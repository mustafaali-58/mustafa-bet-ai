import { getLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getBlogPost, getBlogPosts, renderMarkdown } from '@/lib/blog';
import PodcastPlayer from '@/components/PodcastPlayer';
import styles from './BlogPost.module.css';

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const post = getBlogPost(slug, locale);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export async function generateStaticParams() {
  const locales = ['tr', 'en'];
  const allParams = [];
  for (const locale of locales) {
    const posts = getBlogPosts(locale);
    for (const post of posts) {
      allParams.push({ locale, slug: post.slug });
    }
  }
  return allParams;
}

export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params;
  const post = getBlogPost(slug, locale);

  if (!post) notFound();

  const htmlContent = await renderMarkdown(post.content);

  return <BlogPostContent post={post} htmlContent={htmlContent} />;
}

function BlogPostContent({ post, htmlContent }) {
  const t = useTranslations('blog');

  return (
    <div className={styles.page}>
      <article className={`container ${styles.article}`}>
        <Link href="/blog" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('back_to_blog')}
        </Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <time>
              {t('published')}: {new Date(post.frontmatter.date).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
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

          {post.frontmatter.audio && (
            <div className={styles.podcastWrapper}>
              <PodcastPlayer audioUrl={post.frontmatter.audio} />
            </div>
          )}
        </header>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
}
