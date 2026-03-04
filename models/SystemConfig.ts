import mongoose, { Schema, Document } from "mongoose";

export interface ISystemConfig extends Document<string> {
    _id: string;
    approvalMode: "manual" | "automatic" | "ai-gated";
    maintenanceMode: boolean;
    allowNewListings: boolean;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const systemConfigSchema = new Schema<ISystemConfig>(
    {
        _id: { type: String, required: true },
        approvalMode: { type: String, enum: ["manual", "automatic", "ai-gated"], default: "automatic" },
        maintenanceMode: { type: Boolean, default: false },
        allowNewListings: { type: Boolean, default: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model<ISystemConfig>("SystemConfig", systemConfigSchema);
