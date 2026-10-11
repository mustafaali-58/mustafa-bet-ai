import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { FROM_ADDRESS, normalizeEmail } from '@/lib/newsletter';

// Mesajların iletileceği adres. Tanımlı değilse sitede zaten yayımlanan
// iletişim adresi kullanılır.
const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'mustafaali58@hotmail.it';

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
      to: CONTACT_TO,
      replyTo: email,
      subject: `Siteden yeni mesaj: ${name}`,
      text: `Gönderen: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">Siteden yeni mesaj</h2>
          <p><strong>Gönderen:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p style="white-space: pre-wrap; padding: 16px; background: #f5f5fa; border-radius: 8px;">${escapeHtml(message)}</p>
          <p style="font-size: 13px; color: #666;">Yanıtla düğmesi doğrudan gönderene yazar.</p>
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
