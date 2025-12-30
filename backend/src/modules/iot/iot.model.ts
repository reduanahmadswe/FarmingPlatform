import mongoose, { Schema, Document } from 'mongoose';

export interface IIoTDevice extends Document {
    deviceId: string;
    waterLevel: number;
    isPumpRunning: boolean;
    lastUpdated: Date;
}

const IoTDeviceSchema: Schema = new Schema({
    deviceId: { type: String, required: true, unique: true },
    waterLevel: { type: Number, default: 0 },
    isPumpRunning: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model<IIoTDevice>('IoTDevice', IoTDeviceSchema);
