// components/Footer.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
    id = "footer"
    className="mt-[100px] h-[230px] bg-black text-white px-20 py-10 flex flex-col">
      {/* 상단 로고 */}
      <div>
        <Link href="https://labchasm.framer.website/">
          <Image
            src="/footerlogo.png"
            alt="Lab CHASM Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </Link>
      </div>

      {/* 구분선 및 하단 영역 */}
      <div className="mt-auto w-full">
        {/* 구분선 */}
        <div className="w-full border-t border-gray-700" />

        {/* 저작권 및 아이콘 */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm">
            copyright 2025. Lab CHASM. All rights reserved.
          </p>

          <div className="flex space-x-6">
            <Link
              href="https://www.youtube.com/lab_chasm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube 채널"
            >
              <Youtube className="w-6 h-6" />
            </Link>
            <Link
              href="https://www.instagram.com/lab_chasm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram 프로필"
            >
              <Instagram className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
