'use client';

import { useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Member } from './member-data';
import { labAccentHex } from './member-data';
import type { CSSProperties } from 'react';
import DOMPurify from 'dompurify';


export default function MemberModal({
  member,
  onClose,
}: {
  member: Member;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const safeBio = useMemo(() => {
    const html = (member.bio ?? '').replace(/\n/g, '<br/>');
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['br', 'strong', 'b', 'em', 'i', 'del', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  }, [member.bio]);

  // ESC + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === ref.current) onClose();
  };

  const accent = labAccentHex[member.lab];

  return (
    <div
      ref={ref}
      onMouseDown={onBackdrop}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* 컨테이너 */}
      <div
        className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden"
        style={{ ['--accent' as any]: accent } as CSSProperties}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 md:top-4 md:right-4 h-9 w-9 rounded-md bg-black text-white grid place-items-center hover:opacity-90"
        >
          ✕
        </button>

        {/* 스크롤 영역 */}
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-[420px_minmax(0,1fr)] gap-6 md:gap-8">
            {/* 왼쪽 큰 사진 */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-200">
              <div className="relative aspect-[3/4]">
                <Image
                  src={member.photo}
                  alt={`${member.name} 사진`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
              </div>
            </div>

            {/* 오른쪽 정보 */}
            <div className="min-w-0">
              {/* 이름/영문명 */}
              <h2 className="text-[32px] md:text-[40px] font-extrabold tracking-[.08em] text-[var(--accent)]">
                {member.name}
                {member.aka ? (
                  <span className="ml-3 font-extrabold text-[26px] md:text-[32px] tracking-[.08em]">
                    {member.aka}
                  </span>
                ) : null}
              </h2>

              {/* Lab · Role */}
              <div className="mt-2 text-sm md:text-base">
                <span className="font-semibold text-[var(--accent)]">
                  {member.labLabel}
                </span>
                <span className="mx-2 text-neutral-400">|</span>
                <span className="text-neutral-500">{member.role}</span>
              </div>

              {/* 태그라인 */}
              {member.tagline ? (
                <h3 className="mt-6 text-xl md:text-xl font-semibold text-neutral-800">
                  {member.tagline}
                </h3>
              ) : null}

              {/* 소개 */}
              <p className="mt-3 text-[15px] md:text-[16px] leading-7 text-neutral-700 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: safeBio }} 
                />

              {/* 구분선 */}
              <hr className="my-6 border-neutral-300" />

              {/* TOP3 */}
              {member.top3?.length ? (
                <>
                  <h4 className="text-lg md:text-xl font-extrabold text-neutral-900">
                    즐겨듣는 음악 TOP3
                  </h4>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {member.top3.map((t, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden border border-neutral-200">
                        <div className="relative aspect-square">
                          <Image
                            src={t.cover}
                            alt={t.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 33vw, 280px"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-black/0 px-4 py-4 text-center">
                            <div className="text-white font-extrabold leading-tight">
                              {t.title}
                            </div>
                            {(t.year || t.subtitle) && (
                              <div className="text-white/90 font-bold">
                                {t.year ? `(${t.year})` : ''}{' '}
                                {t.subtitle ?? ''}
                              </div>
                            )}
                          </div>
                        </div>
                        {t.artist && (
                          <div className="px-4 py-3 text-sm text-neutral-700 text-center">
                            {t.artist}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
