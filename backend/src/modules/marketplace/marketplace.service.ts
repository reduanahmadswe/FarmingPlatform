import Crop, { ICrop } from './marketplace.model';

export const createCrop = async (data: Partial<ICrop>): Promise<ICrop> => {
    return await Crop.create(data);
};

export const getAllCrops = async (): Promise<ICrop[]> => {
    return await Crop.find().sort({ createdAt: -1 });
};

export const updateCrop = async (id: string, data: Partial<ICrop>): Promise<ICrop | null> => {
    return await Crop.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCrop = async (id: string): Promise<ICrop | null> => {
    return await Crop.findByIdAndDelete(id);
};
