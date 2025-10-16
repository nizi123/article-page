// app/musicconv/page.tsx
import MusicConvClient from "./MusicConvClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({
  searchParams,
}: {
  searchParams: { v?: string; sid?: string; id?: string; q?: string; n?: string };
}) {
  const { v, sid, id, q = "", n = "" } = searchParams;

  const initialView =
    v === "result" ? "result" :
    v === "loading" ? "loading" :
    v === "saved" ? "saved" : "form";

  return (
    <MusicConvClient
      initialView={initialView as any}
      sid={sid ?? null}
      savedId={id ? Number(id) : null}
      initialText={q}
      initialNickname={n}
    />
  );
}
