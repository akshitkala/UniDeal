import ListingDetailView from "@/components/listing/ListingDetailView";
import '@/models/Listing';
import '@/models/Category';
import '@/models/User';

import Link from "next/link";

export default async function ListingPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    return (
        <div style={{ background: "var(--bg)", minHeight: "100%" }}>
            <Link
                href="/"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: 'var(--ink-4)',
                    textDecoration: 'none', padding: '16px 20px',
                    fontWeight: 500,
                }}
            >← Back to listings</Link>
            <ListingDetailView slug={slug} isModal={false} />
        </div>
    );
}
