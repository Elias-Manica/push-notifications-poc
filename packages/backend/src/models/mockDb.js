/**
 * Mock Database - Simula tabela device_tokens em memória
 * 
 * Estrutura:
 * - Key: fcm_token (string)
 * - Value: objeto com device_id, user_id, notification_consent_status, last_updated_at
 * 
 * TODO: Substituir por Firebase Admin SDK quando integrar com FCM real
 */

class MockDatabase {
  constructor() {
    this.deviceTokens = new Map();
    console.log('🗄️  Mock Database inicializada');
  }

  /**
   * Busca um registro pelo fcm_token
   * @param {string} fcmToken 
   * @returns {object|null}
   */
  findByFcmToken(fcmToken) {
    return this.deviceTokens.get(fcmToken) || null;
  }

  /**
   * Busca registros pelo device_id
   * @param {string} deviceId 
   * @returns {object|null}
   */
  findByDeviceId(deviceId) {
    for (const [fcmToken, record] of this.deviceTokens) {
      if (record.device_id === deviceId) {
        return { fcmToken, record };
      }
    }
    return null;
  }

  /**
   * Busca registros por user_id e status de consentimento
   * @param {string} userId 
   * @param {string} consentStatus 
   * @returns {Array}
   */
  findByUserIdAndConsent(userId, consentStatus = 'granted') {
    const results = [];
    for (const [fcmToken, record] of this.deviceTokens) {
      if (record.user_id === userId && record.notification_consent_status === consentStatus) {
        results.push({ fcmToken, record });
      }
    }
    return results;
  }

  /**
   * Cria ou atualiza um registro
   * @param {string} fcmToken 
   * @param {object} data 
   * @returns {object} { action: 'created'|'updated', record: object }
   */
  upsert(fcmToken, data) {
    const existing = this.deviceTokens.get(fcmToken);
    const now = new Date().toISOString();
    
    if (existing) {
      // Atualizar registro existente
      const updatedRecord = {
        ...existing,
        ...data,
        last_updated_at: now
      };
      this.deviceTokens.set(fcmToken, updatedRecord);
      console.log(`📝 Registro atualizado: ${fcmToken} para user_id: ${data.user_id}`);
      return { action: 'updated', record: updatedRecord };
    } else {
      // Criar novo registro
      const newRecord = {
        fcm_token: fcmToken,
        device_id: data.device_id,
        user_id: data.user_id,
        notification_consent_status: data.notification_consent_status,
        last_updated_at: now
      };
      this.deviceTokens.set(fcmToken, newRecord);
      console.log(`✨ Novo registro criado: ${fcmToken} para user_id: ${data.user_id}`);
      return { action: 'created', record: newRecord };
    }
  }

  /**
   * Remove um registro pelo fcm_token
   * @param {string} fcmToken 
   * @returns {boolean}
   */
  deleteByFcmToken(fcmToken) {
    const deleted = this.deviceTokens.delete(fcmToken);
    if (deleted) {
      console.log(`🗑️  Registro removido: ${fcmToken}`);
    }
    return deleted;
  }

  /**
   * Remove um registro pelo device_id
   * @param {string} deviceId 
   * @returns {object|null} { fcmToken, record } se encontrado, null caso contrário
   */
  deleteByDeviceId(deviceId) {
    const found = this.findByDeviceId(deviceId);
    if (found) {
      this.deviceTokens.delete(found.fcmToken);
      console.log(`🗑️  Registro removido por device_id: ${deviceId} (fcm_token: ${found.fcmToken})`);
      return found;
    }
    return null;
  }

  /**
   * Retorna a quantidade total de registros
   * @returns {number}
   */
  count() {
    return this.deviceTokens.size;
  }

  /**
   * Retorna todos os registros (para debug)
   * @returns {Array}
   */
  getAll() {
    return Array.from(this.deviceTokens.entries()).map(([fcmToken, record]) => ({
      fcm_token: fcmToken,
      ...record
    }));
  }
}

// Instância singleton do banco mock
const mockDb = new MockDatabase();

module.exports = mockDb;
