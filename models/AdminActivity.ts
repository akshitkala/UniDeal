import mongoose, { Schema, Document } from "mongoose";

export interface IAdminActivity extends Document {
    actor?: mongoose.Types.ObjectId;
    actorType: "user" | "system" | "deleted_user";
    target?: mongoose.Types.ObjectId;
    targetModel: "User" | "Listing" | "Category" | "System";
    action: string;
    metadata?: any;
    ipAddress?: string;
    timestamp: Date;
}

const adminActivitySchema = new Schema<IAdminActivity>({
    actor: { type: Schema.Types.ObjectId, ref: "User" },
    actorType: { type: String, enum: ["user", "system", "deleted_user"], required: true },
    target: { type: Schema.Types.ObjectId, refPath: "targetModel" },
    targetModel: { type: String, enum: ["User", "Listing", "Category", "System"], required: true },
    action: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now },
});

export const AdminActivity = mongoose.models.AdminActivity || mongoose.model<IAdminActivity>("AdminActivity", adminActivitySchema);
