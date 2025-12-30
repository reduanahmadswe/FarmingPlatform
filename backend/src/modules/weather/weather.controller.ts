import { Request, Response } from 'express';

const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy'];

export const getWeather = (req: Request, res: Response) => {
    // Mock Weather Data
    const temp = Math.floor(Math.random() * 15) + 20; // 20-35 deg
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%

    res.status(200).json({
        location: 'Bogura, BD',
        temperature: temp,
        condition,
        humidity
    });
};
