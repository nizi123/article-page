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
    // 모든 폰트/가중치/크기를 미리 로드
    await Promise.all(fonts.map(f => set.load(f, "한")));
    // Safari 안정화: ready도 기다리기
    try { await set.ready; } catch {}
  } else {
    // 폰트 API 없는 구형 브라우저용 최소 대기
    await new Promise(r => setTimeout(r, 200));
  }
}


export default function SharePosterClient({ gid, nickname, comment, top3 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // ?dl=1 로 모바일 자동저장
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

  // ======================= 캔버스 렌더 =======================
  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureFonts([
        "900 60px Pretendard, Apple SD Gothic Neo, sans-serif",
        "700 42px Pretendard, Apple SD Gothic Neo, sans-serif",
        "700 40px Pretendard, Apple SD Gothic Neo, sans-serif",
        "700 34px Pretendard, Apple SD Gothic Neo, sans-serif",
        "400 32px Pretendard, Apple SD Gothic Neo, sans-serif",
      ]);
      if (cancelled) return;
  

  //  (async () => {
    const c = canvasRef.current;
    if (!c) return;

    const W = 1080;
    const H = 1920;
    c.width = W;
    c.height = H;

    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // ------- 유틸 -------
    const setFont = (font: string, color = "#333") => {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
    };

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
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      setFont(font, color);
      ctx.fillText(text, Math.round(x) + 0.5, Math.round(y) + 0.5);
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
      const words = String(text ?? "").split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const t = line ? line + " " + w : w;
        if (ctx.measureText(t).width > maxW) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = t;
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
      ctx.save();
      setFont(font, color);
      const count = maxLines ? Math.min(lines.length, maxLines) : lines.length;
      for (let i = 0; i < count; i++) {
        ctx.fillText(lines[i], Math.round(x) + 0.5, Math.round(y + i * lineH) + 0.5);
      }
      ctx.restore();
      return count * lineH;
    };

    const drawRect = (x: number, y: number, w: number, h: number, fill: string, stroke = "#E5E5E5") => {
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

    // #1 카드 왼쪽 아이콘 (간단한 ‘마법봉’ 벡터)
    const drawAISummaryIcon = (x: number, y: number, size = 48) => {
      // 캐시된 이미지 재사용
      if (!__aiIconImg) {
        __aiIconImg = new Image();
        __aiIconImg.src = AI_ICON;
      }

      const img = __aiIconImg;

        // 실제 그리기 함수
  const paint = () => {
    // 살짝 정수 정렬(번짐 방지)
    const dx = Math.round(x);
    const dy = Math.round(y);
    ctx.drawImage(img!, dx, dy, size, size);
  };

  // 로딩 상태에 따라 처리
  if (img!.complete) {
    paint();
  } else {
    img!.onload = paint;
  }
};

    // 배경 로드 후 그리기
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
      const cardX = 150; // 카드의 좌측
      const numberRight = cardX - 24; // 랭크 텍스트의 '오른쪽 끝' 위치(카드 왼쪽과 수평 끝점 맞춤)
      const cardW = 860;

      // === 1번 카드 ===
      let y = 1088;

      // 제목
      const title1 = `${top3?.[0]?.artist ?? ""} - ${top3?.[0]?.title ?? ""}`;
      const titleFont = "700 42px Pretendard";
      const titleLines = wrapLines(title1, cardW - 40, titleFont);
      const titleH = Math.max(42, (titleLines.length || 1) * 50);
      
      // 요약
      const labelFont = "700 34px Pretendard, Apple SD Gothic Neo, sans-serif";
      const bodyFont = "400 32px Pretendard, Apple SD Gothic Neo, sans-serif";
      const summaryLines = wrapLines(top3?.[0]?.summary ?? "", cardW - (40 + 56), bodyFont);
      const summaryH = Math.min(summaryLines.length, 6) * 44;

      // 카드 높이 계산 (라운드 없음)
      const topPad = 26;
      const bottomPad = 26;
      const dividerGap = 18;
      const labelGap = 16;
      const iconSize = 48; // 아이콘 영역 높이
      const iconLabelGap = 16;

      const card1H =
        topPad +
        titleH +
        dividerGap +
        1 + // divider
        labelGap +
        Math.max(iconSize, 34) + // 아이콘/라벨 라인
        18 + // 라인과 본문 사이 여백
        summaryH +
        bottomPad;

      // 카드 사각형
      drawRect(cardX, y, cardW, card1H, "#FFFFFF");

      // 랭크 텍스트 (#1) — 카드의 세로 중앙 맞춤 + 오른쪽 끝을 카드 왼쪽 끝과 맞춤
      const rankFont = "900 60px Pretendard, Apple SD Gothic Neo, sans-serif";
      const rankText = "#1";
      const rankW = measureWidth(rankText, rankFont);
      const rankX = numberRight - rankW;
      const rankY = y + 60 ; // 중앙
      drawText(rankText, rankX, rankY, rankFont, "#111", "left", "middle");
      drawText(rankText, rankX, rankY, rankFont, "#111", "left", "middle");


      // 제목
      drawWrapped(titleLines, cardX + 20, y + topPad + 40, 50, titleFont, "#222");
      drawWrapped(titleLines, cardX + 20, y + topPad + 40, 50, titleFont, "#222");


      // 구분선
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

        // 아이콘 + 라벨
        const rowY = yy + labelGap; // 라벨 라인 top 기준
        drawAISummaryIcon(cardX + 20, rowY - 5); // 살짝 내려서 균형
        drawText("가사 AI 요약", cardX + 20 + 56 + iconLabelGap, rowY + 30, labelFont, "#2D2D2D", "left", "middle");

        // 본문
        const bodyStartY = rowY + Math.max(iconSize, 34) + 18;
        drawWrapped(summaryLines, cardX + 90, bodyStartY + 15, 44, bodyFont, "#3C3C3C", 6);
      }

      y += card1H + 28;

      // === 2번, 3번 카드 ===
      const smallH = 110;
      const smallTitleFont = "700 40px Pretendard, Apple SD Gothic Neo, sans-serif";

      [2, 3].forEach((rank, i) => {
        // 카드
        drawRect(cardX, y, cardW, smallH, "#FFFFFF");

        // 랭크 텍스트
        const text = `#${rank}`;
        const w = measureWidth(text, rankFont);
        const rx = numberRight - w;
        const ry = y + smallH / 2;
        drawText(text, rx, ry, rankFont, "#111", "left", "middle");

        // 제목(한 줄)
        const item = top3?.[i + 1];
        const line = wrapLines(`${item?.artist ?? ""} - ${item?.title ?? ""}`, cardW - 40, smallTitleFont)[0] ?? "";
        drawText(line, cardX + 20, y + smallH / 2, smallTitleFont, "#222", "left", "middle");

        y += smallH + 28;
      });
    };
  })();
    return () => { cancelled = true; };
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
                       {/* EVENT 타이틀 이미지 */}
  <img src={EV_TITLE} alt="EVENT" className="mx-auto h-30 mb-8" />
        </div>
        <p className="mt-2 text-[13px] leading-6 text-[#525252]">
    이미지를 꾹 눌러 다운 받아보세요!
    <br />(PC 버전은 QR코드로 찍어주세요)
    <br /><span className="font-semibold">@lab_chasm</span>을 태그해 스토리에 올려주시면
    <br />추첨을 통해 선물을 드립니다
    <br />인스타그램 비공개 계정은 참여 확인이 어렵습니다.
  </p>

    {/* 화살표 이미지 */}
    <img src={EV_ARROW} alt="" className="mx-auto mt-2 h-4 w-auto" />

        {isDesktop && qr && (
          <div className="mt-3 flex justify-center">
            <img src={qr} alt="포스터 다운로드 QR" className="h-44 w-44" />
          </div>
        )}
      </div>

      {/* 포스터 미리보기 + 다운로드 */}
      <div className="mt-8 flex flex-col items-center">
        <canvas
          ref={canvasRef}
          className="h-[640px] w-auto shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
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
