import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    photoUrl: string;
    role: "user" | "admin" | "superadmin";
    isActive: boolean;
    trustLevel: "new" | "trusted" | "flagged";
    phone: string;
    whatsapp: string;
    bio?: string;
    location?: string;
    totalListings: number;
    activeListings: number;
    savedListings: mongoose.Types.ObjectId[];
    bannedAt: Date | null;
    bannedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        uid: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        emailVerified: { type: Boolean, default: false },
        displayName: String,
        photoUrl: { type: String, default: '' },
        role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
        isActive: { type: Boolean, default: true },
        trustLevel: { type: String, enum: ["new", "trusted", "flagged"], default: "new" },
        phone: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        bio: String,
        location: String,
        totalListings: { type: Number, default: 0 },
        activeListings: { type: Number, default: 0 },
        savedListings: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
        bannedAt: { type: Date, default: null },
        bannedBy: { type: String, default: null },
    },
    { timestamps: true }
);

// --- Performance Indexes ---
userSchema.index({ role: 1 });                     // admin user list
userSchema.index({ isActive: 1 });                 // banned user check

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
