/* tout-en-un.js — à coller tel quel dans Cloudflare : Workers & Pages → courriel → Edit code, fichier index.js.
   Fabriqué à partir de src/reponse.js puis src/index.js : ne pas le retoucher à la main. */

/* L'accusé de réception de bonjour@mapetitemadeleine.org.
   C'est ici, et seulement ici, qu'on retouche le texte : les deux versions
   (français puis anglais) et le sujet de la lettre. Le reste du Worker n'y
   touche pas. */

const DE = 'Laurence — Ma petite madeleine <bonjour@mapetitemadeleine.org>';

const SUJET = 'Votre message est bien arrivé · Your message has arrived';

const TEXTE = [
  'Bonjour,',
  '',
  'Votre message est bien arrivé, j\u2019en prends connaissance au plus vite.',
  'Je vous réponds en personne d\u2019ici deux jours.',
  '',
  'À très bientôt,',
  'Laurence',
  'Ma petite madeleine — mapetitemadeleine.org',
  '',
  '— — —',
  '',
  'Hello,',
  '',
  'Thank you for your message — it has arrived safely.',
  'I will write back to you personally within two days.',
  '',
  'See you very soon,',
  'Laurence',
  'Ma petite madeleine — mapetitemadeleine.org',
  '',
  'Casa Mimosa LLC, 1209 Mountain Road Pl NE, Ste N, Albuquerque, NM 87110, USA'
].join('\n');

/* Le courriel lui-même : tables imbriquées, styles en ligne, pas d'image ni
   de police chargée — c'est ce qui survit à Gmail, Outlook et Apple Mail. */
const HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Votre message est bien arrivé</title>
</head>
<body style="margin:0; padding:0; background-color:#EFE7D7;">
<span style="display:none; font-size:1px; color:#EFE7D7; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">Votre lettre est bien arrivée, je vous réponds d&rsquo;ici deux jours. Your message has arrived safely.</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#EFE7D7;">
<tr>
<td align="center" style="padding:28px 12px 34px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; background-color:#FBF6EC; border:1px solid #E2CFA2;">

<tr>
<td align="center" style="padding:30px 32px 0 32px;">
<div style="font-family:Georgia,'Times New Roman',serif; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#8F6518; mso-line-height-rule:exactly; line-height:16px;">Classe de fran&ccedil;ais</div>
<div style="font-family:Georgia,'Times New Roman',serif; font-style:italic; font-size:30px; color:#1C2B4F; mso-line-height-rule:exactly; line-height:38px; padding-top:6px;">Ma petite madeleine</div>
</td>
</tr>

<tr>
<td align="center" style="padding:18px 32px 0 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="260" style="width:260px;">
<tr>
<td width="100" valign="middle" style="width:100px;"><div style="height:1px; font-size:0; mso-line-height-rule:exactly; line-height:1px; background-color:#E2CFA2;">&nbsp;</div></td>
<td width="60" align="center" style="width:60px; font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#B8862B; mso-line-height-rule:exactly; line-height:15px;">&#9884;</td>
<td width="100" valign="middle" style="width:100px;"><div style="height:1px; font-size:0; mso-line-height-rule:exactly; line-height:1px; background-color:#E2CFA2;">&nbsp;</div></td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:24px 40px 0 40px; font-family:Georgia,'Times New Roman',serif; font-size:17px; color:#1C2B4F; mso-line-height-rule:exactly; line-height:28px;">
<p style="margin:0 0 16px 0;">Bonjour,</p>
<p style="margin:0 0 16px 0;">Votre message est bien arriv&eacute;, j&rsquo;en prends connaissance au plus vite.</p>
<p style="margin:0 0 16px 0;">Je vous r&eacute;ponds en personne d&rsquo;ici deux jours.</p>
<p style="margin:0 0 4px 0;">&Agrave; tr&egrave;s bient&ocirc;t,</p>
<p style="margin:0; font-style:italic; font-size:19px; color:#8F6518;">Laurence</p>
</td>
</tr>

<tr>
<td align="center" style="padding:26px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
<tr><td height="1" style="height:1px; background-color:#E2CFA2; font-size:0; line-height:1px;">&nbsp;</td></tr>
</table>
</td>
</tr>

<tr>
<td style="padding:22px 40px 0 40px; font-family:Georgia,'Times New Roman',serif; font-size:16px; color:#3A4761; mso-line-height-rule:exactly; line-height:27px;">
<p style="margin:0 0 14px 0;">Hello,</p>
<p style="margin:0 0 14px 0;">Thank you for your message &mdash; it has arrived safely.</p>
<p style="margin:0 0 14px 0;">I will write back to you personally within two days.</p>
<p style="margin:0 0 4px 0;">See you very soon,</p>
<p style="margin:0; font-style:italic; font-size:18px; color:#8F6518;">Laurence</p>
</td>
</tr>

<tr>
<td align="center" style="padding:30px 32px 32px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%; background-color:#1C2B4F;">
<tr>
<td align="center" style="padding:20px 24px 22px 24px;">
<a href="https://mapetitemadeleine.org" style="display:block; font-family:Georgia,'Times New Roman',serif; font-size:17px; color:#F3E4C0; text-decoration:none; mso-line-height-rule:exactly; line-height:24px;">mapetitemadeleine.org</a>
<div style="font-family:Georgia,'Times New Roman',serif; font-size:12px; color:#AFBBD2; mso-line-height-rule:exactly; line-height:19px; padding-top:8px;">Exercices quotidiens, corrig&eacute;s et Jeu-Clic</div>
</td>
</tr>
</table>
<div style="font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#5F5847; mso-line-height-rule:exactly; line-height:18px; padding-top:16px;">Cette lettre est automatique&nbsp;: votre message est bien arriv&eacute;, la r&eacute;ponse suivra de ma main.<br>This is an automatic acknowledgement; a personal reply will follow.</div>
<div style="font-family:Georgia,'Times New Roman',serif; font-size:11px; color:#6F6857; mso-line-height-rule:exactly; line-height:18px; padding-top:8px;">Casa Mimosa LLC &middot; 1209 Mountain Road Pl NE, Ste N &middot; Albuquerque, NM 87110 &middot; USA</div>
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>`;

/* Le facteur de bonjour@mapetitemadeleine.org.
   Une lettre arrive : on la fait suivre dans la boîte de Laurence, puis on
   renvoie l'accusé de réception (français puis anglais).

   Deux garde-fous, pour qu'aucun répondeur ne se parle à lui-même :
   — on ne répond jamais à une lettre déjà automatique (liste, robot, facteur) ;
   — on ne répond qu'une fois par expéditeur et par jour (mémoire KV, facultative). */


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
