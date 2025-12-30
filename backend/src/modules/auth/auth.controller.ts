import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { phone, password } = req.body;
        const result = await authService.login(phone, password);
        if (!result) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await authService.updateUser(id, updates);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
