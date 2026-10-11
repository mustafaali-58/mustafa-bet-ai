import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import styles from './NotFound.module.css';

export default function NotFound() {
  const t = useTranslations('not_found');

  return (
    <div className={`container ${styles.body}`}>
      <p className={`${styles.code} nums`}>404</p>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.text}>{t('description')}</p>
      <div className={styles.actions}>
        <Link href="/" className="btn btn-primary">{t('home')}</Link>
        <Link href="/blog" className="btn btn-outline">{t('blog')}</Link>
      </div>
    </div>
  );
}
