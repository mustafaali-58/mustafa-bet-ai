import { getTranslations } from 'next-intl/server';
import { resources } from '@/data/resources';
import ResourceCard from '@/components/ResourceCard';
import PageHeader from '@/components/PageHeader';
import { buildMetadata } from '@/lib/seo';
import styles from './Resources.module.css';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resources' });

  return buildMetadata({
    locale,
    path: '/resources',
    title: t('title'),
    description: t('description')
  });
}

export default async function ResourcesPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resources' });
  const tA11y = await getTranslations({ locale, namespace: 'a11y' });

  return (
    <>
      <PageHeader title={t('title')} lead={t('description')} />

      <div className={`container ${styles.body}`}>
        {resources.map((category) => (
          <section key={category.id} className={styles.category} aria-labelledby={`res-${category.id}`}>
            <h2 id={`res-${category.id}`} className={styles.categoryTitle}>
              {locale === 'tr' ? category.category_tr : category.category}
            </h2>
            <ul className={styles.list}>
              {category.items.map((item) => (
                <ResourceCard
                  key={item.name}
                  item={item}
                  locale={locale}
                  viewText={t('explore')}
                  externalText={tA11y('external')}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
