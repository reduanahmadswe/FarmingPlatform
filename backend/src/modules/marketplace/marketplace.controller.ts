import { Request, Response } from 'express';
import * as marketService from './marketplace.service';

export const createCrop = async (req: Request, res: Response) => {
    try {
        const crop = await marketService.createCrop(req.body);
        res.status(201).json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Error creating crop', error });
    }
};

export const getCrops = async (req: Request, res: Response) => {
    try {
        const crops = await marketService.getAllCrops();
        res.status(200).json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching crops', error });
    }
};

export const updateCrop = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const crop = await marketService.updateCrop(id, req.body);
        res.status(200).json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Error updating crop', error });
    }
};

export const deleteCrop = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await marketService.deleteCrop(id);
        res.status(200).json({ message: 'Crop deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting crop', error });
    }
};
