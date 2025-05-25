// components/RandomArticleGrid.tsx
'use client';

import React, { useMemo } from 'react';
import ArticleCard, { Article } from './ArticleCard';

interface RandomArticleGridProps {
  /** 전체 아티클 목록 */
  articles: Article[];
  /** 현재 보고 있는 아티클 ID (옵션) */
  currentId?: number;
  /** 보여줄 카드 개수 */
  count?: number;
}

export default function RandomArticleGrid({
  articles,
  currentId,
  count = 3,
}: RandomArticleGridProps) {
  // currentId 제외하고 랜덤으로 count개 선택
  const items = useMemo(() => {
    const pool = currentId
      ? articles.filter((a) => a.id !== currentId)
      : [...articles];
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [articles, currentId, count]);

  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
      {items.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
