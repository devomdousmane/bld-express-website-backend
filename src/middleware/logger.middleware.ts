import { Request, Response, NextFunction } from 'express';

// Middleware de journalisation simple
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Journaliser l'entrée de la requête
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Attacher un événement de fin pour journaliser la sortie
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};