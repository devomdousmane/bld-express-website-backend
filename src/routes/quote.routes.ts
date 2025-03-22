// src/routes/quote.routes.ts

import { Router } from 'express';
import { submitQuoteRequest } from '../controllers/quote.controller';
import { validateFields, validateEmail, validatePhone, validateMinLength } from '../middleware/validator';

const router = Router();

// Route pour soumettre une demande de devis
router.post('/', [
  validateFields(['name', 'email', 'type', 'pickup', 'delivery', 'date', 'description']),
  validateEmail(),
  validatePhone(),
  validateMinLength('description', 10)
], submitQuoteRequest);

export default router;