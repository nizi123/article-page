import MusicConvClient from "../../MusicConvClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// params/searchParams 타입을 any로 받아 Promise/객체 모두 커버
export default function Page(props: any) {
  const sid = (props?.params?.sid as string) ?? "";
  const q = (props?.searchParams?.q as string) ?? "";
  const n = (props?.searchParams?.n as string) ?? "";

  return (
    <MusicConvClient
      initialView="result"
      sid={sid || null}
      initialText={q}
      initialNickname={n}
    />
  );
}
