import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About | Lab CHASM',
  description: '한국 인디음악 기반의 음악 생태계 연구소, Lab CHASM 소개',
};

export default function Page() {
  return <AboutPageClient />; // 👈 클라이언트 컴포넌트 렌더
}
