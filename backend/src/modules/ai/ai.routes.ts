import { Router } from 'express';
import { analyzeImage } from './ai.controller';

const router = Router();

router.post('/detect', analyzeImage);

export default router;
