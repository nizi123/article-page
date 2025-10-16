import MusicConvClient from "../../MusicConvClient";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({
  params,
  searchParams,
}: {
  params: { sid: string };
  searchParams: { q?: string; n?: string };
}) {
  return (
    <MusicConvClient
      initialView="loading"
      sid={params.sid}
      initialText={searchParams?.q ?? ""}
      initialNickname={searchParams?.n ?? ""}
    />
  );
}
