import styles from './ResourceCard.module.css';

export default function ResourceCard({ item, locale, viewText }) {
  const description = locale === 'tr' ? item.description_tr : item.description;

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.name}>{item.name}</h3>
        <p className={styles.description}>{description}</p>
        <div className={styles.tags}>
          {item.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
      <div className={styles.footer}>
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.link}
          aria-label={`${viewText}: ${item.name}`}
        >
          {viewText}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>
    </div>
  );
}
