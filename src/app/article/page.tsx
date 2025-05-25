// src/app/article/page.tsx
'use client';

import React, { useState } from "react";
import ArticleCard, { Article as CardArticle } from "@/components/ArticleCard";
import { articleDetails } from "@/lib/articleDetails";

const ITEMS_PER_PAGE = 9;

export default function ArticleListPage() {
  const [page, setPage] = useState(1);

  // 1) articleDetails 를 Card 컴포넌트용 타입으로 매핑
  const cards: CardArticle[] = articleDetails.map((a) => ({
    id: a.id,
    title: a.title,
    // subtitle 이 summary 역할을 한다고 가정, 없으면 본문 첫 문단을 대체로 사용
    summary:
      a.subtitle ??
      a.content?.[0]?.text.slice(0, 80).trim().replace(/\n/g, " ") + "...",
    category: a.category,
    tagColor: a.tagColor,
    imageUrl: a.imageUrl,
  }));

  // 2) 최신순으로 정렬 (id가 클수록 최신이라면)
  const sorted = [...cards].sort((a, b) => b.id - a.id);

  // 3) 페이징 계산
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const currentItems = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col items-center bg-white text-black">
      <section className="flex flex-col items-center pt-[60px] pb-[40px] gap-5">
        {/* ...타이틀 & 설명... */}
      </section>

      {/* 4) 여기서 바로 ArticleCard 에 매핑된 cards 사용 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 px-6">
        {currentItems.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center mt-12 gap-4 text-gray-400 text-xl select-none">
        <span
          className="cursor-pointer hover:text-black"
          onClick={() => page > 1 && setPage(page - 1)}
        >
          &lt;
        </span>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            className={`w-8 h-8 flex items-center justify-center text-sm font-medium border transition ${
              page === i + 1
                ? "bg-black text-white"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <span
          className="cursor-pointer hover:text-black"
          onClick={() => page < totalPages && setPage(page + 1)}
        >
          &gt;
        </span>
      </div>
    </div>
  );
}
