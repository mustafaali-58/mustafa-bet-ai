import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import fs from 'fs';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const rootDir = path.join(__dirname, '..');
const blogsDir = path.join(rootDir, 'src/content/blog');

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

async function runRetroactive() {
  const locales = ['tr', 'en'];

  for (const locale of locales) {
    const localeDir = path.join(blogsDir, locale);
    if (!fs.existsSync(localeDir)) continue;

    const files = fs.readdirSync(localeDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(localeDir, file);
      const slug = file.replace('.md', '');
      const audioPathCheck = path.join(rootDir, 'public', 'audio', locale, `${slug}.mp3`);

      if (fs.existsSync(audioPathCheck)) {
        console.log(`Audio already exists for ${locale}/${slug}. Skipping...`);
        continue; // Skip if audio already generated
      }

      console.log(`Processing file: ${locale}/${slug}.md`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      const textToRead = `${data.title}. ${content}`;
      const audioUrl = await generateAudioWithOpenAI(cleanForTTS(textToRead), locale, slug);

      if (audioUrl) {
        // Update frontmatter
        const newFrontmatter = { ...data, audio: audioUrl };
        const newContent = matter.stringify(content, newFrontmatter);
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated frontmatter for ${locale}/${slug}.`);
      }
    }
  }

  console.log('Finished retroactive audio generation.');
}

runRetroactive();
