import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./env";

/**
 * Service-role client, used by exactly one thing: the public questionnaire.
 *
 * The client has no login, so there is no session to run queries as, and RLS
 * grants the anon role nothing. Rather than opening a policy to anonymous
 * callers — which would apply to anyone holding the anon key, not just someone
 * holding a valid intake token — the public route reads through the server
 * with this client and projects a narrow, explicit column list.
 *
 * "server-only" makes importing this from a client component a build error.
 */
export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
