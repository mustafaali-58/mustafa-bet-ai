import { Resend } from 'resend';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { buildResultPage, verifyConfirmToken } from '@/lib/newsletter';

function page(locale, kind, status) {
  return new Response(buildResultPage(locale, kind), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer'
    }
  });
}

// Onay e-postasındaki bağlantının hedefi. Belirteç geçerliyse adres Resend
// kişi listesine eklenir; aboneler dosya sistemi yerine orada tutulur.
export async function GET(request) {
  const ip = getClientIp(request);
  if (!rateLimit(`newsletter:confirm:${ip}`, 20, 60 * 60_000).ok) {
    return page('tr', 'error', 429);
  }

  const verified = verifyConfirmToken(request.nextUrl.searchParams.get('token'));
  if (!verified) {
    return page('tr', 'bad', 400);
  }

  const { email, locale } = verified;

  if (!process.env.RESEND_API_KEY) {
    console.error('Newsletter: RESEND_API_KEY tanımlı değil; abone kaydedilemedi.');
    return page(locale, 'error', 503);
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const segmentId = process.env.RESEND_SEGMENT_ID;

    const { error } = await resend.contacts.create({
      email,
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {})
    });

    if (error) {
      // Bağlantıya ikinci kez tıklanmış olabilir: kişi zaten kayıtlıysa başarı say.
      const existing = await resend.contacts.get({ email });
      if (existing.error || !existing.data) {
        console.error('Newsletter: abone kaydedilemedi:', error);
        return page(locale, 'error', 502);
      }
    }

    return page(locale, 'ok', 200);
  } catch (error) {
    console.error('Newsletter: onay sırasında beklenmeyen hata:', error);
    return page(locale, 'error', 500);
  }
}
