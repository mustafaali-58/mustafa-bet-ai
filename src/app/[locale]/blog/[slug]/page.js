import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import {
  getBlogPost,
  getBlogPosts,
  getPostLocales,
  getRelatedPosts,
  renderMarkdown
} from '@/lib/blog';
import { formatDate } from '@/lib/format';
import { buildMetadata, postJsonLd } from '@/lib/seo';
import BlogCard from '@/components/BlogCard';
import JsonLd from '@/components/JsonLd';
import Newsletter from '@/components/Newsletter';
import styles from './BlogPost.module.css';

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const post = getBlogPost(slug, locale);
  if (!post) return { title: 'Not Found' };

  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    // Dil karşılığı yalnızca yazının gerçekten var olduğu diller için verilir.
    locales: getPostLocales(slug, routing.locales),
    type: 'article',
    publishedTime: post.frontmatter.date,
    tags: post.frontmatter.tags
  });
}

export async function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    getBlogPosts(locale).map(post => ({ locale, slug: post.slug }))
  );
}

export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params;
  const post = getBlogPost(slug, locale);

  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'blog' });
  const htmlContent = await renderMarkdown(post.content);
  const relatedPosts = getRelatedPosts(slug, locale, 3);
  const { source, sourceName } = post.frontmatter;

  return (
    <div className={styles.page}>
      <JsonLd data={postJsonLd(post, locale)} />
      <article className={`container ${styles.article}`}>
        <Link href="/blog" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('back_to_blog')}
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <time dateTime={post.frontmatter.date}>
              {t('published')}: {formatDate(post.frontmatter.date, locale)}
            </time>
            <span className={styles.readTime}>{post.readingTime} {t('min_read')}</span>
          </div>
          <h1 className={styles.title}>{post.frontmatter.title}</h1>
          {post.frontmatter.description && (
            <p className={styles.description}>{post.frontmatter.description}</p>
          )}
          <div className={styles.tags}>
            {post.frontmatter.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </header>

        {post.type === 'news' && (
          <aside className={styles.disclosure}>
            <span className={styles.disclosureBadge}>{t('news_badge')}</span>
            <p>
              {source
                ? t('news_disclosure_source', { source: sourceName || new URL(source).hostname.replace(/^www\./, '') })
                : t('news_disclosure')}
              {source && (
                <>
                  {' '}
                  <a href={source} target="_blank" rel="noopener noreferrer nofollow">
                    {t('read_original')}
                  </a>
                </>
              )}
            </p>
          </aside>
        )}

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      <div className={`container ${styles.after}`}>
        {relatedPosts.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{t('related')}</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map(related => (
                <BlogCard
                  key={related.slug}
                  post={related}
                  readMore={t('read_more')}
                  minRead={t('min_read')}
                  newsBadge={t('news_badge')}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
        <Newsletter />
      </div>
    </div>
  );
}
