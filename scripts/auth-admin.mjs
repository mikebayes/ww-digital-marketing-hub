/**
 * Supabase Auth admin helpers, used to provision staff accounts and to drive
 * end-to-end tests without a mailbox.
 *
 *   node scripts/auth-admin.mjs settings
 *   node scripts/auth-admin.mjs create <email>
 *   node scripts/auth-admin.mjs list
 *   node scripts/auth-admin.mjs magiclink <email>
 *
 * Reads the secret key from .env.local and never prints it.
 */
import { readFile } from "node:fs/promises";

const env = {};
for (const line of (await readFile(new URL("../.env.local", import.meta.url), "utf8")).split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = env.SUPABASE_SERVICE_ROLE_KEY;

async function api(path, init = {}) {
  const res = await fetch(`${URL_}${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json", ...init.headers },
  });
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; }
  catch { return { status: res.status, body: text }; }
}

const [cmd, arg] = process.argv.slice(2);

if (cmd === "settings") {
  const r = await fetch(`${URL_}/auth/v1/settings`, { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY } });
  const s = await r.json();
  console.log(JSON.stringify({ email: s.external?.email, disable_signup: s.disable_signup, mailer_autoconfirm: s.mailer_autoconfirm }, null, 2));
}

if (cmd === "create") {
  const r = await api("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email: arg, email_confirm: true }),
  });
  console.log(r.status, JSON.stringify(r.body?.id ? { id: r.body.id, email: r.body.email, confirmed: !!r.body.email_confirmed_at } : r.body));
}

if (cmd === "list") {
  const r = await api("/auth/v1/admin/users");
  console.log(JSON.stringify((r.body.users ?? []).map(u => ({ email: u.email, confirmed: !!u.email_confirmed_at })), null, 2));
}

if (cmd === "magiclink") {
  const r = await api("/auth/v1/admin/generate_link", {
    method: "POST",
    body: JSON.stringify({ type: "magiclink", email: arg, options: { redirect_to: "http://localhost:3000/auth/callback?next=/intakes" } }),
  });
  if (r.status !== 200) { console.log("FAILED", r.status, JSON.stringify(r.body)); process.exit(1); }
  console.log(r.body.action_link ?? r.body.properties?.action_link ?? JSON.stringify(r.body));
}
