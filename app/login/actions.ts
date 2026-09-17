"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Send a magic link.
 *
 * Always redirects to the same "check your email" state, whether or not the
 * address belongs to anyone. Telling a stranger which addresses exist is a
 * small leak, but it is free to avoid.
 */
export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const next = String(formData.get("next") ?? "/intakes");

  if (email) {
    const origin = (await headers()).get("origin") ?? "";
    const supabase = await createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(next)}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
