import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  addPendingNote,
  isGuestbookEnabled,
  listApprovedNotes,
  validateNote
} from '@/lib/guestbook';
import { FROM_ADDRESS, OWNER_EMAIL, SITE_URL, normalizeLocale } from '@/lib/newsletter';

// IP başına saatte 3 not; ayrıca tek bir sunucu örneğinde saatte en fazla 30
// not (farklı adreslerden gelen toplu spam'e karşı).
const PER_IP = { limit: 3, windowMs: 60 * 60_000 };
const GLOBAL = { limit: 30, windowMs: 60 * 60_000 };
// Formu bundan kısa sürede gönderen istemci bot sayılır.
const MIN_FILL_MS = 2_500;
const LIST_LIMIT = 100;

// Yayındaki notlar kısa süre bellekte tutulur; CDN önbelleğiyle birlikte
// depolama okumalarını azaltır.
const MEMORY_TTL_MS = 60_000;
let memory = { at: 0, notes: null };

// Tarayıcı listeyi her açılışta yeniden ister; Vercel CDN'i ise iki dakika
// önbellekte tutar ve süresi dolunca arka planda yeniler.
const LIST_CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600'
};

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  if (!isGuestbookEnabled()) {
    return NextResponse.json({ enabled: false, notes: [] }, { headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    if (!memory.notes || Date.now() - memory.at > MEMORY_TTL_MS) {
      memory = { at: Date.now(), notes: await listApprovedNotes() };
    }
    const notes = memory.notes.slice(0, LIST_LIMIT).map(({ id, name, message, createdAt }) => ({
      id,
      name,
      message,
      createdAt
    }));
    return NextResponse.json({ enabled: true, notes }, { headers: LIST_CACHE_HEADERS });
  } catch (error) {
    console.error('Guestbook: notlar okunamadı:', error?.message);
    return NextResponse.json({ error: 'Could not load notes' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request) {
  if (!isGuestbookEnabled()) {
    return NextResponse.json({ error: 'Guestbook is not configured' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Bal küpü ve süre denetimi: botlara başarı gibi görünen bir yanıt verilir.
  const elapsed = Number(body?.elapsed);
  if ((typeof body?.website === 'string' && body.website.trim() !== '') || !(elapsed >= MIN_FILL_MS)) {
    return NextResponse.json({ status: 'pending' }, { status: 200 });
  }

  const checked = validateNote(body);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: 400 });
  }

  const ip = getClientIp(request);
  const perIp = rateLimit(`guestbook:${ip}`, PER_IP.limit, PER_IP.windowMs);
  // Sınırını aşmış bir adres genel kotadan düşmez; tek kişi defteri kilitleyemez.
  const global = perIp.ok ? rateLimit('guestbook:all', GLOBAL.limit, GLOBAL.windowMs) : { ok: true, retryAfter: 0 };
  if (!perIp.ok || !global.ok) {
    return NextResponse.json(
      { error: 'rate' },
      { status: 429, headers: { 'Retry-After': String(Math.max(perIp.retryAfter, global.retryAfter)) } }
    );
  }

  let note;
  try {
    note = await addPendingNote({ name: checked.name, message: checked.message, locale: normalizeLocale(body?.locale) });
  } catch (error) {
    console.error('Guestbook: not kaydedilemedi:', error?.message);
    return NextResponse.json({ error: 'server' }, { status: 502 });
  }

  // Site sahibine haber verilir; e-posta gitmese de not yönetim sayfasında bekler.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminUrl = `${SITE_URL}/api/guestbook/admin`;
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: OWNER_EMAIL,
        subject: `Ziyaretçi defterine yeni not: ${note.name}`,
        text: `${note.name} yazdı:\n\n${note.message}\n\nOnaylamak ya da silmek için: ${adminUrl}`,
        html: `
          <div style="font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a222d; max-width: 600px; margin: 0 auto; padding: 24px; line-height: 1.6;">
            <h2 style="margin: 0 0 12px; font-size: 22px;">Ziyaretçi defterine yeni not</h2>
            <p><strong>${escapeHtml(note.name)}</strong> yazdı:</p>
            <p style="white-space: pre-wrap; padding: 16px; background: #f2f4f7; border: 1px solid #d4dae2; border-radius: 4px;">${escapeHtml(note.message)}</p>
            <p>Not, onaylanana kadar sitede görünmez.</p>
            <p><a href="${adminUrl}" style="color: #2f3e9e;">Yönetim sayfasını aç</a></p>
          </div>
        `
      });
      if (error) console.error('Guestbook: bildirim e-postası gönderilemedi:', error?.message || error);
    } catch (error) {
      console.error('Guestbook: bildirim e-postası gönderilemedi:', error?.message);
    }
  }

  return NextResponse.json({ status: 'pending' }, { status: 200 });
}
