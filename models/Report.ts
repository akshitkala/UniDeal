import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
    listing: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: Date;
}

const ReportSchema: Schema = new Schema({
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
}, { timestamps: true });

export const Report = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
