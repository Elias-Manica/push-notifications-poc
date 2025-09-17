# Push Notifications PoC

PoC (Proof of Concept) para implementação de Push Notifications usando Node.js + Express + React.

## 🏗️ Arquitetura

Este projeto está organizado como um monorepo com os seguintes pacotes:

```
push-notifications-poc/
├── packages/
│   ├── backend/          # Backend Express (Etapa 1 - ✅ Concluída)
│   └── frontend/         # Frontend React (Etapas futuras)
├── package.json          # Configuração do monorepo
└── README.md
```

## 🚀 Etapa 1: Backend Mock (Concluída)

### Funcionalidades Implementadas

- ✅ Servidor Express com CORS configurado
- ✅ Banco de dados em memória (Map) simulando tabela `device_tokens`
- ✅ Endpoints REST para gerenciar tokens FCM
- ✅ Simulação de envio de notificações
- ✅ Validações de dados e tratamento de erros
- ✅ Logs detalhados para debugging
- ✅ Script de testes automatizados

### Como Executar

```bash
# Instalar dependências
npm run install:all

# Executar backend em modo desenvolvimento
npm run dev:backend

# Ou executar em modo produção
npm run start:backend
```

### Testar API

```bash
# Executar suite de testes
npm run test:backend

# Ou testar manualmente com curl
curl http://localhost:3000/health
```

## 📚 Documentação da API

### Endpoints Disponíveis

| Método | Endpoint                                  | Descrição                     |
| ------ | ----------------------------------------- | ----------------------------- |
| GET    | `/health`                                 | Health check                  |
| POST   | `/api/v1/notifications/tokens`            | Registrar/atualizar token FCM |
| DELETE | `/api/v1/notifications/tokens/:device_id` | Remover token por device_id   |
| GET    | `/api/v1/notifications/tokens/count`      | Contar tokens registrados     |
| POST   | `/api/v1/events/enviar`                   | Simular envio de notificação  |

### Exemplos de Uso

#### Registrar Token

```bash
curl -X POST http://localhost:3000/api/v1/notifications/tokens \
  -H 'Content-Type: application/json' \
  -d '{
    "fcm_token": "token-abc-123",
    "device_id": "device-1",
    "user_id": "user-a",
    "notification_consent_status": "granted"
  }'
```

#### Simular Envio

```bash
curl -X POST http://localhost:3000/api/v1/events/enviar \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "user-a",
    "account_id": "acc-1",
    "notification_payload": {
      "title": "Título da notificação",
      "body": "Corpo da notificação",
      "data": {"customKey": "customValue"}
    }
  }'
```

## 🔮 Próximas Etapas

### Etapa 2: Frontend React

- [ ] Interface para gerenciar tokens
- [ ] Dashboard de notificações
- [ ] Testes de envio em tempo real

### Etapa 3: Integração Real

- [ ] Firebase Admin SDK
- [ ] Banco de dados persistente
- [ ] Autenticação JWT
- [ ] Rate limiting e segurança

### Etapa 4: Produção

- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Monitoramento e logs
- [ ] Deploy automatizado

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js** (>=18)
- **Express.js** - Framework web
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Hot reload em desenvolvimento

### Estrutura de Dados

```javascript
// Tabela device_tokens (simulada em memória)
{
  fcm_token: "string",                    // Primary key
  device_id: "string",
  user_id: "string",
  notification_consent_status: "granted" | "denied" | "default",
  last_updated_at: "ISO_TIMESTAMP"
}
```

## 📝 Logs e Debugging

O servidor registra todas as operações no console:

- ✅ Registros criados/atualizados
- 🗑️ Registros removidos
- 📤 Simulações de envio
- 🌐 Requisições HTTP
- ❌ Erros e exceções

## 🔧 Configuração

### Variáveis de Ambiente

```bash
PORT=3000                    # Porta do servidor
FRONTEND_URL=http://localhost:3001  # URL do frontend para CORS
NODE_ENV=development         # Ambiente de execução
```

## ✅ Critérios de Aceitação - Etapa 1

- [x] Servidor sobe e responde nos endpoints definidos
- [x] `POST /api/v1/notifications/tokens` cria e atualiza registros corretamente
- [x] `GET /api/v1/notifications/tokens/count` retorna número correto de registros
- [x] `POST /api/v1/events/enviar` retorna tokens apenas com `notification_consent_status === 'granted'`
- [x] `DELETE /api/v1/notifications/tokens/:device_id` remove registro corretamente
- [x] Todos os fluxos testados via curl/Postman funcionam conforme esperado
- [x] Logs detalhados para debugging
- [x] Validações de dados implementadas
- [x] Tratamento de erros robusto
- [x] Código modular e bem documentado

## 📞 Suporte

Para dúvidas ou problemas, verifique:

1. Logs do servidor no console
2. Documentação da API em `http://localhost:3000/`
3. Script de testes em `packages/backend/test-api.sh`
