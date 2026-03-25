import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { getBlogPosts } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';
import styles from './Blog.module.css';

export async function generateMetadata() {
  return { title: 'Blog' };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const posts = getBlogPosts(locale);

  return <BlogContent posts={posts} />;
}

function BlogContent({ posts }) {
  const t = useTranslations('blog');

  return (
    <div className={styles.page}>
      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('title')}</h1>
          <p className="section-subtitle">{t('subtitle')}</p>

          {posts.length > 0 ? (
            <div className={styles.grid}>
              {posts.map(post => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  readMore={t('read_more')}
                  minRead={t('min_read')}
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>{t('no_posts')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
