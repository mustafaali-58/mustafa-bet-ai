import { getTranslations } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import Guestbook from '@/components/Guestbook';
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

export default async function ContactPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')} />
      <ContactForm />
      <div className="container">
        <Guestbook />
      </div>
    </>
  );
}
