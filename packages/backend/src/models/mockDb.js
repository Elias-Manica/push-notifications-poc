/**
 * Mock Database - Simula tabela device_tokens em memória
 * 
 * Estrutura:
 * - Key: fcm_token (string)
 * - Value: objeto com device_id, user_id, notification_consent_status, last_updated_at
 * 
 * TODO: Substituir por Firebase Admin SDK quando integrar com FCM real
 */

const deviceTokens = new Map();
console.log('🗄️  Mock Database inicializada');

function findByFcmToken(fcmToken) {
  return deviceTokens.get(fcmToken) || null;
}

function findByDeviceId(deviceId) {
  for (const [fcmToken, record] of deviceTokens) {
    if (record.device_id === deviceId) {
      return { fcmToken, record };
    }
  }
  return null;
}

function findByUserIdAndConsent(userId, consentStatus = 'granted') {
  const results = [];
  for (const [fcmToken, record] of deviceTokens) {
    if (record.user_id === userId && record.notification_consent_status === consentStatus) {
      results.push({ fcmToken, record });
    }
  }
  return results;
}

function upsert(fcmToken, data) {
  const existing = deviceTokens.get(fcmToken);
  const now = new Date().toISOString();

  if (existing) {
    const updatedRecord = {
      ...existing,
      ...data,
      last_updated_at: now
    };
    deviceTokens.set(fcmToken, updatedRecord);
    console.log(`📝 Registro atualizado: ${fcmToken} para user_id: ${data.user_id}`);
    return { action: 'updated', record: updatedRecord };
  } else {
    const newRecord = {
      fcm_token: fcmToken,
      device_id: data.device_id,
      user_id: data.user_id,
      notification_consent_status: data.notification_consent_status,
      last_updated_at: now
    };
    deviceTokens.set(fcmToken, newRecord);
    console.log(`✨ Novo registro criado: ${fcmToken} para user_id: ${data.user_id}`);
    return { action: 'created', record: newRecord };
  }
}

function deleteByFcmToken(fcmToken) {
  const deleted = deviceTokens.delete(fcmToken);
  if (deleted) {
    console.log(`🗑️  Registro removido: ${fcmToken}`);
  }
  return deleted;
}

function deleteByDeviceId(deviceId) {
  const found = findByDeviceId(deviceId);
  if (found) {
    deviceTokens.delete(found.fcmToken);
    console.log(`🗑️  Registro removido por device_id: ${deviceId} (fcm_token: ${found.fcmToken})`);
    return found;
  }
  return null;
}

function count() {
  return deviceTokens.size;
}

function getAll() {
  return Array.from(deviceTokens.entries()).map(([fcmToken, record]) => ({
    fcm_token: fcmToken,
    ...record
  }));
}

module.exports = {
  findByFcmToken,
  findByDeviceId,
  findByUserIdAndConsent,
  upsert,
  deleteByFcmToken,
  deleteByDeviceId,
  count,
  getAll
};
