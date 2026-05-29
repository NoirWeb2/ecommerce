import { getHomePageData } from "@/lib/page-settings";
import HomePageClient from "@/components/store/HomePageClient";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
const pageData = await getHomePageData();
return <HomePageClient pageData={pageData} />;
}