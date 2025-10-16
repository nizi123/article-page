// app/musicconv/MusicConvClient.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/* ===== Asset Consts ===== */
const TITLE_IMG = "/musicconv/musicconv-title.png";
const CLEANBOT_IMG = "/musicconv/cleanbot.png";
const IG_BANNER_IMG = "/musicconv/chasmad.png";
const TIP_PIN_IMG = "/musicconv/pin.png";
const TIP_CHECK_PINK_IMG = "/musicconv/check.png";
const TIP_CHECK_GRAY_IMG = "/musicconv/noncheck.png";

/* ===== Types ===== */
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

/* ===== Helpers ===== */
const BASE = "/musicconv";
const genSid = () => {
  try {
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(6);
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes).map(b => b.toString(36).padStart(2, "0")).join("").slice(0, 8);
    }
  } catch {}
  return Math.random().toString(36).slice(2, 10);
};

const pathForView = (v: View, sid?: string | null) => {
  switch (v) {
    case "form": return BASE;
    case "loading": return sid ? `${BASE}/loading/${sid}` : `${BASE}/loading`;
    case "result": return sid ? `${BASE}/result/${sid}` : `${BASE}/result`;
    case "saved": return `${BASE}/guestbook`;
  }
};

export default function MusicConvClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 입력값
  const [nickname, setNickname] = useState("");
  const [text, setText] = useState("");

  // 화면/상태
  const [view, setView] = useState<View>("form");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [resultSid, setResultSid] = useState<string | null>(null);

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
  const [firstLoad, setFirstLoad] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // API 프록시
  const SEARCH_URL = "/api/search";
  const GUESTBOOK_PROXY = "/api/guestbook";

  // 유효성
  const nickMax = 16;
  const textMin = 5;
  const textMax = 120;
  const nickValid = nickname.length <= nickMax;
  const textValid = text.length >= textMin && text.length <= textMax;
  const canSubmit = nickValid && textValid && !submitting;

  const textTooShort = text.length > 0 && text.length < textMin;
  const textAtMax = text.length === textMax;
  const textWarn = textTooShort || textAtMax;

  /* ===== URL 변경 ===== */
  const replaceViewURL = (v: View, sid?: string | null, extras?: Record<string, string | number | undefined | null>) => {
    let base = pathForView(v, sid);
    const sp = new URLSearchParams();

    if (v === "saved" && extras?.id !== undefined && extras?.id !== null && extras?.id !== "") {
      base = `${BASE}/guestbook/${extras.id}`;
    }
    if (extras) {
      for (const [k, val] of Object.entries(extras)) {
        if (k === "id") continue;
        if (val === undefined || val === null || val === "") continue;
        sp.set(k, String(val));
      }
    }
    const q = sp.toString();
    router.replace(q ? `${base}?${q}` : base, { scroll: false });
  };

  /* ===== 공용: 검색 실행 ===== */
  async function runSearch(input: string) {
    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: input }),
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || `검색 실패 (${res.status})`);
    const data = (await res.json()) as { data?: SearchItem[] };
    setSearchItems(Array.isArray(data?.data) ? data.data! : []);
  }

  /* ===== Handlers ===== */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrMsg(null);
    setSubmitting(true);

    const sid = genSid();
    setResultSid(sid);
    setView("loading");
    replaceViewURL("loading", sid, { q: text, n: nickname });

    try {
      await runSearch(text);
      setView("result");
      replaceViewURL("result", sid, { q: text, n: nickname });
    } catch (err: any) {
      setErrMsg(err?.message || "요청 실패");
      setView("form");
      replaceViewURL("form");
    } finally {
      setSubmitting(false);
    }
  }

  function onReset() {
    setView("form");
    setResultSid(null);
    setSearchItems([]);
    setErrMsg(null);
    replaceViewURL("form");
  }

  async function saveGuestbook() {
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

      let newId: number | null = null;
      try {
        const json = (await res.json()) as { readGuestbookResponses?: ReadGuestbookItem[] };
        newId = json.readGuestbookResponses?.[0]?.id ?? null;
      } catch {}

      setSavedId(newId);
      setView("saved");
      replaceViewURL("saved", null, { id: newId ?? undefined });
      setGuestItems([]);
      setFirstLoad(true);
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
      if (!(firstLoad && sortBy === SortBy.LATEST)) {
        const anchorId = lastId ?? 2147483647;
        params.set("lastGuestbookId", String(anchorId));
      }
      params.set("sortBy", sortBy);

      const url = `${GUESTBOOK_PROXY}?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("목록 조회 실패");

      const json = (await res.json()) as { readGuestbookResponses?: ReadGuestbookItem[] };
      const next = json.readGuestbookResponses || [];

      // dedup
      setGuestItems(prev => {
        const map = new Map<number, ReadGuestbookItem>();
        prev.forEach(it => map.set(it.id, it));
        next.forEach(it => { if (!map.has(it.id)) map.set(it.id, it); });
        return Array.from(map.values());
      });

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

  /* ===== Effects ===== */
  // URL → 상태 복원
  useEffect(() => {
    let v: View = "form";
    let sid: string | null = null;

    if (pathname?.startsWith(`${BASE}/loading`)) v = "loading";
    else if (pathname?.startsWith(`${BASE}/result`)) v = "result";
    else if (pathname?.startsWith(`${BASE}/guestbook`)) v = "saved";

    const parts = pathname?.split("/") ?? [];
    const last = parts[parts.length - 1];
    if (v === "result" || v === "loading") {
      sid = last && last !== "result" && last !== "loading" ? last : null;
    }

    if (v === "saved") {
      const idx = parts.findIndex(p => p === "guestbook");
      const idPart = idx >= 0 ? parts[idx + 1] : undefined;
      if (idPart && /^\d+$/.test(idPart)) setSavedId(Number(idPart));
      else {
        const idParam = searchParams?.get("id");
        setSavedId(idParam ? Number(idParam) : null);
      }
    }

    const q = searchParams?.get("q") ?? "";
    const n = searchParams?.get("n") ?? "";

    if (v !== view) setView(v);
    if (sid && sid !== resultSid) setResultSid(sid);
    if (q && q !== text) setText(q);
    if (n && n !== nickname) setNickname(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // 결과 페이지로 직접 접근/새로고침 시 자동 검색
  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    if (view !== "result") return;
    if (!q || q.length < textMin || q.length > textMax) return;
    if (searchItems.length > 0 || submitting) return;

    (async () => {
      try {
        setSubmitting(true);
        await runSearch(q);
      } catch (err: any) {
        setErrMsg(err?.message || "요청 실패");
      } finally {
        setSubmitting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // 저장 화면: 첫 로드 1회 → 이후 IO 부착
  useEffect(() => {
    if (view !== "saved" || !firstLoad) return;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, firstLoad]);

  useEffect(() => {
    if (view !== "saved" || firstLoad) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && loadMore()),
      { rootMargin: "200px" }
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, sortBy, lastId, hasMore, firstLoad]);

  // 정렬 변경 시 리셋
  useEffect(() => {
    if (view !== "saved") return;
    setGuestItems([]);
    setHasMore(true);
    setFirstLoad(true);
    setLastId(null);
  }, [sortBy, view]);

  /* ===== UI ===== */
  return (
    <main className="min-h-[100dvh] w-full bg-[#fafafa]">
      {/* 상단 로고 */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <div className="flex items-center justify-center">
            <span className="text-xl font-black tracking-widest text-[#ff2a6d]">Mu</span>
            <span className="text-xl font-black tracking-widest text-slate-900">sic</span>
            <span className="text-xl font-black tracking-widest text-[#20c997]">C</span>
            <span className="text-xl font-black tracking-widest text-slate-900">onv</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {(view === "form" || view === "loading" || view === "result") && (
          <header className="text-center">
            <img src={TITLE_IMG} alt="텍스트 음악 변환기" className="mx-auto h-auto w-[260px] sm:w-[340px]" />
            <p className="mt-5 text-[15px] leading-7 text-[#3B3B3B]">
              온라인에서 모든 텍스트들을 무료로 음악으로
              <br /> 변환할 수 있는 최고의 음악 변환기입니다.
              <br />
              텍스트를 빠르고 안전하게 음악으로 변환하세요.
            </p>
          </header>
        )}

        {/* ===== FORM ===== */}
        {view === "form" && (
          <section className="mt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, nickMax))}
                placeholder="닉네임 (공백 포함 16자 이내)"
                maxLength={nickMax}
                className={`w-full rounded-[12px] border px-5 py-4 text-[16px] leading-6
                    text-[#2B2B2B] placeholder-[#B5B5B5]
                    shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                    outline-none transition
                    ${!nickValid ? "border-rose-400 ring-4 ring-rose-100"
                                 : "border-[#D7D7D7] focus:border-[#A8E5E5] focus:ring-4 focus:ring-[#DBF4F4]"}`}
              />

              <div className={`relative overflow-hidden rounded-[12px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.10)]
                               ${textWarn ? "border-[1.5px] border-[#F26D7D] ring-4 ring-[#FFE9ED]" : "border border-[#D7D7D7]"}`}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, textMax))}
                  className="block w-full min-h-[260px] resize-none rounded-[inherit] border-0 bg-transparent
                             px-5 pt-5 pb-[96px] text-[18px] leading-8 text-[#2B2B2B] placeholder-[#B5B5B5] outline-none"
                  placeholder="텍스트를 입력하세요. (공백 포함 5자 이상)"
                  maxLength={textMax}
                  aria-invalid={textWarn}
                />
                <div className={`pointer-events-none absolute right-5 bottom-[86px] text-[14px]
                                 ${textWarn ? "text-[#F26D7D]" : "text-[#9A9A9A]"}`}>
                  ({text.length}/{textMax})
                </div>
                <div className="absolute left-5 right-5 bottom-4">
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#E9E9E9] bg-white px-4 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
                    <img src={CLEANBOT_IMG} alt="클린봇" className="h-6 w-6" />
                    <span className="text-[15px] text-[#4A4A4A]">클린봇이 악성댓글을 감시합니다.</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!textValid || !nickValid || submitting}
                  className={`inline-flex items-center gap-2 rounded-[12px] px-7 py-4 text-[16px] font-bold text-white transition-all
                              ${textValid && nickValid && !submitting
                                ? "bg-[#79E0E1] hover:bg-[#66CFD1] active:translate-y-[1px] shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
                                : "bg-[#D9D9D9] cursor-not-allowed"}`}
                >
                  <SwapIcon />
                  변환하기
                </button>
              </div>

              {errMsg && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errMsg}</div>
              )}
            </form>

            <a href="https://instagram.com/lab_chasm" target="_blank" rel="noreferrer"
               className="mt-6 block overflow-hidden rounded-2xl shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
              <img src={IG_BANNER_IMG} alt="랩 캐즘 인스타그램 팔로우 하고 소식 받기" className="h-auto w-full" />
            </a>

            <div className="mt-6 rounded-[16px] border border-[#E5E5E5] bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
              <div className="mb-3 flex items-center gap-2">
                <img src={TIP_PIN_IMG} alt="핀" className="h-5 w-5" />
                <div className="text-[15px] font-semibold text-[#3B3B3B]">문장입력 Tip</div>
              </div>
              <ul className="space-y-3 text-[15px] leading-7 text-[#4A4A4A]">
                <li className="flex items-start gap-3">
                  <img src={TIP_CHECK_PINK_IMG} alt="체크" className="mt-1 h-4 w-4" />
                  <span>나만의 ‘페스티벌 법칙’을 정해 보세요.</span>
                </li>
                <li className="flex items-start gap-3">
                  <img src={TIP_CHECK_PINK_IMG} alt="체크" className="mt-1 h-4 w-4" />
                  <span>오늘 그만페를 한마디로 요약해 보세요.</span>
                </li>
                <li className="flex items-start gap-3">
                  <img src={TIP_CHECK_GRAY_IMG} alt="체크(회색)" className="mt-1 h-4 w-4" />
                  <span className="text-[#8C8C8C] line-through decoration-[#3BA6FF] decoration-2">
                    사실 아무 말이나 해도 됩니다.
                  </span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* ===== LOADING ===== */}
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

        {/* ===== RESULT ===== */}
        {view === "result" && (
          <section className="mt-6">
            <div className="text-center">
              <div className="text-[12px] font-semibold text-slate-500">
                <span className="text-pink-500">{nickname || "익명"}</span>님이 입력한 문장
              </div>
              <h2 className="mt-1 text-[20px] sm:text-[22px] font-bold text-slate-900">{text}</h2>
            </div>

            <div className="mt-3 rounded-[10px] border border-[#b7ecea] bg-[#e9fbfa] p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-teal-600 shadow">
                <SwapIcon />
              </div>
              <div className="font-extrabold text-teal-700">변환 성공!</div>
              <div className="mt-1 text-sm text-teal-700">가장 유사한 감정과 내용의 음악으로 변환 성공</div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                onClick={onReset}
              >
                다시 입력
              </button>
              <button
                className="flex-1 rounded-md bg-[#51c4c1] px-4 py-3 text-sm font-semibold text-white shadow-sm"
                onClick={saveGuestbook}
                disabled={submitting}
              >
                방명록에 저장
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {searchItems.map((it, idx) => (
                <article key={idx} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-[15px] font-semibold text-slate-900">
                    {it.artist_name} - {it.song_name}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-rose-600">유사도 {it.similarity}%</div>
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-1 text-[12px] font-semibold text-slate-700">
                      <ScissorsIcon className="h-4 w-4" />
                      <span>가사 요약</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{it.summary_3 || it.summary_1}</p>
                  </div>
                </article>
              ))}
            </div>

            <a href="https://instagram.com/lab_chasm" target="_blank" rel="noreferrer"
               className="mt-6 block overflow-hidden rounded-2xl shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
              <img src={IG_BANNER_IMG} alt="랩 캐즘 인스타그램 팔로우 하고 소식 받기" className="h-auto w-full" />
            </a>
          </section>
        )}

        {/* ===== SAVED + FEED ===== */}
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
              <div className="mt-4 flex justify-center gap-3">
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
                      <div className="mt-1 text-sm font-medium">{g.title} — {g.artist}</div>
                      <div className="text-sm text-slate-700">{g.aiLyricsSummary}</div>
                    </div>
                    <div className="mt-2 text-right text-xs text-slate-500">❤ {g.likeCount.toLocaleString()}</div>
                  </article>
                ))}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} />
                {!hasMore && guestItems.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                    아직 글이 없습니다.
                  </div>
                )}
              </div>

              {loadingMore && <div className="mt-4 text-center text-sm text-slate-500">불러오는 중...</div>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* ===== Icons ===== */
function SwapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M7.41 13.41L6 12l-4 4 4 4 1.41-1.41L5.83 17H22v-2H5.83l1.58-1.59zm9.18-2.82L18 12l4-4-4-4-1.41 1.41L18.17 7H2v2h16.17l-1.58 1.59z" />
    </svg>
  );
}

function ScissorsIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M9.64 7.64A3 3 0 1 0 7 10.28l2.29 2.29-2.29 2.29a3 3 0 1 0 2.64 2.64l3.36-3.36 3.36 3.36a3 3 0 1 0 2.12-2.12l-4.42-4.42 4.42-4.42A3 3 0 1 0 16.36 5L13 8.36 9.64 5zM7 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm10-10a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
    </svg>
  );
}
