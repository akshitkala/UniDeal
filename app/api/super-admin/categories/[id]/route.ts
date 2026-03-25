import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { Listing } from "@/models/Listing";
import { requireSuperadmin } from "@/middleware/auth";
import { invalidateCache } from '@/lib/db/cache/memory-cache';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const auth = await requireSuperadmin();
    if (auth instanceof NextResponse) return auth;

    const [paramsData, body] = await Promise.all([
        params,
        req.json()
    ]);
    const { id } = paramsData;
    const { name, slug, icon, order, isActive } = body;

    const category = await Category.findById(id);
    if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Safeguard: Cannot change slug of "other" category
    if (category.slug === 'other' && slug && slug !== 'other') {
        return NextResponse.json(
            { error: "The 'other' category slug cannot be changed" },
            { status: 400 }
        );
    }

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (slug !== undefined) update.slug = slug;
    if (icon !== undefined) update.icon = icon;
    if (order !== undefined) update.order = order;
    if (isActive !== undefined) update.isActive = isActive;

    const updated = await Category.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
    );

    // After successful update:
    invalidateCache('categories:all');

    return NextResponse.json({ success: true, category: updated });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const auth = await requireSuperadmin();
    if (auth instanceof NextResponse) return auth;

    const paramsData = await params;
    const { id } = paramsData;
    const [category, fallback] = await Promise.all([
        Category.findById(id),
        Category.findOne({ slug: 'other' })
    ]);
    if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Block deletion of the "Other" fallback category
    if (category.slug === 'other') {
        return NextResponse.json(
            { error: 'The "Other" category cannot be deleted' },
            { status: 409 }
        );
    }

    let actualFallback = fallback;
    if (!actualFallback) {
        actualFallback = await Category.create({
            name: 'Other',
            icon: '📦',
            slug: 'other',
            order: 999,
        });
    }

    // Move ALL listings in this category to "Other"
    // This covers every status: active, pending, rejected, sold, expired, soft-deleted
    const { modifiedCount } = await Listing.updateMany(
        { category: id },
        { $set: { category: actualFallback._id } }
    );

    // Delete the category
    await Category.findByIdAndDelete(id);

    // After successful delete:
    invalidateCache('categories:all');

    return NextResponse.json({
        success: true,
        movedListings: modifiedCount,
        message: modifiedCount > 0
            ? `Deleted. ${modifiedCount} listing(s) moved to "Other".`
            : 'Deleted. No listings were affected.',
    });
}
