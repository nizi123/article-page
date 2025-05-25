// src/app/article/[id]/page.tsx
import { articleDetails } from '@/lib/articleDetails';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

// ✅ 정적 생성 경로 설정
export async function generateStaticParams() {
  return articleDetails.map((article) => ({
    id: article.id.toString(),
  }));
}

// ✅ 페이지 메타데이터 설정 (선택사항)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = articleDetails.find((a) => a.id === parseInt(params.id));
  return {
    title: article?.title || 'Lab Chasm',
  };
}

export default function ArticleContentView({ params }: { params: { id: string } }) {
  const articleId = parseInt(params.id, 10);
  const article = articleDetails.find((a) => a.id === articleId);

  if (!article) {
    return <div className="p-10 text-center bg-white min-h-screen">아티클을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="relative h-[400px] w-full mb-10">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="absolute inset-x-0 bottom-10 flex flex-col justify-end items-center text-white text-center px-4">
          <span
            className="text-[11px] font-medium px-3 py-1 bg-white text-center rounded-sm"
            style={{ color: article.tagColor }}
          >
            {article.category}
          </span>
          <h1 className="text-[28px] font-extrabold mt-3 leading-tight">{article.title}</h1>
          {article.subtitle && (
            <p className="text-sm text-gray-300 mt-1">{article.subtitle}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{article.date} • {article.author}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="space-y-6">
          {article.content.map((section, index) => (
            <div key={index}>
              {section.title && <h2 className="text-lg font-bold mb-1">{section.title}</h2>}
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                {section.text}
              </p>
            </div>
          ))}
        </div>

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

        <div className="h-px w-full bg-gray-100 my-20" />

        <div className="text-center">
          <Link href="/article">
            <button className="border border-black px-6 py-2 text-sm">전체 아티클 보기</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
