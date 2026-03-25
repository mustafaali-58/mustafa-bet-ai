import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { resources } from '@/data/resources';
import ResourceCard from '@/components/ResourceCard';
import styles from './Resources.module.css';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resources' });

  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function ResourcesPage({ params }) {
  const { locale } = await params;

  return <ResourcesContent locale={locale} />;
}

function ResourcesContent({ locale }) {
  const t = useTranslations('resources');

  return (
    <main className="container section-padding">
      <div className={styles.header}>
        <h1 className="section-title">{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
      </div>

      <div className={styles.categories}>
        {resources.map((category) => (
          <section key={category.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>
              {locale === 'tr' ? category.category_tr : category.category}
            </h2>
            <div className={styles.grid}>
              {category.items.map((item) => (
                <ResourceCard 
                  key={item.name} 
                  item={item} 
                  locale={locale} 
                  viewText={t('explore')}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
