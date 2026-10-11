'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import styles from './Newsletter.module.css';

export default function Newsletter() {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale })
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="newsletter-title">
      <div>
        <h2 id="newsletter-title" className={styles.title}>{t('title')}</h2>
        <p className={styles.description}>{t('description')}</p>
      </div>

      <div>
        {status === 'success' ? (
          <p className={styles.success} role="status">{t('success')}</p>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              className="input"
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? t('subscribing') : t('subscribe')}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className={styles.error} role="alert">{t('error')}</p>
        )}
      </div>
    </section>
  );
}
