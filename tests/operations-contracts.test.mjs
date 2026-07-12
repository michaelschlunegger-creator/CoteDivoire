import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const context = { waitUntil() {}, passThroughOnException() {} };

test("admin APIs are denied without a verified organizer session", async () => {
  const app = await worker();
  for (const path of ["/api/admin/overview", "/api/admin/participants", "/api/admin/resources", "/api/admin/feedback", "/api/admin/announcements"]) {
    const response = await app.fetch(new Request(`http://localhost${path}`), env, context);
    assert.equal(response.status, 403, path);
  }
});

test("participant-only APIs are denied without a participant session", async () => {
  const app = await worker();
  for (const path of ["/api/me/agenda", "/api/me/activities", "/api/announcements"]) {
    const response = await app.fetch(new Request(`http://localhost${path}`), env, context);
    assert.equal(response.status, 401, path);
  }
});

test("OTP validation rejects malformed codes before touching authentication", async () => {
  const app = await worker();
  const response = await app.fetch(new Request("http://localhost/api/auth/verify-code", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "participant@example.com", code: "123" }) }), env, context);
  assert.equal(response.status, 400);
  assert.match(await response.text(), /six-digit code/i);
});

test("registration flow remains protected by a fresh verified-email proof", async () => {
  const source = await readFile(new URL("../app/api/register/route.ts", import.meta.url), "utf8");
  assert.match(source, /getFreshRegistrationUser/);
  assert.match(source, /verifiedEmail/);
  assert.match(source, /clearRegistrationProofCookie/);
});

test("placeholder activities are always closed to new reservations", async () => {
  const source = await readFile(new URL("../lib/activities.ts", import.meta.url), "utf8");
  assert.match(source, /row\.isOpen&&!row\.isPlaceholder/);
  assert.match(source, /isOpen:false,isPlaceholder:true/);
});

test("session refresh persists rotated access and refresh tokens", async () => {
  const source = await readFile(new URL("../app/api/auth/refresh/route.ts", import.meta.url), "utf8");
  assert.match(source, /refreshEventSession/);
  assert.match(source, /eventSessionCookies/);
  assert.match(source, /Set-Cookie/);
});
