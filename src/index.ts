import app from './app';

// Port
const PORT = process.env.PORT || 3000;

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port localhost:${PORT}`);
  console.log(`🌐 Environnement: ${process.env.NODE_ENV}`);
});

// Gestion des erreurs non captées
process.on('uncaughtException', (error) => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesse rejetée non gérée:', error);
  process.exit(1);
});