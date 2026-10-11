'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { socialLinks } from '@/data/social';
import ExternalIcon from '@/components/ExternalIcon';
import styles from './Contact.module.css';

// Bağlantının görünen kısa hali: "github.com/kullanici" ya da e-posta adresi.
function displayTarget(url) {
  if (url.startsWith('mailto:')) return url.slice('mailto:'.length);
  try {
    const { hostname, pathname } = new URL(url);
    return decodeURIComponent(`${hostname.replace(/^www\./, '')}${pathname}`).replace(/\/$/, '');
  } catch {
    return url;
  }
}

// Adres dar alanda satır sonunda bölünebilir. Son parça, "yeni sekme" simgesiyle
// birlikte bölünmeyen bir bütün olarak verilir; simge tek başına alt satıra düşmez.
function splitTail(text) {
  const at = Math.max(text.lastIndexOf('/'), text.lastIndexOf('-')) + 1;
  return [text.slice(0, at), text.slice(at)];
}

export default function ContactForm() {
  const t = useTranslations('contact');
  const tA11y = useTranslations('a11y');
  const [formState, setFormState] = useState({ name: '', email: '', message: '', website: '' });
  // null | 'sending' | 'success' | 'error' | 'error_rate' | 'error_invalid' | 'error_fallback'
  const [status, setStatus] = useState(null);

  const setField = (field) => (e) => setFormState(s => ({ ...s, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      if (res.ok) {
        setStatus('success');
        setFormState({ name: '', email: '', message: '', website: '' });
      } else if (res.status === 429) {
        setStatus('error_rate');
      } else if (res.status === 400) {
        setStatus('error_invalid');
      } else if (res.status === 503) {
        setStatus('error_fallback');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className={`container ${styles.body}`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="name">{t('name_label')}</label>
          <input
            id="name"
            type="text"
            className="input"
            autoComplete="name"
            maxLength={100}
            value={formState.name}
            onChange={setField('name')}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">{t('email_label')}</label>
          <input
            id="email"
            type="email"
            className="input"
            autoComplete="email"
            maxLength={254}
            value={formState.email}
            onChange={setField('email')}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="message">{t('message_label')}</label>
          <textarea
            id="message"
            className="input"
            rows={7}
            minLength={10}
            maxLength={5000}
            value={formState.message}
            onChange={setField('message')}
            required
          />
        </div>
        {/* Bal küpü: ziyaretçiye görünmez, botlar doldurur. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={formState.website}
            onChange={setField('website')}
          />
        </div>

        <div className={styles.submitRow}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? t('sending') : t('send')}
          </button>
          <div role="status" aria-live="polite">
            {status === 'success' && (
              <p className={styles.success}>{t('success')}</p>
            )}
            {status && status.startsWith('error') && (
              <p className={styles.error}>{t(status)}</p>
            )}
          </div>
        </div>
      </form>

      <aside aria-labelledby="contact-direct">
        <h2 id="contact-direct" className={styles.directTitle}>{t('or_reach')}</h2>
        <ul>
          {socialLinks.map(social => {
            // E-posta bağlantısı yeni sekme açmaz; diğerleri dış sitelere gider.
            const isMail = social.url.startsWith('mailto:');
            const target = displayTarget(social.url);
            const [head, tail] = splitTail(target);
            return (
              <li key={social.name} className={styles.channel}>
                <span className={styles.channelName}>
                  {isMail ? t('email_label') : social.name}
                </span>
                {isMail ? (
                  <a href={social.url} className={styles.channelLink}>{target}</a>
                ) : (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.channelLink}
                    aria-label={`${social.name}: ${target} (${tA11y('external')})`}
                  >
                    {head}
                    <span className={styles.channelTail}>
                      {tail}
                      <ExternalIcon />
                    </span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
