'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatDate } from '@/lib/format';
import styles from './Guestbook.module.css';

const PAGE_SIZE = 6;
const MAX_NAME = 60;
const MAX_MESSAGE = 500;

// Ziyaretçi defteri: yayımlanmış notlar ve yeni not formu. Notlar onaylandıktan
// sonra listede görünür (bkz. src/lib/guestbook.js).
export default function Guestbook() {
  const t = useTranslations('guestbook');
  const locale = useLocale();
  const [notes, setNotes] = useState(null); // null: yükleniyor
  const [enabled, setEnabled] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [form, setForm] = useState({ name: '', message: '', website: '' });
  // null | 'sending' | 'success' | 'error' | 'error_invalid' | 'error_links' | 'error_rate'
  const [status, setStatus] = useState(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
    let cancelled = false;
    fetch('/api/guestbook')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(data => {
        if (cancelled) return;
        setEnabled(data.enabled !== false);
        setNotes(Array.isArray(data.notes) ? data.notes : []);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setNotes([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = field => event => setForm(current => ({ ...current, [field]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale, elapsed: Date.now() - startedAt.current })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', message: '', website: '' });
      } else if (res.status === 429) {
        setStatus('error_rate');
      } else if (data.error === 'links') {
        setStatus('error_links');
      } else if (res.status === 400) {
        setStatus('error_invalid');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (!enabled) return null;

  const shown = (notes || []).slice(0, visible);

  return (
    <section className={styles.guestbook} aria-labelledby="guestbook-title">
      <div className="section-head">
        <div>
          <h2 id="guestbook-title" className="section-title">{t('title')}</h2>
          <p className="section-desc">{t('description')}</p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.notes}>
          {notes === null && <p className={styles.state} role="status">{t('loading')}</p>}
          {notes !== null && loadError && <p className={styles.state}>{t('load_error')}</p>}
          {notes !== null && !loadError && notes.length === 0 && <p className={styles.state}>{t('empty')}</p>}
          {shown.length > 0 && (
            <ul className={styles.list} aria-label={t('list_label')}>
              {shown.map(note => (
                <li key={note.id} className={styles.note}>
                  <p className={styles.noteText}>{note.message}</p>
                  <p className={styles.noteMeta}>
                    <span className={styles.noteName}>{note.name}</span>
                    <time className="nums" dateTime={note.createdAt}>{formatDate(note.createdAt, locale)}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}
          {notes && visible < notes.length && (
            <button type="button" className={`btn btn-outline ${styles.more}`} onClick={() => setVisible(count => count + PAGE_SIZE)}>
              {t('show_more')}
            </button>
          )}
        </div>

        <form className={styles.form} onSubmit={submit}>
          <h3 className={styles.formTitle}>{t('form_title')}</h3>
          <div className={styles.field}>
            <label htmlFor="guestbook-name">{t('name_label')}</label>
            <input
              id="guestbook-name"
              type="text"
              className="input"
              autoComplete="name"
              maxLength={MAX_NAME}
              value={form.name}
              onChange={setField('name')}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="guestbook-message">{t('message_label')}</label>
            <textarea
              id="guestbook-message"
              className="input"
              rows={4}
              maxLength={MAX_MESSAGE}
              value={form.message}
              onChange={setField('message')}
              aria-describedby="guestbook-count guestbook-privacy"
              required
            />
            <span id="guestbook-count" className={`${styles.count} nums`}>
              {[...form.message].length}/{MAX_MESSAGE}
            </span>
          </div>
          {/* Bal küpü: ziyaretçiye görünmez, botlar doldurur. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="guestbook-website">Website</label>
            <input
              id="guestbook-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={setField('website')}
            />
          </div>
          <p id="guestbook-privacy" className={styles.privacy}>{t('privacy')}</p>
          <div className={styles.submitRow}>
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? t('sending') : t('submit')}
            </button>
            <div role="status" aria-live="polite">
              {status === 'success' && <p className={styles.success}>{t('success')}</p>}
              {status && status.startsWith('error') && <p className={styles.error}>{t(status)}</p>}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
