# Push Notifications PoC

Prova de Conceito completa de Push Notifications usando Node.js + Express + React + Firebase Cloud Messaging.

## 🏗️ Arquitetura

### Monorepo com dois pacotes:

- **`packages/backend`** - API REST em Node.js + Express
- **`packages/frontend`** - Interface React + Vite

### Comunicação:

- Frontend ↔ Backend via REST API
- Frontend ↔ Service Worker via postMessage
- Service Worker ↔ IndexedDB para persistência

## 🚀 Início Rápido

### 1. Instalar dependências

```bash
npm run install:all
```

### 2. Executar em desenvolvimento

```bash
# Executar backend e frontend simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:backend  # Backend na porta 3000
npm run dev:frontend # Frontend na porta 3001
```

### 3. Acessar aplicação

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **Documentação:** http://localhost:3000/

## 📱 Funcionalidades Implementadas

### Frontend React

- ✅ **Login/Logout** com diferentes usuários e contas
- ✅ **Troca de perfil** entre diferentes account_ids
- ✅ **Persistência** de sessão e device_id no IndexedDB
- ✅ **Integração FCM** para receber tokens
- ✅ **Interface responsiva** com feedback visual

### Service Worker

- ✅ **Filtragem inteligente** de notificações por user_id e account_id
- ✅ **Persistência** de sessão no IndexedDB
- ✅ **Comunicação** com frontend via postMessage
- ✅ **Exibição** de notificações apenas para sessão ativa

### Backend API

- ✅ **CRUD de tokens** FCM com validações
- ✅ **Simulação** de envio de notificações
- ✅ **Banco em memória** com Map (mock)
- ✅ **CORS** configurado para frontend

## 🧪 Cenários de Teste

### 1. Cenário de Sucesso

1. Acesse http://localhost:3001
2. Clique em "Login como Usuário A (Conta X)"
3. Clique em "Enviar Notificação de Teste"
4. **Resultado:** Notificação deve aparecer

### 2. Cenário de Troca de Perfil

1. Faça login como Usuário A (Conta X)
2. Clique em "Trocar para Conta Z"
3. Envie notificação de teste
4. **Resultado:** Notificação deve aparecer (mesmo usuário, conta diferente)

### 3. Cenário de Logout

1. Faça login como qualquer usuário
2. Clique em "Logout"
3. Tente enviar notificação de teste
4. **Resultado:** Token removido do backend, não recebe notificações

### 4. Cenário de Persistência

1. Faça login como qualquer usuário
2. Recarregue a página (F5)
3. **Resultado:** Sessão mantida, SW continua filtrando corretamente

## 🔧 Configuração Firebase

### Para usar FCM real:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Cloud Messaging
3. Gere uma chave VAPID
4. Atualize `packages/frontend/src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// E a chave VAPID:
const token = await getToken(messaging, {
  vapidKey: "sua-chave-vapid-real",
});
```

## 📚 Estrutura do Projeto

```
push-notifications-poc/
├── packages/
│   ├── backend/                 # API REST
│   │   ├── src/
│   │   │   ├── models/         # Mock DB
│   │   │   ├── services/       # Lógica de negócio
│   │   │   ├── routes/         # Endpoints
│   │   │   └── server.js       # Servidor Express
│   │   └── test-api.sh         # Script de testes
│   └── frontend/               # React App
│       ├── public/
│       │   └── firebase-messaging-sw.js  # Service Worker
│       ├── src/
│       │   ├── services/       # IndexedDB, API, Firebase
│       │   ├── App.jsx         # Componente principal
│       │   └── main.jsx        # Entry point
│       └── package.json
├── package.json                # Scripts do monorepo
└── README.md
```

## 🔍 Endpoints da API

| Método | Endpoint                                  | Descrição                     |
| ------ | ----------------------------------------- | ----------------------------- |
| GET    | `/health`                                 | Health check                  |
| POST   | `/api/v1/notifications/tokens`            | Registrar/atualizar token FCM |
| GET    | `/api/v1/notifications/tokens`            | Listar todos os tokens        |
| DELETE | `/api/v1/notifications/tokens/:device_id` | Remover token                 |
| GET    | `/api/v1/notifications/tokens/count`      | Contar tokens                 |
| POST   | `/api/v1/events/enviar`                   | Simular envio de notificação  |

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js** (>=18)
- **Express.js** - Framework web
- **CORS** - Cross-origin requests

### Frontend

- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **Firebase SDK** - Cloud Messaging
- **IndexedDB** - Persistência local

### Service Worker

- **Firebase Messaging** - Push notifications
- **IndexedDB** - Persistência de sessão
- **postMessage** - Comunicação com frontend

## 📝 Logs e Debugging

### Backend

- Logs no console do terminal
- Operações de CRUD registradas
- Simulações de envio detalhadas

### Frontend

- Console do navegador (F12)
- Logs de IndexedDB e FCM
- Estado da sessão em tempo real

### Service Worker

- Console do Service Worker (DevTools > Application > Service Workers)
- Logs de filtragem de notificações
- Estado da sessão persistida

## 🔮 Próximos Passos

### Melhorias Técnicas

- [ ] Integrar Firebase Admin SDK real no backend
- [ ] Implementar banco de dados persistente (PostgreSQL/MongoDB)
- [ ] Adicionar autenticação JWT
- [ ] Implementar rate limiting
- [ ] Adicionar testes unitários e E2E

### Funcionalidades

- [ ] Notificações em tempo real via WebSocket
- [ ] Dashboard de analytics de notificações
- [ ] Suporte a múltiplos tipos de notificação
- [ ] Configurações de usuário (preferências)

### Produção

- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Deploy automatizado
- [ ] Monitoramento e métricas

## 🐛 Troubleshooting

### Problemas Comuns

**1. CORS Error**

- Verifique se o backend está rodando na porta 3000
- Confirme configuração CORS no backend

**2. Service Worker não registra**

- Verifique se o arquivo `firebase-messaging-sw.js` está em `/public`
- Force refresh (Ctrl+Shift+R) para limpar cache

**3. Notificações não aparecem**

- Verifique permissões do navegador
- Confirme se o Service Worker está ativo
- Verifique logs do SW no DevTools

**4. Sessão não persiste**

- Verifique se o IndexedDB está habilitado
- Confirme se não está em modo incógnito

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs no console do navegador
2. Confirme se backend e frontend estão rodando
3. Teste os endpoints da API manualmente
4. Verifique configuração do Firebase

---

**Desenvolvido com ❤️ para demonstrar Push Notifications com FCM**
