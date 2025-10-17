"use client";

import { useEffect, useMemo, useRef, useState } from "react";
// QR 코드:  npm i qrcode
import QRCode from "qrcode";

type Props = {
  gid: number;
  nickname: string;
  comment: string;
  top3: { title: string; artist: string; summary?: string }[];
};

const BG = "/musicconv/share-bg.png";            // 핑크 배경 (첨부 이미지)
const IG_BANNER = "/images/instagram-banner.png";

export default function SharePosterClient({ gid, nickname, comment, top3 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // 공유 페이지 URL & 다운로드 파라미터
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.searchParams.set("dl", "1");
    return u.toString();
  }, []);

  // 데스크탑 판별 + QR 준비
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDesktop(window.innerWidth >= 768);
    }
  }, []);
  useEffect(() => {
    if (!isDesktop || !shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 180, margin: 1, color: { dark: "#000000", light: "#ffffff00" } })
      .then(setQr)
      .catch(() => setQr(null));
  }, [isDesktop, shareUrl]);

  // 모바일에서 ?dl=1 들어오면 자동 다운로드
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dl = new URL(window.location.href).searchParams.get("dl");
    if (dl === "1") {
      // 약간의 렌더 시간 후 저장
      setTimeout(() => download(), 500);
    }
  }, []);

  // 캔버스 렌더(1080x1920)
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const W = 1080, H = 1920;
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    const bg = new Image();
    bg.src = BG;
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, W, H);

      // 공통 스타일
      const drawRound = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 4; ctx.stroke(); }
        ctx.restore();
      };
      const drawText = (text: string, x: number, y: number, font: string, color="#333", align: CanvasTextAlign="left") => {
        ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "top"; ctx.fillText(text, x, y); ctx.restore();
      };
      const wrap = (text: string, x: number, y: number, maxW: number, lineH: number, font: string, color="#333") => {
        ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = "top";
        const words = text.split(/\s+/);
        let line = "", yy = y;
        for (let i=0;i<words.length;i++){
          const test = line ? line + " " + words[i] : words[i];
          if (ctx.measureText(test).width > maxW) {
            ctx.fillText(line, x, yy);
            line = words[i]; yy += lineH;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, x, yy);
        ctx.restore();
      };

      // 1) 민트 박스: 닉네임 + 입력 문장
      drawRound(135, 675, 810, 260, 18, "#B8F3EC");
      drawText(`“ ${nickname}님의 문장 ”`, 165, 705, "bold 36px Pretendard, Apple SD Gothic Neo, sans-serif", "#254a45");
      wrap(comment, 165, 755, 760, 40, "500 30px Pretendard, Apple SD Gothic Neo, sans-serif", "#254a45");

      // 2) 추천 TOP3
      drawText("변환된 음악을 추천드려요", 165, 1010, "bold 36px Pretendard, Apple SD Gothic Neo, sans-serif", "#2b2b2b");

      const rowH = 158;
      const boxW = 720, boxH = 120;

      top3.slice(0, 3).forEach((s, idx) => {
        const baseY = 1075 + idx * rowH;
        drawText(`#${idx + 1}`, 135, baseY + 20, "bold 30px Pretendard, sans-serif", "#C02C50");

        // 곡 박스
        drawRound(195, baseY, boxW, boxH, 8, "#fff", "#f0f0f0");
        drawText(`${s.artist} - ${s.title}`, 215, baseY + 12, "600 26px Pretendard, sans-serif", "#2f2f2f");

        if (idx === 0 && s.summary) {
          drawText("가사 AI 요약", 215, baseY + 52, "600 22px Pretendard, sans-serif", "#4a4a4a");
          wrap(s.summary, 215, baseY + 78, 680, 30, "400 22px Pretendard, sans-serif", "#4a4a4a");
        }
      });

      // 하단 배너(선택) — PNG에는 포함시키고 싶으면 주석 해제
      // const ig = new Image();
      // ig.src = IG_BANNER;
      // ig.onload = () => ctx.drawImage(ig, (W-660)/2, H-220, 660, 120);
    };
  }, [nickname, comment, top3]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const link = document.createElement("a");
    link.download = `musicconv_${gid}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto max-w-[920px] px-4 py-8">
      {/* 상단 안내 / PC 전용 QR */}
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e8fbf7]">🎉</div>
        <h2 className="text-[18px] font-extrabold text-[#47a8a0] tracking-[-0.01em]">EVENT</h2>
        <p className="mt-2 text-[13px] leading-6 text-[#444]">
          이미지를 꼭 받아 보관하세요! <br />
          PC에서는 아래 QR코드로 휴대폰에서 저장하면 편해요.
        </p>

        {/* PC에서만 QR */}
        {isDesktop && qr && (
          <div className="mt-3 flex justify-center">
            <img src={qr} alt="포스터 다운로드 QR" className="h-44 w-44" />
          </div>
        )}
      </div>

      {/* 포스터 미리보기 */}
      <div className="mt-8 flex flex-col items-center">
        <canvas ref={canvasRef} className="h-[640px] w-auto rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.12)]" />
        <div className="mt-5 flex gap-3">
          <button
            onClick={download}
            className="rounded-[10px] bg-[#ef5f86] px-5 py-3 text-[15px] font-bold text-white shadow-[0_6px_12px_rgba(239,95,134,0.25)] hover:bg-[#e65980]"
          >
            PNG 다운로드
          </button>
          <a
            href="/images/instagram-banner.png"
            target="_blank"
            className="rounded-[10px] border border-slate-300 bg-white px-5 py-3 text-[15px] font-semibold text-slate-700"
          >
            인스타그램 배너 보기
          </a>
        </div>
      </div>
    </div>
  );
}
