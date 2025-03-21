import { Request, Response } from 'express';
import { postApiService } from '../services/post-api.service';
import { PostOffice } from '../models/post-office.model';

export const postOfficeController = {
  // Obtenir les informations d'un bureau de poste par ID
  getPostOfficeById: async (req: Request, res: Response) => {
    try {
      const officeId = req.params.id;
      
      if (!officeId) {
        return res.status(400).json({ 
          message: 'ID du bureau de poste manquant',
          success: false 
        });
      }
      
      // Appel à l'API de la Poste
      const officeData = await postApiService.getPostOfficeInfo(officeId);
      
      // Vérifier si les données ont été trouvées
      if (!officeData) {
        return res.status(404).json({
          message: 'Bureau de poste non trouvé',
          success: false
        });
      }
      
      // Retourner les informations du bureau de poste
      return res.status(200).json({
        message: 'Informations du bureau de poste récupérées avec succès',
        success: true,
        office: officeData
      });
    } catch (error: any) {
      const status = error.status || 500;
      return res.status(status).json({
        message: error.message || 'Erreur lors de la récupération des informations du bureau de poste',
        success: false,
        error: error.error || error
      });
    }
  },
  
  // Rechercher des bureaux de poste à proximité de coordonnées géographiques
  findNearbyPostOffices: async (req: Request, res: Response) => {
    try {
      // Récupérer les paramètres de recherche
      const { latitude, longitude, radius } = req.query;
      
      // Validation des paramètres
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          message: 'Coordonnées de géolocalisation (latitude, longitude) requises',
          success: false 
        });
      }
      
      // Convertir les paramètres en nombre
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const rad = radius ? parseInt(radius as string) : 5000; // Rayon par défaut: 5km
      
      // Validation des valeurs numériques
      if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
        return res.status(400).json({ 
          message: 'Coordonnées ou rayon invalides',
          success: false 
        });
      }
      
      // Valider la plage des coordonnées
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({ 
          message: 'Coordonnées hors limites valides',
          success: false,
          details: 'Latitude: -90 à 90, Longitude: -180 à 180'
        });
      }
      
      // Appel à l'API de la Poste
      const officesData = await postApiService.findNearbyPostOffices(lat, lon, rad);
      
      // Formater la réponse
      return res.status(200).json({
        message: 'Bureaux de poste trouvés avec succès',
        success: true,
        searchParams: {
          latitude: lat,
          longitude: lon,
          radius: rad
        },
        totalResults: officesData.totalResults || officesData.offices?.length || 0,
        offices: officesData.offices || []
      });
    } catch (error: any) {
      const status = error.status || 500;
      return res.status(status).json({
        message: error.message || 'Erreur lors de la recherche de bureaux de poste',
        success: false,
        error: error.error || error
      });
    }
  },
  
  // Rechercher des bureaux de poste par code postal
  searchPostOfficesByPostalCode: async (req: Request, res: Response) => {
    try {
      const postalCode = req.params.postalCode;
      
      if (!postalCode) {
        return res.status(400).json({ 
          message: 'Code postal manquant',
          success: false 
        });
      }
      
      // Validation du format du code postal (pour la France)
      const postalCodeRegex = /^[0-9]{5}$/;
      if (!postalCodeRegex.test(postalCode)) {
        return res.status(400).json({ 
          message: 'Format de code postal invalide',
          success: false,
          details: 'Le code postal doit contenir 5 chiffres'
        });
      }
      
      // Appel à l'API de la Poste avec un endpoint spécifique pour la recherche par code postal
      const officesData = await postApiService.makeRequest(`/datanova/v1/bureaux-poste?codePostal=${postalCode}`);
      
      // Formater la réponse
      return res.status(200).json({
        message: 'Bureaux de poste trouvés avec succès',
        success: true,
        searchParams: {
          postalCode
        },
        totalResults: officesData.totalResults || officesData.offices?.length || 0,
        offices: officesData.offices || []
      });
    } catch (error: any) {
      const status = error.status || 500;
      return res.status(status).json({
        message: error.message || 'Erreur lors de la recherche de bureaux de poste par code postal',
        success: false,
        error: error.error || error
      });
    }
  }
};