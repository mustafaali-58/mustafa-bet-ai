'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const t = useTranslations('nav');
  const tLang = useTranslations('language');
  const tA11y = useTranslations('a11y');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Mobil menü Escape ile kapanır.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const switchLocale = () => {
    const newLocale = locale === 'tr' ? 'en' : 'tr';
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/projects', label: t('projects') },
    { href: '/resources', label: t('resources') },
    { href: '/blog', label: t('blog') },
    { href: '/contact', label: t('contact') },
  ];

  // Alt sayfalarda da (ör. bir blog yazısı) ilgili bölüm işaretli kalır.
  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} aria-label={`MA. — ${t('home')}`}>
          MA<span className={styles.logoDot}>.</span>
        </Link>

        <nav
          id="site-nav"
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
          aria-label={tA11y('main_nav')}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.active : ''}`}
              aria-current={isActive(link.href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.control} ${styles.langBtn}`}
            onClick={switchLocale}
            aria-label={`${tLang('switch')} — ${tA11y('switch_language')}`}
          >
            {tLang('switch')}
          </button>

          <ThemeToggle label={tA11y('toggle_theme')} />

          <button
            type="button"
            className={`${styles.control} ${styles.menuBtn}`}
            onClick={() => setMenuOpen(open => !open)}
            aria-label={tA11y('toggle_menu')}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

// Tema: ziyaretçi cihaz ayarından farklı bir tema seçtiyse <html data-theme>
// özniteliğinde tutulur (sayfa çizilmeden önce düzen dosyasındaki betik
// uygular). Seçim yoksa cihazın açık/koyu ayarı geçerlidir.
const themeListeners = new Set();
const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeTheme(callback) {
  themeListeners.add(callback);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener('change', callback);
  return () => {
    themeListeners.delete(callback);
    media.removeEventListener('change', callback);
  };
}

function readTheme() {
  const chosen = document.documentElement.getAttribute('data-theme');
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function ThemeToggle({ label }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'light');

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const system = window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
    // Seçilen tema cihaz ayarıyla aynıysa kayıt silinir; site yeniden cihaz
    // ayarını izler (ör. gece koyuya, gündüz açığa kendiliğinden geçer).
    const followSystem = next === system;
    if (followSystem) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', next);
    }
    try {
      if (followSystem) localStorage.removeItem('theme');
      else localStorage.setItem('theme', next);
    } catch {
      // Depolama kapalıysa tercih yalnızca bu sayfa için geçerli olur.
    }
    themeListeners.forEach(listener => listener());
  };

  return (
    <button type="button" className={styles.control} onClick={toggle} aria-label={label}>
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
          <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
          <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
