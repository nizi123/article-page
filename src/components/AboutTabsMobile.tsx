// src/components/AboutTabsMobile.tsx
'use client';

import { AboutTab } from '@/types/about';
import { useEffect } from 'react';

type Props = {
  active: AboutTab;
  onChange: (t: AboutTab) => void;
  headerHeight?: number; // 기본 70
};

export default function AboutTabsMobile({ active, onChange, headerHeight = 70 }: Props) {
  // 해시로 진입 시 초기 동기화(다른 곳에서 해도 중복 무해)
  useEffect(() => {
    const hash = (typeof window !== 'undefined' && window.location.hash.replace('#', '')) || '';
    if (hash === 'member' || hash === 'about') onChange(hash as AboutTab);
  }, [onChange]);

  return (
    <nav
      aria-label="About sections"
      className="md:hidden sticky z-30 bg-white"
      style={{ top: headerHeight }}
      role="tablist"
    >
      <ul className="mx-auto max-w-6xl px-6 py-3 flex gap-6">
        {(['about', 'member'] as AboutTab[]).map((t) => {
          const isActive = active === t;
          const base = 'inline-block pb-1 -mb-px transition-colors';
          const on = 'text-neutral-900 font-semibold';              // 활성: 진하게
          const off = 'text-neutral-400 hover:text-neutral-900';    // 비활성
          return (
            <li key={t}>
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${base} ${isActive ? on : off}`}
                onClick={() => {
                  onChange(t);
                  // URL 해시만 교체(라우팅 X)
                  if (typeof window !== 'undefined') {
                    history.replaceState(null, '', `#${t}`);
                  }
                }}
              >
                {t === 'about' ? 'About' : 'Member'}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
