import { getServerAuthSession } from "@/server/auth";
import UniversityList from "./_sections/UniversityList";

export default async function Universities() {
	const session = await getServerAuthSession();
	return <div className="container">{session && <UniversityList />}</div>;
}
