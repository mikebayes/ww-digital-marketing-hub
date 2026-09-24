import { redirect } from "next/navigation";

export default async function PreviewIntakeRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/client-questionnaires/admin/preview/${id}`);
}
