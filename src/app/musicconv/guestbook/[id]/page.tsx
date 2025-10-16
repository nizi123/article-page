import MusicConvClient from "../../MusicConvClient";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page({ params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  return (
    <MusicConvClient
      initialView="saved"
      savedId={isNaN(idNum) ? null : idNum}
    />
  );
}
