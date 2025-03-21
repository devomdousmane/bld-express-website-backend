import { Router } from 'express';
import { postOfficeController } from '../controllers/post-office.controller';

const router = Router();

// Routes pour les bureaux de poste
router.get('/nearby', postOfficeController.findNearbyPostOffices);
router.get('/postal-code/:postalCode', postOfficeController.searchPostOfficesByPostalCode);
router.get('/:id', postOfficeController.getPostOfficeById);

export default router;