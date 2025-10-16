"use client";

import { useState } from "react";

export default function LikeButton({
  gid,
  initialCount,
  initiallyLiked = false,
  onSynced,
}: {
  gid: number;
  initialCount: number;
  initiallyLiked?: boolean;
  onSynced?: (count: number, liked: boolean) => void;
}) {
  const [liked, setLiked] = useState(!!initiallyLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);

    // ✅ 엔드포인트를 백엔드 구조와 동일하게 변경
    const endpoint = `/api/guestbook/${gid}/likes/${liked ? "cancel" : "add"}`;

    // 낙관적 업데이트
    const nextLiked = !liked;
    const nextCount = Math.max(0, count + (nextLiked ? +1 : -1));
    setLiked(nextLiked);
    setCount(nextCount);

    try {
      const r = await fetch(endpoint, { method: "POST" });
      if (!r.ok) throw new Error(await r.text().catch(() => "like api failed"));

      // 서버에서 최신 likeCount 내려주면 반영
      const json = await r.json().catch(() => null);
      if (json && typeof json.likeCount === "number") {
        setCount(json.likeCount);
        onSynced?.(json.likeCount, nextLiked);
      } else {
        onSynced?.(nextCount, nextLiked);
      }
    } catch {
      // 실패 시 롤백
      setLiked(liked);
      setCount(count);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-[14px] text-[#666] hover:opacity-90"
      aria-label="좋아요"
    >
      <img
        src={liked ? "/musicconv/heart-fill.png" : "/musicconv/heart-line.png"}
        alt=""
        className="h-5 w-5"
      />
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </button>
  );
}
