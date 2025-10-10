import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "MusicConv | LabChasm",
  description: "텍스트를 음악으로 변환하는 실험적 페이지",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function MusicConvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
