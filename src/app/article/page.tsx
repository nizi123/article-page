'use client';

import React, { useState } from "react";
import ArticleCard, { Article } from "@/components/ArticleCard";

const sampleArticles: Article[] = [
  {
    id: 1,
    title: "밴드문화, 스트리밍의 미래?",
    summary: "스트리밍 시대의 밴드의 미래에 대한 통찰",
    category: "Data Future",
    tagColor: "#EF4444",
    imageUrl: "/placeholder.png",
  },
  {
    id: 2,
    title: "K-POP은 5세대? 그럼 K-indie는?",
    summary: "K-indie 시장의 흐름과 진화",
    category: "Music Business",
    tagColor: "#3B82F6",
    imageUrl: "/placeholder.png",
  },
  {
    id: 3,
    title: "음악의 내부, 입체적 인터뷰를 만나다",
    summary: "인터뷰 중심 음악 탐구 기사",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 4,
    title: "해외 서버에서 방금 딴 핫 스토리",
    summary: "2024 음악리서치 요약 기사",
    category: "Data Future",
    tagColor: "#EF4444",
    imageUrl: "/placeholder.png",
  },
  {
    id: 5,
    title: "아티클 타이틀 (문단 포함 최대 50자 이내)",
    summary: "짧고 강렬한 카드 UI 예시",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 6,
    title: "추가 기사1",
    summary: "페이지네이션 테스트용",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 7,
    title: "추가 기사2",
    summary: "더 많은 테스트",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 8,
    title: "추가 기사3",
    summary: "더 많은 테스트2",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 9,
    title: "추가 기사4",
    summary: "더 많은 테스트3",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 10,
    title: "추가 기사5",
    summary: "더 많은 테스트4",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
  {
    id: 11,
    title: "추가 기사6",
    summary: "더 많은 테스트5",
    category: "Case Study",
    tagColor: "#10B981",
    imageUrl: "/placeholder.png",
  },
];

const ITEMS_PER_PAGE = 9;

export default function HomePage() {
  const [page, setPage] = useState(1);
  const sortedArticles = [...sampleArticles].sort((a, b) => b.id - a.id);
  const totalPages = Math.ceil(sortedArticles.length / ITEMS_PER_PAGE);
  const currentItems = sortedArticles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col items-center bg-white text-black">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12 px-6">
        {currentItems.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

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
