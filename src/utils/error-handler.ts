// Types d'erreurs
export enum ErrorType {
    VALIDATION = 'VALIDATION_ERROR',
    AUTHENTICATION = 'AUTHENTICATION_ERROR',
    AUTHORIZATION = 'AUTHORIZATION_ERROR',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
    EXTERNAL_API = 'EXTERNAL_API_ERROR',
    INTERNAL_SERVER = 'INTERNAL_SERVER_ERROR',
    RATE_LIMIT = 'RATE_LIMIT_ERROR',
    BAD_REQUEST = 'BAD_REQUEST_ERROR'
  }
  
  // Codes HTTP correspondants
  export const ErrorStatusMap: Record<ErrorType, number> = {
    [ErrorType.VALIDATION]: 400,
    [ErrorType.AUTHENTICATION]: 401,
    [ErrorType.AUTHORIZATION]: 403,
    [ErrorType.RESOURCE_NOT_FOUND]: 404,
    [ErrorType.RESOURCE_CONFLICT]: 409,
    [ErrorType.SERVICE_UNAVAILABLE]: 503,
    [ErrorType.EXTERNAL_API]: 502,
    [ErrorType.INTERNAL_SERVER]: 500,
    [ErrorType.RATE_LIMIT]: 429,
    [ErrorType.BAD_REQUEST]: 400
  };
  
  // Interface pour les erreurs API
  export interface ApiError {
    type: ErrorType;
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
    path?: string;
  }
  
  // Classe pour créer des erreurs avec des informations cohérentes
  export class AppError extends Error {
    public readonly type: ErrorType;
    public readonly details: any;
    public readonly code: string;
    public readonly timestamp: string;
    public readonly status: number;
  
    constructor(type: ErrorType, message: string, details?: any, code?: string) {
      super(message);
      this.type = type;
      this.details = details;
      this.code = code || type;
      this.timestamp = new Date().toISOString();
      this.status = ErrorStatusMap[type];
      
      // Nécessaire pour étendre Error correctement en TypeScript
      Object.setPrototypeOf(this, AppError.prototype);
    }
  
    // Convertir l'erreur en objet pour la réponse API
    public toResponse(path?: string): ApiError {
      return {
        type: this.type,
        message: this.message,
        code: this.code,
        details: this.details,
        timestamp: this.timestamp,
        path: path
      };
    }
  }
  
  // Fonctions d'aide pour créer des erreurs spécifiques
  export const createError = {
    validation: (message: string, details?: any) => 
      new AppError(ErrorType.VALIDATION, message, details),
    
    authentication: (message: string = 'Authentification requise') => 
      new AppError(ErrorType.AUTHENTICATION, message),
    
    authorization: (message: string = 'Accès non autorisé') => 
      new AppError(ErrorType.AUTHORIZATION, message),
    
    notFound: (resource: string = 'Ressource') => 
      new AppError(ErrorType.RESOURCE_NOT_FOUND, `${resource} non trouvé(e)`),
    
    conflict: (message: string, details?: any) => 
      new AppError(ErrorType.RESOURCE_CONFLICT, message, details),
    
    serviceUnavailable: (service: string, details?: any) => 
      new AppError(ErrorType.SERVICE_UNAVAILABLE, `Service ${service} indisponible`, details),
    
    externalApi: (api: string, message: string, details?: any) => 
      new AppError(ErrorType.EXTERNAL_API, `Erreur API externe (${api}): ${message}`, details),
    
    internal: (message: string = 'Erreur interne du serveur', details?: any) => 
      new AppError(ErrorType.INTERNAL_SERVER, message, details),
    
    rateLimit: (message: string = 'Limite de taux dépassée', details?: any) => 
      new AppError(ErrorType.RATE_LIMIT, message, details),
    
    badRequest: (message: string, details?: any) => 
      new AppError(ErrorType.BAD_REQUEST, message, details)
  };