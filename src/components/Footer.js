import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { socialLinks } from '@/data/social';
import { SITE_NAME } from '@/lib/seo';
import { formatDate } from '@/lib/format';
import { visitorSummary } from '@/lib/visitor-stats';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tContact = useTranslations('contact');
  const locale = useLocale();
  const stats = visitorSummary();
  const numbers = new Intl.NumberFormat(locale);
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });

  const quickLinks = [
    { href: '/', label: tNav('home') },
    { href: '/about', label: tNav('about') },
    { href: '/projects', label: tNav('projects') },
    { href: '/resources', label: tNav('resources') },
    { href: '/blog', label: tNav('blog') },
    { href: '/contact', label: tNav('contact') },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            MA<span className={styles.logoDot}>.</span>
          </span>
          <p className={styles.name}>{SITE_NAME}</p>
          <p className={styles.role}>{tHero('title')}</p>
        </div>

        <nav aria-label={t('links')}>
          <h2 className={styles.columnTitle}>{t('links')}</h2>
          <ul className={styles.list}>
            {quickLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={styles.columnTitle}>{t('social')}</h2>
          <ul className={styles.list}>
            {socialLinks.map(social => (
              <li key={social.name}>
                {social.url.startsWith('mailto:') ? (
                  <a href={social.url} className={styles.link}>{tContact('email_label')}</a>
                ) : (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {social.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Ziyaretçi sayacı: Vercel Web Analytics verisi, yayınla birlikte güncellenir. */}
        {stats.visitors > 0 && (
          <div className={styles.stats}>
            <h2 className={styles.columnTitle}>{t('visitors_title')}</h2>
            <p className={styles.statLine}>
              {t.rich('visitors_count', {
                count: stats.visitors,
                formatted: numbers.format(stats.visitors),
                num: chunks => <span className={`${styles.statNumber} nums`}>{chunks}</span>
              })}
            </p>
            <p className={styles.statLine}>
              {t.rich('countries_count', {
                count: stats.countryCount,
                formatted: numbers.format(stats.countryCount),
                num: chunks => <span className={`${styles.statNumber} nums`}>{chunks}</span>
              })}
            </p>
            {stats.topCountries.length > 0 && (
              <ul className={styles.countries} aria-label={t('top_countries')}>
                {stats.topCountries.map(country => (
                  <li key={country.code} className={styles.country}>
                    <span>{regionNames.of(country.code) || country.code}</span>
                    <span className="nums">{numbers.format(country.visitors)}</span>
                  </li>
                ))}
              </ul>
            )}
            {stats.updatedAt && (
              <p className={`${styles.statNote} nums`}>
                {t('stats_updated', { date: formatDate(stats.updatedAt, locale) })}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="container">
        <p className={`${styles.bottom} nums`}>© {new Date().getFullYear()} {SITE_NAME}. {t('copyright')}</p>
      </div>
    </footer>
  );
}
