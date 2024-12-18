import { api } from "@/trpc/server";
import ChoicesTable from "../_sections/ChoicesTable";
import { redirect } from "next/navigation";

export default async function MyChoices({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const choices = await api.choices.getList();

  // if length of choices is 0, then redirect to /dashboard/
  if (choices.length === 0) {
    redirect("/dashboard/");
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">My Choices {id}</h1>
      <ChoicesTable abroadId={Number(id)} />
    </>
  );
}
