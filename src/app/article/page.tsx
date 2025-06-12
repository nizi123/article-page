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
      a.content?.slice(0, 80).trim().replace(/\n/g, " ") + "…",
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
    <div className="flex flex-col items-center bg-white text-black dark:bg-white dark:text-black m-2">
      <section className="flex flex-col items-center pt-[60px] pb-[40px] gap-5">
      <svg
          width="60"
          height="82"
          viewBox="0 0 72 99"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0.5 3.21698V87.3774H52.7335L58.572 0L0.5 3.21698Z" fill="#101010" />
          <path d="M22.3943 20.6509L29.2753 99H71.5L63.0551 7.99057L22.3943 20.6509Z" fill="#101010" />
          <path d="M26.6689 92.3585L21.9773 16.9151L60.3444 7.8868" stroke="#CECECE" strokeWidth="10" />
          <path d="M30.3179 29.0566L57.8421 24.3868" stroke="#CECECE" strokeWidth="3" />
          <path d="M34.9053 35.9057L62.4295 31.2359" stroke="#CECECE" strokeWidth="3" />
          <path d="M29.4839 43.7925L57.0081 39.1227" stroke="#CECECE" strokeWidth="3" />
        </svg>
        <h1 className="text-[28px] font-extrabold text-center leading-tight">아티클</h1>
        <div className="text-center text-sm text-gray-500 leading-snug">
          <p>음악산업에서 깊은 분석을 통해</p>
          <p>재미있는, 그리고 꽤 유용할지도 모르는 사실들을 도출해 냅니다</p>
        </div>
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
