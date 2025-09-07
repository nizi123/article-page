'use client';

import { useMemo, useState } from 'react';
import { members, SubLab } from './member-data';
import MemberFilters from './MemberFilters';
import MemberGrid from './MemberGrid';
import MemberModal from './MemberModal';
import LabIntro from './LabIntro';

const PIN_ID = 'kitsh'; // ALL에서 최상단 고정

// 중복 제거( id 기준 )
function uniqueById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const i of arr) {
    if (!seen.has(i.id)) {
      seen.add(i.id);
      out.push(i);
    }
  }
  return out;
}

// Fisher–Yates (원본 불변)
function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemberContent() {
  const [lab, setLab] = useState<SubLab>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [allNonce, setAllNonce] = useState(0); // ALL을 누를 때마다 증가

  const handleChange = (next: SubLab) => {
    setLab(next);
    if (next === 'all') setAllNonce((n) => n + 1);
  };

  // ✅ 데이터 계산
  const data = useMemo(() => {
    const uniq = uniqueById(members);
    if (lab === 'all') {
      const pinned = uniq.find((m) => m.id === PIN_ID) || null;
      const others = uniq.filter((m) => m.id !== PIN_ID);
      const mixed = shuffle(others); // nonce가 바뀔 때만 다시 섞임
      return pinned ? [pinned, ...mixed] : mixed;
    }
    return uniq.filter((m) => m.lab === lab);
  }, [lab, allNonce]);

  const selected = useMemo(
    () => members.find((m) => m.id === openId) || null,
    [openId]
  );

  return (
    <section className="not-prose">
      <LabIntro lab={lab} />

      <div className="mt-10">
        <MemberFilters active={lab} onChange={handleChange} />
      </div>

      {/* key로 강제 리마운트 → 이전 렌더 잔상 제거 */}
      <MemberGrid key={`${lab}-${allNonce}`} items={data} onOpen={setOpenId} />

      {selected && (
        <MemberModal member={selected} onClose={() => setOpenId(null)} />
      )}
    </section>
  );
}
