/* Le facteur de bonjour@mapetitemadeleine.org.
   Une lettre arrive : on la fait suivre dans la boîte de Laurence, puis on
   renvoie l'accusé de réception (français puis anglais).

   Deux garde-fous, pour qu'aucun répondeur ne se parle à lui-même :
   — on ne répond jamais à une lettre déjà automatique (liste, robot, facteur) ;
   — on ne répond qu'une fois par expéditeur et par jour (mémoire KV, facultative). */

import { DE, SUJET, TEXTE, HTML } from './reponse.js';

const ROBOTS = ['noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster', 'bounce'];

function adresse(brut) {
  const m = String(brut || '').match(/<([^>]+)>/);
  return (m ? m[1] : String(brut || '')).trim().toLowerCase();
}

/* Cette lettre mérite-t-elle une réponse ? */
function meriteReponse(message) {
  const h = message.headers;
  const de = adresse(message.from);
  if (!de || de.indexOf('@') < 0) return false;
  if (de.endsWith('mapetitemadeleine.org')) return false;
  if (ROBOTS.some(r => de.indexOf(r) >= 0)) return false;
  const auto = (h.get('auto-submitted') || '').toLowerCase();
  if (auto && auto !== 'no') return false;
  if (h.get('x-autoreply') || h.get('x-autorespond') || h.get('x-auto-response-suppress')) return false;
  const p = (h.get('precedence') || '').toLowerCase();
  if (p === 'bulk' || p === 'list' || p === 'junk') return false;
  if (h.get('list-id') || h.get('list-unsubscribe')) return false;
  return true;
}


/* ————— Le site ————— 
   Le site est servi en fichiers seuls (sans Worker à lui) : c'est donc ce
   Worker qui reçoit, à l'adresse courriel.mapetitemadeleine.org, les deux
   envois du site — l'inscription au Club (/api/club) et la page « Nous
   écrire » (/api/contact). Le registre D1 y est branché sous le nom REGISTRE. */

const ORIGINES = ['https://mapetitemadeleine.org', 'https://www.mapetitemadeleine.org'];
let origine = ORIGINES[0];
function repondre(corps, options) {
  const r = Response.json(corps, options);
  r.headers.set('Access-Control-Allow-Origin', origine);
  r.headers.set('Vary', 'Origin');
  return r;
}

/* ————— Jeu-Clic : le compteur anonyme —————
   À la fin d'une épreuve, l'appli envoie { module, epreuve, niveau, reussi }
   et rien d'autre : ni adresse, ni identifiant, ni pays. On n'ajoute qu'un
   à un total du jour ; le bureau les lit. L'appli envoie en « no-cors »,
   sans attendre de réponse : si le compteur boude, le jeu ne le sait pas. */

const JEU = 'https://jeu.mapetitemadeleine.org';
const JEU_MODULES = ['challenge', 'nombres', 'prononciation', 'exercices'];
let tableJeuPrete = false;

async function compterPartie(requete, env) {
  const vide = new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': JEU } });
  if (requete.method !== 'POST') return vide;
  let c = {};
  try { c = JSON.parse(await requete.text()); } catch (e) { return vide; }
  const module = JEU_MODULES.indexOf(c.module) >= 0 ? c.module : null;
  if (!module) return vide;
  const epreuve = /^[1-9]$/.test(String(c.epreuve)) ? String(c.epreuve) : '';
  const niveau = /^[0-4]$/.test(String(c.niveau)) ? String(c.niveau) : '';
  try {
    if (!tableJeuPrete) {
      await env.REGISTRE.prepare(
        'CREATE TABLE IF NOT EXISTS jeu_totaux (jour TEXT NOT NULL, module TEXT NOT NULL, ' +
        "epreuve TEXT NOT NULL DEFAULT '', niveau TEXT NOT NULL DEFAULT '', " +
        'tentes INTEGER NOT NULL DEFAULT 0, reussis INTEGER NOT NULL DEFAULT 0, ' +
        'PRIMARY KEY (jour, module, epreuve, niveau))'
      ).run();
      tableJeuPrete = true;
    }
    await env.REGISTRE.prepare(
      'INSERT INTO jeu_totaux (jour, module, epreuve, niveau, tentes, reussis) VALUES (?1, ?2, ?3, ?4, 1, ?5) ' +
      'ON CONFLICT(jour, module, epreuve, niveau) DO UPDATE SET tentes = tentes + 1, reussis = reussis + excluded.reussis'
    ).bind(new Date().toISOString().slice(0, 10), module, epreuve, niveau, c.reussi === true ? 1 : 0).run();
  } catch (e) { console.log('compteur du jeu —', String(e)); }
  return vide;
}

/* ————— La provenance marquée —————
   Le lien de la bio TikTok passe par ici (/de/tiktok) : on ajoute un au
   total du jour, sans rien garder de la personne, et on l'envoie aussitôt
   sur l'accueil du site. Le navigateur de TikTok efface la provenance ;
   sans ce détour, ces visites se perdraient dans l'« accès direct ».
   Le compte ne doit jamais retarder ni empêcher l'arrivée sur le site. */

const PROVENANCES = ['tiktok', 'facebook'];
let tableProvenancesPrete = false;

async function compterProvenance(source, env, ctx) {
  const suite = Response.redirect('https://mapetitemadeleine.org/', 302);
  if (PROVENANCES.indexOf(source) < 0) return suite;
  const compter = async () => {
    try {
      if (!tableProvenancesPrete) {
        await env.REGISTRE.prepare(
          'CREATE TABLE IF NOT EXISTS provenances (jour TEXT NOT NULL, source TEXT NOT NULL, ' +
          'clics INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (jour, source))'
        ).run();
        tableProvenancesPrete = true;
      }
      await env.REGISTRE.prepare(
        'INSERT INTO provenances (jour, source, clics) VALUES (?1, ?2, 1) ' +
        'ON CONFLICT(jour, source) DO UPDATE SET clics = clics + 1'
      ).bind(new Date().toISOString().slice(0, 10), source).run();
    } catch (e) { console.log('provenance —', String(e)); }
  };
  if (ctx && ctx.waitUntil) ctx.waitUntil(compter()); else await compter();
  return suite;
}

function propre(v, n) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
}

function echappe(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* L'accusé de réception, au visiteur qui vient d'écrire : c'est la même
   lettre que celle du Worker « courriel », rangée dans ./reponse.js. */
async function accuser(env, adresse) {
  if (!env.RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: DE,
        to: [adresse],
        reply_to: 'bonjour@mapetitemadeleine.org',
        subject: SUJET,
        text: TEXTE,
        html: HTML,
        headers: { 'Auto-Submitted': 'auto-replied', 'X-Auto-Response-Suppress': 'All' }
      })
    });
  } catch (e) {}
}

/* La lettre telle qu'elle arrive dans la boîte de Laurence : l'expéditeur est
   posé en « répondre à », donc un simple Répondre suffit. */
async function faireSuivre(env, m) {
  console.log('formulaire reçu de', m.adresse, '— sujet :', m.sujet);
  if (!env.RESEND_API_KEY) { console.log('ECHEC : RESEND_API_KEY absent'); return; }
  const corps = [
    'Nom : ' + m.nom,
    'Adresse : ' + m.adresse,
    'Sujet : ' + m.sujet,
    'Page : ' + (m.venu_de || '—') + (m.pays ? ' (' + m.pays + ')' : ''),
    '',
    m.message
  ].join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Formulaire du site <formulaire@mapetitemadeleine.org>',
        to: [env.BOITE || 'bonjour@mapetitemadeleine.org'],
        reply_to: m.adresse,
        subject: m.sujet + ' — ' + m.nom,
        text: corps,
        html: '<pre style="font:16px Georgia,serif; white-space:pre-wrap;">' + echappe(corps) + '</pre>',
        headers: { 'Auto-Submitted': 'auto-generated' }
      })
    });
    console.log('formulaire → boîte : Resend a répondu', r.status, await r.text());
  } catch (e) { console.log('ECHEC formulaire → boîte —', String(e)); }
}

async function fetchSite(requete, env, ctx) {
  const url = new URL(requete.url);
  if (url.pathname === '/api/jeu') return compterPartie(requete, env);
  const de = url.pathname.match(/^\/de\/([a-z]+)\/?$/);
  if (de) return compterProvenance(de[1], env, ctx);
  const o = requete.headers.get('origin') || '';
  origine = ORIGINES.indexOf(o) >= 0 ? o : ORIGINES[0];
  if (requete.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': origine,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    } });
  }
    if (url.pathname === '/api/club') {
      if (requete.method !== 'POST') {
        return repondre({ ok: false }, { status: 405 });
      }
      let corps = {};
      try { corps = await requete.json(); } catch (e) {}
      const adresse = String(corps.adresse || '').trim().toLowerCase();
      if (adresse.length < 5 || adresse.indexOf('@') < 1) {
        return repondre({ ok: false, mot: 'adresse incomplète' }, { status: 400 });
      }
      try {
        await env.REGISTRE.prepare(
          'INSERT INTO membres (adresse, venu_de, pays, ajoute_le) VALUES (?1, ?2, ?3, ?4) ' +
          'ON CONFLICT(adresse) DO UPDATE SET vu_le = ?4'
        ).bind(
          adresse,
          String(corps.venu_de || '').slice(0, 200),
          requete.headers.get('cf-ipcountry') || '',
          new Date().toISOString()
        ).run();
      } catch (e) {
        return repondre({ ok: false, mot: 'registre indisponible' }, { status: 500 });
      }
      return repondre({ ok: true });
    }

    if (url.pathname === '/api/contact') {
      if (requete.method !== 'POST') {
        return repondre({ ok: false }, { status: 405 });
      }
      let corps = {};
      try { corps = await requete.json(); } catch (e) {}
      /* Le champ « ville » est invisible dans la page : seul un robot le
         remplit. On répond poliment, et rien n'est gardé. */
      if (propre(corps.mpm_piege, 60) || propre(corps.ville, 60)) return repondre({ ok: true });
      const m = {
        nom: propre(corps.nom, 120),
        adresse: propre(corps.adresse, 200).toLowerCase(),
        sujet: propre(corps.sujet, 200),
        message: String(corps.message == null ? '' : corps.message).trim().slice(0, 5000),
        venu_de: propre(corps.venu_de, 200),
        pays: requete.headers.get('cf-ipcountry') || ''
      };
      if (!m.nom || !m.sujet || !m.message || m.adresse.length < 5 || m.adresse.indexOf('@') < 1) {
        return repondre({ ok: false, mot: 'message incomplet' }, { status: 400 });
      }
      try {
        await env.REGISTRE.prepare(
          'INSERT INTO messages (nom, adresse, sujet, message, venu_de, pays, recu_le) ' +
          'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)'
        ).bind(m.nom, m.adresse, m.sujet, m.message, m.venu_de, m.pays, new Date().toISOString()).run();
      } catch (e) {
        /* Même si le registre boude, la lettre doit partir. */
      }
      await faireSuivre(env, m);
      await accuser(env, m.adresse);
      return repondre({ ok: true });
    }

    return new Response('Ma petite madeleine', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
}

export default {
  fetch: fetchSite,

  async email(message, env, ctx) {
    /* D'abord le courrier arrive à bon port : même si la réponse échoue,
       la lettre ne se perd pas. */
    if (env.BOITE) {
      try { await message.forward(env.BOITE); console.log('suivie vers', env.BOITE); }
      catch (e) { console.log('ECHEC du renvoi vers', env.BOITE, '—', String(e)); }
    } else {
      console.log('ECHEC : la variable BOITE est vide');
    }

    console.log('lettre de', message.from, 'pour', message.to);
    if (!env.RESEND_API_KEY) { console.log('ECHEC : le secret RESEND_API_KEY est absent'); return; }
    if (!meriteReponse(message)) { console.log('pas de réponse : lettre automatique ou interne'); return; }

    const de = adresse(message.from);

    /* Une seule réponse par jour et par personne. Sans mémoire KV branchée,
       on répond simplement à chaque lettre. */
    if (env.MEMOIRE) {
      try {
        if (await env.MEMOIRE.get('repondu:' + de)) return;
        await env.MEMOIRE.put('repondu:' + de, '1', { expirationTtl: 86400 });
      } catch (e) {}
    }

    const identifiant = message.headers.get('message-id') || '';
    const entetes = { 'Auto-Submitted': 'auto-replied', 'X-Auto-Response-Suppress': 'All' };
    if (identifiant) {
      entetes['In-Reply-To'] = identifiant;
      entetes['References'] = identifiant;
    }

    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + env.RESEND_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: DE,
          to: [de],
          reply_to: 'bonjour@mapetitemadeleine.org',
          subject: SUJET,
          text: TEXTE,
          html: HTML,
          headers: entetes
        })
      });
      console.log('Resend a répondu', r.status, await r.text());
    } catch (e) { console.log('ECHEC de l\'envoi Resend —', String(e)); }
  }
};
