// app/musicconv/share/[id]/page.tsx
import SharePosterClient from "../SharePosterClient";
import { headers } from "next/headers";

type GBDetail = {
  id: number;
  nickname: string;
  comment: string;

  // 신규 스키마
  readMusicSummaryResponses?: {
    title: string;
    artist: string;
    aiLyricsSummary?: string;
  }[];

  // 구형 호환
  summaryList?: {
    title: string;
    artist: string;
    aiLyricsSummaryOneLine?: string;
    aiLyricsSummaryThreeLines?: string;
  }[];
  title?: string;
  artist?: string;
  aiLyricsSummary?: string;
};

export const dynamic = "force-dynamic";

// 절대 URL 생성 (SSR에서 상대경로 fetch 방지)
function absUrl(path: string) {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
}

// ✅ 인자 타입 주석 제거 (또는 any 사용) → 빌드 에러 해결 포인트
export default async function SharePage(props: any) {
  const id = String(props?.params?.id || "");

  const api = absUrl(`/api/guestbook/${id}`);
  const r = await fetch(api, { cache: "no-store" });
  if (!r.ok) throw new Error(`guestbook fetch failed (${r.status})`);
  const data = (await r.json()) as GBDetail;

  // TOP3 구성: #1은 요약 포함, #2/#3은 제목/가수만
  let top3: { title: string; artist: string; summary?: string }[] = [];
  if (Array.isArray(data.readMusicSummaryResponses) && data.readMusicSummaryResponses.length) {
    top3 = data.readMusicSummaryResponses.slice(0, 3).map((s, i) => ({
      title: s?.title ?? "",
      artist: s?.artist ?? "",
      summary: i === 0 ? (s?.aiLyricsSummary ?? "") : undefined,
    }));
  } else if (Array.isArray(data.summaryList) && data.summaryList.length) {
    top3 = data.summaryList.slice(0, 3).map((s, i) => ({
      title: s.title,
      artist: s.artist,
      summary: i === 0 ? (s.aiLyricsSummaryThreeLines || s.aiLyricsSummaryOneLine || "") : undefined,
    }));
  } else {
    top3 = [{ title: data.title || "", artist: data.artist || "", summary: data.aiLyricsSummary || "" }];
  }

  return (
    <main className="min-h-[100dvh] bg-white">
      <SharePosterClient
        gid={data.id}
        nickname={data.nickname || "익명"}
        comment={data.comment || ""}
        top3={top3}
      />
    </main>
  );
}
