"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

type Props = {
  gid: number;
  nickname: string;
  comment: string;
  top3: { title: string; artist: string; summary?: string }[];
};

const BG = "/musicconv/share-bg.png";
const AI_ICON = "/musicconv/ai-icon.png";
const EV_TITLE = "/musicconv/event-title.png";  // 'EVENT' 타이틀 이미지
const EV_ARROW = "/musicconv/event-arrow.png";  // 아래 화살표 이미지

async function ensureFonts(fonts: string[]) {
  const set = (document as any).fonts as FontFaceSet | undefined;
  if (set?.load) {
    await Promise.all(fonts.map((f) => set.load(f, "한")));
    try { await set.ready; } catch {}
  } else {
    await new Promise((r) => setTimeout(r, 200));
  }
}

function splitGraphemes(text: string) {
  try {
    // @ts-ignore
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      // @ts-ignore
      const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
      return Array.from(seg.segment(text), (s: any) => s.segment);
    }
  } catch {}
  return Array.from(text ?? "");
}

export default function SharePosterClient({ gid, nickname, comment, top3 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.searchParams.set("dl", "1");
    return u.toString();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") setIsDesktop(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    if (!isDesktop || !shareUrl) return;
    QRCode.toDataURL(shareUrl, {
      width: 180,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff00" },
    })
      .then(setQr)
      .catch(() => setQr(null));
  }, [isDesktop, shareUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dl = new URL(window.location.href).searchParams.get("dl");
    if (dl === "1") setTimeout(() => download(), 500);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureFonts([
        "900 60px Pretendard, Apple SD Gothic Neo, sans-serif",
        "700 42px Pretendard, Apple SD Gothic Neo, sans-serif",
        "700 40px Pretendard, Apple SD Gothic Neo, sans-serif",
        "700 34px Pretendard, Apple SD Gothic Neo, sans-serif",
        "400 32px Pretendard, Apple SD Gothic Neo, sans-serif",
        "500 30px Pretendard, Apple SD Gothic Neo, sans-serif",
        "900 36px Pretendard, Apple SD Gothic Neo, sans-serif",
        "1000 44px Pretendard, Apple SD Gothic Neo, sans-serif",
      ]);
      if (cancelled) return;

      const c = canvasRef.current;
      if (!c) return;

      const W = 1080;
      const H = 1920;
      c.width = W;
      c.height = H;

      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);

      const drawText = (
        text: string,
        x: number,
        y: number,
        font: string,
        color = "#333",
        align: CanvasTextAlign = "left",
        baseline: CanvasTextBaseline = "alphabetic"
      ) => {
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;

        const dx = Math.round(x) + 0.5;
        const dy = Math.round(y) + 0.5;

        ctx.fillText(text, dx, dy);
        ctx.strokeStyle = "rgba(0,0,0,0.01)";
        ctx.lineWidth = 0.5;
        ctx.strokeText(text, dx, dy);
        ctx.fillText(text, dx, dy);

        ctx.restore();
      };

      const measureWidth = (text: string, font: string) => {
        ctx.save();
        ctx.font = font;
        const w = ctx.measureText(text).width;
        ctx.restore();
        return w;
      };

      const wrapLines = (text: string, maxW: number, font: string) => {
        ctx.save();
        ctx.font = font;

        const raw = String(text ?? "");
        const hasSpace = /\s/.test(raw);
        const tokens = hasSpace ? raw.split(/\s+/) : splitGraphemes(raw);
        const joiner = hasSpace ? " " : "";

        const lines: string[] = [];
        let line = "";

        for (const t of tokens) {
          const cand = line ? line + joiner + t : t;
          if (ctx.measureText(cand).width > maxW) {
            if (line) lines.push(line);
            line = t;
          } else {
            line = cand;
          }
        }
        if (line) lines.push(line);

        ctx.restore();
        return lines;
      };

      const drawWrapped = (
        lines: string[],
        x: number,
        y: number,
        lineH: number,
        font: string,
        color = "#333",
        maxLines?: number
      ) => {
        const count = maxLines ? Math.min(lines.length, maxLines) : lines.length;
        for (let i = 0; i < count; i++) {
          drawText(lines[i], x, y + i * lineH, font, color, "left", "top");
        }
        return count * lineH;
      };

      const drawRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        fill: string,
        stroke = "#E5E5E5"
      ) => {
        ctx.save();
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };

      let __aiIconImg: HTMLImageElement | null = null;
      const drawAISummaryIcon = (x: number, y: number, size = 48) => {
        if (!__aiIconImg) {
          __aiIconImg = new Image();
          __aiIconImg.src = AI_ICON;
        }
        const img = __aiIconImg;
        const paint = () => {
          const dx = Math.round(x);
          const dy = Math.round(y);
          ctx.drawImage(img!, dx, dy, size, size);
        };
        if (img!.complete) paint();
        else img!.onload = paint;
      };

      const bg = new Image();
      bg.src = BG;
      bg.onload = () => {
        // 배경
        ctx.drawImage(bg, 0, 0, W, H);

        // ===== 민트 박스 (고정) =====
        drawRect(80, 630, 900, 260, "#38CED4", "#38CED4");
        drawText(
          `“ ${nickname}님의 문장 ”`,
          100,
          700,
          "900 36px Pretendard, Apple SD Gothic Neo, sans-serif",
          "#254a45"
        );
        {
          const commentFont = "500 30px Pretendard, Apple SD Gothic Neo, sans-serif";
          const lines = wrapLines(comment, 760, commentFont);
          drawWrapped(lines, 105, 765, 40, commentFont, "#254a45", 5);
        }

        // 섹션 타이틀
        drawText(
          "변환된 음악을 추천드려요",
          80,
          1040,
          "1000 44px Pretendard, Apple SD Gothic Neo, sans-serif",
          "#2B2B2B"
        );

        // ===== 카드 배치 공통 =====
        const cardX = 150;          // 카드의 좌측 (그대로)
        const numberRight = cardX - 24; // 랭크 텍스트 오른쪽 끝(그대로)
        const cardW = 860;

        // === 1번 카드 ===
        let y = 1088;               // (그대로)

        const title1 = `${top3?.[0]?.artist ?? ""} - ${top3?.[0]?.title ?? ""}`;
        const titleFont = "700 42px Pretendard";
        const titleLines = wrapLines(title1, cardW - 40, titleFont);
        const titleH = Math.max(42, (titleLines.length || 1) * 50);

        const labelFont = "700 34px Pretendard, Apple SD Gothic Neo, sans-serif";
        const bodyFont  = "400 32px Pretendard, Apple SD Gothic Neo, sans-serif";
        const summaryLines = wrapLines(top3?.[0]?.summary ?? "", cardW - (40 + 56), bodyFont);
        const summaryH = Math.min(summaryLines.length, 6) * 44;

        const topPad = 26;
        const bottomPad = 26;
        const dividerGap = 18;
        const labelGap = 16;
        const iconSize = 48;        // (그대로)
        const iconLabelGap = 16;

        const card1H =
          topPad +
          titleH +
          dividerGap +
          1 +
          labelGap +
          Math.max(iconSize, 34) +
          18 +
          summaryH +
          bottomPad;

        // 카드 사각형
        drawRect(cardX, y, cardW, card1H, "#FFFFFF");

        // 랭크 텍스트 (#1)
        const rankFont = "900 60px Pretendard, Apple SD Gothic Neo, sans-serif";
        const rankText = "#1";
        const rankW = measureWidth(rankText, rankFont);
        const rankX = numberRight - rankW;
        const rankY = y + 60;
        drawText(rankText, rankX, rankY, rankFont, "#111", "left", "middle");

        // ===== FIX: RAF에서 바뀐 y가 쓰이지 않게 “고정 좌표”로 두 번 그리기 =====
        const titleBaseX = cardX + 20;
        const titleBaseY = y + topPad + 5;
        drawWrapped(titleLines, titleBaseX, titleBaseY, 50, titleFont, "#222");
        requestAnimationFrame(() => {
          drawWrapped(titleLines, titleBaseX, titleBaseY, 50, titleFont, "#222");
        });

        // 구분선 + 요약
        {
          const yy = y + topPad + titleH + dividerGap;
          ctx.save();
          ctx.strokeStyle = "#E5E5E5";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(Math.round(cardX + 20) + 0.5, Math.round(yy) + 0.5);
          ctx.lineTo(Math.round(cardX + cardW - 20) + 0.5, Math.round(yy) + 0.5);
          ctx.stroke();
          ctx.restore();

          const rowY = yy + labelGap;
          drawAISummaryIcon(cardX + 20, rowY - 5);
          drawText(
            "가사 AI 요약",
            cardX + 20 + 56 + iconLabelGap,
            rowY + 30,
            labelFont,
            "#2D2D2D",
            "left",
            "middle"
          );

          const bodyStartY = rowY + Math.max(iconSize, 34) + 18;
          drawWrapped(summaryLines, cardX + 90, bodyStartY + 15, 44, bodyFont, "#3C3C3C", 6);
        }

        y += card1H + 28;

        // === 2번, 3번 카드 ===
        const smallH = 110;
        const smallTitleFont = "700 40px Pretendard, Apple SD Gothic Neo, sans-serif";

        [2, 3].forEach((rank, i) => {
          drawRect(cardX, y, cardW, smallH, "#FFFFFF");

          const text = `#${rank}`;
          const w = measureWidth(text, rankFont);
          const rx = numberRight - w;
          const ry = y + smallH / 2;
          drawText(text, rx, ry, rankFont, "#111", "left", "middle");

          const item = top3?.[i + 1];
          const line = wrapLines(`${item?.artist ?? ""} - ${item?.title ?? ""}`, cardW - 40, smallTitleFont)[0] ?? "";
          drawText(line, cardX + 20, y + smallH / 2, smallTitleFont, "#222", "left", "middle");

          y += smallH + 28;
        });

        // 모바일 꾹-저장 이미지 갱신
        if (imgRef.current) {
          try {
            imgRef.current.src = c.toDataURL("image/png");
          } catch {}
        }
      };
    })();

    return () => {
      cancelled = true;
    };
  }, [nickname, comment, top3]);

  const download = () => {
    const c = canvasRef.current;
    if (!c) return;
    const fileName = `GMF_LAB_CHASM.png`;
    const a = document.createElement("a");
    a.download = fileName;
    a.href = c.toDataURL("image/png");
    a.click();
  };

  return (
    <main className="min-h-[100dvh] w-full bg-white">
      <div className="mx-auto max-w-[920px] px-4 py-8">
        {/* 안내 + PC 전용 QR */}
        <div className="text-center">
          <div className="">
            <img src={EV_TITLE} alt="EVENT" className="mx-auto h-30 mb-8" />
          </div>
          <p className="mt-2 text-[13px] leading-6 text-[#525252]">
            이미지를 꾹 눌러 다운 받아보세요!
            <br />(PC 버전은 QR코드로 찍어주세요)
            <br /><span className="font-semibold">@lab_chasm</span>을 태그해 스토리에 올려주시면
            <br />추첨을 통해 선물을 드립니다
            <br />인스타그램 비공개 계정은 참여 확인이 어렵습니다.
          </p>
          <img src={EV_ARROW} alt="" className="mx-auto mt-2 h-4 w-auto" />
          {isDesktop && qr && (
            <div className="mt-3 flex justify-center">
              <img src={qr} alt="포스터 다운로드 QR" className="h-44 w-44" />
            </div>
          )}
        </div>

        {/* 포스터 미리보기 + 다운로드 */}
        <div className="mt-8 flex flex-col items-center">
          {/* 모바일: 이미지(꾹-저장), 데스크톱: 캔버스 */}
          <img
            ref={imgRef}
            alt="MusicConv Poster"
            className="block h-[640px] w-auto rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.12)] md:hidden"
          />
          <canvas
            ref={canvasRef}
            className="hidden h-[640px] w-auto rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.12)] md:block"
          />
          <div className="mt-5 flex gap-3">
            <button
              onClick={download}
              className="rounded-[10px] bg-[#ef5f86] px-5 py-3 text-[15px] font-bold text-white shadow-[0_6px_12px_rgba(239,95,134,0.25)] hover:bg-[#e65980]"
            >
              PNG 다운로드
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
