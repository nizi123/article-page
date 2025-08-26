'use client';

import { useEffect, useMemo, useState } from 'react';
import { AboutTab } from '@/types/about';
import AboutTabsMobile from '@/components/AboutTabsMobile';
import AboutSideNav from '@/components/AboutSideNav';
import AboutContent from '@/components/about/AboutContent';
import MemberContent from '@/components/about/MemberContent';

export default function AboutPageClient() {
  const initialTab: AboutTab = useMemo(() => {
    if (typeof window === 'undefined') return 'about';
    const h = window.location.hash.replace('#', '');
    return h === 'member' ? 'member' : 'about';
  }, []);
  const [tab, setTab] = useState<AboutTab>(initialTab);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (h === 'member' || h === 'about') setTab(h as AboutTab);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <main
      className="
        not-prose w-full min-h-screen bg-white mx-auto max-w-6xl
        px-6 md:px-8 pt-28 md:pt-40 pb-16 md:pb-24
      "
    >
      <AboutTabsMobile active={tab} onChange={setTab} />

      {/* 2컬럼: 사이드바(고정폭) + 본문(유동폭) */}
      <div
        className="
          grid grid-cols-1
          md:grid-cols-[236px_minmax(0,1fr)]
          lg:grid-cols-[248px_minmax(0,1fr)]
          gap-8 md:gap-12
        "
      >
        {/* 왼쪽 사이드바 */}
        <div className="md:pr-6 lg:pr-8">
          <AboutSideNav active={tab} onChange={setTab} />
        </div>

        {/* 오른쪽 본문: 세로 가이드 안쪽으로 강제 */}
        <div
          className="
            min-w-0 w-full box-border
            /*md:pr-[30px]*/            /* ← 가이드 폭만큼 오른쪽 여백 예약 */
            max-w-[980px]                     /* ← 텍스트 최대 너비 제한 */
            mr-auto                           /* ← 왼쪽 정렬 유지 */
            not-prose
          "
        >
          {tab === 'about' ? <AboutContent /> : <MemberContent />}
        </div>
      </div>
    </main>
  );
}
