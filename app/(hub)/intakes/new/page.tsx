import { redirect } from "next/navigation";

export default function NewIntakeRedirect() {
  redirect("/client-questionnaires/admin/new");
}
