import { redirect } from "next/navigation";

/** "Edit" became the Questions tab. */
export default async function EditIntakeRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/client-questionnaires/admin/${id}/questions`);
}
