import { Router } from 'express';
import { trackingController } from '../controllers/tracking.controller';

const router = Router();

// Routes pour le suivi de colis
router.get('/:trackingNumber', trackingController.getPackageTracking);
router.get('/:trackingNumber/summary', trackingController.getPackageTrackingSummary);

export default router;