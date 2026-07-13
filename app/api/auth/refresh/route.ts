import { clearEventSessionCookies, eventSessionCookies, refreshEventSession } from "@/lib/event-auth";

function safeReturnTo(request: Request) {
  const value = new URL(request.url).searchParams.get("returnTo") || "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function appendClearedCookies(headers: Headers) {
  for (const cookie of clearEventSessionCookies()) headers.append("Set-Cookie", cookie);
}

export async function GET(request: Request) {
  const target = safeReturnTo(request);
  const headers = new Headers({ Location: new URL(target, request.url).toString(), "Cache-Control": "no-store" });
  try {
    const refreshed = await refreshEventSession();
    if (!refreshed) {
      headers.set("Location", new URL(`/signin?returnTo=${encodeURIComponent(target)}`, request.url).toString());
      appendClearedCookies(headers);
      return new Response(null, { status: 303, headers });
    }
    for (const cookie of eventSessionCookies(refreshed.session)) headers.append("Set-Cookie", cookie);
    return new Response(null, { status: 303, headers });
  } catch {
    headers.set("Location", new URL(`/signin?returnTo=${encodeURIComponent(target)}`, request.url).toString());
    appendClearedCookies(headers);
    return new Response(null, { status: 303, headers });
  }
}

export async function POST() {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  try {
    const refreshed = await refreshEventSession();
    if (!refreshed) {
      appendClearedCookies(headers);
      return new Response(JSON.stringify({ refreshed: false }), { status: 401, headers });
    }
    for (const cookie of eventSessionCookies(refreshed.session)) headers.append("Set-Cookie", cookie);
    return new Response(JSON.stringify({ refreshed: true }), { status: 200, headers });
  } catch {
    appendClearedCookies(headers);
    return new Response(JSON.stringify({ refreshed: false }), { status: 401, headers });
  }
}
