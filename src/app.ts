import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler,loggerMiddleware, rateLimiter, validateApiParams } from './middleware';

// Importer les routes
import apiRoutes from './routes';
import morgan from 'morgan';
import { config } from './config';

// Charger les variables d'environnement
dotenv.config();

const app: Application = express();

// Middleware
app.use(helmet()); // Sécurité
app.use(cors()); // Gérer les requêtes CORS
app.use(express.json()); // Parser les requêtes JSON
app.use(express.urlencoded({ extended: true })); // Parser les données des formulaires
app.use(loggerMiddleware); // Middleware de journalisation
app.use(rateLimiter); // Limiter le taux de requêtes
app.use(morgan(config.server.environment === 'production' ? 'combined' : 'dev'));

// Préfixe API défini dans le fichier .env
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Route racine
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'BLD Express API',
    version: '1.0.0',
    environment: config.server.environment
  });
});



// Routes API
app.use(`${API_PREFIX}`, apiRoutes);

app.use(validateApiParams);
// Middleware pour les routes non trouvées - doit être après toutes les routes
app.use(notFoundHandler);

// Middleware de gestion des erreurs - doit être le dernier middleware
app.use(errorHandler);

export default app;