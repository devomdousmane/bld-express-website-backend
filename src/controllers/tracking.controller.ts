import { Request, Response } from 'express';
import { postApiService } from '../services/post-api.service';
import { TrackingResponse } from '../models/package-tracking.model';

export const trackingController = {
  // Obtenir les informations de suivi d'un colis
  getPackageTracking: async (req: Request, res: Response) => {
    try {
      const trackingNumber = req.params.trackingNumber;
      
      if (!trackingNumber) {
        return res.status(400).json({ 
          message: 'Numéro de suivi manquant',
          success: false 
        });
      }
      
      // Vérifier le format du numéro de suivi (exemple basique)
      const trackingRegex = /^[A-Z0-9]{8,14}$/i;
      if (!trackingRegex.test(trackingNumber)) {
        return res.status(400).json({ 
          message: 'Format de numéro de suivi invalide',
          success: false,
          details: 'Le numéro de suivi doit contenir entre 8 et 14 caractères alphanumériques'
        });
      }
      
      // Appel à l'API de la Poste
      const trackingData: TrackingResponse = await postApiService.trackPackage(trackingNumber);
      
      // Vérifier si le suivi a réussi
      if (trackingData.returnCode !== 200 || trackingData.error) {
        return res.status(404).json({
          message: trackingData.error?.message || 'Informations de suivi non disponibles',
          success: false,
          code: trackingData.error?.code,
          type: trackingData.error?.type
        });
      }
      
      // Retourner les informations de suivi
      return res.status(200).json({
        message: 'Informations de suivi récupérées avec succès',
        success: true,
        tracking: trackingData.shipment
      });
    } catch (error: any) {
      // Gestion centralisée des erreurs
      const status = error.status || 500;
      return res.status(status).json({
        message: error.message || 'Erreur lors de la récupération des informations de suivi',
        success: false,
        error: error.error || error
      });
    }
  },
  
  // Obtenir un résumé simplifié du suivi
  getPackageTrackingSummary: async (req: Request, res: Response) => {
    try {
      const trackingNumber = req.params.trackingNumber;
      
      if (!trackingNumber) {
        return res.status(400).json({ 
          message: 'Numéro de suivi manquant',
          success: false 
        });
      }
      
      // Appel à l'API de la Poste
      const trackingData: TrackingResponse = await postApiService.trackPackage(trackingNumber);
      
      // Vérifier si le suivi a réussi
      if (trackingData.returnCode !== 200 || trackingData.error) {
        return res.status(404).json({
          message: trackingData.error?.message || 'Informations de suivi non disponibles',
          success: false
        });
      }
      
      // Créer un résumé simplifié
      const shipment = trackingData.shipment;
      const summary = {
        trackingNumber: shipment?.idShip,
        status: shipment?.status,
        isDelivered: shipment?.isFinal,
        lastEvent: shipment?.timeline?.[0],
        estimatedDeliveryDate: shipment?.deliveryDate,
        url: shipment?.url
      };
      
      // Retourner le résumé
      return res.status(200).json({
        message: 'Résumé de suivi récupéré avec succès',
        success: true,
        summary
      });
    } catch (error: any) {
      // Gestion des erreurs
      const status = error.status || 500;
      return res.status(status).json({
        message: error.message || 'Erreur lors de la récupération du résumé de suivi',
        success: false,
        error: error.error || error
      });
    }
  }
};