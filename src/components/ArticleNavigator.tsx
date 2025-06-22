// components/ArticleNavigator.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Article {
  id: number;
  title: string;
  subtitle?: string;
}

interface ArticleNavigatorProps {
  article: Article;
  prevArticle?: Article;
  nextArticle?: Article;
  logoSrc?: string;
}

export default function ArticleNavigator({
  article,
  prevArticle,
  nextArticle,
  logoSrc = '/labchasm-logo.png',
}: ArticleNavigatorProps) {
  return (
    <div className="flex flex-col items-center w-full py-10 space-y-4">
      {/* 1. 로고 클릭 시 홈 */}
      <Link
        href="https://labchasm.framer.website/"
        className="rounded-full border-2 border-gray-300 p-3 hover:border-gray-500 transitio"
      >
        <Image
          src='/logoblack.png'
          alt="홈으로"
          width={80}
          height={80}
          className="object-cotain"
        />
      </Link>

      {/* 2. 현재 아티클 제목 & 부제 */}
      <h2 className="text-2xl font-bold text-black">랩 캐즘</h2>
        <p className="text-gray-500">자생가능한 음악 생태계</p>

      {/* 3. 아티클 더보기 버튼 */}
      {/* <Link href="/article">  */}
      <Link href="/article">
        <button className="mt-2 px-6 py-2 bg-black text-white">
          아티클 더보기
        </button>
      </Link>

      {/* 4. 이전/다음 아티클 */}
      <div className="flex justify-between w-full text-gray-400 mt-12">
        {prevArticle ? (
          <Link
            href={`/article/${prevArticle.id}`}
            className="flex items-center space-x-1 hover:text-gray-900 transition"
          >
            <span>← 이전 아티클</span>
          </Link>
        ) : (
          <div />
        )}

        {nextArticle ? (
          <Link
            href={`/article/${nextArticle.id}`}
            className="flex items-center space-x-1 hover:text-gray-900 transition ml-auto"
          >
            <span>다음 아티클 →</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
