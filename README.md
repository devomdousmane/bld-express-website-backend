# BLD Express API Backend

API Backend pour le site BLD Express, gérant les formulaires de contact, demandes de devis et réservations de véhicules.

## Fonctionnalités

- Service d'emails avec support pour le développement (Nodemailer) et la production (SparkPost)
- API RESTful avec validation des données
- Gestion des formulaires de contact, devis et réservations de véhicules
- Journalisation avancée
- Architecture MVC avec séparation des routes, contrôleurs et services

## Prérequis

- Node.js 16.0.0 ou supérieur
- npm ou yarn
- Un compte SparkPost pour la production

## Installation

1. Cloner ce dépôt :

```bash
git clone https://github.com/votreutilisateur/bld-express-backend.git
cd bld-express-backend
```

2. Installer les dépendances :

```bash
npm install
```

3. Créer un fichier `.env` à partir du fichier `.env.example` :

```bash
cp .env.example .env
```

4. Modifier le fichier `.env` avec vos propres configurations.

## Développement

```bash
npm run dev
```

Cette commande lance le serveur en mode développement avec redémarrage automatique lors des modifications.

## Production

1. Construire l'application :

```bash
npm run build
```

2. Démarrer le serveur :

```bash
npm start
```

## Déploiement sur Render

### Configuration

1. Créez un nouveau service Web sur Render
2. Connectez votre dépôt Git
3. Utilisez les paramètres suivants :
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Variables d'environnement

Configurez les variables d'environnement suivantes dans l'interface Render :

```
NODE_ENV=production
PORT=10000
SPARKPOST_API_KEY=votre_cle_api_sparkpost
SPARKPOST_API_URL=https://api.eu.sparkpost.com/api/v1
EMAIL_SENDER_NAME=BLD Express
EMAIL_SENDER_ADDRESS=no-reply@bld-express.fr
CONTACT_EMAIL=contact@bld-express.fr
HEALTH_CHECK_API_KEY=une_cle_secrete_pour_les_tests_de_sante
```

## Structure du projet

```
├── src/
│   ├── controllers/       # Logique des contrôleurs
│   ├── middleware/        # Middlewares Express (validation, etc.)
│   ├── routes/            # Définition des routes API
│   ├── services/          # Services (email, etc.)
│   ├── utils/             # Utilitaires
│   ├── app.ts             # Configuration Express
│   ├── config.ts          # Configuration de l'application
│   └── server.ts          # Point d'entrée du serveur
├── .env                   # Variables d'environnement (non versionnées)
├── .env.example           # Exemple de variables d'environnement
├── .gitignore             # Fichiers ignorés par Git
├── package.json           # Configuration et dépendances
└── tsconfig.json          # Configuration TypeScript
```

## API Endpoints

### Points de santé

- **GET /api/health** - Vérifier l'état de l'API
- **GET /api/health/email?key=API_KEY** - Tester le service d'email

### Contact

- **POST /api/contact** - Envoyer un message de contact

### Devis

- **POST /api/quote** - Soumettre une demande de devis

### Réservation de véhicule

- **POST /api/vehicle-reservation** - Créer une réservation de véhicule

## Exemple de requête - Contact

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+33612345678",
    "subject": "Demande d'information",
    "message": "Bonjour, je souhaite obtenir plus d'informations sur vos services."
  }'
```

## Maintenance

### Logs

En production, les logs sont formatés pour être facilement exploitables par les outils de gestion de logs.

### Mise à jour des dépendances

```bash
npm outdated
npm update
```

Pour les mises à jour majeures :

```bash
npx npm-check-updates -u
npm install
```

## Licence

Propriétaire - Tous droits réservés.
