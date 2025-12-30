import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    phone: string;
    password?: string;
    role: string;
    location: string;
    avatar: string;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Farmer', 'Buyer', 'Admin'], default: 'Farmer' },
    location: { type: String, default: '' },
    avatar: { type: String, default: '' }
});

export default mongoose.model<IUser>('User', UserSchema);
