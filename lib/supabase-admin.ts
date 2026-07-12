import { getRuntimeEnv } from "@/lib/runtime-env";

type SupabaseAdminUser = { id: string; email?: string };

function adminConfig() {
  const env = getRuntimeEnv();
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function isPermanentErasureConfigured() {
  const { url, serviceKey } = adminConfig();
  return Boolean(url && serviceKey);
}

async function findAuthUser(email: string) {
  const { url, serviceKey } = adminConfig();
  if (!url || !serviceKey) throw new Error("Permanent erasure is not configured. Add the private Supabase service-role key to the production environment.");
  for (let page = 1; page <= 50; page += 1) {
    const response = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=1000`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!response.ok) throw new Error("The Supabase identity directory could not be accessed.");
    const data = await response.json() as { users?: SupabaseAdminUser[] } | SupabaseAdminUser[];
    const users = Array.isArray(data) ? data : data.users || [];
    const match = users.find(user => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (users.length < 1000) return null;
  }
  return null;
}

export async function permanentlyDeleteAuthUser(email: string) {
  const { url, serviceKey } = adminConfig();
  if (!url || !serviceKey) throw new Error("Permanent erasure is not configured. Add the private Supabase service-role key to the production environment.");
  const user = await findAuthUser(email);
  if (!user) return { deleted: false, reason: "identity_not_found" } as const;
  const response = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: "DELETE",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ should_soft_delete: false }),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({})) as { message?: string; msg?: string };
    throw new Error(detail.message || detail.msg || "The Supabase identity could not be permanently deleted.");
  }
  return { deleted: true, userId: user.id } as const;
}
