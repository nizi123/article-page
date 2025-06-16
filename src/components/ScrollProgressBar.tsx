// components/ScrollProgressBar.tsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
  /** 오른쪽 여백 */
  sharePaddingRight?: number; 
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
  sharePaddingRight = 80,
}: ScrollProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [topOffset, setTopOffset] = useState(0);
  // 모바일
  const [isMobile, setIsMobile] = useState(false);
  // 토스트 상태
  const [showToast, setShowToast] = useState(false);
  
  // 모바일 체크
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  
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

  useEffect(() => {
    const headerEl = document.getElementById('header');
    const updateOffset = () => {
      setTopOffset(headerEl?.offsetHeight || 0);
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  if (!visible) return null;

  // 모바일이면 좌측 마진을 16px, 폰트는 흰색으로
  const left = isMobile ? 16 : titlePaddingLeft;
  const shareRight = isMobile ? 16 : sharePaddingRight;

    // 공유 버튼 핸들러
    const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    };
  

  return (
    <>
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
            left: `${left}px`,
            transform: 'translateY(-50%)',
            color: titleColor,
            fontWeight: 500,
            pointerEvents: 'none',
          }}
        >
          {title}
        </div>
      )}


      {/* 공유 버튼 */}
      <button
        onClick={handleShare}
        style={{
          position: 'absolute',
          top: '50%',
          right: `${shareRight}px`,
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          pointerEvents: 'auto',  // 중요!
          color: 'lightgray'
        }}
        aria-label="이 페이지 링크 복사"
      >
        <Image
          src="/shareicon.png"
          alt="공유하기"
          width={24}
          height={24}
          priority={true}
        />
      </button>
    </div>

  {/* 토스트 */}
  {showToast && (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: 4,
        fontSize: 14,
        pointerEvents: 'none',
        zIndex: 1100,
        opacity: showToast ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      링크가 복사되었습니다!
    </div>
  )}
</>


  );
}
