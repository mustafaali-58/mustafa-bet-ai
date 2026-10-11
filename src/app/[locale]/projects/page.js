import { getTranslations } from 'next-intl/server';
import ProjectsContent from './ProjectsContent';
import PageHeader from '@/components/PageHeader';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });

  return buildMetadata({
    locale,
    path: '/projects',
    title: t('title'),
    description: t('subtitle')
  });
}

export default async function ProjectsPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')} />
      <ProjectsContent />
    </>
  );
}
