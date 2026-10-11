import { routing } from '@/i18n/routing';
import { socialLinks } from '@/data/social';

export const SITE_URL = 'https://mustafaalisolmazgul.com.tr';
export const SITE_NAME = 'Mustafa Ali Solmazgül';
export const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: SITE_NAME };

const OG_LOCALE = { tr: 'tr_TR', en: 'en_US' };

const SITE_DESCRIPTION = {
  tr: 'Veri Analisti & Teknoloji Uzmanı — veri analitiği, raporlama ve bilgisayar sistemleri üzerine portfolyo ve blog.',
  en: 'Data Analyst & Tech Specialist — portfolio and blog on data analytics, reporting and computer systems.'
};

export function siteDescription(locale) {
  return SITE_DESCRIPTION[locale] || SITE_DESCRIPTION.tr;
}

/**
 * Bir sayfanın canonical adresini ve dil karşılıklarını üretir.
 * `path` dil ön eki olmadan verilir ('' ana sayfa, '/about', '/blog/slug').
 * `locales`, sayfanın gerçekten var olduğu dilleri sınırlar (ör. çevirisi
 * olmayan bir blog yazısı).
 */
export function localizedAlternates(locale, path = '', locales = routing.locales) {
  const languages = Object.fromEntries(locales.map(l => [l, `/${l}${path}`]));
  if (locales.includes(routing.defaultLocale)) {
    languages['x-default'] = `/${routing.defaultLocale}${path}`;
  }
  return { canonical: `/${locale}${path}`, languages };
}

/**
 * Sayfa meta verisi. Next.js meta alanlarını yüzeysel birleştirdiği için
 * (bir sayfa `openGraph` verirse üst düzendeki tamamen ezilir) canonical,
 * Open Graph ve Twitter alanları her sayfa için buradan eksiksiz üretilir.
 */
export function buildMetadata({
  locale,
  path = '',
  title,
  description,
  locales,
  type = 'website',
  publishedTime,
  tags
}) {
  const desc = description || siteDescription(locale);
  const ogTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: localizedAlternates(locale, path, locales),
    openGraph: {
      type,
      title: ogTitle,
      description: desc,
      url: `/${locale}${path}`,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale] || OG_LOCALE.tr,
      images: [OG_IMAGE],
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      ...(type === 'article' && tags?.length ? { tags } : {})
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: desc,
      images: [OG_IMAGE.url]
    }
  };
}

const JOB_TITLE = {
  tr: 'Veri Analisti & Teknoloji Uzmanı',
  en: 'Data Analyst & Tech Specialist'
};

export function personJsonLd(locale) {
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    jobTitle: JOB_TITLE[locale] || JOB_TITLE.tr,
    worksFor: { '@type': 'Organization', name: 'SASA Polyester Sanayi A.Ş.' },
    sameAs: socialLinks.filter(s => s.url.startsWith('http')).map(s => s.url)
  };
}

export function homeJsonLd(locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personJsonLd(locale),
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/${locale}`,
        name: SITE_NAME,
        description: siteDescription(locale),
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#person` }
      }
    ]
  };
}

export function postJsonLd(post, locale) {
  const url = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const isNews = post.type === 'news';

  return {
    '@context': 'https://schema.org',
    '@type': isNews ? 'Article' : 'BlogPosting',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: new Date(post.frontmatter.date).toISOString(),
    inLanguage: locale,
    url,
    mainEntityOfPage: url,
    image: `${SITE_URL}${OG_IMAGE.url}`,
    keywords: (post.frontmatter.tags || []).join(', '),
    publisher: personJsonLd(locale),
    // Haber özetleri yapay zekâ yardımıyla hazırlandığı için kişisel imza taşımaz.
    ...(isNews ? {} : { author: personJsonLd(locale) }),
    ...(isNews && post.frontmatter.source ? { isBasedOn: post.frontmatter.source } : {})
  };
}
