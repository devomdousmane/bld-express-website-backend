// src/controllers/vehicle.controller.ts

import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import Logger from '../utils/logger';

// Créer une instance du logger pour ce contrôleur
const logger = new Logger('VehicleController');

/**
 * Traite une demande de réservation de véhicule et envoie des emails
 */
export const createVehicleReservation = async (req: Request, res: Response) => {
  try {
    const formData = req.body;
    logger.info('Nouvelle demande de réservation de véhicule reçue', { 
      email: formData.email, 
      startDate: formData.startDate, 
      endDate: formData.endDate 
    });
    
    // La validation est désormais gérée par les middlewares
    
    // Générer un ID de réservation
    const reservationId = generateReservationId();
    logger.debug('ID de réservation généré', { reservationId });
    
    // Envoyer l'email à l'entreprise
    await emailService.sendVehicleReservationEmail(formData);
    logger.debug('Email de réservation envoyé à l\'entreprise');
    
    // Envoyer un email de confirmation au client
    await emailService.sendVehicleReservationConfirmation(formData);
    logger.debug('Email de confirmation de réservation envoyé au client');
    
    logger.info('Traitement de la demande de réservation terminé avec succès', { 
      email: formData.email, 
      reservationId 
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Votre réservation a été envoyée avec succès',
      data: {
        reservationId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Erreur lors du traitement de la demande de réservation', error);
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue lors de l\'envoi de votre réservation',
      error: error.message
    });
  }
};

/**
 * Génère un identifiant unique pour la réservation
 */
function generateReservationId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `BLD-${timestamp}-${randomStr}`.toUpperCase();
}