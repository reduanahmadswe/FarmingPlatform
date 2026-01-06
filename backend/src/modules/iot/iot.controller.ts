import { Request, Response } from 'express';
import * as iotService from './iot.service';

const IOT_OWNER = process.env.IOT_OWNER || 'iot-owner';

const assertIoTOwner = (req: Request, res: Response): string | null => {
    const requester = (req.body && (req.body.user || req.body.userId)) || (req.query && (req.query.user as string));
    if (!requester) {
        res.status(400).json({ message: 'user is required for IoT operations' });
        return null;
    }
    if (requester !== IOT_OWNER) {
        res.status(403).json({ message: 'Unauthorized: only device owner can control IoT' });
        return null;
    }
    return requester as string;
};

export const getStatus = async (req: Request, res: Response) => {
    try {
        if (!assertIoTOwner(req, res)) return;
        const status = await iotService.getDeviceStatus("pump-001"); // Hardcoded ID for demo
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device status', error });
    }
};

export const togglePump = async (req: Request, res: Response) => {
    try {
        if (!assertIoTOwner(req, res)) return;
        const status = await iotService.togglePump("pump-001");
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error toggling pump', error });
    }
};

export const updateData = async (req: Request, res: Response) => {
    try {
        if (!assertIoTOwner(req, res)) return;
        const status = await iotService.updateDeviceStatus("pump-001", req.body);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error updating data', error });
    }
};
