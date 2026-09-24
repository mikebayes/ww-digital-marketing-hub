import { redirect } from "next/navigation";

/**
 * Moved to /client-questionnaires/admin.
 *
 * Kept as a redirect rather than deleted: these URLs are in browser histories,
 * bookmarks and at least one Productive task. Permanent, because the move is.
 */
export default function IntakesRedirect() {
  redirect("/client-questionnaires/admin");
}
