import { Router } from 'express';
import * as weatherController from './weather.controller';

const router = Router();

router.get('/', weatherController.getWeather);

export default router;
