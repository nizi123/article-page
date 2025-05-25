// components/RandomArticleGrid.tsx
'use client';

import { useMemo } from 'react';
import ArticleCard, { Article } from './ArticleCard';

interface RandomArticleGridProps {
  /** 전체 아티클 목록 (Article 타입 배열) */
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
  // currentId 제외한 목록에서 랜덤으로 count개 선택
  const items: Article[] = useMemo(() => {
    const pool = currentId
      ? articles.filter((a) => a.id !== currentId)
      : [...articles];
    // Fisher–Yates shuffle for true randomness
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }, [articles, currentId, count]);

  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
      {items.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
