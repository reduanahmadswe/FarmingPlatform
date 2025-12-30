import { Router } from 'express';
import * as marketController from './marketplace.controller';

const router = Router();

router.post('/', marketController.createCrop);
router.get('/', marketController.getCrops);
router.put('/:id', marketController.updateCrop);
router.delete('/:id', marketController.deleteCrop);

export default router;
