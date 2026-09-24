import { redirect } from "next/navigation";

export default async function IntakeRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/client-questionnaires/admin/${id}`);
}
