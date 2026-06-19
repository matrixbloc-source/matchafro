/**
 * MatchAfro — Edge Function : send-notification
 *
 * Envoie, après chaque réservation confirmée :
 *   1. Un email au professionnel (coordonnées client complètes)
 *   2. Un email de confirmation au client
 *   3. Un SMS au professionnel via Twilio
 *
 * Variables d'environnement à configurer dans Supabase Dashboard → Settings → Edge Functions :
 *   RESEND_API_KEY   — clé API Resend (resend.com)
 *   TWILIO_SID       — Account SID Twilio
 *   TWILIO_TOKEN     — Auth Token Twilio
 *   TWILIO_FROM      — Numéro Twilio expéditeur (+33...)
 *   FROM_EMAIL       — Adresse expéditeur (ex: reservations@matchafro.fr)
 *
 * Déploiement : supabase functions deploy send-notification
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')  ?? '';
const TWILIO_SID  = Deno.env.get('TWILIO_SID')      ?? '';
const TWILIO_TOKEN = Deno.env.get('TWILIO_TOKEN')    ?? '';
const TWILIO_FROM = Deno.env.get('TWILIO_FROM')      ?? '';
const FROM_EMAIL  = Deno.env.get('FROM_EMAIL')       ?? 'reservations@matchafro.fr';

/* ─── Types ── */
interface Pro {
  id: string; name: string; email?: string; phone?: string;
  address?: string; city?: string;
}
interface Booking {
  id: string; clientName: string; clientPhone?: string; clientEmail?: string;
  service: string; date: string; startTime: string; endTime?: string;
}

/* ─── Helpers ── */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_KEY || !to) return;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `MatchAfro <${FROM_EMAIL}>`, to: [to], subject, html }),
  });
  if (!res.ok) console.error('[resend]', await res.text());
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM || !to) return;
  const phone = to.replace(/[\s\-\(\)]/g, '');
  const params = new URLSearchParams({ From: TWILIO_FROM, To: phone, Body: body });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    },
  );
  if (!res.ok) console.error('[twilio]', await res.text());
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ─── Handler ── */
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let payload: { type: string; booking: Booking; pro: Pro };
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { type, booking, pro } = payload;

  if (type !== 'new_booking' || !booking || !pro) {
    return new Response(JSON.stringify({ ok: false, error: 'payload invalide' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const dateLabel = formatDate(booking.date);

  /* ── 1. Email au professionnel ── */
  if (pro.email) {
    await sendEmail(
      pro.email,
      `📅 Nouvelle réservation — ${booking.service}`,
      `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0B0B0C">
        <div style="background:#0B0B0C;padding:24px 32px;border-radius:12px 12px 0 0">
          <p style="color:#D4A574;font-size:22px;font-weight:800;margin:0">MatchAfro</p>
        </div>
        <div style="background:#fff;border:1px solid #E8E3DA;border-top:none;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 20px">Nouvelle réservation reçue !</h2>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;width:140px">Prestation</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${booking.service}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px">Date</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${dateLabel}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px">Heure</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${booking.startTime}${booking.endTime ? ` — ${booking.endTime}` : ''}</td></tr>
          </table>

          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <p style="font-size:12px;font-weight:700;color:#065F46;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px">Coordonnées du client</p>
            <p style="font-size:15px;font-weight:700;color:#0B0B0C;margin:0 0 4px">${booking.clientName}</p>
            ${booking.clientPhone ? `<p style="font-size:14px;color:#059669;margin:0 0 2px">📞 <a href="tel:${booking.clientPhone}" style="color:#059669;text-decoration:none;font-weight:600">${booking.clientPhone}</a></p>` : ''}
            ${booking.clientEmail ? `<p style="font-size:14px;color:#059669;margin:0">✉️ <a href="mailto:${booking.clientEmail}" style="color:#059669;text-decoration:none;font-weight:600">${booking.clientEmail}</a></p>` : ''}
          </div>

          <p style="font-size:12px;color:#9CA3AF;margin:0">Ce créneau est automatiquement bloqué dans votre calendrier MatchAfro.</p>
        </div>
      </div>
      `,
    );
  }

  /* ── 2. Email de confirmation au client ── */
  if (booking.clientEmail) {
    await sendEmail(
      booking.clientEmail,
      `✅ Réservation confirmée — ${booking.service}`,
      `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0B0B0C">
        <div style="background:#0B0B0C;padding:24px 32px;border-radius:12px 12px 0 0">
          <p style="color:#D4A574;font-size:22px;font-weight:800;margin:0">MatchAfro</p>
        </div>
        <div style="background:#fff;border:1px solid #E8E3DA;border-top:none;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="font-size:20px;font-weight:700;margin:0 0 8px">Votre réservation est confirmée !</h2>
          <p style="color:#6B7280;font-size:14px;margin:0 0 24px">Bonjour ${booking.clientName}, voici le récapitulatif de votre rendez-vous.</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;width:140px">Artisan</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${pro.name}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px">Prestation</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${booking.service}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px">Date</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${dateLabel}</td></tr>
            <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px">Heure</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-weight:600;font-size:13px">${booking.startTime}${booking.endTime ? ` — ${booking.endTime}` : ''}</td></tr>
            ${pro.address ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px">Adresse</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px">${pro.address}</td></tr>` : ''}
          </table>

          ${pro.phone ? `<p style="font-size:13px;color:#6B7280;margin:0 0 4px">Pour contacter votre artisan : <a href="tel:${pro.phone}" style="color:#A87E3C;font-weight:600;text-decoration:none">${pro.phone}</a></p>` : ''}
          <p style="font-size:12px;color:#9CA3AF;margin:16px 0 0">Gérez vos réservations depuis votre espace client sur matchafro.fr</p>
        </div>
      </div>
      `,
    );
  }

  /* ── 3. SMS au professionnel ── */
  if (pro.phone) {
    await sendSms(
      pro.phone,
      `MatchAfro — Nouvelle réservation !\n${booking.clientName} · ${booking.service}\n${dateLabel} à ${booking.startTime}\nContact : ${booking.clientPhone || booking.clientEmail || 'voir app'}`,
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
