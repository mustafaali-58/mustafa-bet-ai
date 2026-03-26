import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Sen Mustafa Ali Solmazgül'ün kişisel web sitesindeki AI asistanısın.
Mustafa Ali hakkında bilgiler:
- SASA Polyester Sanayi A.Ş.'de Veri Analisti & Reporter olarak çalışıyor (Ekim 2019'dan beri)
- Veri analitiği, bilgisayar sistemleri ve AutoCAD konularında uzman
- Alone Computer & Satellite Systems'in kurucusu (2012-2018)
- Çukurova Halk Eğitim Merkezi'nde AutoCAD eğitmeni (2011-2012)
- Bağımsız, kendine güvenen, detaylara odaklanan ve arkadaş canlısı bir profesyonel
- Projeleri: EdgeGlimpse (Finans dashboard), AI Trading Bot, Portfolyo sitesi
- Teknolojileri: Data Analysis, AutoCAD, IT Systems, Hardware & Network

Kurallar:
- Kısa ve öz cevaplar ver (2-3 cümle)
- Türkçe veya İngilizce, sorulan dilde yanıtla
- Sadece Mustafa Ali ve teknolojiyle ilgili sorulara cevap ver
- Samimi ama profesyonel ol`;

export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        reply: 'AI asistan şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.' 
      }, { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nKullanıcı sorusu: ${message}`);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      reply: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' 
    }, { status: 200 });
  }
}
