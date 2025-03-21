import { Request, Response, NextFunction } from 'express';

// Middleware pour valider les paramètres d'API communs
export const validateApiParams = (req: Request, res: Response, next: NextFunction): void => {
  // Vérification pour les endpoints de géolocalisation
  if (req.path.includes('/nearby')) {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Les paramètres latitude et longitude sont requis'
      });
      return;
    }
    
    // Validation du format
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    
    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({
        success: false,
        message: 'Les coordonnées doivent être des nombres valides'
      });
      return;
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      res.status(400).json({
        success: false,
        message: 'Coordonnées hors limites valides (latitude: -90 à 90, longitude: -180 à 180)'
      });
      return;
    }
  }
  
  // Vérification pour les endpoints de suivi de colis
  if (req.path.includes('/tracking/')) {
    const trackingNumber = req.params.trackingNumber;
    
    if (!trackingNumber) {
      res.status(400).json({
        success: false,
        message: 'Numéro de suivi requis'
      });
      return;
    }
    
    // Validation basique du format (à adapter selon les exigences spécifiques de La Poste)
    const trackingRegex = /^[A-Z0-9]{8,14}$/i;
    if (!trackingRegex.test(trackingNumber)) {
      res.status(400).json({
        success: false,
        message: 'Format de numéro de suivi invalide'
      });
      return;
    }
  }
  
  next();
};

// Limites de taux simples pour les requêtes API
// Dans une application de production, utilisez un système de gestion des limites plus robuste
const requestCounts: Record<string, { count: number, resetTime: number }> = {};

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const currentTime = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 60; // 60 requêtes par minute
  
  // Initialiser ou réinitialiser le compteur
  if (!requestCounts[ip] || requestCounts[ip].resetTime < currentTime) {
    requestCounts[ip] = {
      count: 1,
      resetTime: currentTime + windowMs
    };
  } else {
    requestCounts[ip].count++;
  }
  
  // Vérifier la limite
  if (requestCounts[ip].count > maxRequests) {
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard',
      retryAfter: Math.ceil((requestCounts[ip].resetTime - currentTime) / 1000)
    });
    return;
  }
  
  // Ajouter des en-têtes pour informer le client
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - requestCounts[ip].count).toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(requestCounts[ip].resetTime / 1000).toString());
  
  next();
};

// Cache simple en mémoire pour les résultats d'API
// Dans une application de production, utilisez un système de cache plus robuste comme Redis
const apiCache: Record<string, { data: any, expiry: number }> = {};

export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Créer une clé de cache basée sur la méthode et l'URL
    const cacheKey = `${req.method}:${req.originalUrl}`;
    const currentTime = Date.now();
    
    // Vérifier si les données sont en cache et non expirées
    if (apiCache[cacheKey] && apiCache[cacheKey].expiry > currentTime) {
      res.status(200).json({
        ...apiCache[cacheKey].data,
        fromCache: true
      });
      return;
    }
    
    // Remplacer la méthode json pour intercepter la réponse et la mettre en cache
    const originalJson = res.json;
    res.json = function(body: any) {
      // Mettre en cache seulement les réponses réussies
      if (res.statusCode === 200) {
        apiCache[cacheKey] = {
          data: body,
          expiry: currentTime + duration
        };
      }
      
      // Appeler la méthode json originale
      return originalJson.call(this, body);
    };
    
    next();
  };
};