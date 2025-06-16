'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // 메뉴 열릴 때 뒤쪽 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* 헤더 바 */}
      <header id="header" className="fixed top-0 left-0 w-full h-[70px] z-50 flex items-center justify-between bg-white px-6">
        <Link href="https://labchasm.framer.website/">
          <img
            src="/labchasm-logo.png"
            alt="Lab Chasm"
            className="h-[50px] object-contain"
          />
        </Link>
        <button onClick={() => setIsOpen(prev => !prev)}>
          {isOpen ? (
            <span className="text-black font-bold">CLOSE</span>
          ) : (
            <img
              src="/menuimg.png"
              alt="Menu"
              className="h-[25px] object-contain"
            />
          )}
        </button>
      </header>

      {/* Framer Motion 풀스크린 메뉴 오버레이 */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: isOpen ? 0 : '-100%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed inset-0 bg-black text-white flex flex-col justify-center items-center z-40"
      >
        <Link href="#about" onClick={() => setIsOpen(false)}>
          <span className="text-4xl font-bold mb-8">ABOUT US</span>
        </Link>
        <Link href="#project" onClick={() => setIsOpen(false)}>
          <span className="text-4xl font-bold mb-8">PROJECT</span>
        </Link>
        <Link href="#article" onClick={() => setIsOpen(false)}>
          <span className="text-4xl font-bold mb-8">ARTICLE</span>
        </Link>
        <Link href="#contact" onClick={() => setIsOpen(false)}>
          <span className="text-4xl font-bold">CONTACT</span>
        </Link>
      </motion.div>
    </>
  );
}
