import MusicConvClient from "../../MusicConvClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// params/searchParams가 빌드 환경에 따라 Promise로 추론되는 케이스 회피
export default function Page(props: any) {
  const sid = (props?.params?.sid as string) ?? "";
  const q = (props?.searchParams?.q as string) ?? "";
  const n = (props?.searchParams?.n as string) ?? "";

  return (
    <MusicConvClient
      initialView="loading"
      sid={sid || null}
      initialText={q}
      initialNickname={n}
    />
  );
}
