// src/controllers/quote.controller.ts

import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import Logger from '../utils/logger';

// Créer une instance du logger pour ce contrôleur
const logger = new Logger('QuoteController');

/**
 * Traite une demande de devis et envoie des emails
 */
export const submitQuoteRequest = async (req: Request, res: Response) => {
  try {
    const formData = req.body;
    logger.info('Nouvelle demande de devis reçue', { 
      email: formData.email, 
      type: formData.type,
      date: formData.date
    });
    
    // La validation est désormais gérée par les middlewares
    
    // Envoyer l'email à l'entreprise
    await emailService.sendQuoteEmail(formData);
    logger.debug('Email de demande de devis envoyé à l\'entreprise');
    
    // Envoyer un email de confirmation au client
    await emailService.sendQuoteConfirmation(formData);
    logger.debug('Email de confirmation de devis envoyé au client');
    
    logger.info('Traitement de la demande de devis terminé avec succès', { 
      email: formData.email,
      type: formData.type
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Votre demande de devis a été envoyée avec succès'
    });
  } catch (error: any) {
    logger.error('Erreur lors du traitement de la demande de devis', error);
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de l\'envoi de votre demande de devis',
      error: error.message
    });
  }
};