import MusicConvClient from "../../MusicConvClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page(props: any) {
  const idStr = props?.params?.id as string | undefined;
  const idNum = idStr ? Number(idStr) : NaN;

  return (
    <MusicConvClient
      initialView="saved"
      savedId={Number.isFinite(idNum) ? idNum : null}
    />
  );
}
