// components/Header.tsx
'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header
      id="header"
      className="fixed top-0 left-0 w-full h-[70px] z-50 flex items-center justify-between bg-white px-4"
    >
      <Link href="/">
        <img
          src="/labchasm-logo.png"
          alt="Lab Chasm"
          className="h-[50px] w-auto object-contain"
        />
      </Link>
      <button>
        <img
          src="/menuimg.png"
          alt="Menu"
          className="h-[25px] w-auto object-contain"
        />
      </button>
    </header>
  );
}
