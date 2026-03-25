'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { projects, categories } from '@/data/projects';
import ProjectCard from '@/components/ProjectCard';
import styles from './Projects.module.css';

export default function ProjectsContent() {
  const t = useTranslations('projects');
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className={styles.page}>
      <section className="section">
        <div className="container">
          <h1 className="section-title">{t('title')}</h1>
          <p className="section-subtitle">{t('subtitle')}</p>

          <div className={styles.filters}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.filterActive : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label[locale]}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} viewText={t('view_project')} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
