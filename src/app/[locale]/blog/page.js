import { getLocale } from 'next-intl/server';
import { getBlogPosts } from '@/lib/blog';
import BlogSearch from '@/components/BlogSearch';
import Newsletter from '@/components/Newsletter';
import styles from './Blog.module.css';

export async function generateMetadata() {
  return { title: 'Blog' };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const posts = getBlogPosts(locale);

  return (
    <div className={styles.page}>
      <section className="section">
        <div className="container">
          <BlogSearch posts={posts} />
          <Newsletter />
        </div>
      </section>
    </div>
  );
}
