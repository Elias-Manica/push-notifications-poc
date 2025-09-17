/**
 * Serviço de Notificações
 * 
 * Funções puras para gerenciar tokens FCM e simular envios
 * TODO: Integrar com Firebase Admin SDK para envios reais
 */

const mockDb = require('../models/mockDb');
const firebaseAdminService = require('./firebaseAdmin');

function validateTokenData(data) {
  const errors = [];
  if (!data.fcm_token || typeof data.fcm_token !== 'string') {
    errors.push('fcm_token é obrigatório e deve ser uma string');
  }
  if (!data.device_id || typeof data.device_id !== 'string') {
    errors.push('device_id é obrigatório e deve ser uma string');
  }
  if (!data.user_id || typeof data.user_id !== 'string') {
    errors.push('user_id é obrigatório e deve ser uma string');
  }
  const validConsentStatuses = ['granted', 'denied', 'default'];
  if (!data.notification_consent_status || !validConsentStatuses.includes(data.notification_consent_status)) {
    errors.push('notification_consent_status é obrigatório e deve ser: granted, denied ou default');
  }
  return { isValid: errors.length === 0, errors };
}

async function registerToken(data) {
  const validation = validateTokenData(data);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }
  try {
    const result = mockDb.upsert(data.fcm_token, {
      device_id: data.device_id,
      user_id: data.user_id,
      notification_consent_status: data.notification_consent_status
    });
    return { success: true, action: result.action, record: result.record };
  } catch (error) {
    console.error('❌ Erro ao registrar token:', error);
    return { success: false, errors: ['Erro interno do servidor'] };
  }
}

async function removeTokenByDeviceId(deviceId) {
  try {
    const result = mockDb.deleteByDeviceId(deviceId);
    if (result) {
      return { success: true, removed: true, removedDeviceId: deviceId };
    }
    return { success: false, message: 'Device not found' };
  } catch (error) {
    console.error('❌ Erro ao remover token:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

async function getTokenCount() {
  try {
    const count = mockDb.count();
    return { success: true, count };
  } catch (error) {
    console.error('❌ Erro ao contar tokens:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

async function getAllTokens() {
  try {
    const tokens = mockDb.getAll();
    console.log(`📋 Listando ${tokens.length} tokens registrados`);
    return { success: true, tokens, count: tokens.length };
  } catch (error) {
    console.error('❌ Erro ao listar tokens:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

async function simulateNotification(data) {
  const { user_id, account_id, notification_payload } = data;
  if (!user_id) {
    return { success: false, message: 'user_id é obrigatório' };
  }
  try {
    const userTokens = mockDb.findByUserIdAndConsent(user_id, 'granted');
    if (userTokens.length === 0) {
      console.log(`📭 Nenhum token encontrado para user_id: ${user_id} com consentimento 'granted'`);
      return { success: true, targets: [], simulatedResult: 'no_targets', message: 'Nenhum token encontrado com consentimento para notificações' };
    }
    
    const fcmTokens = userTokens.map(item => item.fcmToken);
    console.log(`📤 Enviando notificação para user_id: ${user_id}`);
    console.log(`📱 Payload:`, notification_payload);
    console.log(`🎯 Tokens FCM que receberão:`, fcmTokens);

    // Inicializar Firebase Admin se não estiver inicializado
    if (!firebaseAdminService.initialized) {
      firebaseAdminService.initializeMock();
    }

    // Enviar notificação real via Firebase Admin
    const result = await firebaseAdminService.sendToMultipleTokens(fcmTokens, notification_payload);
    
    console.log('✅ Resultado do envio:', result);
    
    return { 
      success: true, 
      targets: fcmTokens, 
      simulatedResult: result.mock ? 'simulated' : 'sent',
      message: result.mock 
        ? `Notificação simulada enviada para ${result.successCount} dispositivo(s)`
        : `Notificação enviada para ${result.successCount} dispositivo(s) (${result.failureCount} falharam)`,
      details: result
    };
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

module.exports = {
  validateTokenData,
  registerToken,
  removeTokenByDeviceId,
  getTokenCount,
  getAllTokens,
  simulateNotification
};
