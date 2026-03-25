import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import styles from './ProjectDetail.module.css';

export async function generateStaticParams() {
  const locales = ['tr', 'en'];
  const allParams = [];
  for (const locale of locales) {
    for (const project of projects) {
      allParams.push({ locale, slug: project.slug });
    }
  }
  return allParams;
}

export default async function ProjectDetailPage({ params }) {
  const { slug, locale } = await params;
  const project = projects.find(p => p.slug === slug);

  if (!project) notFound();

  return <ProjectDetailContent project={project} locale={locale} />;
}

function ProjectDetailContent({ project, locale }) {
  const t = useTranslations('projects');

  return (
    <div className={styles.page}>
      <article className="container">
        <Link href="/projects" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('back_to_projects')}
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{project.title[locale]}</h1>
          <div className={styles.tags}>
            {project.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </header>

        <div className={styles.heroImage}>
          {project.image ? (
            <img src={project.image} alt={project.title[locale]} />
          ) : (
            <div className={styles.placeholder}>{project.title[locale]?.[0]}</div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.mainInfo}>
            <section className={styles.descriptionSection}>
              <h2>{t('description_title')}</h2>
              <p>{project.description[locale]}</p>
            </section>
            
            <div className={styles.actions}>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  {t('view_live_demo')}
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  {t('view_on_github')}
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
