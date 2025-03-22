// src/routes/contact.routes.ts

import { Router } from 'express';
import { sendContactMessage } from '../controllers/contact.controller';
import { validateFields, validateEmail, validatePhone, validateMinLength } from '../middleware/validator';

const router = Router();

// Route pour envoyer un message de contact
router.post('/', [
  validateFields(['name', 'email', 'subject', 'message']),
  validateEmail(),
  validatePhone(),
  validateMinLength('message', 10)
], sendContactMessage);

export default router;