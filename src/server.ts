// src/server.ts

import app from './app';
import { config } from './config';

// Obtenir le port sur lequel le serveur doit fonctionner
const PORT = config.server.port;

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`=== BLD Express Backend Service ===`);
  console.log(`Serveur démarré sur le port ${PORT} en mode ${config.server.environment}`);
  console.log(`URL locale: http://localhost:${PORT}`);
  console.log(`Date de démarrage: ${new Date().toISOString()}`);
  console.log(`===================================`);
});

// Gérer les signaux de terminaison proprement
const handleShutdown = (signal: string) => {
  console.log(`\n${signal} reçu. Arrêt du serveur...`);
  server.close(() => {
    console.log('Serveur arrêté proprement.');
    process.exit(0);
  });
  
  // Si le serveur ne se ferme pas en 10 secondes, forcer la fermeture
  setTimeout(() => {
    console.error('Fermeture forcée du serveur après délai d\'attente.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default server;