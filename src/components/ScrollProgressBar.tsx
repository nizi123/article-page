// components/ScrollProgressBar.tsx
'use client';
import { useEffect, useState } from 'react';

interface ScrollProgressBarProps {
  color: string;
  /** 제목과의 좌측 여백(px) */
  titlePaddingLeft?: number;
  /** 표시할 제목 */
  title?: string;
  /** 푸터 직전에서 페이드 아웃 될 때까지의 스크롤 거리 (px) */
  fadeDistance?: number;
  /** 바 두께(px) */
  thickness?: number;
  /** 하단 베이스라인 두께(px) */
  baselineThickness?: number;
  /** 하단 베이스라인 색상 */
  baselineColor?: string;
  /** 제목 텍스트 색상 */
  titleColor?: string;
  /** 배경 색상 */
  background?: string;
}

export default function ScrollProgressBar({
  color,
  titlePaddingLeft = 80,
  title = '',
  fadeDistance = 100,
  thickness = 47,
  baselineThickness = 1,
  baselineColor = '#e5e7eb',
  titleColor = '#000000',
}: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    const headerEl = document.getElementById('header');
    setTopOffset(headerEl?.offsetHeight || 0);

    const startEl = document.getElementById('article-top-image');
    const footerEl = document.getElementById('footer');

    const onScroll = () => {
      const scrollY = window.pageYOffset;
      const start = startEl
        ? startEl.getBoundingClientRect().bottom + scrollY
        : 0;
      const footerTop = footerEl
        ? footerEl.getBoundingClientRect().top + scrollY
        : document.documentElement.scrollHeight;
      const end = footerTop - window.innerHeight;

      if (scrollY >= start && scrollY <= end + fadeDistance) {
        setVisible(true);
        const pct = ((scrollY - start) / (end - start)) * 100;
        setProgress(Math.min(100, Math.max(0, pct)));

        if (scrollY > end) {
          const o = 1 - (scrollY - end) / fadeDistance;
          setOpacity(Math.max(0, o));
        } else {
          setOpacity(1);
        }
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [fadeDistance]);

  if (!visible) return null;

  return (
    <div
      style={{
        background: 'white',
        position: 'fixed',
        top: topOffset,
        left: 0,
        width: '100%',
        height: `${thickness + baselineThickness}px`,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {/* 베이스라인 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: `${baselineThickness}px`,
          backgroundColor: baselineColor,
        }}
      />

      {/* 컬러 프로그레스 바 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progress}%`,
          height: `${thickness}px`,
          backgroundColor: color,
          opacity,
          transition: 'width 0.2s ease-out, opacity 0.2s ease-out',
        }}
      />

      {/* 제목 */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${titlePaddingLeft}px`,
            transform: 'translateY(-50%)',
            color: titleColor,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
}
