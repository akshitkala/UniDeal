import ListingDetailView from "@/components/listing/ListingDetailView";
import '@/models/Listing';
import '@/models/Category';
import '@/models/User';


export default async function ListingPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    return (
        <div style={{ background: "var(--bg)", minHeight: "100%" }}>
            <ListingDetailView slug={slug} isModal={false} />
        </div>
    );
}
