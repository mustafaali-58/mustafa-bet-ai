import { getBlogPosts } from '@/lib/blog';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// CDATA içinde kapanış dizisi geçerse bölünerek kaçışlanır.
function cdata(value) {
  return `<![CDATA[${String(value).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

const MAX_ITEMS = 50;

export async function GET() {
  const posts = getBlogPosts('tr').slice(0, MAX_ITEMS);

  const rssItems = posts.map(post => {
    const url = `${SITE_URL}/tr/blog/${encodeURIComponent(post.slug)}`;
    return `
    <item>
      <title>${cdata(post.frontmatter.title)}</title>
      <link>${url}</link>
      <description>${cdata(post.frontmatter.description)}</description>
      <pubDate>${new Date(post.frontmatter.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${url}</guid>
      ${post.frontmatter.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} Blog</title>
    <link>${SITE_URL}/tr/blog</link>
    <description>Teknoloji haber özetleri ve yazılar</description>
    <language>tr</language>
    <lastBuildDate>${new Date(posts[0]?.frontmatter.date || Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
