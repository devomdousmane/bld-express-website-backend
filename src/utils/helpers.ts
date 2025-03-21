/**
 * Fonctions utilitaires pour l'application
 */

/**
 * Valide un numéro de suivi de colis selon les formats connus de La Poste
 * @param trackingNumber Numéro de suivi à valider
 * @returns {boolean} Vrai si le format est valide
 */
export const isValidTrackingNumber = (trackingNumber: string): boolean => {
    if (!trackingNumber) return false;
    
    // Différents formats de numéros de suivi de La Poste
    const patterns = [
      /^[A-Z]{2}\d{9}[A-Z]{2}$/i, // Format international (ex: RB123456789FR)
      /^\d{13}$/,                 // Format Colissimo France (13 chiffres)
      /^[A-Z]{2}\d{9}$/i,         // Format avec préfixe (ex: CP123456789)
      /^[A-Z0-9]{12,14}$/i        // Format générique
    ];
    
    return patterns.some(pattern => pattern.test(trackingNumber));
  };
  
  /**
   * Formate un numéro de téléphone français
   * @param phone Numéro de téléphone à formater
   * @returns {string} Numéro formaté (ex: 01 23 45 67 89)
   */
  export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    
    // Vérifier si c'est un numéro français (10 chiffres commençant par 0)
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    // Sinon retourner le numéro tel quel
    return phone;
  };
  
  /**
   * Calcule la distance entre deux points géographiques (formule de Haversine)
   * @param lat1 Latitude du point 1
   * @param lon1 Longitude du point 1
   * @param lat2 Latitude du point 2
   * @param lon2 Longitude du point 2
   * @returns {number} Distance en kilomètres
   */
  export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance en km
    
    return distance;
  };
  
  /**
   * Convertit des degrés en radians
   * @param degrees Angle en degrés
   * @returns {number} Angle en radians
   */
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };
  
  /**
   * Génère un identifiant unique
   * @returns {string} Identifiant unique
   */
  export const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  /**
   * Formate une date au format français
   * @param date Date à formater
   * @param includeTime Inclure l'heure
   * @returns {string} Date formatée (ex: 01/01/2023 12:00)
   */
  export const formatDate = (date: Date | string, includeTime: boolean = false): string => {
    const d = new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
      return '';
    }
    
    // Format date: JJ/MM/AAAA
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = d.getFullYear();
    
    let formatted = `${day}/${month}/${year}`;
    
    // Ajouter l'heure si demandé
    if (includeTime) {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      formatted += ` ${hours}:${minutes}`;
    }
    
    return formatted;
  };