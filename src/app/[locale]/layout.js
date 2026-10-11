import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatBot from '@/components/ChatBot';
import { Analytics } from '@vercel/analytics/next';
import { SITE_NAME, SITE_URL, buildMetadata } from '@/lib/seo';

// Kayıtlı tema tercihini sayfa çizilmeden önce uygular; böylece açık temayı
// seçen ziyaretçi her açılışta kısa bir koyu ekran görmez.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;

  return {
    // Alt sayfalar kendi canonical ve dil karşılıklarını `buildMetadata` ile
    // verir; buradaki değerler yalnızca ana sayfa için geçerlidir.
    ...buildMetadata({ locale }),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    metadataBase: new URL(SITE_URL),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE_NAME} Blog`}
          href="/rss.xml"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">{t('skip')}</a>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main id="main" style={{ paddingTop: 'var(--header-height)' }}>
            {children}
          </main>
          <Footer />
          <ChatBot />
        </NextIntlClientProvider>
        {/* Çerezsiz ziyaretçi ve ülke istatistikleri; veriler Vercel panelinde görünür. */}
        <Analytics />
      </body>
    </html>
  );
}
