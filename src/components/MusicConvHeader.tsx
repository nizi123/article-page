"use client";

const MUSICCONV_LOGO = "/musicconv/logo-musicconv.png"; // 넣을 로고 경로

export default function MusicConvHeader() {
  return (
    <div className="sticky top-0 z-40 bg-white/85 backdrop-blur
                    supports-[backdrop-filter]:bg-white/70 border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4">
        <div className="h-12 sm:h-14 flex items-center justify-center">
          <a href="/musicconv" aria-label="MusicConv 홈으로">
            <img
              src={MUSICCONV_LOGO}
              alt="MuSicConv"
              className="h-6 sm:h-7 w-auto select-none"
              style={{ imageRendering: "crisp-edges" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
}
