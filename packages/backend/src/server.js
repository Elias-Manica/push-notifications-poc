/**
 * Servidor Express - PoC Push Notifications
 * 
 * Backend mock para gerenciar tokens FCM e simular envios de notificações
 * TODO: Integrar com Firebase Admin SDK para funcionalidade real
 */

const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./routes/notifications');
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001', // React dev server padrão
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🌐 ${timestamp} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Push Notifications PoC Backend está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/events', eventRoutes);

// Rota raiz com informações da API
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Push Notifications PoC - Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      registerToken: 'POST /api/v1/notifications/tokens',
      listTokens: 'GET /api/v1/notifications/tokens',
      removeToken: 'DELETE /api/v1/notifications/tokens/:device_id',
      tokenCount: 'GET /api/v1/notifications/tokens/count',
      sendNotification: 'POST /api/v1/events/enviar',
      firebaseStatus: 'GET /api/v1/events/status'
    },
    examples: {
      registerToken: {
        method: 'POST',
        url: '/api/v1/notifications/tokens',
        body: {
          fcm_token: 'token-abc-123',
          device_id: 'device-1',
          user_id: 'user-a',
          notification_consent_status: 'granted'
        }
      },
      sendNotification: {
        method: 'POST',
        url: '/api/v1/events/enviar',
        body: {
          user_id: 'user-a',
          account_id: 'acc-1',
          notification_payload: {
            title: 'Título da notificação',
            body: 'Corpo da notificação',
            data: { customKey: 'customValue' }
          }
        }
      }
    }
  });
});

// Middleware de tratamento de rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    ok: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentação: http://localhost:${PORT}/`);
  console.log('📱 Pronto para receber requisições de Push Notifications!');
  console.log('---');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

module.exports = app;
