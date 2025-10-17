import SharePosterClient from "../SharePosterClient";

type GBDetail = {
  id: number;
  nickname: string;
  comment: string;

  readMusicSummaryResponses?: {
    title: string;
    artist: string;
    aiLyricsSummary?: string;
  }[];

  // (구형 호환)
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

// ✅ 업스트림 절대 URL 생성 (환경변수/기본값 모두 지원)
function upstreamGuestbookItemUrl(id: string | number) {
  // 배포 시 GUESTBOOK_UPSTREAM를 "http://54.180.46.82:8080/guestbook" 으로 두는 걸 권장
  const base =
    process.env.GUESTBOOK_UPSTREAM?.replace(/\/+$/, "") ||
    "http://54.180.46.82:8080/guestbook";
  return `${base}/${id}`;
}

// 타입 충돌 방지: props any
export default async function SharePage(props: any) {
  const id = String(props?.params?.id || "");
  if (!/^\d+$/.test(id)) {
    throw new Error("invalid id");
  }

  // ✅ 프록시 대신 업스트림 직접 호출
  const api = upstreamGuestbookItemUrl(id);
  const r = await fetch(api, { cache: "no-store" });
  if (!r.ok) {
    // 디버깅에 도움
    throw new Error(`guestbook fetch failed (${r.status})\nURL: ${api}`);
  }
  const data = (await r.json()) as GBDetail;

  // TOP3 구성: #1 요약 포함, #2/#3은 제목/가수만
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
