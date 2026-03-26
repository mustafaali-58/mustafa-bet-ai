import { getBlogPosts } from '@/lib/blog';

export async function GET() {
  const baseUrl = 'https://mustafaalisolmazgul.com.tr';
  const posts = getBlogPosts('tr');

  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.frontmatter.title}]]></title>
      <link>${baseUrl}/tr/blog/${post.slug}</link>
      <description><![CDATA[${post.frontmatter.description}]]></description>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/tr/blog/${post.slug}</guid>
      <author>${post.frontmatter.author}</author>
      ${(post.frontmatter.tags || []).map(tag => `<category>${tag}</category>`).join('\n      ')}
    </item>`).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mustafa Ali Solmazgül Blog</title>
    <link>${baseUrl}</link>
    <description>Teknoloji, yazılım ve veri analitiği hakkında yazılar</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
