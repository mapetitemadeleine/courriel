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
  if (!env.RESEND_API_KEY) return;
  const corps = [
    'Nom : ' + m.nom,
    'Adresse : ' + m.adresse,
    'Sujet : ' + m.sujet,
    'Page : ' + (m.venu_de || '—') + (m.pays ? ' (' + m.pays + ')' : ''),
    '',
    m.message
  ].join('\n');
  try {
    await fetch('https://api.resend.com/emails', {
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
  } catch (e) {}
}

async function fetchSite(requete, env) {
  const url = new URL(requete.url);
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
      if (propre(corps.ville, 60)) return repondre({ ok: true });
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
