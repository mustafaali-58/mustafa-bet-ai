import { getTranslations } from 'next-intl/server';
import ProjectsContent from './ProjectsContent';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });

  return {
    title: t('title'),
    description: t('subtitle')
  };
}

export default function ProjectsPage() {
  return <ProjectsContent />;
}
