import { getBlogPosts } from '@/lib/blog';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

const STATIC_PAGES = ['', '/about', '/projects', '/blog', '/contact', '/resources'];

function languageMap(path, locales) {
  return Object.fromEntries(locales.map(locale => [locale, `${SITE_URL}/${locale}${path}`]));
}

export default function sitemap() {
  const { locales } = routing;
  const postsByLocale = Object.fromEntries(locales.map(locale => [locale, getBlogPosts(locale)]));

  // Ana sayfa ve blog listesi en yeni yazıyla birlikte değişir; diğer sabit
  // sayfalar için uydurma bir tarih verilmez.
  const staticEntries = locales.flatMap(locale => {
    const newest = postsByLocale[locale][0]?.frontmatter.date;
    return STATIC_PAGES.map(page => ({
      url: `${SITE_URL}/${locale}${page}`,
      ...((page === '' || page === '/blog') && newest ? { lastModified: new Date(newest) } : {}),
      changeFrequency: page === '' || page === '/blog' ? 'daily' : 'monthly',
      priority: page === '' ? 1 : 0.8,
      alternates: { languages: languageMap(page, locales) }
    }));
  });

  const blogEntries = locales.flatMap(locale =>
    postsByLocale[locale].map(post => {
      // Dil karşılığı yalnızca yazının var olduğu diller için verilir.
      const available = locales.filter(l => postsByLocale[l].some(p => p.slug === post.slug));
      return {
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: { languages: languageMap(`/blog/${post.slug}`, available) }
      };
    })
  );

  return [...staticEntries, ...blogEntries];
}
