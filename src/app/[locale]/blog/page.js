import { getTranslations } from 'next-intl/server';
import { getBlogPostSummaries } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';
import BlogSearch from '@/components/BlogSearch';
import Newsletter from '@/components/Newsletter';
import PageHeader from '@/components/PageHeader';
import styles from './Blog.module.css';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return buildMetadata({
    locale,
    path: '/blog',
    title: t('title'),
    description: t('subtitle')
  });
}

export default async function BlogPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  // Listeye yalnızca satırda gösterilen alanlar gider; yazı gövdeleri gitmez.
  const posts = getBlogPostSummaries(locale);

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')} />
      <div className={`container ${styles.body}`}>
        <BlogSearch posts={posts} />
        <Newsletter />
      </div>
    </>
  );
}
