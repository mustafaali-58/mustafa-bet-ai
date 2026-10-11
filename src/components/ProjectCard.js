import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ExternalIcon from './ExternalIcon';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project, viewText, headingLevel = 3 }) {
  const locale = useLocale();
  const tA11y = useTranslations('a11y');
  const Heading = `h${headingLevel}`;
  const title = project.title[locale];
  const href = `/projects/${project.slug}`;

  return (
    <article className={styles.card}>
      {/* Görsel de proje sayfasına gider; başlık bağlantısıyla aynı hedef
          olduğu için klavye ve ekran okuyucu sırasına ikinci kez girmez. */}
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden="true">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            width={640}
            height={640}
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 360px"
            className={styles.image}
          />
        ) : (
          <span className={styles.placeholder}>{title?.[0] || 'P'}</span>
        )}
      </Link>

      <div className={styles.body}>
        <Heading className={styles.title}>
          <Link href={href}>{title}</Link>
        </Heading>
        <p className={styles.description}>{project.description[locale]}</p>
        <p className={styles.stack}>{project.tags.join(', ')}</p>

        <div className={styles.actions}>
          {viewText && (
            <Link
              href={href}
              className="btn btn-outline btn-sm"
              aria-label={`${viewText}: ${title}`}
            >
              {viewText}
            </Link>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.external}
              aria-label={`Demo: ${title} (${tA11y('external')})`}
            >
              Demo
              <ExternalIcon />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.external}
              aria-label={`GitHub: ${title} (${tA11y('external')})`}
            >
              GitHub
              <ExternalIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
