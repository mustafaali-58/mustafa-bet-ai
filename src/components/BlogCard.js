import { Link } from '@/i18n/navigation';
import styles from './BlogCard.module.css';

export default function BlogCard({ post, readMore, minRead }) {
  return (
    <Link href={`/blog/${post.slug}`} className={`glass-card ${styles.card}`}>
      <div className={styles.meta}>
        <time className={styles.date}>
          {new Date(post.frontmatter.date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        <span className={styles.readTime}>{post.readingTime} {minRead}</span>
      </div>
      <h3 className={styles.title}>{post.frontmatter.title}</h3>
      <p className={styles.description}>{post.frontmatter.description}</p>
      <div className={styles.tags}>
        {post.frontmatter.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <span className={styles.readMore}>
        {readMore}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </span>
    </Link>
  );
}
