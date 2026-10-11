import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import {
  FROM_ADDRESS,
  SITE_URL,
  buildConfirmEmail,
  createConfirmToken,
  normalizeEmail,
  normalizeLocale
} from '@/lib/newsletter';

// IP başına saatte 5 istek; aynı adrese 10 dakikada en fazla 1 onay e-postası.
const PER_IP = { limit: 5, windowMs: 60 * 60_000 };
const PER_EMAIL = { limit: 1, windowMs: 10 * 60_000 };

// Çift onaylı abonelik: bu uç nokta yalnızca onay e-postası gönderir. Adres,
// kişi bağlantıya tıkladığında /api/newsletter/confirm içinde listeye eklenir.
export async function POST(request) {
  const ip = getClientIp(request);
  const ipLimit = rateLimit(`newsletter:ip:${ip}`, PER_IP.limit, PER_IP.windowMs);
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfter) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = normalizeEmail(body?.email);
  if (!email) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  const locale = normalizeLocale(body?.locale);

  if (!process.env.RESEND_API_KEY) {
    console.error('Newsletter: RESEND_API_KEY tanımlı değil; abonelik alınamıyor.');
    return NextResponse.json({ error: 'Newsletter is not configured' }, { status: 503 });
  }

  // Aynı adrese kısa sürede tekrar e-posta gönderme. Yanıt, adresin daha önce
  // kullanılıp kullanılmadığını ele vermemek için başarılı istekle aynıdır.
  const emailLimit = rateLimit(`newsletter:email:${email}`, PER_EMAIL.limit, PER_EMAIL.windowMs);
  if (!emailLimit.ok) {
    return NextResponse.json({ message: 'Confirmation email sent' }, { status: 202 });
  }

  try {
    const token = createConfirmToken(email, locale);
    const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const { subject, html, text } = buildConfirmEmail(locale, confirmUrl);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
      text
    });

    if (error) {
      console.error('Newsletter: onay e-postası gönderilemedi:', error);
      return NextResponse.json({ error: 'Could not send confirmation email' }, { status: 502 });
    }

    return NextResponse.json({ message: 'Confirmation email sent' }, { status: 202 });
  } catch (error) {
    console.error('Newsletter: beklenmeyen hata:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
