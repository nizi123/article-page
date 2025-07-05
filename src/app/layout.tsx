import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lab CHASM",
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons:{
    icon: '/labchasmfavi.png'
  },
  verification: {
    google: "g6vRsKyBv0T81ioqLSaA5ahU95lClmEjl51TOGEAbdg",
    other: {
      "naver-site-verification": "bb18df70dc0a23382337c76363d52080322a99ed",
    },
  },
  description: "한국 인디음악 기반의 음악 생태계 연구소, Lab CHASM ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-white dark:text-black overflow-x-hidden`}
      >
        <Header />
        <div>
        {children}
        </div>
        <Footer /> 

        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="99ebff8e-ae77-4f5e-8fe5-1b664a5209c5"
          strategy="beforeInteractive"
          defer
        />
      </body>
    </html>
  );
}
