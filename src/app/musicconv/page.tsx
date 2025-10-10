"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// ===== Types =====
type View = "form" | "loading" | "result" | "saved";

interface SearchItem {
  artist_name: string;
  similarity: number;
  song_name: string;
  song_url: string;
  summary_1: string;
  summary_3: string;
}

interface ReadGuestbookItem {
  id: number;
  nickname: string;
  comment: string;
  likeCount: number;
  title: string;
  artist: string;
  aiLyricsSummary: string;
}

enum SortBy {
  LATEST = "LATEST",
  LIKES = "LIKES",
}

// ===== Component =====
export default function MusicConvPage() {
  // 입력값
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");
  const [captcha, setCaptcha] = useState(false);

  // 화면/상태
  const [view, setView] = useState<View>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 검색 결과
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);

  // 저장 완료
  const [savedId, setSavedId] = useState<number | null>(null);

  // 방명록 피드
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.LATEST);
  const [guestItems, setGuestItems] = useState<ReadGuestbookItem[]>([]);
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true); // LATEST 첫 로드: id 없이 질의
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 엔드포인트
  const SEARCH_URL =
    (process.env.NEXT_PUBLIC_MUSICCONV_SEARCH as string) ||
    "http://54.180.46.82:5000/api/search";
  // CORS 프록시 (Next API Routes)
  const GUESTBOOK_PROXY = "/api/guestbook";

  // 유효성
  const nickMax = 16;
  const textMin = 5;
  const textMax = 120;
  const nickValid = nickname.length <= nickMax;
  const textValid = text.length >= textMin && text.length <= textMax;
  const canSubmit = nickValid && textValid && captcha && !submitting;

  // ===== Handlers =====
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrMsg(null);
    setSubmitting(true);
    setView("loading");

    try {
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: text }),
      });
      if (!res.ok) throw new Error((await res.text().catch(() => "")) || `검색 실패 (${res.status})`);

      const data = (await res.json()) as { data?: SearchItem[] };
      setSearchItems(Array.isArray(data?.data) ? data.data! : []);
      setView("result");
    } catch (err: any) {
      setErrMsg(err?.message || "요청 실패");
      setView("form");
    } finally {
      setSubmitting(false);
    }
  }

  function onReset() {
    setView("form");
    setSearchItems([]);
    setErrMsg(null);
  }

  async function saveGuestbook() {
    // 검색 상위 3개로 summaryList 구성
    const top3 = searchItems.slice(0, 3).map((s) => ({
      title: s.song_name,
      artist: s.artist_name,
      aiLyricsSummaryOneLine: s.summary_1,
      aiLyricsSummaryThreeLines: s.summary_3,
    }));

    setSubmitting(true);
    setErrMsg(null);

    try {
      const res = await fetch(GUESTBOOK_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname || "익명",
          comment: text,
          summaryList: top3,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `저장 실패 (${res.status})`);
      }

      // 응답 본문이 비어 있어도 다음 화면으로 전환
      let newId: number | null = null;
      try {
        const json = (await res.json()) as { readGuestbookResponses?: ReadGuestbookItem[] };
        newId = json.readGuestbookResponses?.[0]?.id ?? null;
        console.log("[guestbook] saved id:", newId);
      } catch {
        console.log("[guestbook] no JSON body");
      }

      setSavedId(newId);
      setView("saved");            // 🔑 확실히 상태 전환
      setGuestItems([]);
      setFirstLoad(true);          // LATEST 첫 로드 → id 없이
      setLastId(null);
      setHasMore(true);
    } catch (err: any) {
      setErrMsg(err?.message || "저장 실패");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      // 최초 + 최신순이면 lastGuestbookId 생략
      if (!(firstLoad && sortBy === SortBy.LATEST)) {
        const anchorId = lastId ?? 2147483647;
        params.set("lastGuestbookId", String(anchorId));
      }
      params.set("sortBy", sortBy);

      const url = `${GUESTBOOK_PROXY}?${params.toString()}`;
      console.log("[guestbook] fetch:", url);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        console.warn("[guestbook] status:", res.status);
        throw new Error("목록 조회 실패");
      }

      const json = (await res.json()) as { readGuestbookResponses?: ReadGuestbookItem[] };
      const next = json.readGuestbookResponses || [];

      setGuestItems((prev) => [...prev, ...next]);
      const tail = next[next.length - 1];
      if (tail) setLastId(tail.id);

      if (firstLoad) setFirstLoad(false);
      if (next.length === 0) setHasMore(false);
    } catch (err) {
      console.warn(err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }

  // ===== Effects =====

  // 저장 화면에서만 무한 스크롤 옵저버 활성화
  useEffect(() => {
    if (view !== "saved") return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMore();
        });
      },
      { rootMargin: "200px" }
    );

    io.observe(el);
    return () => io.disconnect();
    // ref.current는 의존성으로 넣지 않는다(변하지 않음)
  }, [view, sortBy, lastId, hasMore]);

  // 저장 화면 진입 시 첫 페이지 로드 (LATEST면 id 없이)
  useEffect(() => {
    if (view !== "saved") return;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // 정렬 변경 → 목록 리셋 후 처음부터 로드
  useEffect(() => {
    if (view !== "saved") return;
    setGuestItems([]);
    setHasMore(true);
    setFirstLoad(true);
    setLastId(null);
  }, [sortBy, view]);

  // ===== UI =====
  return (
    <main className="min-h-[100dvh] w-full bg-[#fafafa]">
      {/* 상단 로고 */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex items-center justify-center">
            <span className="font-black tracking-widest text-xl text-[#ff2a6d]">Mu</span>
            <span className="font-black tracking-widest text-xl text-slate-900">sic</span>
            <span className="font-black tracking-widest text-xl text-[#20c997]">C</span>
            <span className="font-black tracking-widest text-xl text-slate-900">onv</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {(view === "form" || view === "loading" || view === "result") && (
          <header className="text-center">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">
              텍스트 <span className="text-pink-500">음악</span>{" "}
              <span className="text-[#20c997]">변환기</span>
            </h1>
            <p className="mt-2 text-center text-[13px] leading-relaxed text-slate-600">
              온라인에서 모든 텍스트들을 무료로 음악으로
              <br className="sm:hidden" /> 변환할 수 있는 최고의 음악 변환기입니다.
              <br />
              텍스트를 빠르고 안전하게 음악으로 변환하세요.
            </p>
          </header>
        )}

        {/* FORM */}
        {view === "form" && (
          <section className="mt-6">
            <form onSubmit={onSubmit} className="rounded-[12px] border border-slate-200 bg-white p-4 shadow">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, nickMax))}
                placeholder="닉네임 (공백 포함 16자 이내)"
                maxLength={nickMax}
                className={`w-full rounded-md border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
                  !nickValid ? "border-rose-400 focus:ring-rose-100" : "border-slate-300 focus:ring-slate-100"
                }`}
              />

              <div className="mt-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, textMax))}
                  rows={8}
                  placeholder="텍스트를 입력하세요. (공백 포함 5자 이상)"
                  className={`w-full resize-y rounded-md border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
                    !(textValid || text.length === 0) ? "border-rose-400 focus:ring-rose-100" : "border-slate-300 focus:ring-slate-100"
                  }`}
                  maxLength={textMax}
                />
                <div className="mt-1 text-right text-[11px] text-slate-500">
                  ({text.length}/{textMax})
                </div>
              </div>

              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-white text-slate-600 shadow">
                    🔒
                  </span>
                  <span>클린봇이 악성댓글을 감시합니다.</span>
                  <div className="ml-auto">
                    <input
                      disabled
                      className="h-8 w-[360px] max-w-full rounded border border-slate-200 bg-white px-3 text-[13px] text-slate-400"
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={captcha} onChange={(e) => setCaptcha(e.target.checked)} />
                  <span className="text-slate-600">체크 후 변환 가능</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={!(nickValid && textValid && captcha) || submitting}
                  className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50 ${
                    nickValid && textValid && captcha ? "bg-[#51c4c1]" : "bg-slate-400"
                  }`}
                >
                  <SwapIcon /> {submitting ? "전송 중..." : "변환하기"}
                </button>
              </div>

              {errMsg && <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errMsg}</div>}
            </form>
          </section>
        )}

        {/* LOADING */}
        {view === "loading" && (
          <section className="mt-10 flex flex-col items-center text-center">
            <div className="text-[84px] leading-none text-pink-400">ᛗ</div>
            <div className="mt-6 text-lg font-semibold text-slate-800">
              <span className="text-pink-500">{nickname || "익명"}</span>님이
            </div>
            <div className="mt-1 text-2xl font-extrabold">입력하신 문장을 딱 맞는 음악으로</div>
            <div className="text-2xl font-extrabold">변환하고 있습니다.</div>

            <div className="mt-8 w-full rounded-xl border border-slate-200 bg-white p-4 text-left">
              <div className="text-sm font-semibold text-slate-800">입력 문장</div>
              <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{text}</div>
            </div>

            <div className="mt-10 animate-pulse text-slate-500">잠시만 기다려 주세요…</div>
          </section>
        )}

        {/* RESULT */}
        {view === "result" && (
          <section className="mt-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-pink-500">{nickname || "익명"}님이 입력한 문장</div>
              <div className="mt-1 text-2xl font-bold">{text}</div>
            </div>
            <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
              <div className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-600 shadow">
                <SwapIcon />
              </div>
              <div className="text-teal-700 font-semibold">변환 성공!</div>
              <div className="mt-1 text-sm text-teal-700">가장 유사한 감정과 내용의 음악으로 변환 성공</div>
            </div>

            <div className="mt-4 flex gap-3">
              <button className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" onClick={onReset}>
                다시 입력
              </button>
              <button className="flex-1 rounded-md bg-[#51c4c1] px-4 py-3 text-sm font-semibold text-white shadow-sm" onClick={saveGuestbook} disabled={submitting}>
                방명록에 저장
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {searchItems.map((it, idx) => {
                let urlText = it.song_url;
                try {
                  urlText = decodeURIComponent(it.song_url || "");
                } catch {}
                return (
                  <article key={idx} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-base font-semibold text-slate-900">
                        {it.artist_name} - {it.song_name}
                      </h3>
                      <div className="text-xs font-semibold text-rose-600">유사도 {it.similarity}%</div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{urlText}</div>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <div className="text-sm font-medium">가사 AI 요약</div>
                      <p className="mt-1 text-sm text-slate-700">{it.summary_3 || it.summary_1}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* SAVED + FEED */}
        {view === "saved" && (
          <section className="mt-6">
            <div className="rounded-xl border border-pink-200 bg-pink-50 p-6 text-center">
              <div className="text-sm text-slate-500">{new Date().getFullYear()} 고민패 페이버딜의 방명록!</div>
              <h2 className="mt-2 text-xl font-bold">
                <span className="text-pink-600">{nickname || "익명"}</span>님의 문장이 방명록에 등록되었어요.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                다른 사람들의 방명록을 보고 감상을 나누어 보세요.
                <br />
                인스타그램 이벤트를 참여하시면 ‘내 결과 공유하기’를 눌러주세요.
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <button className="rounded-md border border-pink-300 bg-white px-4 py-2 text-sm font-semibold text-pink-600">베스트 글 보기</button>
                <button className="rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white">내 결과 공유하기</button>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">정렬</div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value={SortBy.LATEST}>최신순</option>
                  <option value={SortBy.LIKES}>좋아요순</option>
                </select>
              </div>

              <div className="space-y-4">
              {guestItems.map((g, idx) => (
                <article key={`${g.id}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-100">🎵</span>
                    {g.nickname}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{g.comment}</p>
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-teal-600">변환 TOP1 음악</div>
                    <div className="mt-1 text-sm font-medium">
                      {g.title} — {g.artist}
                    </div>
                    <div className="text-sm text-slate-700">{g.aiLyricsSummary}</div>
                  </div>
                  <div className="mt-2 text-right text-xs text-slate-500">❤ {g.likeCount.toLocaleString()}</div>
                </article>
              ))}


                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} />
                {!hasMore && guestItems.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">아직 글이 없습니다.</div>
                )}
              </div>

              {loadingMore && <div className="mt-4 text-center text-sm text-slate-500">불러오는 중...</div>}
            </div>
          </section>
        )}

        {/* 배너 자리 */}
        <div className="mt-10 rounded-md border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          랩캐즘 광고 배너 (링크 이미지)
        </div>
        <footer className="mt-8 flex justify-center">
          <a href="#" className="block w-full max-w-xl overflow-hidden rounded-2xl shadow">
            <img src="/images/instagram-banner.png" alt="랩캐즘 인스타그램" className="h-auto w-full" />
          </a>
        </footer>
      </div>
    </main>
  );
}

// ===== Icons =====
function SwapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M7.41 13.41L6 12l-4 4 4 4 1.41-1.41L5.83 17H22v-2H5.83l1.58-1.59zm9.18-2.82L18 12l4-4-4-4-1.41 1.41L18.17 7H2v2h16.17l-1.58 1.59z" />
    </svg>
  );
}
