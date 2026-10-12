import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { projects } from '@/data/projects';
import { experience, education } from '@/data/skills';
import { getBlogPostSummaries } from '@/lib/blog';
import { homeJsonLd } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import ProjectCard from '@/components/ProjectCard';
import BlogCard from '@/components/BlogCard';
import styles from './Home.module.css';

export default async function HomePage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  const tHome = await getTranslations({ locale, namespace: 'home' });
  const tBlog = await getTranslations({ locale, namespace: 'blog' });
  const tProjects = await getTranslations({ locale, namespace: 'projects' });

  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
  const latestPosts = getBlogPostSummaries(locale).slice(0, 4);

  // Antet, Hakkımda sayfasıyla aynı veriden beslenir: güncel görev ve eğitim.
  const current = experience[0];
  const school = education[0];

  return (
    <>
      <JsonLd data={homeJsonLd(locale)} />

      {/* Açılış: çizim paftası düzeni. Solda tanıtım, sağ alt köşede antet. */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.sheet}>
            <div className={styles.frame}>
              <div className={styles.heading}>
                <h1 className={styles.name}>{t('name')}</h1>
                <p className={styles.role}>{t('title')}</p>
              </div>

              <div className={styles.intro}>
                <p className={styles.summary}>{t('description')}</p>
                <div className={styles.cta}>
                  <Link href="/projects" className="btn btn-primary">
                    {t('cta_projects')}
                  </Link>
                  <Link href="/contact" className="btn btn-outline">
                    {t('cta_contact')}
                  </Link>
                </div>
              </div>

              <dl className={styles.antet}>
                <div className={styles.cellWide}>
                  <dt>{t('fact_organization')}</dt>
                  <dd>{current.company}</dd>
                </div>
                <div className={styles.cell}>
                  <dt>{t('fact_role')}</dt>
                  <dd>{current.title[locale]}</dd>
                </div>
                <div className={styles.cell}>
                  <dt>{t('fact_period')}</dt>
                  <dd className="nums">{current.period[locale]}</dd>
                </div>
                <div className={styles.cellWide}>
                  <dt>{t('fact_education')}</dt>
                  <dd>{school.degree[locale]}, {school.institution[locale]}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">{tHome('featured_projects')}</h2>
              <p className="section-desc">{tHome('featured_projects_desc')}</p>
            </div>
            <Link href="/projects" className="section-link">
              {tHome('view_all_projects')}
            </Link>
          </div>
          <div className={styles.projects}>
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} viewText={tProjects('view_project')} />
            ))}
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className={styles.posts}>
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">{tHome('latest_posts')}</h2>
                <p className="section-desc">{tHome('latest_posts_desc')}</p>
              </div>
              <Link href="/blog" className="section-link">
                {tHome('view_all_posts')}
              </Link>
            </div>
            <div>
              {latestPosts.map(post => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  minRead={tBlog('min_read')}
                  newsBadge={tBlog('news_badge')}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
