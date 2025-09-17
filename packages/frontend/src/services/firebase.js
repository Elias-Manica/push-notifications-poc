/**
 * Firebase Service
 * 
 * Configuração e gerenciamento do Firebase Cloud Messaging
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbw3L4y-w5VwNEuinQ4yoZMt6lBNngAKQ",
  authDomain: "push-notifications-poc-9bb04.firebaseapp.com",
  projectId: "push-notifications-poc-9bb04",
  storageBucket: "push-notifications-poc-9bb04.firebasestorage.app",
  messagingSenderId: "503083108810",
  appId: "1:503083108810:web:39d77bb664be410b0c2733",
  measurementId: "G-JBPWZ5F005"
};;

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

class FirebaseService {
  constructor() {
    this.messaging = messaging;
    this.token = null;
  }

  async getFCMToken() {
    try {
      // Solicitar permissão para notificações
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Permissão para notificações negada');
      }

      // Obter token FCM
      const token = await getToken(this.messaging, {
        vapidKey: 'BIUh-MR009qIFw5_emosz52IKig3jGWw2AjdNcmyYKEKcINnMWOiqmoDqiACMI0SywY9ta3gW-rfd3f3V7t2-9o' // Substitua pela sua chave VAPID real
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
    onMessage(this.messaging, (payload) => {
      console.log('📨 Mensagem recebida:', payload);
      callback(payload);
    });
  }

  getToken() {
    return this.token;
  }
}

export default new FirebaseService();
