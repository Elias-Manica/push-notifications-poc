# Push Notifications PoC - Backend

Backend mock para PoC de Push Notifications usando Node.js + Express.

## 🚀 Início Rápido

### Instalação

```bash
cd packages/backend
npm install
```

### Executar

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📚 Endpoints da API

### 1. Health Check

```bash
GET /health
```

### 2. Registrar/Atualizar Token FCM

```bash
POST /api/v1/notifications/tokens
Content-Type: application/json

{
  "fcm_token": "token-abc-123",
  "device_id": "device-1",
  "user_id": "user-a",
  "notification_consent_status": "granted"
}
```

**Resposta:**

```json
{
  "ok": true,
  "action": "created", // ou "updated"
  "record": {
    "fcm_token": "token-abc-123",
    "device_id": "device-1",
    "user_id": "user-a",
    "notification_consent_status": "granted",
    "last_updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Remover Token por Device ID

```bash
DELETE /api/v1/notifications/tokens/device-1
```

**Resposta:**

```json
{
  "ok": true,
  "removed": true,
  "removedDeviceId": "device-1"
}
```

### 4. Contar Tokens Registrados

```bash
GET /api/v1/notifications/tokens/count
```

**Resposta:**

```json
{
  "ok": true,
  "count": 5
}
```

### 5. Simular Envio de Notificação

```bash
POST /api/v1/events/enviar
Content-Type: application/json

{
  "user_id": "user-a",
  "account_id": "acc-1",
  "notification_payload": {
    "title": "Título da notificação",
    "body": "Corpo da notificação",
    "data": {
      "customKey": "customValue"
    }
  }
}
```

**Resposta:**

```json
{
  "ok": true,
  "targets": ["token-abc-123", "token-def-456"],
  "simulatedResult": "success",
  "message": "Notificação simulada enviada para 2 dispositivo(s)"
}
```

## 🧪 Testes com cURL

### Registrar Token

```bash
curl -X POST http://localhost:3000/api/v1/notifications/tokens \
  -H 'Content-Type: application/json' \
  -d '{"fcm_token":"token-abc","device_id":"device-1","user_id":"user-a","notification_consent_status":"granted"}'
```

### Contar Tokens

```bash
curl http://localhost:3000/api/v1/notifications/tokens/count
```

### Simular Envio

```bash
curl -X POST http://localhost:3000/api/v1/events/enviar \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"user-a","account_id":"acc-1","notification_payload":{"title":"Oi","body":"Teste"}}'
```

### Remover Token

```bash
curl -X DELETE http://localhost:3000/api/v1/notifications/tokens/device-1
```

## 🏗️ Estrutura do Projeto

```
src/
├── models/
│   └── mockDb.js          # Banco de dados em memória
├── services/
│   └── notificationService.js  # Lógica de negócio
├── routes/
│   ├── notifications.js   # Rotas de tokens
│   └── events.js         # Rotas de eventos
└── server.js             # Servidor principal
```

## 🔧 Configuração

### Variáveis de Ambiente

- `PORT`: Porta do servidor (padrão: 3000)
- `FRONTEND_URL`: URL do frontend para CORS (padrão: http://localhost:3001)
- `NODE_ENV`: Ambiente (development/production)

### CORS

O servidor está configurado para aceitar requisições do frontend React em `http://localhost:3001` por padrão.

## 📝 Logs

O servidor registra todas as operações no console:

- ✅ Registros criados/atualizados
- 🗑️ Registros removidos
- 📤 Simulações de envio
- 🌐 Requisições HTTP

## 🔮 Próximos Passos

- [ ] Integrar Firebase Admin SDK
- [ ] Implementar persistência real (PostgreSQL/MongoDB)
- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários
- [ ] Configurar CI/CD
