'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ChatBot.module.css';

export default function ChatBot() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json().catch(() => ({}));

      // Hata durumlarında metin sayfanın dilinde gösterilir.
      let content;
      if (res.ok && data.reply) content = data.reply;
      else if (res.status === 429) content = t('rate_limited');
      else if (res.status === 400) content = t('too_long');
      else content = t('error');

      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('error') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [t('suggestion_1'), t('suggestion_2'), t('suggestion_3')];

  return (
    <>
      {/* Floating Button */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label={t('open')}
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {/* Chat Panel: kapalıyken klavye ve ekran okuyucu için de gizlenir. */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label={t('title')}
        inert={!isOpen}
      >
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar} aria-hidden="true">MA</div>
            <div>
              <p className={styles.headerTitle}>{t('title')}</p>
              <span className={styles.headerStatus}>{t('online')}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label={t('close')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className={styles.messages} aria-live="polite">
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <p>{t('welcome')}</p>
              <div className={styles.suggestions}>
                {suggestions.map(q => (
                  <button key={q} className={styles.suggestionBtn} onClick={() => { setInput(q); }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.assistantMsg}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMsg}`}>
              <div className={styles.typing}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={sendMessage}>
          <input
            type="text"
            className={styles.input}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className={styles.sendBtn} disabled={isLoading || !input.trim()} aria-label={t('send')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
