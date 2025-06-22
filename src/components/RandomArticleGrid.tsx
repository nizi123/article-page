// components/RandomArticleGrid.tsx
'use client';

import { useMemo } from 'react';
import ArticleCard, { Article as CardArticle } from './ArticleCard';
import { articleDetails } from '@/lib/articleDetails';

// 원본 articleDetails 배열 아이템 타입 추출
type ArticleDetail = typeof articleDetails[number];

interface RandomArticleGridProps {
  /** 전체 아티클 상세 배열 (articleDetails) */
  articles: ArticleDetail[];
  /** 현재 보고 있는 아티클 ID (옵션) */
  currentId?: number;
  /** 뿌려줄 카드 개수 */
  count?: number;
}

export default function RandomArticleGrid({
  articles,
  currentId,
  count = 3,
}: RandomArticleGridProps) {
  // currentId 제외 후, CardArticle 형태로 매핑 → 셔플 → slice
  const items: CardArticle[] = useMemo(() => {
    // 1) 현재 ID 제외
    const pool = currentId
      ? articles.filter((a) => a.id !== currentId)
      : [...articles];

    // 2) CardArticle 타입으로 변환
    const cards: CardArticle[] = pool.map((a) => ({
      id: a.id,
      title: a.title,
      summary:
        a.subtitle ??
        a.content?.slice(0, 80).trim().replace(/\n/g, " ") + "…",
      category: a.category,
      tagColor: a.tagColor,
      imageUrl: a.imageUrl,
    }));

    // 3) Fisher–Yates 셔플
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // 4) 원하는 개수만 반환
    return cards.slice(0, count);
  }, [articles, currentId, count]);

  return (
    <div className="mt-16 grid 
                        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
                        gap-x-6 gap-y-12
                        justify-items-center    /* 모바일에서 가운데 정렬 */
                        sm:justify-items-stretch /* sm 이상에선 셀 전체 채우기 */"> 
                             {items.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
