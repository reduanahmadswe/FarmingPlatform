import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
    user: string;
    name: string;
    qty: number;
    price: number;
    icon: string;
    color: string;
    createdAt: Date;
}

const CropSchema: Schema = new Schema({
    user: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    icon: { type: String, default: 'fa-leaf' },
    color: { type: String, default: 'green' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICrop>('Crop', CropSchema);
