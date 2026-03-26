import { getBlogPosts } from '@/lib/blog';

export default function sitemap() {
  const baseUrl = 'https://mustafaalisolmazgul.com.tr';
  const locales = ['tr', 'en'];
  const staticPages = ['', '/about', '/projects', '/blog', '/contact', '/resources'];

  // Static pages for both locales
  const staticEntries = locales.flatMap(locale =>
    staticPages.map(page => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // Dynamic blog posts
  const blogEntries = locales.flatMap(locale => {
    const posts = getBlogPosts(locale);
    return posts.map(post => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.frontmatter.date),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  });

  return [...staticEntries, ...blogEntries];
}
