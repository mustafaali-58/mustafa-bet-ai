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
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, isOpen]);

  // Pencere açılınca yazı alanına odaklanılır; Escape ile kapanır. Kapanınca
  // odak, pencereyi açan düğmeye döner.
  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const launcher = launcherRef.current;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      launcher?.focus();
    };
  }, [isOpen]);

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
      else if (data.code === 'busy') content = t('busy');
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
      <button
        ref={launcherRef}
        type="button"
        className={`${styles.launcher} ${isOpen ? styles.launcherHidden : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label={t('open')}
        aria-expanded={isOpen}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>

      {/* Kapalıyken klavye ve ekran okuyucu için de gizlenir. */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label={t('title')}
        inert={!isOpen}
      >
        <div className={styles.header}>
          <div>
            <p className={styles.title}>{t('title')}</p>
            <p className={styles.status}>{t('online')}</p>
          </div>
          <button type="button" className={styles.close} onClick={() => setIsOpen(false)} aria-label={t('close')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className={styles.messages} aria-live="polite">
          {messages.length === 0 && (
            <div className={styles.welcome}>
              <p>{t('welcome')}</p>
              <div className={styles.suggestions}>
                {suggestions.map(q => (
                  <button
                    key={q}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.fromUser : styles.fromAssistant}`}>
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.fromAssistant}`}>
              <span className={styles.typing} aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className={styles.inputArea} onSubmit={sendMessage}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            maxLength={500}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className={styles.send} disabled={isLoading || !input.trim()} aria-label={t('send')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
