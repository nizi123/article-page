"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LikeButton from "./guestbook/LikeButton";

/** 이미지 경로 */
const TITLE_IMG = "/musicconv/musicconv-title.png";
const CLEANBOT_IMG = "/musicconv/cleanbot.png";
const IG_BANNER_IMG = "/musicconv/chasmad.png";
const TIP_PIN_IMG = "/musicconv/pin.png";
const TIP_CHECK_PINK_IMG = "/musicconv/check.png";
const TIP_CHECK_GRAY_IMG = "/musicconv/noncheck.png";
const SUCCESS_ICON_IMG = "/musicconv/success-icon.png";
const AI_SUMMARY_ICON_IMG = "/musicconv/ai-summary.png";

/** 방명록 / 저장 화면 전용 아이콘 */
const GB_HEADER_IMG = "/musicconv/gb-header.png";
const GB_CHECK_IMG = "/musicconv/gb-check.png";
const ICO_USER = "/musicconv/ico-user.png";
const ICO_BUBBLE = "/musicconv/ico-bubble.png";
const ICO_NOTE = "/musicconv/ico-note.png";

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
  createTime?: string; // "YYYY-MM-DD HH:mm:ss"
}
enum SortBy {
  LATEST = "LATEST",
  LIKES = "LIKES",
}

type Props = {
  initialView: View;
  sid?: string | null;
  savedId?: number | null;
  initialNickname?: string;
  initialText?: string;
};

const BASE = "/musicconv";
const LS_KEY = "musicconv:last";
const genSid = () =>
  (typeof window !== "undefined" && window.crypto?.getRandomValues
    ? (() => {
        const b = new Uint8Array(6);
        window.crypto.getRandomValues(b);
        return Array.from(b).map((x) => x.toString(36)).join("").slice(0, 8);
      })()
    : Math.random().toString(36).slice(2, 10));

function formatTimeKST(s?: string) {
  if (!s) return "";
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!m) return s;
  const yy = m[1].slice(2);
  return `${yy}.${m[2]}.${m[3]} ${m[4]}:${m[5]}`;
}

export default function MusicConvClient({
  initialView,
  sid: initSid = null,
  savedId: initSavedId = null,
  initialNickname = "",
  initialText = "",
}: Props) {
  const router = useRouter();

  const [nickname, setNickname] = useState(initialNickname);
  const [text, setText] = useState(initialText);

  const [view, setView] = useState<View>(initialView);
  const [sid, setSid] = useState<string | null>(initSid);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);

  const [sortBy, setSortBy] = useState<SortBy>(SortBy.LATEST);
  const [guestItems, setGuestItems] = useState<ReadGuestbookItem[]>([]);
  const [lastId, setLastId] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [savedId, setSavedId] = useState<number | null>(initSavedId);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** ✅ loadMore 동시 진입 차단 게이트 */
  const loadingGateRef = useRef(false);

  /** 좋아요 프록시 경로(/api/likes)는 LikeButton이 직접 사용 */
  const SEARCH_URL = "/api/search";
  const GUESTBOOK_PROXY = "/api/guestbook";

  const nickMax = 16;
  const textMin = 5;
  const textMax = 120;
  const nickValid = nickname.length <= nickMax;
  const textValid = text.length >= textMin && text.length <= textMax;
  const canSubmit = nickValid && textValid && !submitting;
  const textWarn =
    (text.length > 0 && text.length < textMin) || text.length === textMax;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErrMsg(null);
    setSubmitting(true);

    const newsid = genSid();
    setSid(newsid);

    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ sid: newsid, q: text, n: nickname })
      );
    } catch {}

    setView("loading");
    router.replace(
      `${BASE}/loading/${newsid}?q=${encodeURIComponent(
        text
      )}&n=${encodeURIComponent(nickname)}`
    );

    try {
      const res = await fetch(SEARCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: text }),
      });
      if (!res.ok)
        throw new Error(
          (await res.text().catch(() => "")) || `검색 실패 (${res.status})`
        );
      const data = (await res.json()) as { data?: SearchItem[] };
      setSearchItems(Array.isArray(data?.data) ? data.data! : []);

      setView("result");
      router.replace(
        `${BASE}/result/${newsid}?q=${encodeURIComponent(
          text
        )}&n=${encodeURIComponent(nickname)}`
      );
    } catch (err: any) {
      setErrMsg(err?.message || "요청 실패");
      setView("form");
      router.replace(`${BASE}`);
    } finally {
      setSubmitting(false);
    }
  }

  function onReset() {
    setView("form");
    setSid(null);
    setSearchItems([]);
    setErrMsg(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
    router.replace(`${BASE}`);
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
        const json = (await res.json()) as {
          readGuestbookResponses?: ReadGuestbookItem[];
        };
        newId = json.readGuestbookResponses?.[0]?.id ?? null;
      } catch {}

      setSavedId(newId);
      setView("saved");
      router.replace(
        newId ? `${BASE}/guestbook/${newId}` : `${BASE}/guestbook`
      );
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

  /** ✅ 방명록 더 불러오기 (이중 호출 차단 게이트) */
  async function loadMore() {
    if (loadingGateRef.current || loadingMore || !hasMore) return;
    loadingGateRef.current = true;
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

      const json = (await res.json()) as {
        readGuestbookResponses?: ReadGuestbookItem[];
      };
      const next = json.readGuestbookResponses || [];

      setGuestItems((prev) => [...prev, ...next]);
      const tail = next[next.length - 1];
      if (tail) setLastId(tail.id);

      if (firstLoad) setFirstLoad(false);
      if (next.length === 0) setHasMore(false);
    } catch {
      setHasMore(false);
    } finally {
      loadingGateRef.current = false;
      setLoadingMore(false);
    }
  }

  /** 새로고침 복원 */
  useEffect(() => {
    if (initialView !== "loading" && initialView !== "result") return;
    const hasQ = !!initialText && initialText.length >= 1;
    if (hasQ) return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        sid?: string;
        q?: string;
        n?: string;
      };
      if (saved?.q) setText(saved.q);
      if (saved?.n) setNickname(saved.n || "");
      if (saved?.sid) setSid(saved.sid);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 결과 화면 자동 검색 */
  useEffect(() => {
    const q =
      initialView === "result" || initialView === "loading"
        ? text || initialText || ""
        : "";
    if (view !== "result") return;
    if (!q || q.length < 5 || q.length > 120) return;
    if (searchItems.length > 0 || submitting) return;

    (async () => {
      try {
        setSubmitting(true);
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: q }),
        });
        if (!res.ok)
          throw new Error(
            (await res.text().catch(() => "")) || `검색 실패 (${res.status})`
          );
        const data = (await res.json()) as { data?: SearchItem[] };
        setSearchItems(Array.isArray(data?.data) ? data.data! : []);
      } catch (e: any) {
        setErrMsg(e?.message || "요청 실패");
      } finally {
        setSubmitting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, text]);

  /** 방명록: 첫 로드 (옵저버와 동시 호출 줄이기 위해 셋타임아웃) */
  useEffect(() => {
    if (view !== "saved") return;
    const t = setTimeout(() => loadMore(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  /** 방명록: 무한 스크롤 옵저버 */
  useEffect(() => {
    if (view !== "saved") return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (ents) => ents.forEach((e) => e.isIntersecting && loadMore()),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, sortBy, lastId, hasMore]);

  /** 방명록: 정렬 변경 시 리셋 */
  useEffect(() => {
    if (view !== "saved") return;
    setGuestItems([]);
    setHasMore(true);
    setFirstLoad(true);
    setLastId(null);
  }, [sortBy, view]);

  return (
    <main className="min-h-[100dvh] w-full bg-white">
      {/* 상단 바 */}
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
        {(view === "form" || view === "loading") && (
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

        {/* FORM */}
        {view === "form" && (
          <section className="mt-6">
            <FormBlock
              nickname={nickname}
              setNickname={setNickname}
              text={text}
              setText={setText}
              nickMax={nickMax}
              textMax={textMax}
              textWarn={textWarn}
              nickValid={nickValid}
              textValid={textValid}
              submitting={submitting}
              onSubmit={onSubmit}
              errMsg={errMsg}
            />

            {/* 배너 */}
            <a
              href="https://instagram.com/lab_chasm"
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-6 block w-full max-w-[680px] overflow-hidden rounded-[14px] shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
            >
              <img src={IG_BANNER_IMG} alt="랩 캐즘 인스타그램 팔로우 하고 소식 받기" className="h-[120px] w-full object-cover" />
            </a>

            {/* 팁 */}
            <div className="mt-6 rounded-[16px] border border-[#E5E5E5] bg-white p-5 shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
              <div className="mb-3 flex items-center gap-2">
                <img src={TIP_PIN_IMG} alt="핀" className="h-5 w-5" />
                <div className="text-[15px] font-semibold text-[#3B3B3B]">문장입력 Tip</div>
              </div>
              <ul className="space-y-3 text-[15px] leading-7 text-[#4A4A4A]">
                <li className="flex items-start gap-3">
                  <img src={TIP_CHECK_PINK_IMG} alt="" className="mt-1 h-4 w-4" />
                  <span>나만의 ‘페스티벌 법칙’을 정해 보세요.</span>
                </li>
                <li className="flex items-start gap-3">
                  <img src={TIP_CHECK_PINK_IMG} alt="" className="mt-1 h-4 w-4" />
                  <span>오늘 그만페를 한마디로 요약해 보세요.</span>
                </li>
                <li className="flex items-start gap-3">
                  <img src={TIP_CHECK_GRAY_IMG} alt="" className="mt-1 h-4 w-4" />
                  <span className="text-[#8C8C8C] line-through decoration-[#3BA6FF] decoration-2">
                    사실 아무 말이나 해도 됩니다.
                  </span>
                </li>
              </ul>
            </div>
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
          </section>
        )}

        {/* RESULT */}
        {view === "result" && (
          <section className="mt-1">
            <div className="text-center">
              <div className="text-[16px] font-semibold text-slate-500">
                <span className="text-pink-500">{nickname || "익명"}</span>님이 입력한 문장
              </div>
              <h2 className="mt-2 text-[30px] sm:text-[32px] font-medium text-slate-900">{text}</h2>
            </div>
            <hr className="mt-6 mb-8 border-t-2 border-slate-100" />

            {/* 변환 성공 */}
            <div className="bg-[#e9fbfa] px-6 py-8 text-center">
              <img src={SUCCESS_ICON_IMG} alt="변환 성공" className="mx-auto h-10 w-10" />
              <div className="mt-2 text-[22px] font-extrabold text-[#27b9b3]">변환 성공!</div>
              <div className="mt-1 text-[14px] text-[#2b8e89]">가장 유사한 감정과 내용의 음악으로 변환 성공</div>
            </div>

            {/* 버튼 */}
            <div className="mt-6 grid grid-cols-5 gap-4">
              <button
                type="button"
                className="col-span-2 h-[56px] rounded-[10px] border border-[#9bdad7] bg-white text-[18px] font-bold text-[#24b6b1] shadow-sm"
                onClick={onReset}
              >
                다시 입력
              </button>
              <button
                type="button"
                className="col-span-3 h-[56px] rounded-[10px] bg-[#3BC9C7] text-[18px] font-bold text-white shadow-sm disabled:opacity-60"
                onClick={saveGuestbook}
                disabled={submitting}
              >
                방명록에 저장
              </button>
            </div>

            {/* 결과 카드 */}
            <div className="mt-6 space-y-6">
              {searchItems.map((it, idx) => {
                let urlText = it.song_url || "";
                try {
                  urlText = decodeURIComponent(it.song_url || "");
                } catch {}
                return (
                  <article
                    key={idx}
                    className="rounded-[18px] border border-[#EAEAEA] bg-white p-6 sm:p-7 shadow-[0_14px_28px_rgba(0,0,0,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[28px] sm:text-[30px] font-semibold leading-tight text-[#1F2937] tracking-[-0.3px]">
                        {it.artist_name} - {it.song_name}
                      </h3>
                      {it.song_url && (
                        <a
                          href={it.song_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${it.song_name} 링크 열기`}
                          className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-[#E6E6E6] hover:bg-[#F7F7F7] transition"
                          title={urlText}
                          style={{ pointerEvents: "auto" }}
                        >
                          <ExternalLinkIcon className="h-4 w-4 text-[#7B7B7B]" />
                        </a>
                      )}
                    </div>

                    <div className="mt-2 text-[18px] font-bold text-[#FF5A7A]">유사도 {it.similarity}%</div>
                    <hr className="mt-5 mb-4 border-t border-[#ECECEC]" />

                    <div className="flex items-center gap-2">
                      <img src={AI_SUMMARY_ICON_IMG} alt="" className="h-5 w-5" />
                      <span className="text-[18px] font-semibold text-[#2F2F2F]">가사 AI 요약</span>
                    </div>
                    <p className="mt-3 text-[20px] leading-[1.9] text-[#6B6B6B]">{it.summary_3 || it.summary_1}</p>
                  </article>
                );
              })}
            </div>

            {/* 하단 배너 */}
            <a
              href="https://instagram.com/lab_chasm"
              target="_blank"
              rel="noreferrer"
              className="mx-auto mt-8 block w-full max-w-[680px] overflow-hidden rounded-[14px] shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
            >
              <img src={IG_BANNER_IMG} alt="랩 캐즘 인스타그램 팔로우 하고 소식 받기" className="h-[120px] w-full object-cover" />
            </a>
          </section>
        )}

        {/* SAVED (방명록) */}
        {view === "saved" && (
          <section className="mt-2">
            <div className="flex flex-col items-center text-center">
              <img src={GB_HEADER_IMG} alt="" className="" />
              <h2 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight text-[#222]">
              </h2>
              <hr className="mt-4 w-full border-t border-[#e9e9e9]" />
            </div>

            {/* 등록 안내 섹션 - NEW */}
<section className="mt-8">
  {/* 상단 알림 배너 */}
  <div className="rounded-[18px] border border-[#ffd4df] bg-[#fff1f5] px-6 py-8">
    <div className="flex flex-col items-center text-center">
    <span className="flex h-10 w-10 items-center justify-center">

<img src={GB_CHECK_IMG} alt="ok" className="h-5 w-5" />
</span>
      <div className="flex items-center gap-3">
        <h3 className="text-center text-[24px] sm:text-[16px] font-bold tracking-tight text-[#3a3a3a]">
          <span className="text-[#ff2a6d] display-block">{nickname || "익명"}</span>
          님의 문장이 방명록에 등록되었어요.
        </h3>
      </div>
    </div>
  </div>

  {/* 설명문 */}
  <p className="mt-8 text-center text-[18px] sm:text-[22px] leading-[1.9] text-[#4b4b4b]">
    다른 사람들의 방명록을 보고 감상을 나누어 보세요.
    <br />
    인스타그램 이벤트를 참여하시면 <span className="font-extrabold">‘내 결과 공유하기’</span>를 눌러주세요.
  </p>

  {/* CTA 버튼들 */}
  <div className="mx-auto mt-10 grid w-full max-w-[1100px] grid-cols-12 gap-6">
    {/* 베스트 글 보기 (작게 / 아웃라인) */}
    <button
      type="button"
      onClick={() => setSortBy(SortBy.LIKES)}
      className="col-span-12 sm:col-span-4 h-[82px] rounded-[18px] border-2 border-[#ff87a6] bg-white
                 text-[22px] sm:text-[26px] font-extrabold text-[#ff5b8a]
                 shadow-[0_8px_0_#ffd3df] hover:translate-y-[1px] hover:shadow-[0_6px_0_#ffd3df]
                 active:translate-y-[2px] active:shadow-[0_4px_0_#ffd3df]"
    >
      베스트 글 보기
    </button>

    {/* 내 결과 공유하기 (크게 / 가득) */}
    <button
      type="button"
      onClick={() => {
        if (savedId) window.location.href = `/musicconv/guestbook/${savedId}`;
        else window.location.href = `/musicconv/guestbook`;
      }}
      className="col-span-12 sm:col-span-8 h-[82px] rounded-[18px] bg-[#ef5f86]
                 text-[24px] sm:text-[30px] font-extrabold text-white
                 shadow-[0_10px_0_#d6577b] hover:bg-[#e6527a]
                 hover:translate-y-[1px] hover:shadow-[0_8px_0_#d6577b]
                 active:translate-y-[2px] active:shadow-[0_6px_0_#d6577b]"
    >
      내 결과 공유하기
    </button>
  </div>
</section>

            <div className="mt-8 mb-3 flex items-center justify-between">
              <div className="text-[14px] font-semibold text-slate-700">• 최신순</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm"
              >
                <option value={SortBy.LATEST}>최신순</option>
                <option value={SortBy.LIKES}>좋아요순</option>
              </select>
            </div>

            {/* ✅ 여기서 LikeButton 사용 */}
            <div className="space-y-5">
              {guestItems.map((g, idx) => (
                <article
                  key={`${g.id}-${idx}`}
                  className="rounded-[12px] border border-[#e7e7e7] bg-[#fff] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#333]">
                    <img src={ICO_USER} alt="" className="h-5 w-5" />
                    {g.nickname}
                  </div>
                  <div className="mt-5 flex items-start gap-2 text-[15px] leading-7 text-[#4b4b4b]">
                    <img src={ICO_BUBBLE} alt="" className="mt-[2px] h-4 w-4" />
                    <p className="whitespace-pre-wrap">{g.comment}</p>
                  </div>

                  <div className="mt-4 rounded-[10px] border border-[#e9e9e9] bg-[#f9fafb] p-3">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-[#17a2a2]">
                      <img src={ICO_NOTE} className="h-4 w-4" alt="" />
                      변환 TOP1 음악
                    </div>
                    <div className="mt-1 text-[15px] font-semibold text-[#2b2b2b]">
                      {g.title} - {g.artist}
                    </div>
                    <div className="mt-1 text-[14px] leading-6 text-[#555]">{g.aiLyricsSummary}</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-[12px] text-[#999]">{formatTimeKST(g.createTime)}</div>
                    <LikeButton
                      gid={g.id}
                      initialCount={g.likeCount}
                      initiallyLiked={false}
                      onSynced={(count) => {
                        // 부모 상태와 동기화(선택)
                        // 필요 시 서버 응답 기반으로 목록도 최신화 가능
                      }}
                    />
                  </div>
                </article>
              ))}

              <div ref={sentinelRef} />
              {!hasMore && guestItems.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">아직 글이 없습니다.</div>
              )}
            </div>

            {loadingMore && <div className="mt-4 text-center text-sm text-slate-500">불러오는 중...</div>}
          </section>
        )}
      </div>
    </main>
  );
}

/** ===== FormBlock ===== */
function FormBlock({
  nickname,
  setNickname,
  text,
  setText,
  nickMax,
  textMax,
  textWarn,
  nickValid,
  textValid,
  submitting,
  onSubmit,
  errMsg,
}: {
  nickname: string;
  setNickname: (s: string) => void;
  text: string;
  setText: (s: string) => void;
  nickMax: number;
  textMax: number;
  textWarn: boolean;
  nickValid: boolean;
  textValid: boolean;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  errMsg: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, nickMax))}
        placeholder="닉네임 (공백 포함 16자 이내)"
        maxLength={nickMax}
        className={`w-full rounded-[12px] border px-5 py-4 text-[16px] leading-6 text-[#2B2B2B] placeholder-[#B5B5B5]
          shadow-[0_4px_12px_rgba(0,0,0,0.10)] outline-none transition
          ${
            !nickValid
              ? "border-rose-400 ring-4 ring-rose-100"
              : "border-[#D7D7D7] focus:border-[#A8E5E5] focus:ring-4 focus:ring-[#DBF4F4]"
          }`}
      />

      <div
        className={`relative overflow-hidden rounded-[12px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.10)]
        ${textWarn ? "border-[1.5px] border-[#F26D7D] ring-4 ring-[#FFE9ED]" : "border border-[#D7D7D7]"}`}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, textMax))}
          className="block w-full min-h-[260px] resize-none rounded-[inherit] border-0 bg-transparent
            px-5 pt-5 pb-[96px] text-[18px] leading-8 text-[#2B2B2B] placeholder-[#B5B5B5] outline-none"
          placeholder="텍스트를 입력하세요. (공백 포함 5자 이상)"
          maxLength={textMax}
          aria-invalid={textWarn}
        />
        <div className={`pointer-events-none absolute right-5 bottom-[86px] text-[14px] ${textWarn ? "text-[#F26D7D]" : "text-[#9A9A9A]"}`}>
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
          disabled={!(nickValid && textValid) || submitting}
          className={`inline-flex items-center gap-2 rounded-[12px] px-7 py-4 text-[16px] font-bold text-white transition-all
            ${
              nickValid && textValid && !submitting
                ? "bg-[#79E0E1] hover:bg-[#66CFD1] active:translate-y-[1px] shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
                : "bg-[#D9D9D9] cursor-not-allowed"
            }`}
        >
          <SwapIcon /> 변환하기
        </button>
      </div>

      {errMsg && <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{errMsg}</div>}
    </form>
  );
}

function SwapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M7.41 13.41L6 12l-4 4 4 4 1.41-1.41L5.83 17H22v-2H5.83l1.58-1.59zm9.18-2.82L18 12l4-4-4-4-1.41 1.41L18.17 7H2v2h16.17l-1.58 1.59z" />
    </svg>
  );
}
function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z" />
      <path d="M5 5h6v2H7v10h10v-4h2v6H5z" />
    </svg>
  );
}
