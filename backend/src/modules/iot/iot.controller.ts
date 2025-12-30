import { Request, Response } from 'express';
import * as iotService from './iot.service';

export const getStatus = async (req: Request, res: Response) => {
    try {
        const status = await iotService.getDeviceStatus("pump-001"); // Hardcoded ID for demo
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device status', error });
    }
};

export const togglePump = async (req: Request, res: Response) => {
    try {
        const status = await iotService.togglePump("pump-001");
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling pump', error });
    }
};

export const updateData = async (req: Request, res: Response) => {
    try {
        const status = await iotService.updateDeviceStatus("pump-001", req.body);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error updating data', error });
    }
};
