import MusicConvClient from "./MusicConvClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 빌드 환경에 따라 searchParams가 Promise로 추론되는 케이스까지 모두 커버
export default async function Page(props: any) {
  const spMaybe = props?.searchParams;
  const sp =
    spMaybe && typeof spMaybe.then === "function"
      ? await spMaybe
      : (spMaybe ?? {});

  const v   = (sp.v  as string | undefined) ?? undefined;
  const sid = (sp.sid as string | undefined) ?? null;
  const id  = (sp.id as string | undefined) ?? undefined;
  const q   = (sp.q  as string | undefined) ?? "";
  const n   = (sp.n  as string | undefined) ?? "";

  const initialView =
    v === "result"  ? "result"  :
    v === "loading" ? "loading" :
    v === "saved"   ? "saved"   : "form";

  const savedId = id && /^\d+$/.test(id) ? Number(id) : null;

  return (
    <MusicConvClient
      initialView={initialView as any}
      sid={sid}
      savedId={savedId}
      initialText={q}
      initialNickname={n}
    />
  );
}
