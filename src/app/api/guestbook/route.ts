export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.GUESTBOOK_UPSTREAM || "http://54.180.46.82:8080/guestbook";

export async function POST(req: Request) {
  try {
    const body = await req.text(); // 그대로 전달
    const r = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("content-type") || "application/json" },
    });
  } catch {
    return new Response("Proxy Error (POST)", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const target = `${UPSTREAM}${url.search}`; // 쿼리 그대로
    const r = await fetch(target, { cache: "no-store" });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("content-type") || "application/json" },
    });
  } catch {
    return new Response("Proxy Error (GET)", { status: 500 });
  }
}
