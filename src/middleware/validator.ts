// src/middleware/validator.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour valider les champs requis dans le corps de la requête
 * @param fields Tableau de champs requis
 */
export const validateFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Champs requis manquants',
        missingFields
      });
    }
    
    next();
  };
};

/**
 * Middleware pour valider le format de l'email
 * @param field Nom du champ contenant l'email
 */
export const validateEmail = (field: string = 'email') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body[field];
    
    if (!email) {
      return next();
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format d\'email invalide',
        field
      });
    }
    
    next();
  };
};

/**
 * Middleware pour valider le format du numéro de téléphone
 * @param field Nom du champ contenant le numéro de téléphone
 */
export const validatePhone = (field: string = 'phone') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const phone = req.body[field];
    
    if (!phone) {
      return next();
    }
    
    // Accepte les formats internationaux et nationaux français
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: 'Format de numéro de téléphone invalide',
        field
      });
    }
    
    next();
  };
};

/**
 * Middleware pour valider la longueur minimale d'un champ
 * @param field Nom du champ à valider
 * @param minLength Longueur minimale requise
 */
export const validateMinLength = (field: string, minLength: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    
    if (!value) {
      return next();
    }
    
    if (value.length < minLength) {
      return res.status(400).json({
        status: 'error',
        message: `Le champ ${field} doit contenir au moins ${minLength} caractères`,
        field
      });
    }
    
    next();
  };
};