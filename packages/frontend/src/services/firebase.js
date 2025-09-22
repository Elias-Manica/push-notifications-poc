/**
 * Firebase Service
 *
 * Configuração e gerenciamento do Firebase Cloud Messaging
 */

import { initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAbw3L4y-w5VwNEuinQ4yoZMt6lBNngAKQ',
  authDomain: 'push-notifications-poc-9bb04.firebaseapp.com',
  projectId: 'push-notifications-poc-9bb04',
  storageBucket: 'push-notifications-poc-9bb04.firebasestorage.app',
  messagingSenderId: '503083108810',
  appId: '1:503083108810:web:39d77bb664be410b0c2733',
  measurementId: 'G-JBPWZ5F005',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Evitar inicializar Messaging em ambientes não suportados (ex.: WebView nativa do Capacitor)
let messaging = null;
(async () => {
  try {
    const supported = !Capacitor.isNativePlatform() && (await isSupported());
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.log(
        'ℹ️ Firebase Messaging não suportado neste ambiente; usando Capacitor no mobile.'
      );
    }
  } catch (e) {
    console.warn(
      '⚠️ Messaging isSupported() falhou, desabilitando Firebase Messaging:',
      e?.message || e
    );
  }
})();

class FirebaseService {
  constructor() {
    this.messaging = messaging;
    this.token = null;
  }

  async getFCMToken() {
    try {
      if (!messaging) {
        throw new Error('Firebase Messaging não suportado neste ambiente');
      }

      // Solicitar permissão para notificações
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada');
      }

      // Obter token FCM
      const token = await getToken(messaging, {
        vapidKey:
          'BIUh-MR009qIFw5_emosz52IKig3jGWw2AjdNcmyYKEKcINnMWOiqmoDqiACMI0SywY9ta3gW-rfd3f3V7t2-9o',
      });

      if (!token) {
        throw new Error('Não foi possível obter o token FCM');
      }

      this.token = token;
      console.log('✅ Token FCM obtido:', token);
      return token;
    } catch (error) {
      console.error('❌ Erro ao obter token FCM:', error);
      throw error;
    }
  }

  onMessage(callback) {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log('📨 Mensagem recebida:', payload);
      callback(payload);
    });
  }

  getToken() {
    return this.token;
  }
}

export default new FirebaseService();
