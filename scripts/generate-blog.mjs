import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Parser from 'rss-parser';
import fs from 'fs';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const rootDir = path.join(__dirname, '..');
const blogsDir = path.join(rootDir, 'src/content/blog');

const parser = new Parser();

// Helper to clean AI response
const cleanJsonResponse = (text) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

async function generateWithGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return cleanJsonResponse(response.text());
}

async function generateWithOpenAI(prompt) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  return response.choices[0].message.content;
}

async function generateBlog() {
  try {
    console.log('Fetching latest tech news...');
    const feed = await parser.parseURL('https://techcrunch.com/feed/');
    const latestNews = feed.items.slice(0, 5);
    const existingPosts = fs.readdirSync(path.join(blogsDir, 'tr')).map(f => f.replace('.md', ''));
    
    let targetNews = null;
    for (const item of latestNews) {
      const slug = slugify(item.title, { lower: true, strict: true });
      if (!existingPosts.includes(slug)) {
        targetNews = item;
        break;
      }
    }

    if (!targetNews) {
      console.log('No new news found to blog about.');
      return;
    }

    console.log(`Generating blog post for: ${targetNews.title}`);

    // Yazılar kişisel köşe yazısı değil, kaynağı belli "haber özeti"dir: birinci
    // tekil şahıs, kişisel görüş ya da uzmanlık iddiası içermez.
    const prompt = `
      You are a neutral technology news editor.
      Write a short news brief in ONE JSON object that summarizes the news below.
      Rules:
      - Summarize only what the source says; do not invent facts, figures, or quotes.
      - Write in the third person. No first-person opinions and no claims of personal expertise.
      - Use "## " markdown subheadings; do not repeat the title as a heading in the content.
      Source News: ${targetNews.title}
      Link: ${targetNews.link}
      Snippet: ${targetNews.contentSnippet}

      Your output MUST be a strict JSON object with these exact keys:
      {
        "tr": { 
           "title": "Turkish Title", 
           "description": "Turkish short description", 
           "tags": ["Tag1", "Tag2"], 
           "content": "Turkish content body here without frontmatter and without the title..." 
        },
        "en": { 
           "title": "English Title", 
           "description": "English short description", 
           "tags": ["Tag1", "Tag2"], 
           "content": "English content body here without frontmatter and without the title..." 
        }
      }
      Tone: Neutral, clear, and accessible.
    `;

    let blogJson;
    try {
      console.log('Trying Gemini...');
      const text = await generateWithGemini(prompt);
      blogJson = JSON.parse(text);
    } catch (e) {
      console.log(`Gemini failed: ${e.message}. Trying OpenAI...`);
      const text = await generateWithOpenAI(prompt);
      blogJson = JSON.parse(text);
    }

    const slug = slugify(targetNews.title, { lower: true, strict: true });
    const date = new Date().toISOString();

    // İki dil de eksiksiz gelmeden hiçbir dosya yazılmaz; aksi halde bir dilin
    // yazısı diğeri olmadan yayımlanır.
    for (const lang of ['tr', 'en']) {
      const data = blogJson?.[lang];
      const complete = data
        && typeof data.title === 'string' && data.title.trim()
        && typeof data.description === 'string'
        && typeof data.content === 'string' && data.content.trim()
        && Array.isArray(data.tags);
      if (!complete) throw new Error(`Model output is missing or incomplete for "${lang}"`);
    }

    const sourceUrl = /^https?:\/\//.test(targetNews.link || '') ? targetNews.link : null;

    const generateMarkdown = (data) => `---
title: ${JSON.stringify(data.title)}
date: ${date}
description: ${JSON.stringify(data.description)}
tags: ${JSON.stringify(data.tags.map(String))}
image: null
type: "news"
source: ${JSON.stringify(sourceUrl)}
sourceName: "TechCrunch"
---
${data.content}`;

    const files = ['tr', 'en'].map(lang => ({
      file: path.join(blogsDir, lang, `${slug}.md`),
      body: generateMarkdown(blogJson[lang])
    }));
    for (const { file, body } of files) fs.writeFileSync(file, body);

    console.log(`Blog successfully generated: ${slug}`);

  } catch (error) {
    // GitHub Actions'ta çalıştırma özetinde görünen bir hata notu bırakır ve
    // adımı başarısız sayar; iş akışı yayınlama adımına yine de devam eder.
    console.error(`::error title=Blog üretimi başarısız::${error.message}`);
    process.exitCode = 1;
  }
}

generateBlog();
