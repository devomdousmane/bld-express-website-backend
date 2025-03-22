// src/controllers/contact.controller.ts

import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import Logger from '../utils/logger';

// Créer une instance du logger pour ce contrôleur
const logger = new Logger('ContactController');

/**
 * Traite une demande de contact et envoie des emails
 */
export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const formData = req.body; 
    logger.info('Nouvelle demande de contact reçue', { email: formData.email, subject: formData.subject });
    // Envoyer l'email à l'entreprise
    await emailService.sendContactEmail(formData);
    logger.debug('Email de contact envoyé à l\'entreprise');
    
    // Envoyer un email de confirmation au client
    await emailService.sendContactConfirmation(formData);
    logger.debug('Email de confirmation envoyé au client');
    
    logger.info('Traitement de la demande de contact terminé avec succès', { email: formData.email });
    return res.status(200).json({
      status: 'success',
      message: 'Votre message a été envoyé avec succès'
    });
  } catch (error: any) {
    logger.error('Erreur lors du traitement de la demande de contact', error);
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de l\'envoi de votre message',
      error: error.message
    });
  }
};