import { getClientIp, peekRateLimit, rateLimit } from '@/lib/rate-limit';
import {
  adminKeyMatches,
  approveNote,
  deleteNote,
  isGuestbookEnabled,
  listApprovedNotes,
  listPendingNotes
} from '@/lib/guestbook';

// Ziyaretçi defteri yönetimi. Giriş, Vercel'deki GUESTBOOK_ADMIN_KEY ile yapılır.
// Anahtar her işlemde form içinde gönderilir; çerez ya da oturum tutulmaz.
// Anahtar bilinmeden işlem yapılamadığı için başka sitelerden tetiklenemez.

const FAILED_LOGINS = { limit: 10, windowMs: 60 * 60_000 };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const dateFormat = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Istanbul'
});

function html(body, status = 200) {
  return new Response(
    `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Ziyaretçi Defteri Yönetimi</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; background: #f2f4f7; color: #1a222d; font: 16px/1.55 -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; }
  main { max-width: 46rem; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { margin: 0 0 4px; font-size: 1.6rem; line-height: 1.2; }
  h2 { margin: 32px 0 12px; font-size: 1.15rem; }
  p { margin: 0 0 12px; }
  .muted { color: #4f5b6b; font-size: 0.9rem; }
  .note { margin: 0 0 12px; padding: 16px; background: #fff; border: 1px solid #d4dae2; border-radius: 4px; }
  .note p { white-space: pre-wrap; }
  .meta { color: #4f5b6b; font-size: 0.85rem; }
  .actions { display: flex; gap: 8px; margin-top: 12px; }
  form { margin: 0; }
  input[type=password] { width: 100%; max-width: 22rem; box-sizing: border-box; padding: 10px 12px; border: 1px solid #8a94a3; border-radius: 4px; font: inherit; background: #fff; color: inherit; }
  button { padding: 8px 14px; border: 1px solid #8a94a3; border-radius: 4px; background: #fff; color: #1a222d; font: inherit; font-weight: 600; cursor: pointer; }
  button.primary { background: #2f3e9e; border-color: #2f3e9e; color: #fff; }
  .flash { padding: 10px 14px; border: 1px solid #d4dae2; border-left: 3px solid #2f3e9e; background: #fff; border-radius: 4px; }
  .error { border-left-color: #b42318; }
  @media (prefers-color-scheme: dark) {
    body { background: #161c24; color: #e7ebf0; }
    .note, .flash, input[type=password], button { background: #222a35; border-color: #364252; color: #e7ebf0; }
    .muted, .meta { color: #a9b3c0; }
    button.primary { background: #a3b1f7; border-color: #a3b1f7; color: #141a22; }
  }
</style>
</head>
<body><main>${body}</main></body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy':
          "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
      }
    }
  );
}

function loginPage(message, status = 200) {
  return html(
    `<h1>Ziyaretçi Defteri Yönetimi</h1>
<p class="muted">Bekleyen notları onaylamak ya da silmek için yönetici anahtarını girin.</p>
${message ? `<p class="flash error">${escapeHtml(message)}</p>` : ''}
<form method="post">
  <p><label for="key">Yönetici anahtarı</label></p>
  <p><input id="key" name="key" type="password" autocomplete="current-password" required></p>
  <p><button class="primary" type="submit">Giriş</button></p>
</form>`,
    status
  );
}

function noteCard(note, key, actions) {
  const buttons = actions
    .map(([action, label, primary]) => `
    <form method="post">
      <input type="hidden" name="key" value="${escapeHtml(key)}">
      <input type="hidden" name="id" value="${escapeHtml(note.id)}">
      <input type="hidden" name="action" value="${action}">
      <button type="submit"${primary ? ' class="primary"' : ''}>${label}</button>
    </form>`)
    .join('');
  return `<div class="note">
  <p class="meta"><strong>${escapeHtml(note.name)}</strong>, ${escapeHtml(dateFormat.format(new Date(note.createdAt)))}</p>
  <p>${escapeHtml(note.message)}</p>
  <div class="actions">${buttons}</div>
</div>`;
}

async function dashboard(key, flash) {
  const [pending, approved] = await Promise.all([listPendingNotes(), listApprovedNotes()]);
  return html(`<h1>Ziyaretçi Defteri Yönetimi</h1>
<p class="muted">Onaylanan notlar sitede birkaç dakika içinde görünür.</p>
${flash ? `<p class="flash">${escapeHtml(flash)}</p>` : ''}
<h2>Onay bekleyen notlar (${pending.length})</h2>
${pending.length ? pending.map(note => noteCard(note, key, [['approve', 'Yayınla', true], ['delete', 'Sil']])).join('') : '<p class="muted">Bekleyen not yok.</p>'}
<h2>Yayındaki notlar (${approved.length})</h2>
${approved.length ? approved.slice(0, 100).map(note => noteCard(note, key, [['delete', 'Kaldır']])).join('') : '<p class="muted">Yayında not yok.</p>'}`);
}

export async function GET() {
  if (!isGuestbookEnabled() || !process.env.GUESTBOOK_ADMIN_KEY) {
    return loginPage('Ziyaretçi defteri yapılandırılmamış.', 503);
  }
  return loginPage();
}

export async function POST(request) {
  if (!isGuestbookEnabled() || !process.env.GUESTBOOK_ADMIN_KEY) {
    return loginPage('Ziyaretçi defteri yapılandırılmamış.', 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return loginPage('İstek okunamadı.', 400);
  }
  const key = String(form.get('key') || '');
  const action = String(form.get('action') || '');
  const id = String(form.get('id') || '');

  // Sınır dolunca anahtar hiç denetlenmez; böylece deneme yanılma sürdürülemez.
  const failures = `guestbook-admin:${getClientIp(request)}`;
  const blocked = peekRateLimit(failures, FAILED_LOGINS.limit);
  if (blocked.limited) {
    const response = loginPage('Çok fazla hatalı deneme. Lütfen daha sonra tekrar deneyin.', 429);
    response.headers.set('Retry-After', String(blocked.retryAfter));
    return response;
  }
  if (!adminKeyMatches(key)) {
    rateLimit(failures, FAILED_LOGINS.limit, FAILED_LOGINS.windowMs);
    return loginPage('Anahtar hatalı.', 401);
  }

  try {
    let flash = '';
    if (action === 'approve') {
      flash = (await approveNote(id)) ? 'Not yayımlandı.' : 'Not bulunamadı; daha önce işlenmiş olabilir.';
    } else if (action === 'delete') {
      flash = (await deleteNote(id)) ? 'Not silindi.' : 'Not bulunamadı.';
    }
    return await dashboard(key, flash);
  } catch (error) {
    console.error('Guestbook admin: işlem başarısız:', error?.message);
    return html('<h1>Ziyaretçi Defteri Yönetimi</h1><p class="flash error">İşlem yapılamadı. Lütfen birazdan tekrar deneyin.</p>', 502);
  }
}
