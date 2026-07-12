import { clearRegistrationProofCookie, eventAuthConfig } from "@/lib/event-auth";
import { getParticipantAccess, participantAccessError } from "@/lib/participant-access";

export async function POST(request: Request) {
  try {
    const { email } = await request.json() as { email?: string };
    const normalized = email?.trim().toLowerCase() || "";
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const access = await getParticipantAccess(normalized);
    if (access && access.status !== "active") {
      return Response.json({ error: participantAccessError(access.status) }, { status: 403 });
    }

    const { url, key } = eventAuthConfig();
    const redirectTo = `${new URL(request.url).origin}/register`;
    const response = await fetch(`${url}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ email: normalized, create_user: true, data: { event: "West African Transform Margin 2027", otp_requested_at: new Date().toISOString() } }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({})) as { msg?: string; message?: string };
      const wait = Number(response.headers.get("retry-after") || 0);
      const message = response.status === 429
        ? `A code was requested too recently. Wait ${wait > 0 ? wait : 60} seconds, then request a new code.`
        : detail.msg || detail.message || "The code could not be sent. Please wait and try again.";
      return Response.json({ error: message, retryAfter: wait || 60 }, { status: response.status, headers: { "Cache-Control": "no-store" } });
    }
    const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" });
    headers.append("Set-Cookie", clearRegistrationProofCookie());
    return new Response(JSON.stringify({ sent: true, email: normalized, retryAfter: 60, expiresIn: 600 }), { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send code.";
    return Response.json({ error: message.includes("not configured") ? "Registration email verification is being configured for this new event. Please try again after the organizer activates email delivery." : message }, { status: 503 });
  }
}
