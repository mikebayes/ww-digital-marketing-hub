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
        /*
         * Sign in existing users only. Without this a magic link creates an
         * account for whatever address was typed, which would make the login
         * form a public sign-up for anyone who found the URL.
         *
         * Being in the project's user list is the permission model, so the
         * only way in is an invite from the Supabase dashboard.
         */
        shouldCreateUser: false,
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
