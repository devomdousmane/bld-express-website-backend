import { Router } from 'express';
//import userRoutes from './user.routes';
import trackingRoutes from './tracking.routes';
import postOfficeRoutes from './post-office.routes';

const router = Router();

// Enregistrer toutes les routes
//router.use('/users', userRoutes);
router.use('/tracking', trackingRoutes);
router.use('/post-offices', postOfficeRoutes);

export default router;