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

  // Hiç projesi olmayan kategoriler filtrede gösterilmez.
  const usedCategories = categories.filter(
    cat => cat.id === 'all' || projects.some(p => p.category === cat.id)
  );

  const filtered = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className={`container ${styles.body}`}>
      <div className={styles.filters} role="group" aria-label={t('title')}>
        {usedCategories.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.filter} ${activeCategory === cat.id ? styles.filterActive : ''}`}
            aria-pressed={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label[locale]}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} viewText={t('view_project')} headingLevel={2} />
        ))}
      </div>
    </div>
  );
}
