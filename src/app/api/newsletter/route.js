import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'src/data/subscribers.json');
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

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
    }

    // Send welcome email via Resend if API key is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'Mustafa Ali Solmazgül <hello@mustafaalisolmazgul.com.tr>',
          to: email,
          subject: 'Bültene Hoş Geldiniz! 🎉',
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">Merhaba!</h2>
              <p>Bültenime abone olduğunuz için teşekkür ederim. En yeni teknoloji yazıları, veri analitiği ipuçları ve güncellemelerle görüşmek üzere.</p>
              <br/>
              <p>Sevgiler,<br/><strong>Mustafa Ali Solmazgül</strong><br/><a href="https://mustafaalisolmazgul.com.tr" style="color: #8b5cf6; text-decoration: none;">mustafaalisolmazgul.com.tr</a></p>
            </div>
          `
        });

        if (error) {
          console.error('Resend Error:', error);
        }
      } catch (emailError) {
        console.error('Exception while sending email:', emailError);
      }
    }

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter API absolute error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
