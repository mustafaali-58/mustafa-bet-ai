import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { projects } from '@/data/projects';
import { getBlogPosts } from '@/lib/blog';
import ProjectCard from '@/components/ProjectCard';
import BlogCard from '@/components/BlogCard';
import styles from './Home.module.css';

export default async function HomePage() {
  const locale = await getLocale();
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
  const latestPosts = getBlogPosts(locale).slice(0, 3);

  return <HomeContent locale={locale} featuredProjects={featuredProjects} latestPosts={latestPosts} />;
}

function HomeContent({ locale, featuredProjects, latestPosts }) {
  const t = useTranslations('hero');
  const tHome = useTranslations('home');
  const tBlog = useTranslations('blog');

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.auroraOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <p className={`${styles.greeting} animate-fade-in-up stagger-1`}>
            {t('greeting')}
          </p>
          <h1 className={`${styles.heroName} animate-fade-in-up stagger-2`}>
            {t('name')}
            <span className={styles.heroDot}>.</span>
          </h1>
          <p className={`${styles.heroTitle} animate-fade-in-up stagger-3`}>
            {t('title')}
          </p>
          <p className={`${styles.heroDesc} animate-fade-in-up stagger-4`}>
            {t('description')}
          </p>
          <div className={`${styles.heroCta} animate-fade-in-up stagger-5`}>
            <Link href="/projects" className="btn btn-primary">
              {t('cta_projects')}
            </Link>
            <Link href="/contact" className="btn btn-outline">
              {t('cta_contact')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className={`section ${styles.featuredSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className="section-title">{tHome('featured_projects')}</h2>
            <p className="section-subtitle">{tHome('featured_projects_desc')}</p>
          </div>
          <div className={styles.projectsGrid}>
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href="/projects" className="btn btn-outline">
              {tHome('view_all_projects')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className={`section ${styles.postsSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="section-title">{tHome('latest_posts')}</h2>
              <p className="section-subtitle">{tHome('latest_posts_desc')}</p>
            </div>
            <div className={styles.postsGrid}>
              {latestPosts.map(post => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  readMore={tBlog('read_more')}
                  minRead={tBlog('min_read')}
                />
              ))}
            </div>
            <div className={styles.viewAll}>
              <Link href="/blog" className="btn btn-outline">
                {tHome('view_all_posts')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
