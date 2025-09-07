'use client';

import Image from 'next/image';
import { Member } from './member-data';

export default function MemberGrid({
  items,
  onOpen,
}: {
  items: Member[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
      {items.map(m => (
        <button
          key={m.id}
          type="button"
          onClick={() => onOpen(m.id)}
          className="group overflow-hidden rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <div className="relative aspect-[3/4]">
            <Image
              src={m.photo}
              alt={`${m.name} 프로필`}
              fill
              sizes="(max-width:768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        </button>
      ))}
    </div>
  );
}
