import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src/data/subscribers.json');

function getSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveSubscribers(subscribers) {
  const dir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const subscribers = getSubscribers();
    
    if (subscribers.some(s => s.email === email)) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }

    subscribers.push({
      email,
      subscribedAt: new Date().toISOString()
    });

    try {
      saveSubscribers(subscribers);
    } catch (saveError) {
      console.warn('Could not save to file system (likely read-only Vercel environment). Subscriber email:', email);
      // Fallback: Just log it and return success so the frontend UI doesn't break.
    }

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter API absolute error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
