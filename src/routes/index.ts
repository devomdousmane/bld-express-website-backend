import { Router } from 'express';
//import userRoutes from './user.routes';
import trackingRoutes from './tracking.routes';
import postOfficeRoutes from './post-office.routes';
import contactRouter from './contact.routes';
import quoteRouter from './quote.routes';
import vehicleRouter from './vehicle.routes';
import healthRouter from './health.routes';

const router = Router();

// Enregistrer toutes les routes

router.use('/tracking', trackingRoutes);
router.use('/post-offices', postOfficeRoutes);
router.use('/health', healthRouter);
router.use('/contact', contactRouter);
router.use('/quote', quoteRouter);
router.use('/vehicle-reservation', vehicleRouter);


export default router;