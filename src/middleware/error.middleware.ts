import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType } from '../utils/error-handler';

// Middleware pour gérer toutes les erreurs
export const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Erreur] ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Si c'est une instance de notre classe AppError
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: err.toResponse(req.originalUrl),
      message: err.message
    });
    return;
  }

  // Erreur générique - convertir en erreur interne
  const status = 500;
  const errorResponse = {
    success: false,
    error: {
      type: ErrorType.INTERNAL_SERVER,
      message: 'Une erreur est survenue sur le serveur',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    },
    // Inclure les détails de l'erreur en développement uniquement
    ...(process.env.NODE_ENV === 'development' && {
      details: {
        name: err.name,
        message: err.message,
        stack: err.stack?.split('\n')
      }
    })
  };

  res.status(status).json(errorResponse);
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    ErrorType.RESOURCE_NOT_FOUND,
    `Route non trouvée: ${req.method} ${req.originalUrl}`
  );
  
  next(error);
};

// Middleware pour capturer les erreurs de validation des requêtes
export const requestValidationHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Vérifier si c'est une erreur de validation (exemple avec express-validator)
  if (err && Array.isArray(err) && 'param' in err[0]) {
    const error = new AppError(
      ErrorType.VALIDATION,
      'Erreur de validation des données',
      err
    );
    next(error);
    return;
  }
  
  // Passer à l'erreur suivante si ce n'est pas une erreur de validation
  next(err);
};