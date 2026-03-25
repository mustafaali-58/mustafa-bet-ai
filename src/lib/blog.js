import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

export function getBlogPosts(locale = 'tr') {
  const localeDir = path.join(contentDirectory, locale);

  if (!fs.existsSync(localeDir)) {
    return [];
  }

  const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const posts = files.map(filename => {
    const slug = filename.replace(/\.(md|mdx)$/, '');
    const filePath = path.join(localeDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const stats = readingTime(content);

    return {
      slug,
      frontmatter: {
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        description: data.description || '',
        tags: data.tags || [],
        image: data.image || null,
        author: data.author || 'Mustafa Ali'
      },
      readingTime: Math.ceil(stats.minutes),
      content
    };
  });

  return posts.sort((a, b) =>
    new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
  );
}

export function getBlogPost(slug, locale = 'tr') {
  const localeDir = path.join(contentDirectory, locale);
  const mdPath = path.join(localeDir, `${slug}.md`);
  const mdxPath = path.join(localeDir, `${slug}.mdx`);

  let filePath = null;
  if (fs.existsSync(mdxPath)) filePath = mdxPath;
  else if (fs.existsSync(mdPath)) filePath = mdPath;
  else return null;

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);

  return {
    slug,
    frontmatter: {
      title: data.title || slug,
      date: data.date || new Date().toISOString(),
      description: data.description || '',
      tags: data.tags || [],
      image: data.image || null,
      author: data.author || 'Mustafa Ali'
    },
    readingTime: Math.ceil(stats.minutes),
    content
  };
}

export async function renderMarkdown(content) {
  const result = await remark().use(html).process(content);
  return result.toString();
}
