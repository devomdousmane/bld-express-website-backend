// src/routes/health.routes.ts

import { Router } from 'express';
import { emailService } from '../services/email.service';
import { config } from '../config';

const router = Router();

// Route simple pour vérifier que le serveur fonctionne
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'BLD Express API',
    version: '1.0.0',
    environment: config.server.environment,
    timestamp: new Date().toISOString()
  });
});

// Route pour vérifier la connexion avec le service d'emails
// Cette route est sécurisée par une clé API simple
router.get('/email', async (req, res) => {
  // Vérification basique d'une clé API
  const apiKey = req.query.key || req.headers['x-api-key'];
  
  // Définir une clé API simple pour ce test (à définir dans les variables d'environnement)
  const validApiKey = process.env.HEALTH_CHECK_API_KEY || 'api_test_key';
  
  if (apiKey !== validApiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Clé API non valide'
    });
  }
  
  try {
    // Envoyer un email de test au destinataire spécifié, ou à l'adresse de contact par défaut
    const testEmail = {
      to: process.env.TEST_EMAIL || config.email.contactRecipient,
      subject: 'Test de l\'API BLD Express',
      text: `Ceci est un email de test envoyé par l'API BLD Express à ${new Date().toISOString()}`,
      html: `<p>Ceci est un email de test envoyé par l'API BLD Express à ${new Date().toISOString()}</p>`
    };
    
    await emailService.sendEmail(testEmail);
    
    return res.status(200).json({
      status: 'success',
      message: 'Service email opérationnel'
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors du test du service email',
      error: error.message
    });
  }
});

export default router;