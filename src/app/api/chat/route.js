import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Sen Mustafa Ali Solmazgül'ün kişisel web sitesindeki AI asistanısın.
Mustafa Ali hakkında bilgiler:
- SASA Polyester Sanayi A.Ş.'de Veri Analisti & Reporter olarak çalışıyor (Ekim 2019'dan beri)
- Veri analitiği, bilgisayar sistemleri ve AutoCAD konularında uzman
- Alone Computer & Satellite Systems'in kurucusu (2012-2018)
- Çukurova Halk Eğitim Merkezi'nde AutoCAD eğitmeni (2011-2012)
- Çukurova Üniversitesi Elektrik bölümü mezunu (2009-2011)
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
        reply: 'API anahtarı bulunamadı. Vercel ortam değişkenlerini kontrol edin.' 
      }, { status: 200 });
    }

    // Use REST API directly instead of SDK for maximum compatibility
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${SYSTEM_PROMPT}\n\nKullanıcı sorusu: ${message}` }]
        }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Gemini API Error:', JSON.stringify(data));
      return NextResponse.json({ 
        reply: `API Hatası: ${data.error?.message || 'Bilinmeyen hata'}` 
      }, { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı.';
    return NextResponse.json({ reply }, { status: 200 });

  } catch (error) {
    console.error('Chat Error:', error.message);
    return NextResponse.json({ 
      reply: `Hata: ${error.message}` 
    }, { status: 200 });
  }
}
