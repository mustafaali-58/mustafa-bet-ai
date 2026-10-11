import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { projects } from '@/data/projects';
import { Link } from '@/i18n/navigation';
import ExternalIcon from '@/components/ExternalIcon';
import { buildMetadata } from '@/lib/seo';
import styles from './ProjectDetail.module.css';

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) return { title: 'Not Found' };

  return buildMetadata({
    locale,
    path: `/projects/${slug}`,
    title: project.title[locale],
    description: project.description[locale]
  });
}

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

  const t = await getTranslations({ locale, namespace: 'projects' });
  const tA11y = await getTranslations({ locale, namespace: 'a11y' });
  const title = project.title[locale];

  return (
    <article className={`container ${styles.article}`}>
      <Link href="/projects" className={styles.back}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t('back_to_projects')}
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <ul className={styles.tags}>
          {project.tags.map(tag => (
            <li key={tag} className="tag">{tag}</li>
          ))}
        </ul>
      </header>

      <div className={styles.layout}>
        <div className={styles.media}>
          {project.image ? (
            <Image
              src={project.image}
              alt={title}
              width={640}
              height={640}
              sizes="(max-width: 900px) 100vw, 640px"
              preload
            />
          ) : (
            <div className={styles.placeholder}>{title?.[0]}</div>
          )}
        </div>

        <div>
          <h2 className={styles.infoTitle}>{t('description_title')}</h2>
          <p className={styles.description}>{project.description[locale]}</p>

          {(project.liveUrl || project.githubUrl) && (
            <div className={styles.actions}>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  aria-label={`${t('view_live_demo')} (${tA11y('external')})`}
                >
                  {t('view_live_demo')}
                  <ExternalIcon />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  aria-label={`${t('view_on_github')} (${tA11y('external')})`}
                >
                  {t('view_on_github')}
                  <ExternalIcon />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
