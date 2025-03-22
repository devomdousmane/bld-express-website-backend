// src/config.ts

// Importation de dotenv pour charger les variables d'environnement depuis un fichier .env
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de l'application
export const config = {
  // Configuration du serveur
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Configuration des emails
  email: {
    // Nodemailer (développement)
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || 'user@example.com',
    password: process.env.EMAIL_PASSWORD || 'password',
    testMode: process.env.EMAIL_TEST_MODE === 'true',
    
    // Configuration commune
    senderName: process.env.EMAIL_SENDER_NAME || 'BLD Express',
    senderAddress: process.env.EMAIL_SENDER_ADDRESS || 'no-reply@bld-express.fr',
    contactRecipient: process.env.CONTACT_EMAIL || 'contact@bld-express.fr',
    
    // SparkPost (production)
    sparkpost: {
      apiKey: process.env.SPARKPOST_API_KEY || '',
      apiUrl: process.env.SPARKPOST_API_URL || 'https://api.eu.sparkpost.com/api/v1'
    }
  }
};