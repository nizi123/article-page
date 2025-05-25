// components/Header.tsx
'use client';

import Link from 'next/link'; // Image import 제거함

export default function Header() {
  return (
    <header
      className="fixed top-0 left-0 w-full h-[70px] z-50 flex items-center justify-between px-6 md:px-12"
      style={{ backgroundColor: 'transparent' }}
    >
      <Link href="/">
        <img
          src="/labchasm-logo.png"
          alt="Lab Chasm"
          className="h-[50px] w-auto object-contain"
        />
      </Link>
      <button className="text-black font-extrabold text-lg tracking-wide">MENU</button>
    </header>
  );
}
