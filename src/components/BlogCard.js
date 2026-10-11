import { Link } from '@/i18n/navigation';
import { formatDate } from '@/lib/format';
import styles from './BlogCard.module.css';

const MAX_TAGS = 4;

// Yazı satırı: tarih, başlık ve açıklama, sağda tür ve okuma süresi. Yazılar
// tarihli bir liste olduğu için kart yerine alt alta satırlar olarak dizilir.
export default function BlogCard({ post, minRead, newsBadge, locale = 'tr', headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  const tags = post.frontmatter.tags.slice(0, MAX_TAGS);

  return (
    <Link href={`/blog/${post.slug}`} className={styles.row}>
      <time className={`${styles.date} nums`} dateTime={post.frontmatter.date}>
        {formatDate(post.frontmatter.date, locale)}
      </time>

      <div className={styles.main}>
        <Heading className={styles.title}>{post.frontmatter.title}</Heading>
        {post.frontmatter.description && (
          <p className={styles.description}>{post.frontmatter.description}</p>
        )}
        {tags.length > 0 && <p className={styles.tags}>{tags.join(', ')}</p>}
      </div>

      <div className={`${styles.meta} nums`}>
        {post.type === 'news' && newsBadge && <span>{newsBadge}</span>}
        <span>{post.readingTime} {minRead}</span>
      </div>
    </Link>
  );
}
