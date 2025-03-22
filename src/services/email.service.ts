// src/services/email.service.ts

import nodemailer from 'nodemailer';
import SparkPost from 'sparkpost';
import { config } from '../config';
import Logger from '../utils/logger';

// Créer une instance du logger pour ce service
const logger = new Logger('EmailService');

// Interface pour les pièces jointes
interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

// Interface pour les emails
interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Attachment[];
}

// Classe abstraite pour les transports d'email
abstract class EmailTransport {
  abstract sendEmail(options: EmailOptions): Promise<any>;
}

// Transport SparkPost pour la production
class SparkPostTransport extends EmailTransport {
  private client: SparkPost;
  private senderName: string;
  private senderEmail: string;

  constructor() {
    super();
    this.client = new SparkPost(process.env.SPARKPOST_API_KEY as string, {
      endpoint: process.env.SPARKPOST_API_URL
    });
    this.senderName = process.env.EMAIL_SENDER_NAME as string || 'BLD Express';
    this.senderEmail = process.env.EMAIL_SENDER_ADDRESS as string || 'no-reply@bld-express.fr';
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    const { to, subject, text, html, cc, bcc, replyTo, attachments } = options;

    // Préparer les options pour SparkPost
    const transmissionOptions: any = {
      content: {
        from: {
          name: this.senderName,
          email: this.senderEmail
        },
        subject,
        text,
        html
      },
      recipients: Array.isArray(to) 
        ? to.map(email => ({ address: { email } })) 
        : [{ address: { email: to } }]
    };

    // Ajouter CC si présent
    if (cc) {
      const ccRecipients = Array.isArray(cc) 
        ? cc.map(email => ({ address: { email, header_to: to } })) 
        : [{ address: { email: cc, header_to: to } }];
      
      transmissionOptions.recipients = [...transmissionOptions.recipients, ...ccRecipients];
    }

    // Ajouter BCC si présent
    if (bcc) {
      const bccRecipients = Array.isArray(bcc) 
        ? bcc.map(email => ({ address: { email, header_to: to } })) 
        : [{ address: { email: bcc, header_to: to } }];
      
      transmissionOptions.recipients = [...transmissionOptions.recipients, ...bccRecipients];
    }

    // Ajouter Reply-To si présent
    if (replyTo) {
      transmissionOptions.content.reply_to = replyTo;
    }

    // Ajouter pièces jointes si présentes
    if (attachments && attachments.length > 0) {
      transmissionOptions.content.attachments = attachments.map(attachment => ({
        name: attachment.filename,
        type: attachment.contentType || 'application/octet-stream',
        data: attachment.content.toString('base64')
      }));
    }

    try {
      const result = await this.client.transmissions.send(transmissionOptions);
      logger.info('Email envoyé via SparkPost', { 
        to: Array.isArray(to) ? to.join(', ') : to,
        subject
      });
      return result;
    } catch (error: any) {
      logger.error('Erreur lors de l\'envoi via SparkPost', error);
      throw new Error(`Erreur d'envoi d'email: ${error.message}`);
    }
  }
}


// Transport Nodemailer pour le développement
// Transport Nodemailer pour le développement
class NodemailerTransport extends EmailTransport {
  private transporter: nodemailer.Transporter;
  private senderName: string;
  private senderEmail: string;

  constructor() {
    super();
    this.senderName = config.email.senderName;
    this.senderEmail = config.email.user || 'test@example.com';
    
    if (config.email.testMode) {
      logger.info('Initialisation de Nodemailer en mode TEST');
      // Créer un transport "jsonTransport" ou "streamTransport" qui n'envoie pas réellement d'emails
      this.transporter = nodemailer.createTransport({
        jsonTransport: true  // Stocke les emails sous forme d'objets JSON
      });
      logger.info('Transport de test Nodemailer configuré avec succès');
    } else {
      logger.info('Initialisation de Nodemailer avec configuration SMTP');
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.password
        }
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    const { to, subject, text, html, cc, bcc, replyTo, attachments } = options;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${this.senderName}" <${this.senderEmail}>`,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      replyTo,
      attachments
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      if (config.email.testMode) {
        // Pour le mode test, afficher les détails de l'email
        logger.info('Email capturé en mode TEST (pas d\'envoi réel)', { 
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          envelope: info.envelope,
          messageId: info.messageId
        });
        
        // Si jsonTransport est utilisé, l'email complet est disponible dans info.message
        if (info.message) {
          logger.debug('Contenu de l\'email:', {
            emailContent: JSON.parse(info.message)
          });
        }
      } else {
        logger.info('Email envoyé avec succès', { 
          to: Array.isArray(to) ? to.join(', ') : to,
          subject,
          messageId: info.messageId
        });
      }
      
      return info;
    } catch (error: any) {
      logger.error('Erreur lors de l\'envoi via Nodemailer', error);
      throw new Error(`Erreur d'envoi d'email: ${error.message}`);
    }
  }
}

// Factory pour créer le transport approprié
class EmailServiceFactory {
  static createTransport(): EmailTransport {
    const environment = process.env.NODE_ENV || 'development';
    
    if (environment === 'production') {
      logger.info('Initialisation du transport SparkPost pour la production');
      return new SparkPostTransport();
    } else {
      // Vérifie si le mode test est activé
      if (config.email.testMode) {
        logger.info('Initialisation du transport Nodemailer en mode TEST');
      } else {
        logger.info('Initialisation du transport Nodemailer standard pour le développement');
      }
      return new NodemailerTransport();
    }
  }
}
// Service d'email principal
class EmailService {
  private transport: EmailTransport;

  constructor() {
    this.transport = EmailServiceFactory.createTransport();
  }

  async sendEmail(options: EmailOptions): Promise<any> {
    return this.transport.sendEmail(options);
  }

  // Méthode pour envoyer des emails de contact
  async sendContactEmail(formData: any): Promise<any> {
    const { name, email, phone, subject, message } = formData;
    
    const html = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
      <p><strong>Sujet:</strong> ${subject}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    const text = `
      Nouveau message de contact
      
      Nom: ${name}
      Email: ${email}
      Téléphone: ${phone || 'Non fourni'}
      Sujet: ${subject}
      
      Message:
      ${message}
    `;

    return this.sendEmail({
      to: config.email.contactRecipient,
      subject: `Nouveau message de contact: ${subject}`,
      html,
      text,
      replyTo: email
    });
  }

  // Méthode pour envoyer une confirmation au client
  async sendContactConfirmation(formData: any): Promise<any> {
    const { name, email, subject } = formData;
    
    const html = `
      <h2>Confirmation de votre message</h2>
      <p>Bonjour ${name},</p>
      <p>Nous avons bien reçu votre message concernant "${subject}".</p>
      <p>Notre équipe va l'analyser et vous répondra dans les plus brefs délais.</p>
      <p>Merci de nous avoir contactés.</p>
      <p>Cordialement,</p>
      <p>L'équipe de BLD Express</p>
    `;

    const text = `
      Confirmation de votre message
      
      Bonjour ${name},
      
      Nous avons bien reçu votre message concernant "${subject}".
      Notre équipe va l'analyser et vous répondra dans les plus brefs délais.
      
      Merci de nous avoir contactés.
      
      Cordialement,
      L'équipe de BLD Express
    `;

    return this.sendEmail({
      to: email,
      subject: `Confirmation de votre message: ${subject}`,
      html,
      text
    });
  }

  // Méthode pour envoyer des emails de devis
  async sendQuoteEmail(formData: any): Promise<any> {
    const { name, email, type, pickup, delivery, date, description } = formData;
    
    const html = `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type de service:</strong> ${type}</p>
      <p><strong>Adresse de départ:</strong> ${pickup}</p>
      <p><strong>Adresse de livraison:</strong> ${delivery}</p>
      <p><strong>Date souhaitée:</strong> ${date}</p>
      <h3>Description:</h3>
      <p>${description.replace(/\n/g, '<br>')}</p>
    `;

    const text = `
      Nouvelle demande de devis
      
      Nom: ${name}
      Email: ${email}
      Type de service: ${type}
      Adresse de départ: ${pickup}
      Adresse de livraison: ${delivery}
      Date souhaitée: ${date}
      
      Description:
      ${description}
    `;

    return this.sendEmail({
      to: config.email.contactRecipient,
      subject: `Nouvelle demande de devis - ${type}`,
      html,
      text,
      replyTo: email
    });
  }

  // Méthode pour envoyer une confirmation de devis au client
  async sendQuoteConfirmation(formData: any): Promise<any> {
    const { name, email, type } = formData;
    
    const html = `
      <h2>Confirmation de votre demande de devis</h2>
      <p>Bonjour ${name},</p>
      <p>Nous avons bien reçu votre demande de devis pour notre service de "${type}".</p>
      <p>Notre équipe commerciale va étudier votre demande et vous contactera dans les 24 heures ouvrées pour vous proposer une offre adaptée à vos besoins.</p>
      <p>Merci de votre confiance.</p>
      <p>Cordialement,</p>
      <p>L'équipe de BLD Express</p>
    `;

    const text = `
      Confirmation de votre demande de devis
      
      Bonjour ${name},
      
      Nous avons bien reçu votre demande de devis pour notre service de "${type}".
      Notre équipe commerciale va étudier votre demande et vous contactera dans les 24 heures ouvrées pour vous proposer une offre adaptée à vos besoins.
      
      Merci de votre confiance.
      
      Cordialement,
      L'équipe de BLD Express
    `;

    return this.sendEmail({
      to: email,
      subject: `Confirmation de votre demande de devis - BLD Express`,
      html,
      text
    });
  }

  // Méthode pour envoyer des emails de réservation de véhicule
  async sendVehicleReservationEmail(formData: any): Promise<any> {
    const { 
      name, 
      email, 
      phone, 
      startDate, 
      endDate, 
      startTime, 
      endTime, 
      pickupLocation, 
      dropoffLocation, 
      additionalServices 
    } = formData;
    
    const servicesText = additionalServices && additionalServices.length 
      ? additionalServices.join(', ') 
      : 'Aucun service additionnel';
    
    const html = `
      <h2>Nouvelle réservation de véhicule</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone}</p>
      <h3>Détails de la réservation:</h3>
      <p><strong>Date de début:</strong> ${startDate} à ${startTime}</p>
      <p><strong>Date de fin:</strong> ${endDate} à ${endTime}</p>
      <p><strong>Lieu de prise en charge:</strong> ${pickupLocation}</p>
      <p><strong>Lieu de retour:</strong> ${dropoffLocation}</p>
      <p><strong>Services additionnels:</strong> ${servicesText}</p>
    `;

    const text = `
      Nouvelle réservation de véhicule
      
      Nom: ${name}
      Email: ${email}
      Téléphone: ${phone}
      
      Détails de la réservation:
      Date de début: ${startDate} à ${startTime}
      Date de fin: ${endDate} à ${endTime}
      Lieu de prise en charge: ${pickupLocation}
      Lieu de retour: ${dropoffLocation}
      Services additionnels: ${servicesText}
    `;

    return this.sendEmail({
      to: config.email.contactRecipient,
      subject: `Nouvelle réservation de véhicule`,
      html,
      text,
      replyTo: email
    });
  }

  // Méthode pour envoyer une confirmation de réservation au client
  async sendVehicleReservationConfirmation(formData: any): Promise<any> {
    const { name, email, startDate, endDate, startTime, endTime, pickupLocation } = formData;
    
    const html = `
      <h2>Confirmation de votre réservation de véhicule</h2>
      <p>Bonjour ${name},</p>
      <p>Nous avons bien reçu votre réservation de véhicule.</p>
      <p><strong>Détails de la réservation:</strong></p>
      <p>Date de début: ${startDate} à ${startTime}</p>
      <p>Date de fin: ${endDate} à ${endTime}</p>
      <p>Lieu de prise en charge: ${pickupLocation}</p>
      <p>Un membre de notre équipe vous contactera prochainement pour confirmer tous les détails.</p>
      <p>Merci de votre confiance.</p>
      <p>Cordialement,</p>
      <p>L'équipe de BLD Express</p>
    `;

    const text = `
      Confirmation de votre réservation de véhicule
      
      Bonjour ${name},
      
      Nous avons bien reçu votre réservation de véhicule.
      
      Détails de la réservation:
      Date de début: ${startDate} à ${startTime}
      Date de fin: ${endDate} à ${endTime}
      Lieu de prise en charge: ${pickupLocation}
      
      Un membre de notre équipe vous contactera prochainement pour confirmer tous les détails.
      
      Merci de votre confiance.
      
      Cordialement,
      L'équipe de BLD Express
    `;

    return this.sendEmail({
      to: email,
      subject: `Confirmation de réservation de véhicule - BLD Express`,
      html,
      text
    });
  }
}

// Créer et exporter une instance unique du service
export const emailService = new EmailService();