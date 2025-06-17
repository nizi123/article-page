'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MenuItemProps {
  id: string;
  href: string;
  src: string;
  hoverSrc: string;
  onClick: () => void;
}

function MenuItem({ id, href, src, hoverSrc, onClick }: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={href} onClick={onClick}>
      <motion.img
        src={isHovered ? hoverSrc : src}
        alt={id}
        className="h-[50px] lg:h-[50px] w-auto object-contain"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
         // 모바일 터치
        onPointerDown={() => setIsHovered(true)}
        onPointerUp={() => setIsHovered(false)}
        onPointerLeave={() => setIsHovered(false)}

        whileTap={{ scale: 1.1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </Link>
  );
}


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // 1️⃣ 메뉴 오픈 시 스크롤 위치 저장 & body 잠금
  useEffect(() => {
    if (isOpen) {
      const y = window.scrollY;
      setScrollY(y);
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      // 2️⃣ 메뉴 닫힐 때 body 스타일 복구 & 원래 위치로 스크롤
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, scrollY);
    }
  }, [isOpen, scrollY]);

  const items = [
    { id: 'About', href: 'https://labchasm.framer.website/about_us', src: '/aboutimg.png', hoverSrc: '/aboutimg_cor.png' },
    { id: 'Project', href: 'https://labchasm.framer.website/project', src: '/projectimg.png', hoverSrc: '/projectimg_cor.png' },
    { id: 'Article', href: '/article', src: '/articleimg.png', hoverSrc: '/articleimg_cor.png' },
    { id: 'Contact', href: 'https://labchasm.framer.website/contact', src: '/contactimg.png', hoverSrc: '/contactimg_cor.png' },
  ];

  return (
    <>
      {/* 1️⃣ 헤더 바 */}
      <header
        id='header'
        className={`
          fixed top-0 left-0 w-full h-[70px] z-50 flex items-center justify-between px-6
          transition-colors duration-500 ease-in-out
          ${isOpen ? 'bg-black' : 'bg-white'}
        `}
      >
        {/* 로고도 색 전환 */}
        <Link href="https://labchasm.framer.website/">
          <img
            src="/labchasm-logo.png"
            alt="Lab Chasm"
            className={`
              h-[50px] object-contain
              transition-filter duration-500 ease-in-out
              ${isOpen ? 'invert' : ''}
            `}
          />
        </Link>

        {/* 메뉴 토글 버튼 */}
        <button onClick={() => setIsOpen(prev => !prev)}>
          {isOpen ? (
                       <img
                       src="/closebtn.png"
                       alt="Close"
                       className="h-[25px] object-contain"
                     />
          ) : (
            <img
              src="/menuimg.png"
              alt="Menu"
              className="h-[25px] object-contain"
            />
          )}
        </button>
      </header>

      {/* 2️⃣ 풀스크린 메뉴 오버레이 */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: isOpen ? 0 : '-100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 bg-black text-white flex flex-col justify-center items-center z-40"
      >
      <nav
            className="
              /* 모바일: 세로 스택 */
              w-full h-full
              flex flex-col items-center justify-center h-full space-y-8 px-6
              /* PC(lg 이상): 가로 플렉스, 아이템 간 균등 분배, 세로간격 제거 */
              lg:flex-row lg:justify-evenly lg:space-y-0 lg:px-0
            "
          >
           {items.map((item) => (
            <MenuItem
              key={item.id}
              id={item.id}
              href={item.href}
              src={item.src}
              hoverSrc={item.hoverSrc}
              onClick={() => setIsOpen(false)}
            />
          ))}

        </nav>
      </motion.div>
    </>
  );
}
