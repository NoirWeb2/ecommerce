import { getHomePageData } from "@/lib/page-settings";
import HomePageClient from "@/components/store/HomePageClient";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function HomePage() {
const pageData = await getHomePageData();

return <HomePageClient pageData={pageData} />;
}