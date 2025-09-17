/**
 * Rotas de Eventos
 * 
 * Endpoints para simular envio de notificações
 */

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

/**
 * POST /api/v1/events/enviar
 * Simula envio de notificação para um usuário
 */
router.post('/enviar', async (req, res) => {
  try {
    const { user_id, account_id, notification_payload } = req.body;
    
    // Validações básicas
    if (!user_id) {
      return res.status(400).json({
        ok: false,
        message: 'user_id é obrigatório'
      });
    }
    
    if (!notification_payload || !notification_payload.title || !notification_payload.body) {
      return res.status(400).json({
        ok: false,
        message: 'notification_payload com title e body são obrigatórios'
      });
    }

    const result = await notificationService.simulateNotification({
      user_id,
      account_id,
      notification_payload
    });
    
    if (result.success) {
      res.status(200).json({
        ok: true,
        targets: result.targets,
        simulatedResult: result.simulatedResult,
        message: result.message
      });
    } else {
      res.status(500).json({
        ok: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint POST /enviar:', error);
    res.status(500).json({
      ok: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
