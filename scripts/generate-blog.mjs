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
      Write a professional, insightful blog post in ONE JSON object based on the news below.
      Source News: ${targetNews.title}
      Link: ${targetNews.link}
      Snippet: ${targetNews.contentSnippet}

      Your output MUST be a strict JSON object with these exact keys:
      {
        "tr": { 
           "title": "Turkish Title", 
           "description": "Turkish short description", 
           "tags": ["Tag1", "Tag2"], 
           "content": "# Turkish Title\\n\\nTurkish content body here without frontmatter..." 
        },
        "en": { 
           "title": "English Title", 
           "description": "English short description", 
           "tags": ["Tag1", "Tag2"], 
           "content": "# English Title\\n\\nEnglish content body here without frontmatter..." 
        }
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

    console.log('Generating TTS Audio for podcasts...');
    const generateAudioWithOpenAI = async (text, locale, postSlug) => {
      try {
        if (!process.env.OPENAI_API_KEY) {
          console.warn('OPENAI_API_KEY missing, skipping audio generation');
          return null;
        }
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: locale === 'tr' ? 'onyx' : 'echo',
          input: text.slice(0, 4000), // Max 4096 chars
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        const audioDir = path.join(rootDir, 'public', 'audio', locale);
        if (!fs.existsSync(audioDir)) {
          fs.mkdirSync(audioDir, { recursive: true });
        }
        const audioPath = path.join(audioDir, `${postSlug}.mp3`);
        fs.writeFileSync(audioPath, buffer);
        console.log(`Audio successfully generated for ${locale}: ${postSlug}`);
        return `/audio/${locale}/${postSlug}.mp3`;
      } catch (e) {
        console.error(`Audio generation failed for ${locale}:`, e.message);
        return null;
      }
    };

    const cleanForTTS = (text) => text.replace(/[#*`~>-]/g, '').trim();
    const trAudioPath = await generateAudioWithOpenAI(cleanForTTS(blogJson.tr.title + '. ' + blogJson.tr.content), 'tr', slug);
    const enAudioPath = await generateAudioWithOpenAI(cleanForTTS(blogJson.en.title + '. ' + blogJson.en.content), 'en', slug);

    const generateMarkdown = (data, audioUrl) => `---
title: ${JSON.stringify(data.title)}
date: ${date}
description: ${JSON.stringify(data.description)}
tags: ${JSON.stringify(data.tags)}
image: null
audio: ${audioUrl ? JSON.stringify(audioUrl) : 'null'}
---
${data.content}`;

    // Save TR
    fs.writeFileSync(path.join(blogsDir, 'tr', `${slug}.md`), generateMarkdown(blogJson.tr, trAudioPath));
    // Save EN
    fs.writeFileSync(path.join(blogsDir, 'en', `${slug}.md`), generateMarkdown(blogJson.en, enAudioPath));
    
    console.log(`Blog successfully generated: ${slug}`);

  } catch (error) {
    console.error('Final Error:', error.message);
  }
}

generateBlog();
