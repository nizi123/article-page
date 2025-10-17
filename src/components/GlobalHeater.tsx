"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import MusicConvHeader from "./MusicConvHeader";

export default function GlobalHeader() {
  const pathname = usePathname();
  return pathname?.startsWith("/musicconv") ? <MusicConvHeader /> : <Header />;
}