/**
 * Firebase Admin Service
 * 
 * Serviço para envio real de notificações via Firebase Admin SDK
 * TODO: Configurar Service Account real para produção
 */

const admin = require('firebase-admin');

class FirebaseAdminService {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.initialized = false;
    this.mockMode = false;
  }

  /**
   * Inicializa o Firebase Admin SDK
   * @param {object} serviceAccount - Credenciais do Service Account
   */
  initialize(serviceAccount) {
    try {
      if (this.initialized) {
        console.log('✅ Firebase Admin já inicializado');
        return;
      }

      // Inicializar Firebase Admin
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });

      this.messaging = admin.messaging();
      this.initialized = true;
      this.mockMode = false;

      console.log('✅ Firebase Admin SDK inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin:', error);
      throw error;
    }
  }

  /**
   * Inicializa em modo mock para desenvolvimento
   */
  initializeMock() {
    try {
      if (this.initialized) {
        console.log('✅ Firebase Admin já inicializado (mock)');
        return;
      }

      // Tentar carregar credenciais reais primeiro
      const serviceAccountPath = require('path').join(__dirname, '../../firebase-adminsdk.json');
      
      try {
        const serviceAccount = require(serviceAccountPath);
        console.log('🔑 Credenciais reais encontradas, inicializando Firebase Admin...');
        this.initialize(serviceAccount);
        return;
      } catch (error) {
        console.log('🔧 Credenciais reais não encontradas, usando modo MOCK');
      }

      // Em modo mock, não inicializar o Firebase Admin real
      this.initialized = true;
      this.mockMode = true;
      this.app = { 
        options: { 
          projectId: 'push-notifications-poc-9bb04',
          credential: { privateKey: 'MOCK_PRIVATE_KEY' }
        } 
      };
      this.messaging = null;

      console.log('🔧 Firebase Admin inicializado em modo MOCK (simulação)');
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase Admin (mock):', error);
      throw error;
    }
  }

  /**
   * Envia notificação para um token FCM
   * @param {string} token - Token FCM do dispositivo
   * @param {object} notification - Dados da notificação
   * @returns {object} Resultado do envio
   */
  async sendToToken(token, notification) {
    if (!this.initialized) {
      throw new Error('Firebase Admin não inicializado');
    }

    try {
      // Em modo mock, simular envio
      if (this.mockMode) {
        console.log('🔧 MOCK: Simulando envio de notificação');
        console.log('📱 Token:', token);
        console.log('📋 Notificação:', notification);
        
        return {
          success: true,
          messageId: 'mock-message-id-' + Date.now(),
          mock: true
        };
      }

      // Envio real (quando configurado)
      const message = {
        token: token,
        notification: {
          title: notification.title || 'Push Notifications PoC',
          body: notification.body || 'Nova notificação'
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      
      console.log('✅ Notificação enviada:', response);
      return {
        success: true,
        messageId: response,
        mock: false
      };

    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      throw error;
    }
  }

  /**
   * Envia notificação para múltiplos tokens
   * @param {string[]} tokens - Array de tokens FCM
   * @param {object} notification - Dados da notificação
   * @returns {object} Resultado do envio
   */
  async sendToMultipleTokens(tokens, notification) {
    if (!this.initialized) {
      throw new Error('Firebase Admin não inicializado');
    }

    if (!tokens || tokens.length === 0) {
      return {
        success: true,
        successCount: 0,
        failureCount: 0,
        responses: []
      };
    }

    try {
      // Em modo mock, simular envio
      if (this.mockMode) {
        console.log('🔧 MOCK: Simulando envio para múltiplos tokens');
        console.log('📱 Tokens:', tokens);
        console.log('📋 Notificação:', notification);
        
        return {
          success: true,
          successCount: tokens.length,
          failureCount: 0,
          responses: tokens.map(token => ({
            success: true,
            messageId: 'mock-message-id-' + Date.now() + '-' + Math.random()
          })),
          mock: true
        };
      }

      // Envio real (quando configurado)
      const message = {
        tokens: tokens,
        notification: {
          title: notification.title || 'Push Notifications PoC',
          body: notification.body || 'Nova notificação'
        },
        data: notification.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.sendEachForMulticast(message);
      
      console.log('✅ Notificações enviadas:', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        mock: false
      };

    } catch (error) {
      console.error('❌ Erro ao enviar notificações:', error);
      throw error;
    }
  }

  /**
   * Valida se um token FCM é válido
   * @param {string} token - Token FCM
   * @returns {boolean} Se o token é válido
   */
  async validateToken(token) {
    if (!this.initialized) {
      throw new Error('Firebase Admin não inicializado');
    }

    try {
      // Em modo mock, sempre retornar true
      if (this.mockMode) {
        console.log('🔧 MOCK: Validando token (sempre válido)');
        return true;
      }

      // Validação real (quando configurado)
      const response = await this.messaging.send({
        token: token,
        data: { test: 'validation' }
      }, true); // dry run

      return !!response;
    } catch (error) {
      console.error('❌ Token inválido:', error.message);
      return false;
    }
  }

  /**
   * Retorna informações sobre o serviço
   * @returns {object} Status do serviço
   */
  getStatus() {
    return {
      initialized: this.initialized,
      projectId: this.app?.options?.projectId || null,
      mock: this.mockMode
    };
  }
}

// Instância singleton
const firebaseAdminService = new FirebaseAdminService();

module.exports = firebaseAdminService;