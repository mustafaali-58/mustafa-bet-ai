'use client';

import { useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import BlogCard from './BlogCard';
import styles from './BlogSearch.module.css';

const PAGE_SIZE = 24;
const TOP_TAG_COUNT = 14;

export default function BlogSearch({ posts }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Etiketler: en çok kullanılanlar önce; tam liste yalnızca istenince çizilir.
  const { topTags, allTags } = useMemo(() => {
    const counts = new Map();
    posts.forEach(post => {
      (post.frontmatter.tags || []).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    const byCount = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], locale))
      .map(([tag]) => tag);
    return {
      topTags: byCount.slice(0, TOP_TAG_COUNT),
      allTags: byCount.slice().sort((a, b) => a.localeCompare(b, locale))
    };
  }, [posts, locale]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(locale);
    return posts.filter(post => {
      const matchesSearch = query === '' ||
        post.frontmatter.title.toLocaleLowerCase(locale).includes(query) ||
        post.frontmatter.description.toLocaleLowerCase(locale).includes(query);

      const matchesTag = !activeTag ||
        (post.frontmatter.tags || []).includes(activeTag);

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, activeTag, locale]);

  // Filtre değişince liste baştan sayfalanır.
  const updateSearch = (value) => {
    setSearchQuery(value);
    setVisibleCount(PAGE_SIZE);
  };
  const updateTag = (tag) => {
    setActiveTag(tag);
    setVisibleCount(PAGE_SIZE);
  };

  const shownTags = showAllTags ? allTags : topTags;
  const tagButtons = activeTag && !shownTags.includes(activeTag)
    ? [activeTag, ...shownTags]
    : shownTags;
  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <>
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={t('search_placeholder')}
            aria-label={t('search_label')}
            value={searchQuery}
            onChange={(e) => updateSearch(e.target.value)}
          />
        </div>

        {allTags.length > 0 && (
          <div className={styles.tags}>
            <button
              type="button"
              className={`${styles.tagBtn} ${!activeTag ? styles.tagBtnActive : ''}`}
              aria-pressed={!activeTag}
              onClick={() => updateTag(null)}
            >
              {t('all')}
            </button>
            {tagButtons.map(tag => (
              <button
                key={tag}
                type="button"
                className={`${styles.tagBtn} ${activeTag === tag ? styles.tagBtnActive : ''}`}
                aria-pressed={activeTag === tag}
                onClick={() => updateTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </button>
            ))}
            {allTags.length > TOP_TAG_COUNT && (
              <button
                type="button"
                className={`${styles.tagBtn} ${styles.tagToggle}`}
                aria-expanded={showAllTags}
                onClick={() => setShowAllTags(value => !value)}
              >
                {showAllTags ? t('fewer_tags') : `${t('all_tags')} (${allTags.length})`}
              </button>
            )}
          </div>
        )}

        {searchQuery || activeTag ? (
          <p className={styles.resultCount} role="status">
            {filteredPosts.length} {t('results')}
          </p>
        ) : null}
      </div>

      {filteredPosts.length > 0 ? (
        <>
          <div className={styles.grid}>
            {visiblePosts.map(post => (
              <BlogCard
                key={post.slug}
                post={post}
                readMore={t('read_more')}
                minRead={t('min_read')}
                newsBadge={t('news_badge')}
                locale={locale}
                headingLevel={2}
              />
            ))}
          </div>
          {visibleCount < filteredPosts.length && (
            <div className={styles.loadMore}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
              >
                {t('load_more')} ({filteredPosts.length - visibleCount})
              </button>
            </div>
          )}
        </>
      ) : (
        <p className={styles.empty}>
          {posts.length === 0 ? t('no_posts') : t('no_results')}
        </p>
      )}
    </>
  );
}
