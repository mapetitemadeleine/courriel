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

export default {
  async email(message, env, ctx) {
    /* D'abord le courrier arrive à bon port : même si la réponse échoue,
       la lettre ne se perd pas. */
    if (env.BOITE) {
      try { await message.forward(env.BOITE); } catch (e) {}
    }

    if (!env.RESEND_API_KEY || !meriteReponse(message)) return;

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
      await fetch('https://api.resend.com/emails', {
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
    } catch (e) {}
  }
};
