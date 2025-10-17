export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = (process.env.GUESTBOOK_UPSTREAM || "http://54.180.46.82:8080").replace(/\/+$/, "");

export async function GET(_req: Request, ctx: any) {
  const id = ctx?.params?.id;
  if (!id || !/^\d+$/.test(id)) return new Response("Bad id", { status: 400 });

  const url = `${/guestbook$/.test(BASE) ? BASE : `${BASE}/guestbook`}/${id}`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") || "application/json; charset=utf-8" },
    });
  } catch {
    return new Response("Proxy error", { status: 500 });
  }
}
