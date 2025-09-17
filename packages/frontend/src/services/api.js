/**
 * API Service
 * 
 * Comunicação com o backend para gerenciar tokens FCM
 */

const API_BASE_URL = 'http://localhost:3000/api/v1';

class ApiService {
  async registerToken(tokenData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao registrar token');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao registrar token:', error);
      throw error;
    }
  }

  async removeToken(deviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/tokens/${deviceId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao remover token');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao remover token:', error);
      throw error;
    }
  }

  async getTokenCount() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/tokens/count`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao contar tokens');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao contar tokens:', error);
      throw error;
    }
  }

  async getAllTokens() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/tokens`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao listar tokens');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao listar tokens:', error);
      throw error;
    }
  }

  async simulateNotification(notificationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao simular notificação');
      }

      return result;
    } catch (error) {
      console.error('❌ Erro ao simular notificação:', error);
      throw error;
    }
  }
}

export default new ApiService();
