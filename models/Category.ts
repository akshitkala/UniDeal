import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;
    slug: string;
    icon: string;
    isActive: boolean;
    order: number;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        icon: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);
