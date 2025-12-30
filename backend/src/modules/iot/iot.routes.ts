import { Router } from 'express';
import * as iotController from './iot.controller';

const router = Router();

router.get('/', iotController.getStatus);
router.post('/toggle', iotController.togglePump);
router.post('/data', iotController.updateData);

export default router;
