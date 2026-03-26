'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import BlogCard from './BlogCard';
import styles from './BlogSearch.module.css';

export default function BlogSearch({ posts }) {
  const t = useTranslations('blog');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    posts.forEach(post => {
      (post.frontmatter.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === '' ||
        post.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.frontmatter.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = !activeTag ||
        (post.frontmatter.tags || []).includes(activeTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, activeTag]);

  return (
    <>
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {allTags.length > 0 && (
          <div className={styles.tags}>
            <button
              className={`${styles.tagBtn} ${!activeTag ? styles.tagBtnActive : ''}`}
              onClick={() => setActiveTag(null)}
            >
              {t('all') || 'Tümü'}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`${styles.tagBtn} ${activeTag === tag ? styles.tagBtnActive : ''}`}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {searchQuery || activeTag ? (
          <p className={styles.resultCount}>
            {filteredPosts.length} {t('results') || 'sonuç'}
          </p>
        ) : null}
      </div>

      {filteredPosts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-xl)' }}>
          {filteredPosts.map(post => (
            <BlogCard
              key={post.slug}
              post={post}
              readMore={t('read_more')}
              minRead={t('min_read')}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--color-text-muted)' }}>
          <p>{t('no_results') || 'Sonuç bulunamadı.'}</p>
        </div>
      )}
    </>
  );
}
