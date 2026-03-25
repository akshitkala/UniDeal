import mongoose, { Schema, Document } from "mongoose";
import crypto from 'crypto';

export interface IListing extends Document {
    title: string;
    description?: string;
    price: number;
    negotiable: boolean;
    category: mongoose.Types.ObjectId;
    condition: "new" | "like-new" | "good" | "used" | "damaged";
    images: string[];
    seller: mongoose.Types.ObjectId;
    sellerPhone?: string;
    sellerWhatsapp?: string;
    sellerEmail?: string;
    location?: string;
    status: "pending" | "approved" | "rejected" | "sold";
    isDeleted: boolean;
    rejectionReason?: string;
    aiFlagged: boolean;
    aiVerification: {
        checked?: boolean;
        flagged?: boolean;
        flags?: string[];
        confidence?: number;
        reason?: string;
        checkedAt?: Date;
    };
    slug: string;
    savedBy: mongoose.Types.ObjectId[];
    expiresAt: Date;
    isExpired: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
    {
        title: { type: String, required: true },
        description: String,
        price: { type: Number, required: true, min: 0 },
        negotiable: { type: Boolean, default: false },
        category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
        condition: { type: String, enum: ["new", "like-new", "good", "used", "damaged"], required: true },
        images: {
            type: [String],
            validate: [(val: string[]) => val.length > 0 && val.length <= 6, "Must have between 1 and 6 images"],
        },
        seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
        sellerPhone: { type: String },
        sellerWhatsapp: { type: String },
        sellerEmail: { type: String },
        location: String,
        status: { type: String, enum: ["pending", "approved", "rejected", "sold"], default: "pending" },
        isDeleted: { type: Boolean, default: false },
        rejectionReason: String,
        aiFlagged: { type: Boolean, default: false },
        aiVerification: {
            checked: Boolean,
            flagged: Boolean,
            flags: [String],
            confidence: { type: Number, default: 0 },
            reason: String,
            checkedAt: Date,
        },
        slug: { type: String, unique: true },
        savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
        expiresAt: Date,
        isExpired: { type: Boolean, default: false },
    },
    { timestamps: true }
);

listingSchema.pre("save", async function (this: any) {
    if (!this.slug) {
        this.slug = crypto.randomBytes(4).toString('hex');
    }
    if (!this.expiresAt) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 60);
        this.expiresAt = expires;
    }
});

listingSchema.pre("find", function () {
    const query = this.getQuery();
    if (query.isDeleted === undefined) {
        this.where({ isDeleted: false });
    }
});

listingSchema.pre("findOne", function () {
    const query = this.getQuery();
    if (query.isDeleted === undefined) {
        this.where({ isDeleted: false });
    }
});

// --- Performance Indexes ---
listingSchema.index({ status: 1, isDeleted: 1, createdAt: -1 }); // home page query
listingSchema.index({ seller: 1, isDeleted: 1, status: 1 });      // dashboard query
listingSchema.index({ category: 1, status: 1, isDeleted: 1 });    // category filter
listingSchema.index({ aiFlagged: 1, status: 1 });                  // admin flagged queue
listingSchema.index({ expiresAt: 1, status: 1, isDeleted: 1 });   // cron expiry query
listingSchema.index({ title: 'text', description: 'text' });       // full-text search

export const Listing = mongoose.models.Listing || mongoose.model<IListing>("Listing", listingSchema);
