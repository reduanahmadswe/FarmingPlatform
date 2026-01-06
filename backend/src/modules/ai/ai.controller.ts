import { Request, Response } from 'express';
import { detectDisease } from './ai.service';

export const analyzeImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body as { image?: string };
    if (!image) {
      return res.status(400).json({ message: 'image data URL is required' });
    }

    const results = await detectDisease(image);

    const top = results[0];
    return res.status(200).json({
      results,
      topLabel: top?.label,
      confidence: top ? Number(top.score).toFixed(2) : null,
      advice: top?.advice || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'AI analysis failed', error });
  }
};
