// src/app/article/[id]/page.tsx

import { articleDetails } from '@/lib/articleDetails';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import ArticleNavigator from '@/components/ArticleNavigator';
import RandomArticleGrid from '@/components/RandomArticleGrid';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

// ✅ 정적 생성 경로 (params는 여전히 동기적으로 id:string 배열을 리턴)
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return articleDetails.map((article) => ({
    id: article.id.toString(),
  }));
}

// ✅ 메타데이터 함수 (params를 Promise<{ id: string }>로 받습니다)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = articleDetails.find((a) => a.id === parseInt(id, 10));

  return {
    title: article?.title || 'Lab Chasm',
  };
}

// ✅ 아티클 상세 페이지 (여기도 params를 Promise<{ id: string }>로 받습니다)
export default async function ArticleContentView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = parseInt(id, 10);
  const article = articleDetails.find((a) => a.id === articleId);

  // Article Navi 사용을 위한 소팅
  const sorted = [...articleDetails].sort((a, b) => a.id - b.id);
  const idx = sorted.findIndex(a => a.id === articleId);
  const prevArticle = sorted[idx - 1];
  const nextArticle = sorted[idx + 1];

  if (!article) {
    return (
      <div className="p-10 text-center bg-white min-h-screen">
        아티클을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full">
        <ScrollProgressBar 
        title={article.title}
        color={article.tagColor}
        fadeDistance={150} />
      {/* 상단 이미지 */}
      <div 
      id = "article-top-image"
      className="relative h-[550px] w-full mb-10">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="absolute inset-x-0 bottom-10 flex flex-col justify-end items-center text-white text-center px-4">
          <span
           className="inline-block border-1 px-6 py-1 bg-white font-medium text-xs"
           style={{
                 color: article.tagColor,
                borderColor: article.tagColor,
               }}
          >
            {article.category}
          </span>
          <h1 className="text-[48px] font-extrabold mt-3 leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-[32px] text-gray-300 mt-1">{article.subtitle}</p>
          )}
          <p className="text-[24px] text-gray-400 mt-1">
            {article.date} • {article.author}
          </p>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="space-y-6">
          {article.content.map((section, index) => (
            <div key={index}>
              {section.title && (
                <h2 className="text-lg font-bold mb-1">{section.title}</h2>
              )}
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {section.text}
              </p>
            </div>
          ))}
        </div>

        {/* 본문 중간 이미지 */}
        {article.bodyImage && (
          <div className="my-10">
            <Image
              src={article.bodyImage}
              alt="본문 이미지"
              width={800}
              height={600}
              className="mx-auto"
            />
          </div>
        )}

        {/* 구분선 */}
        <div className="h-px w-full bg-gray-100 mt-20" />

        <ArticleNavigator
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        logoSrc="/footerlogo.png"
      />

      <RandomArticleGrid
        articles={articleDetails}
        currentId={articleId}
        count={3}
      />
      </div>
    </div>
  );
}
