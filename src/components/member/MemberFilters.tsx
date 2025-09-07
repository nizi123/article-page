'use client';

import { labs, SubLab, labAccentHex } from './member-data';
import type { CSSProperties } from 'react';

export default function MemberFilters({
  active,
  onChange,
}: {
  active: SubLab;
  onChange: (lab: SubLab) => void;
}) {
  return (
    <nav className="w-full" aria-label="Sub Lab filters" role="tablist">
      {/* 동일폭 그리드 + 바닥 회색선 */}
      <ul
        className="grid w-full border-b border-neutral-300"
        style={{ gridTemplateColumns: `repeat(${labs.length}, minmax(0,1fr))` }}
      >
        {labs.map(({ key, label }) => {
          const isActive = active === key;
          const accent = labAccentHex[key];

          return (
            <li
              key={key}
              className="min-w-0"
              style={{ ['--accent' as any]: accent } as CSSProperties}
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(key)}
                className={[
                  'relative block w-full text-center py-2 pb-3 transition-colors',
                  isActive
                    ? 'font-semibold text-[var(--accent)] ' +
                      // 활성 밑줄(바닥선과 딱 붙도록 -1px)
                      'after:content-[""] after:absolute after:left-0 after:right-0 ' +
                      'after:-bottom-[1px] after:h-[3px] after:bg-[var(--accent)]'
                    : 'text-neutral-400 hover:text-[var(--accent)]',
                ].join(' ')}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
