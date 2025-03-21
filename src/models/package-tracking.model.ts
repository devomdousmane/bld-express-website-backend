// Types pour le suivi de colis
export interface TrackingEvent {
    code: string;
    date: string;
    location?: string;
    label: string;
    status: string;
  }
  
  export interface TrackingInfo {
    idShip: string; // Numéro de suivi
    product: string; // Type de produit postal
    isFinal: boolean; // Livraison terminée ou non
    status: string; // Statut actuel
    entryDate: string; // Date d'entrée dans le système
    deliveryDate?: string; // Date de livraison (peut être nulle)
    timeline: TrackingEvent[]; // Liste chronologique des événements
    url?: string; // URL pour suivre le colis sur le site de La Poste
  }
  
  export interface TrackingError {
    code: string;
    message: string;
    type: string;
  }
  
  export interface TrackingResponse {
    returnCode: number; // Code de retour (200 = OK)
    shipment?: TrackingInfo; // Informations de suivi (si disponible)
    error?: TrackingError; // Erreur (si applicable)
  }