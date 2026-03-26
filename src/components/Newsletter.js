'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './Newsletter.module.css';

export default function Newsletter() {
  const t = useTranslations('newsletter');
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
        body: JSON.stringify({ email })
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
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.icon}>📬</div>
        <h3 className={styles.title}>{t('title')}</h3>
        <p className={styles.description}>{t('description')}</p>
        
        {status === 'success' ? (
          <div className={styles.successMsg}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{t('success')}</span>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              className={styles.input}
              placeholder={t('placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className={`btn btn-primary ${styles.btn}`}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? t('subscribing') : t('subscribe')}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className={styles.errorMsg}>{t('error')}</p>
        )}
      </div>
    </div>
  );
}
