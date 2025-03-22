// src/routes/vehicle.routes.ts

import { Router } from 'express';
import { createVehicleReservation } from '../controllers/vehicle.controller';
import { validateFields, validateEmail, validatePhone } from '../middleware/validator';

const router = Router();

// Route pour créer une réservation de véhicule
router.post('/', [
  validateFields(['name', 'email', 'phone', 'startDate', 'endDate', 'pickupLocation']),
  validateEmail(),
  validatePhone()
], createVehicleReservation);

export default router;