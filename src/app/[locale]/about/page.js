import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { skills, experience } from '@/data/skills';
import styles from './About.module.css';

export async function generateMetadata() {
  return { title: 'About' };
}

export default async function AboutPage() {
  const locale = await getLocale();
  return <AboutContent locale={locale} />;
}

function AboutContent({ locale }) {
  const t = useTranslations('about');

  return (
    <div className={styles.page}>
      <section className={`section ${styles.heroSection}`}>
        <div className="container">
          <h1 className={`section-title ${styles.title}`}>{t('title')}</h1>
          <p className={`section-subtitle ${styles.subtitle}`}>{t('subtitle')}</p>
        </div>
      </section>

      <section className={`section ${styles.bioSection}`}>
        <div className={`container ${styles.bioGrid}`}>
          <div className={styles.bioAvatar}>
            <div className={styles.avatarPlaceholder}>
              <span>MA</span>
            </div>
          </div>
          <div className={styles.bioText}>
            <p>{t('bio')}</p>
          </div>
        </div>
      </section>

      <section className={`section ${styles.skillsSection}`}>
        <div className="container">
          <h2 className="section-title">{t('skills')}</h2>
          <div className={styles.skillsGrid}>
            {skills.map((skill, i) => (
              <div key={skill.name} className={styles.skillItem}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillName}>{skill.name}</span>
                  <span className={styles.skillLevel}>{skill.level}%</span>
                </div>
                <div className={styles.skillBar}>
                  <div
                    className={styles.skillFill}
                    style={{
                      width: `${skill.level}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.expSection}`}>
        <div className="container">
          <h2 className="section-title">{t('experience')}</h2>
          <div className={styles.timeline}>
            {experience.map((exp, i) => (
              <div key={i} className={`glass-card ${styles.timelineItem}`}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <span className={styles.period}>{exp.period[locale]}</span>
                  <h3 className={styles.expTitle}>{exp.title[locale]}</h3>
                  <p className={styles.company}>{exp.company}</p>
                  <p className={styles.expDesc}>{exp.description[locale]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
