// src/components/AboutSideNav.tsx
'use client';

import { AboutTab } from '@/types/about';

type Props = {
  active: AboutTab;
  onChange: (t: AboutTab) => void;
};

export default function AboutSideNav({ active, onChange }: Props) {
  return (
    <aside className="hidden md:block md:sticky md:top-24 md:self-start bg-white">
      <nav aria-label="About navigation">
        <ul className="flex md:flex-col gap-4 text-sm">
          {(['about', 'member'] as AboutTab[]).map((t) => {
            const isActive = active === t;
            const base = 'block text-left transition-colors';
            const on = 'text-neutral-900 font-semibold underline underline-offset-2 decoration-2 cursor-default';
            const off = 'text-neutral-400 hover:text-neutral-900 hover:underline underline-offset-2';
            return (
              <li key={t}>
                <button
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  className={`${base} ${isActive ? on : off}`}
                  onClick={() => {
                    onChange(t);
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

      {/* 연락처 */}
      <div className="mt-10 space-y-6 text-[13px] leading-6">
        <div>
          <div className="text-neutral-400">mail</div>
          <a href="mailto:labchasm2022@gmail.com" className="text-neutral-700 hover:underline">
            labchasm2022@gmail.com
          </a>
        </div>
        <div>
          <div className="text-neutral-400">instagram</div>
          <a
            href="https://instagram.com/lab_chasm"
            target="_blank"
            rel="noreferrer"
            className="text-neutral-700 hover:underline"
          >
            @lab_chasm
          </a>
        </div>
      </div>
    </aside>
  );
}
