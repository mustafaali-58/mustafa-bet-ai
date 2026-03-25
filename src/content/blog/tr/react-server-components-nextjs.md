---
title: "React Server Components ve Next.js 16: Web Performansında Yeni Dönem"
description: "Client-side rendering sınırlarını aşıp, React Server Components (RSC) ve Next.js App Router ile uygulamanızın hızını nasıl artırabileceğinizi inceleyelim."
date: "2026-03-19"
tags: ["Next.js", "React", "Performans", "Frontend"]
---

Modern web geliştirme dünyasında front-end mimarileri sürekli evrim geçiriyor. Uzun bir süre boyunca Single Page Application (SPA) ve Client-Side Rendering (CSR) yaklaşımlarının konfor alanındaydık. Ancak performans gereksinimlerinin artması, bizi React Server Components (RSC) ve Next.js App Router kullanımına itti.

Peki RSC neden bu kadar önemli? Gelin teknik detaylara birlikte bakalım.

## 1. Client Bundle Boyutunu Küçültmek

RSC'nin en büyük avantajı, sunucuda render edilen komponentlerin istemciye (tarayıcıya) JavaScript kodu olarak **gönderilmemesidir**. Sadece üretilen nihai HTML gönderilir. 

```javascript
// Server Component (app/page.js)
import db from '@/lib/db';
import heavyParser from 'heavy-markdown-parser';

export default async function BlogPost({ id }) {
  // Bu kod ve kütüphaneler (heavy-markdown-parser) 
  // asla client'a gönderilmez!
  const post = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
  const content = heavyParser(post.content);

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

Yukarıdaki örnekte `heavy-markdown-parser` gibi ağır bir kütüphane sadece sunucuda çalışır. Tarayıcıya sıfır JavaScript yükü biner. Bu, "Time to Interactive" (TTI) ve "First Contentful Paint" (FCP) metriklerinde devasa bir iyileşme demektir.

## 2. Veri Çekme (Data Fetching) İşlemlerini Sunucuda Tutmak

Eskiden verileri `useEffect` içinde çekerken, loading state'ler ("Yükleniyor...") ile boğuşurduk. Waterflow (şelale) problemi yaratıp API isteklerinin sırayla beklenmesine neden olurduk.

Server Components sayesinde veritabanına veya API'lere doğrudan, güvenli (API anahtarlarını gizleyerek) ve çok daha hızlı erişebiliyoruz. Veriler aynı sunucu merkezinden geldiği için ağ gecikmesi (network latency) minimuma iniyor.

## 3. Ne Zaman Client Component Kullanmalı?

Her şeyi sunucuda render edemeyiz. Eğer komponentinizde şunlara ihtiyacınız varsa, dosyanın en üstüne `'use client';` direktifini ekleyerek Client Component kullanmalısınız:

- **State Yönetimi ve Lifecycle Hook'ları:** `useState`, `useEffect`, `useReducer`
- **Etkileşim:** `onClick`, `onChange` etkinlikleri
- **Tarayıcı API'leri:** `window`, `document`, `localStorage`

## Sonuç

Next.js App Router ve React Server Components, sunucu ve istemci arasındaki çizgiyi yeniden çiziyor. "Her şey sunucuda şekillensin, sadece etkileşim (interactivity) gereken yerler istemciye bırakılsın" felsefesiyle, hem DX (Developer Experience) hem de kullanıcı performansı zirveye çıkıyor.

Siz projelerinizde App Router'a geçiş yaptınız mı? Deneyimlerinizi benimle LinkedIn üzerinden paylaşabilirsiniz!
