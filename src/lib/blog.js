import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

// Yazılar derleme anında sabittir; her istekte yüzlerce dosyayı yeniden
// okumamak için dil başına bir kez okunup bellekte tutulur.
const cache = new Map();

function toIsoDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function httpUrlOrNull(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value) ? value : null;
}

function parsePost(localeDir, filename) {
  const slug = filename.replace(/\.(md|mdx)$/, '');
  const fileContent = fs.readFileSync(path.join(localeDir, filename), 'utf-8');
  const { data, content } = matter(fileContent);

  // Elle yazılan yazılar `author` taşır; otomatik üretilenler taşımaz ve
  // "haber özeti" sayılır. `type` alanı verilmişse o geçerlidir.
  const type = data.type === 'article' || data.type === 'news'
    ? data.type
    : (data.author ? 'article' : 'news');

  return {
    slug,
    type,
    frontmatter: {
      title: data.title || slug,
      date: toIsoDate(data.date),
      description: data.description || '',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      image: data.image || null,
      author: type === 'article' ? (data.author || 'Mustafa Ali') : null,
      source: httpUrlOrNull(data.source),
      sourceName: typeof data.sourceName === 'string' ? data.sourceName : null
    },
    readingTime: Math.max(1, Math.ceil(readingTime(content).minutes)),
    content
  };
}

export function getBlogPosts(locale = 'tr') {
  if (cache.has(locale)) return cache.get(locale);

  const localeDir = path.join(contentDirectory, locale);
  if (!fs.existsSync(localeDir)) return [];

  const posts = fs.readdirSync(localeDir)
    .filter(f => f.endsWith('.md') || f.endsWith('.mdx'))
    .map(filename => parsePost(localeDir, filename))
    .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));

  cache.set(locale, posts);
  return posts;
}

export function getBlogPost(slug, locale = 'tr') {
  return getBlogPosts(locale).find(post => post.slug === slug) || null;
}

/** Liste ve kartlar için yazı gövdesi olmadan, yalnızca gösterilen alanlar. */
export function getBlogPostSummaries(locale = 'tr') {
  return getBlogPosts(locale).map(({ slug, type, frontmatter, readingTime: minutes }) => ({
    slug,
    type,
    readingTime: minutes,
    frontmatter: {
      title: frontmatter.title,
      date: frontmatter.date,
      description: frontmatter.description,
      tags: frontmatter.tags
    }
  }));
}

/** Yazının var olduğu diller (çevirisi eksik yazılar için). */
export function getPostLocales(slug, locales) {
  return locales.filter(locale => getBlogPost(slug, locale));
}

/** Ortak etiket sayısına, eşitlikte yeniliğe göre ilgili yazılar. */
export function getRelatedPosts(slug, locale = 'tr', limit = 3) {
  const posts = getBlogPosts(locale);
  const current = posts.find(post => post.slug === slug);
  if (!current) return [];

  const tags = new Set(current.frontmatter.tags.map(tag => tag.toLowerCase()));

  return posts
    .filter(post => post.slug !== slug)
    .map((post, index) => ({
      post,
      index,
      score: post.frontmatter.tags.filter(tag => tags.has(tag.toLowerCase())).length
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ post }) => ({
      slug: post.slug,
      type: post.type,
      readingTime: post.readingTime,
      frontmatter: {
        title: post.frontmatter.title,
        date: post.frontmatter.date,
        description: post.frontmatter.description,
        tags: post.frontmatter.tags
      }
    }));
}

/**
 * Gövdeyi sayfada gösterime hazırlar:
 * - Baştaki `# Başlık` satırını atar; başlık sayfada zaten h1 olarak yer alır.
 * - Yalnızca kalın metinden oluşan satırları (`**Ara başlık**`) gerçek ara
 *   başlığa çevirir; üretilen yazılar ara başlıkları bu biçimde yazıyor.
 */
export function prepareContent(content) {
  return content
    .replace(/^\s*#\s+.*(?:\r?\n)+/, '')
    .replace(/^[ \t]*\*\*([^*\n]{2,90}?):?\*\*[ \t]*$/gm, '\n## $1\n');
}

export async function renderMarkdown(content) {
  const result = await remark().use(html).process(prepareContent(content));
  return result.toString();
}
