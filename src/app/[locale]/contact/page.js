import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo';
import ContactForm from './ContactForm';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return buildMetadata({
    locale,
    path: '/contact',
    title: t('title'),
    description: t('subtitle')
  });
}

export default function ContactPage() {
  return <ContactForm />;
}
