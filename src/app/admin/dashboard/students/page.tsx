import { getServerAuthSession } from "@/server/auth";
import StudentList from "./_sections/StudentsList";

export default async function Students() {
  const session = await getServerAuthSession();
  return (
    <div className="container pl-16 pt-16">
      <h1>Students</h1>
      {session && <StudentList />}
    </div>
  );
}
