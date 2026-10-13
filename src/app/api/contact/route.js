import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { FROM_ADDRESS, OWNER_EMAIL, normalizeEmail } from '@/lib/newsletter';

const LIMITS = { name: 100, message: 5000, minMessage: 10 };
// IP başına saatte 3 mesaj.
const PER_IP = { limit: 3, windowMs: 60 * 60_000 };

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanLine(value, max) {
  if (typeof value !== 'string') return null;
  // Başlık enjeksiyonuna karşı satır sonları tek satıra indirilir.
  const text = value.replace(/[\r\n\t]+/g, ' ').trim();
  return text && text.length <= max ? text : null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Bal küpü: gerçek ziyaretçinin görmediği alanı botlar doldurur. Bota
  // başarı gibi görünen bir yanıt verilir, mesaj gönderilmez.
  if (typeof body?.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ message: 'Message sent' }, { status: 200 });
  }

  const name = cleanLine(body?.name, LIMITS.name);
  const email = normalizeEmail(body?.email);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!name || !email || message.length < LIMITS.minMessage || message.length > LIMITS.message) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, PER_IP.limit, PER_IP.windowMs);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Contact: RESEND_API_KEY tanımlı değil; mesaj iletilemedi.');
    return NextResponse.json({ error: 'Contact form is not configured' }, { status: 503 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: OWNER_EMAIL,
      replyTo: email,
      subject: `Siteden yeni mesaj: ${name}`,
      text: `Gönderen: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: #1a222d; max-width: 600px; margin: 0 auto; padding: 24px; line-height: 1.6;">
          <h2 style="margin: 0 0 12px; color: #1a222d; font-size: 22px;">Siteden yeni mesaj</h2>
          <p><strong>Gönderen:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p style="white-space: pre-wrap; padding: 16px; background: #f2f4f7; border: 1px solid #d4dae2; border-radius: 4px;">${escapeHtml(message)}</p>
          <p style="font-size: 13px; color: #4f5b6b;">Yanıtla düğmesi doğrudan gönderene yazar.</p>
        </div>
      `
    });

    if (error) {
      console.error('Contact: e-posta gönderilemedi:', error);
      return NextResponse.json({ error: 'Could not send message' }, { status: 502 });
    }

    return NextResponse.json({ message: 'Message sent' }, { status: 200 });
  } catch (error) {
    console.error('Contact: beklenmeyen hata:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
