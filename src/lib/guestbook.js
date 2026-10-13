import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

// Ziyaretçi defteri. Notlar önce "bekleyen" olarak saklanır; site sahibi
// yönetim sayfasından onayladığında yayımlanır.
//
// Depolama: canlıda özel (private) bir Vercel Blob deposu (BLOB_READ_WRITE_TOKEN
// Vercel'de projeye bağlıdır). Yerel denemelerde GUESTBOOK_LOCAL_DIR klasörü.
//   guestbook/pending/<id>.json  bekleyen her not ayrı dosya
//   guestbook/approved.json      yayındaki notlar, en yenisi başta

const PENDING_PREFIX = 'guestbook/pending/';
const APPROVED_PATH = 'guestbook/approved.json';
const MAX_APPROVED = 300;
const ID_PATTERN = /^[a-z0-9]{6,12}-[a-f0-9]{8}$/;

export const LIMITS = {
  name: { min: 2, max: 60 },
  message: { min: 3, max: 500 }
};

class ConflictError extends Error {}

export function isGuestbookEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.GUESTBOOK_LOCAL_DIR);
}

function etagOf(text) {
  return createHash('sha1').update(text).digest('hex');
}

function fileStore(dir) {
  const full = pathname => path.join(dir, pathname);
  return {
    async read(pathname) {
      try {
        const text = await fs.readFile(full(pathname), 'utf8');
        return { data: JSON.parse(text), etag: etagOf(text) };
      } catch {
        return null;
      }
    },
    async write(pathname, data, { ifMatch } = {}) {
      if (ifMatch) {
        const current = await this.read(pathname);
        if (current && current.etag !== ifMatch) throw new ConflictError('etag');
      }
      await fs.mkdir(path.dirname(full(pathname)), { recursive: true });
      await fs.writeFile(full(pathname), JSON.stringify(data));
    },
    async list(prefix) {
      try {
        const names = await fs.readdir(full(prefix));
        return names.filter(name => name.endsWith('.json')).map(name => prefix + name);
      } catch {
        return [];
      }
    },
    async remove(pathname) {
      await fs.rm(full(pathname), { force: true });
    }
  };
}

async function blobStore() {
  const blob = await import('@vercel/blob');
  return {
    async read(pathname) {
      const result = await blob.get(pathname, { access: 'private', useCache: false });
      if (!result || result.statusCode !== 200) return null;
      const text = await new Response(result.stream).text();
      return { data: JSON.parse(text), etag: result.blob.etag };
    },
    async write(pathname, data, { ifMatch } = {}) {
      try {
        await blob.put(pathname, JSON.stringify(data), {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
          ...(ifMatch ? { ifMatch } : {})
        });
      } catch (error) {
        if (error instanceof blob.BlobPreconditionFailedError) throw new ConflictError('etag');
        throw error;
      }
    },
    async list(prefix) {
      const pathnames = [];
      let cursor;
      do {
        const page = await blob.list({ prefix, limit: 1000, cursor });
        pathnames.push(...page.blobs.map(item => item.pathname));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return pathnames;
    },
    async remove(pathname) {
      await blob.del(pathname);
    }
  };
}

async function store() {
  if (process.env.GUESTBOOK_LOCAL_DIR) return fileStore(process.env.GUESTBOOK_LOCAL_DIR);
  if (process.env.BLOB_READ_WRITE_TOKEN) return blobStore();
  throw new Error('Guestbook storage is not configured');
}

/** Ad ve not metnini temizler ve denetler. */
export function validateNote(input) {
  const name = typeof input?.name === 'string'
    ? input.name.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const message = typeof input?.message === 'string'
    ? input.message
        .replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : '';

  const nameLength = [...name].length;
  const messageLength = [...message].length;
  if (
    nameLength < LIMITS.name.min || nameLength > LIMITS.name.max ||
    messageLength < LIMITS.message.min || messageLength > LIMITS.message.max
  ) {
    return { ok: false, error: 'invalid' };
  }
  // Reklam ve spam bağlantılarına karşı notlarda adres kabul edilmez.
  if (/https?:\/\/|www\./i.test(`${name} ${message}`)) {
    return { ok: false, error: 'links' };
  }
  return { ok: true, name, message };
}

function newId() {
  return `${Date.now().toString(36)}-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

export function isValidId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id);
}

export async function addPendingNote({ name, message, locale }) {
  const note = { id: newId(), name, message, locale, createdAt: new Date().toISOString() };
  const s = await store();
  await s.write(`${PENDING_PREFIX}${note.id}.json`, note);
  return note;
}

export async function listPendingNotes() {
  const s = await store();
  const pathnames = await s.list(PENDING_PREFIX);
  const notes = await Promise.all(pathnames.map(async pathname => (await s.read(pathname))?.data));
  return notes.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listApprovedNotes() {
  const s = await store();
  const current = await s.read(APPROVED_PATH);
  return Array.isArray(current?.data?.notes) ? current.data.notes : [];
}

/** Yayındaki notlar dosyasını eşzamanlı yazmalara karşı ETag ile günceller. */
async function updateApproved(s, change) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const current = await s.read(APPROVED_PATH);
    const notes = Array.isArray(current?.data?.notes) ? current.data.notes : [];
    const next = change(notes).slice(0, MAX_APPROVED);
    try {
      await s.write(
        APPROVED_PATH,
        { notes: next, updatedAt: new Date().toISOString() },
        current ? { ifMatch: current.etag } : {}
      );
      return next;
    } catch (error) {
      if (!(error instanceof ConflictError) || attempt === 2) throw error;
    }
  }
  return null;
}

export async function approveNote(id) {
  if (!isValidId(id)) return false;
  const s = await store();
  const pending = await s.read(`${PENDING_PREFIX}${id}.json`);
  if (!pending?.data) return false;
  const note = { ...pending.data, approvedAt: new Date().toISOString() };
  await updateApproved(s, notes => [note, ...notes.filter(item => item.id !== id)]);
  await s.remove(`${PENDING_PREFIX}${id}.json`);
  return true;
}

/** Notu bekleyenlerden ya da yayındakilerden kaldırır. */
export async function deleteNote(id) {
  if (!isValidId(id)) return false;
  const s = await store();
  await s.remove(`${PENDING_PREFIX}${id}.json`);
  const approved = await listApprovedNotes();
  if (approved.some(item => item.id === id)) {
    await updateApproved(s, notes => notes.filter(item => item.id !== id));
  }
  return true;
}

/** Yönetici anahtarını sabit sürede karşılaştırır. */
export function adminKeyMatches(candidate) {
  const expected = process.env.GUESTBOOK_ADMIN_KEY;
  if (!expected || typeof candidate !== 'string' || !candidate) return false;
  const a = createHash('sha256').update(candidate).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
