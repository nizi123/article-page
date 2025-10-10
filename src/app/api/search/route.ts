export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 스프링 서버로 프록시
const SEARCH_UPSTREAM =
  process.env.SEARCH_UPSTREAM || "http://54.180.46.82:5000/api/search";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const res = await fetch(SEARCH_UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await res.text();

    return new Response(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[Proxy Error] /api/search", err);
    return new Response("Proxy Error (search)", { status: 500 });
  }
}
