import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  return {
    title: {
      default: 'Mustafa Ali Solmazgül',
      template: '%s | Mustafa Ali Solmazgül',
    },
    description: isEn
      ? 'Full-Stack Developer & Software Engineer — Portfolio and blog showcasing modern web projects.'
      : 'Full-Stack Geliştirici & Yazılım Mühendisi — Modern web projelerini sergileyen portfolyo ve blog.',
    metadataBase: new URL('https://mustafaalisolmazgul.com.tr'),
    alternates: {
      canonical: '/',
      languages: {
        'tr': '/tr',
        'en': '/en',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'tr_TR',
      siteName: 'Mustafa Ali Solmazgül',
    },
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

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main style={{ paddingTop: 'var(--header-height)' }}>
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
