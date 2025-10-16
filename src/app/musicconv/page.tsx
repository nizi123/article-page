// app/musicconv/page.tsx
import { Suspense } from "react";
import MusicConvClient from "./MusicConvClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MusicConvClient />
    </Suspense>
  );
}
