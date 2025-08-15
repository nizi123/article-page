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
    <main className="w-full min-h-screen bg-white mx-auto max-w-6xl px-6 md:px-8
                 pt-28 md:pt-40 pb-16 md:pb-24">      <AboutTabsMobile active={tab} onChange={setTab} />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
        <div className="md:col-span-3 lg:col-span-2">
          <AboutSideNav active={tab} onChange={setTab} />
        </div>
        <div className="md:col-span-9 lg:col-span-10 not-prose">
          {tab === 'about' ? <AboutContent /> : <MemberContent />}
        </div>
      </div>
    </main>
  );
}
