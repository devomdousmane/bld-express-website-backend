// src/utils/logger.ts

import { config } from '../config';

/**
 * Niveaux de journalisation
 */
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Classe utilitaire pour la journalisation
 */
class Logger {
  private context: string;
  private static isProduction: boolean = config.server.environment === 'production';

  /**
   * Crée une nouvelle instance du logger
   * @param context Nom du contexte pour le logger (souvent le nom de la classe ou du module)
   */
  constructor(context: string = 'Global') {
    this.context = context;
  }

  /**
   * Journalise un message de débogage
   * @param message Message à journaliser
   * @param data Données supplémentaires à journaliser
   */
  debug(message: string, data?: any): void {
    if (!Logger.isProduction) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Journalise un message d'information
   * @param message Message à journaliser
   * @param data Données supplémentaires à journaliser
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Journalise un message d'avertissement
   * @param message Message à journaliser
   * @param data Données supplémentaires à journaliser
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Journalise un message d'erreur
   * @param message Message à journaliser
   * @param error Erreur ou données supplémentaires à journaliser
   */
  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    
    this.log(LogLevel.ERROR, message, errorData);
  }

  /**
   * Méthode interne pour formater et afficher les logs
   * @param level Niveau de journalisation
   * @param message Message à journaliser
   * @param data Données supplémentaires à journaliser
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    
    // Déterminer les couleurs pour différents niveaux (pour la console)
    let consoleMethod: 'log' | 'info' | 'warn' | 'error' = 'log';
    
    switch (level) {
      case LogLevel.DEBUG:
        consoleMethod = 'log';
        break;
      case LogLevel.INFO:
        consoleMethod = 'info';
        break;
      case LogLevel.WARN:
        consoleMethod = 'warn';
        break;
      case LogLevel.ERROR:
        consoleMethod = 'error';
        break;
    }
    
    // Format de base du message de journal
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    // Journaliser en utilisant la méthode console appropriée
    if (data !== undefined) {
      console[consoleMethod](logMessage, data);
    } else {
      console[consoleMethod](logMessage);
    }
  }
}

export default Logger;