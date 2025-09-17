/**
 * Rotas de Notificações
 * 
 * Endpoints para gerenciar tokens FCM e simular envios
 */

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

/**
 * POST /api/v1/notifications/tokens
 * Registra ou atualiza um token FCM
 */
router.post('/tokens', async (req, res) => {
  try {
    const result = await notificationService.registerToken(req.body);
    
    if (result.success) {
      res.status(200).json({
        ok: true,
        action: result.action,
        record: result.record
      });
    } else {
      res.status(400).json({
        ok: false,
        message: 'Dados inválidos',
        errors: result.errors
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint POST /tokens:', error);
    res.status(500).json({
      ok: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * DELETE /api/v1/notifications/tokens/:device_id
 * Remove um token pelo device_id
 */
router.delete('/tokens/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const result = await notificationService.removeTokenByDeviceId(device_id);
    
    if (result.success) {
      res.status(200).json({
        ok: true,
        removed: result.removed,
        removedDeviceId: result.removedDeviceId
      });
    } else {
      res.status(404).json({
        ok: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint DELETE /tokens/:device_id:', error);
    res.status(500).json({
      ok: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * GET /api/v1/notifications/tokens/count
 * Retorna a quantidade de tokens registrados
 */
router.get('/tokens/count', async (req, res) => {
  try {
    const result = await notificationService.getTokenCount();
    
    if (result.success) {
      res.status(200).json({
        ok: true,
        count: result.count
      });
    } else {
      res.status(500).json({
        ok: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint GET /tokens/count:', error);
    res.status(500).json({
      ok: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
