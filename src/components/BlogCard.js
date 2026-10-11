import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/format';
import styles from './BlogCard.module.css';

const MAX_TAGS = 4;

export default function BlogCard({ post, readMore, minRead, newsBadge, locale = 'tr', headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;

  return (
    <Link href={`/blog/${post.slug}`} className={`glass-card ${styles.card}`}>
      <div className={styles.meta}>
        <time className={styles.date} dateTime={post.frontmatter.date}>
          {formatDate(post.frontmatter.date, locale)}
        </time>
        <span className={styles.readTime}>{post.readingTime} {minRead}</span>
        {post.type === 'news' && newsBadge && (
          <span className={styles.badge}>{newsBadge}</span>
        )}
      </div>
      <Heading className={styles.title}>{post.frontmatter.title}</Heading>
      <p className={styles.description}>{post.frontmatter.description}</p>
      <div className={styles.tags}>
        {post.frontmatter.tags.slice(0, MAX_TAGS).map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <span className={styles.readMore}>
        {readMore}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </span>
    </Link>
  );
}
