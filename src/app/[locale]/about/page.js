import { getTranslations } from 'next-intl/server';
import { skills, experience, education } from '@/data/skills';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import styles from './About.module.css';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return buildMetadata({
    locale,
    path: '/about',
    title: t('title'),
    description: t('meta_description')
  });
}

// Deneyim ve eğitim aynı düzeni paylaşır: solda dönem, sağda unvan, kurum ve
// açıklama. Sıralı bir zaman çizelgesi olduğu için sıralı liste kullanılır.
function Timeline({ items, locale, getTitle, getOrganization }) {
  return (
    <ol className={styles.timeline}>
      {items.map((item, index) => (
        <li key={index} className={styles.entry}>
          <p className={`${styles.period} nums`}>{item.period[locale]}</p>
          <div>
            <h3 className={styles.entryTitle}>{getTitle(item)}</h3>
            <p className={styles.organization}>{getOrganization(item)}</p>
            <p className={styles.entryText}>{item.description[locale]}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')} />

      <div className={`container ${styles.body}`}>
        <p className={styles.bio}>{t('bio')}</p>

        <section className={styles.block} aria-labelledby="about-skills">
          <h2 id="about-skills" className={styles.blockTitle}>{t('skills')}</h2>
          <ul className={styles.skills}>
            {skills.map(skill => (
              <li key={skill.name.en} className={styles.skill}>
                <span className={styles.skillName}>{skill.name[locale] || skill.name.en}</span>
                <span className={`${styles.skillValue} nums`}>{skill.level}%</span>
                <span className={styles.skillBar} aria-hidden="true">
                  <span className={styles.skillFill} style={{ width: `${skill.level}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="about-experience">
          <h2 id="about-experience" className={styles.blockTitle}>{t('experience')}</h2>
          <Timeline
            items={experience}
            locale={locale}
            getTitle={item => item.title[locale]}
            getOrganization={item => item.company}
          />
        </section>

        <section className={styles.block} aria-labelledby="about-education">
          <h2 id="about-education" className={styles.blockTitle}>{t('education')}</h2>
          <Timeline
            items={education}
            locale={locale}
            getTitle={item => item.degree[locale]}
            getOrganization={item => item.school}
          />
        </section>
      </div>
    </>
  );
}
