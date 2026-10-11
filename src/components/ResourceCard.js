import ExternalIcon from './ExternalIcon';
import styles from './ResourceCard.module.css';

// Kaynak satırı: ad, açıklama ve etiketler; sağda kaynağa giden bağlantı.
export default function ResourceCard({ item, locale, viewText, externalText }) {
  const description = locale === 'tr' ? item.description_tr : item.description;

  return (
    <li className={styles.row}>
      <div>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{description}</p>
        <p className={styles.tags}>{item.tags.join(', ')}</p>
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        aria-label={`${viewText}: ${item.name}${externalText ? ` (${externalText})` : ''}`}
      >
        {viewText}
        <ExternalIcon />
      </a>
    </li>
  );
}
