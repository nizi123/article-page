// components/RandomArticleGrid.tsx\
'use client';
import { useMemo } from 'react';
import ArticleCard, { Article as CardArticle } from './ArticleCard';
import { ArticleDetail } from '@/lib/articleDetails';

type Props = {
  articles: ArticleDetail[];
  currentId?: number;
  count?: number;
};

export default function RandomArticleGrid({ articles, currentId, count = 3 }: Props) {
  const items: CardArticle[] = useMemo(() => {
    const pool = articles
      .filter(a => a.id !== currentId)
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    return pool.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.subtitle ?? a.content[0].text,
      category: a.category,
      tagColor: a.tagColor,
      imageUrl: a.imageUrl,
    }));
  }, [articles, currentId, count]);

  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
      {items.map((art) => (
        <ArticleCard key={art.id} article={art} />
      ))}
    </div>
  );
}
