import ChoicesTable from "../_sections/ChoicesTable";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  return (
    <div className="container">
      <ChoicesTable applicationId={Number(slug)} />
    </div>
  );
}
