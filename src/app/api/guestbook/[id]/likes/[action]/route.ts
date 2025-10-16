export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// .env.local 예) GUESTBOOK_UPSTREAM=http://54.180.46.82:8080
const RAW = process.env.GUESTBOOK_UPSTREAM || "http://54.180.46.82:8080";

// RAW가 /guestbook으로 끝나든 말든 안전하게 보정
function buildTarget(base: string, id: string, action: "add" | "cancel", search: string) {
  let b = base.trim().replace(/\/+$/, "");
  if (!/\/guestbook$/i.test(b)) b = `${b}/guestbook`;
  return `${b}/${id}/likes/${action}${search}`;
}

function proxyHeadersFrom(req: Request) {
  const h = new Headers(req.headers);
  ["host", "connection", "content-length"].forEach((k) => h.delete(k));
  return h;
}

function toProxyResponse(r: Response, body: string | ArrayBuffer) {
  const headers = new Headers(r.headers);
  if (!headers.get("content-type")) headers.set("content-type", "application/json; charset=utf-8");
  return new Response(body, { status: r.status, headers });
}

// ✅ 두 번째 인자 타입 주석 제거(또는 any 사용) → 빌드 에러 해결 포인트
export async function POST(req: Request, context: any) {
  try {
    const { id, action } = (context?.params ?? {}) as { id?: string; action?: string };

    if (!id || !/^\d+$/.test(id) || !["add", "cancel"].includes(String(action))) {
      return new Response("Not found", { status: 404 });
    }

    const url = new URL(req.url);
    const target = buildTarget(RAW, id, action as "add" | "cancel", url.search);

    const r = await fetch(target, {
      method: "POST",
      headers: proxyHeadersFrom(req),
      body: await req.text(), // 대개 빈 바디
      cache: "no-store",
    });

    const text = await r.text();
    return toProxyResponse(r, text);
  } catch (e) {
    return new Response("Proxy Error (/api/guestbook/:id/likes/:action)", { status: 500 });
  }
}
