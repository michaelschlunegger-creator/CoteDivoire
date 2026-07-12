import { eventAuthConfig } from "@/lib/event-auth";
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
      body: JSON.stringify({ email: normalized, create_user: true, data: { event: "West African Transform Margin 2027" } }),
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({})) as { msg?: string; message?: string };
      return Response.json({ error: detail.msg || detail.message || "The code could not be sent. Please wait and try again." }, { status: response.status });
    }
    return Response.json({ sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send code.";
    return Response.json({ error: message.includes("not configured") ? "Registration email verification is being configured for this new event. Please try again after the organizer activates email delivery." : message }, { status: 503 });
  }
}
