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

    const prompt = `
      You are Mustafa Ali Solmazgül, a senior software architect and AI/Fintech expert. 
      Write a professional, insightful blog post in ONE JSON object.
      Source News: ${targetNews.title}
      Link: ${targetNews.link}
      Snippet: ${targetNews.contentSnippet}

      Your output MUST be a JSON with these exact keys:
      {
        "tr": "--- (frontmatter including title, date, description, tags, image: null) --- \\n # Title \\n Content...",
        "en": "--- (frontmatter including title, date, description, tags, image: null) --- \\n # Title \\n Content..."
      }
      Tone: Technical but accessible, forward-looking.
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

    // Save TR
    fs.writeFileSync(path.join(blogsDir, 'tr', `${slug}.md`), blogJson.tr.replace(/date:.*?\n/, `date: ${date}\n`));
    // Save EN
    fs.writeFileSync(path.join(blogsDir, 'en', `${slug}.md`), blogJson.en.replace(/date:.*?\n/, `date: ${date}\n`));

    console.log(`Blog successfully generated: ${slug}`);

  } catch (error) {
    console.error('Final Error:', error.message);
  }
}

generateBlog();
