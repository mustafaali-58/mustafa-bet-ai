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
import ExternalIcon from '@/components/ExternalIcon';
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
  const tA11y = await getTranslations({ locale, namespace: 'a11y' });
  const htmlContent = await renderMarkdown(post.content);
  const relatedPosts = getRelatedPosts(slug, locale, 3);
  const { source, sourceName } = post.frontmatter;
  const isNews = post.type === 'news';

  return (
    <>
      <JsonLd data={postJsonLd(post, locale)} />

      <article className={`container ${styles.article}`}>
        <Link href="/blog" className={styles.back}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('back_to_blog')}
        </Link>

        <header className={styles.header}>
          <p className={`${styles.meta} nums`}>
            <time dateTime={post.frontmatter.date}>
              {t('published')}: {formatDate(post.frontmatter.date, locale)}
            </time>
            <span>{post.readingTime} {t('min_read')}</span>
          </p>
          <h1 className={styles.title}>{post.frontmatter.title}</h1>
          {post.frontmatter.description && (
            <p className={styles.lead}>{post.frontmatter.description}</p>
          )}
          {post.frontmatter.tags.length > 0 && (
            <ul className={styles.tags}>
              {post.frontmatter.tags.map(tag => (
                <li key={tag} className="tag">{tag}</li>
              ))}
            </ul>
          )}
        </header>

        {isNews && (
          <aside className={styles.note}>
            <p className={styles.noteTitle}>{t('news_badge')}</p>
            <p>
              {source
                ? t('news_disclosure_source', { source: sourceName || new URL(source).hostname.replace(/^www\./, '') })
                : t('news_disclosure')}
            </p>
            {source && (
              <a
                href={source}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={styles.noteLink}
                aria-label={`${t('read_original')} (${tA11y('external')})`}
              >
                {t('read_original')}
                <ExternalIcon />
              </a>
            )}
          </aside>
        )}

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      <div className={`container ${styles.after}`}>
        {relatedPosts.length > 0 && (
          <section>
            <div className="section-head">
              <h2 className="section-title">{t('related')}</h2>
            </div>
            <div>
              {relatedPosts.map(related => (
                <BlogCard
                  key={related.slug}
                  post={related}
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
    </>
  );
}
