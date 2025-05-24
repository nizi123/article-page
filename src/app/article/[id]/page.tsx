// app/article/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { articleDetails } from '@/lib/articleDetails';
import Image from 'next/image';
import Link from 'next/link';

export default function ArticleContentView() {
  const params = useParams();
  const articleId = parseInt(params.id as string);
  const article = articleDetails.find((a) => a.id === articleId);

  if (!article) return <div className="p-10 text-center bg-white min-h-screen">아티클을 찾을 수 없습니다.</div>;

  return (
    <div className="bg-white min-h-screen w-full">
      {/* 헤더 이미지 전체 너비 */}
      <div className="relative h-[400px] w-full mb-10">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>

        <div className="absolute inset-x-0 bottom-10 flex flex-col justify-end items-center text-white text-center px-4">
          <span
            className="text-[11px] font-medium px-3 py-1 bg-white text-center rounded-sm"
            style={{ color: article.tagColor }}
          >
            {article.category}
          </span>
          <h1 className="text-[28px] font-extrabold mt-3 leading-tight">{article.title}</h1>
          <p className="text-sm text-gray-300 mt-1">{article.subtitle}</p>
          <p className="text-xs text-gray-400 mt-1">{article.date} • {article.author}</p>
        </div>
      </div>

      <div className="max-w-[700px] mx-auto px-4 pb-20">
        {/* 본문 텍스트 예시 */}
        <div className="space-y-10">
          {article.content.map((section, index) => (
            <div key={index}>
              {section.title && <h2 className="text-xl font-semibold mb-4 text-black">{section.title}</h2>}
              <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">{section.text}</p>
            </div>
          ))}
        </div>

        {/* 중간 이미지 */}
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

    <hr className="w-full max-w-[700px] mx-auto mt-20 border-t border-gray-200" />

        {/* 하단 버튼 */}
        <div className="text-center mt-20">
          <Link href="/article">
            <button className="border border-black px-6 py-2 text-sm">전체 아티클 보기</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
