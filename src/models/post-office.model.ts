// Types pour les bureaux de poste et la géolocalisation
export interface GeoCoordinates {
    latitude: number;
    longitude: number;
  }
  
  export interface Address {
    streetNumber?: string;
    street: string;
    postalCode: string;
    city: string;
    country: string;
  }
  
  export interface OpeningHours {
    day: string;
    openingTime: string;
    closingTime: string;
    closed: boolean;
  }
  
  export interface PostOffice {
    id: string;
    name: string;
    type: string; // Type de bureau (bureau de poste, relais, etc.)
    address: Address;
    coordinates: GeoCoordinates;
    phone?: string;
    email?: string;
    openingHours: OpeningHours[];
    services: string[]; // Liste des services disponibles
    accessibility: string[]; // Informations d'accessibilité
    distance?: number; // Distance en mètres (pour les résultats de recherche à proximité)
  }
  
  export interface PostOfficeSearchResult {
    totalResults: number;
    offices: PostOffice[];
  }