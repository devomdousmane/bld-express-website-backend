import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Classe de service pour gérer les appels API de la Poste
export class PostApiService {
  private apiClient: AxiosInstance;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.POST_API_KEY || '';
    this.baseUrl = process.env.POST_API_BASE_URL || 'https://api.laposte.fr';
    
    // Création d'un client axios configuré
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Okapi-Key': this.apiKey
      },
      timeout: 10000 // Timeout de 10 secondes
    });

    // Intercepteur pour les réponses
    this.apiClient.interceptors.response.use(
      this.handleSuccess,
      this.handleError
    );
  }

  // Gestion des réponses réussies
  private handleSuccess(response: AxiosResponse): AxiosResponse {
    console.log(`[PostAPI] Réponse réussie: ${response.config.url}`);
    return response;
  }

  // Gestion centralisée des erreurs
  private handleError(error: any): Promise<never> {
    if (error.response) {
      // Erreur avec réponse du serveur (400, 401, 404, 500, etc.)
      console.error(`[PostAPI] Erreur ${error.response.status}: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      
      // Personnaliser la gestion selon le code d'erreur
      switch (error.response.status) {
        case 401:
          console.error('[PostAPI] Erreur d\'authentification - Vérifiez votre clé API');
          break;
        case 403:
          console.error('[PostAPI] Accès interdit - Vérifiez vos permissions');
          break;
        case 404:
          console.error('[PostAPI] Ressource non trouvée');
          break;
        case 429:
          console.error('[PostAPI] Trop de requêtes - Limite de taux dépassée');
          break;
        case 500:
        case 502:
        case 503:
          console.error('[PostAPI] Erreur serveur - Service indisponible');
          break;
      }
    } else if (error.request) {
      // Erreur sans réponse (problème réseau, timeout)
      console.error('[PostAPI] Pas de réponse reçue:', error.request);
    } else {
      // Erreur lors de la configuration de la requête
      console.error('[PostAPI] Erreur de configuration:', error.message);
    }

    return Promise.reject({
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Une erreur est survenue lors de la communication avec l\'API de la Poste',
      error: error.response?.data || error.message
    });
  }

  // Appel API pour suivre un colis
  async trackPackage(trackingNumber: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/suivi/v2/idships/${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Appel API pour obtenir les informations d'un bureau de poste
  async getPostOfficeInfo(id: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/datanova/v1/bureaux-poste/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Appel API pour rechercher les bureaux de poste à proximité
  async findNearbyPostOffices(latitude: number, longitude: number, radius: number = 5000): Promise<any> {
    try {
      const response = await this.apiClient.get(`/datanova/v1/bureaux-poste/`, {
        params: {
          lat: latitude,
          lon: longitude,
          radius: radius
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Méthode générique pour faire des appels API
  async makeRequest(endpoint: string, method: string = 'GET', data?: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const requestConfig: AxiosRequestConfig = {
        ...config,
        method,
        url: endpoint,
        data
      };
      
      const response = await this.apiClient.request(requestConfig);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const postApiService = new PostApiService();