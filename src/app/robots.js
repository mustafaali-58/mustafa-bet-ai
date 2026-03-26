export default function robots() {
  const baseUrl = 'https://mustafaalisolmazgul.com.tr';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
