This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `GEMINI_API_KEY` | Sohbet botu için | `/api/chat` ve blog üretim betiği kullanır. |
| `OPENAI_API_KEY` | Hayır | Blog üretim betiğinde Gemini başarısız olursa yedek. |
| `RESEND_API_KEY` | Bülten için | Onay e-postasını gönderir ve onaylanan aboneleri Resend kişi listesine kaydeder. Anahtarın tam erişimli olması gerekir (yalnızca gönderim yetkili anahtar kişi ekleyemez). |
| `RESEND_SEGMENT_ID` | Hayır | Tanımlıysa onaylanan aboneler bu Resend segmentine eklenir. |
| `NEWSLETTER_SECRET` | Hayır | Onay bağlantılarını imzalayan sır. Tanımlı değilse `RESEND_API_KEY` kullanılır. |
| `CONTACT_TO_EMAIL` | Hayır | İletişim formundan gelen mesajların iletileceği adres. Tanımlı değilse sitede yayımlanan iletişim adresi kullanılır. Form da `RESEND_API_KEY` ile gönderir. |
| `SITE_URL` | Hayır | Onay bağlantılarının kök adresi. Varsayılan: `https://mustafaalisolmazgul.com.tr`. |

Bülten çift onaylıdır: form yalnızca onay e-postası gönderir, adres bağlantıya tıklanınca listeye eklenir.

## Ziyaretçi İstatistikleri

Ziyaretçi, sayfa görüntüleme ve ülke verileri [Vercel Web Analytics](https://vercel.com/docs/analytics) ile toplanır (`src/app/[locale]/layout.js` içindeki `<Analytics />`). Çerez kullanmaz. Verilerin görünmesi için Vercel panelinde projenin **Analytics** sekmesinden **Enable** düğmesine basılmış olmalıdır.

## Blog

Otomatik üretilen yazılar "haber özeti" olarak etiketlenir: kişisel imza taşımaz, sayfada yapay zekâ yardımıyla hazırlandığı belirtilir ve yeni yazılar kaynağın bağlantısını içerir (`source`, `sourceName`). Ön bilgisinde `author` bulunan yazılar elle yazılmış makale sayılır; `type: "article"` ya da `type: "news"` ile bu açıkça belirtilebilir.
