import SharePosterClient from "../SharePosterClient";
import { headers } from "next/headers";

type GBDetail = {
  id: number;
  nickname: string;
  comment: string;

  // ✅ 새 응답 스키마
  readMusicSummaryResponses?: {
    title: string;
    artist: string;
    aiLyricsSummary?: string;
  }[];

  // 구형 호환(혹시 모를 경우)
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

function absUrl(path: string) {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const id = params.id;

  const api = absUrl(`/api/guestbook/${id}`);
  const r = await fetch(api, { cache: "no-store" });
  if (!r.ok) throw new Error(`guestbook fetch failed (${r.status})`);
  const data = (await r.json()) as GBDetail;

  // ✅ TOP3 구성 (readMusicSummaryResponses → #1은 요약 포함, #2/#3은 제목/가수만)
  let top3: { title: string; artist: string; summary?: string }[] = [];

  if (Array.isArray(data.readMusicSummaryResponses) && data.readMusicSummaryResponses.length) {
    top3 = data.readMusicSummaryResponses.slice(0, 3).map((s, i) => ({
      title: s?.title ?? "",
      artist: s?.artist ?? "",
      summary: i === 0 ? (s?.aiLyricsSummary ?? "") : undefined,
    }));
  } else if (Array.isArray(data.summaryList) && data.summaryList.length) {
    // 구형 응답 스키마 호환
    top3 = data.summaryList.slice(0, 3).map((s, i) => ({
      title: s.title,
      artist: s.artist,
      summary: i === 0 ? (s.aiLyricsSummaryThreeLines || s.aiLyricsSummaryOneLine || "") : undefined,
    }));
  } else {
    // 최후 fallback (단일 필드만 있는 경우)
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
