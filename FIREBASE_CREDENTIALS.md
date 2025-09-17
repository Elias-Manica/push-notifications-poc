# 🔐 Gerenciamento de Credenciais Firebase

## 📋 **Resumo Rápido**

| Cenário       | Arquivo                  | Local               | Commitar? | Segurança        |
| ------------- | ------------------------ | ------------------- | --------- | ---------------- |
| **PoC Local** | `firebase-adminsdk.json` | `packages/backend/` | ❌ NÃO    | ✅ .gitignore    |
| **Produção**  | Variáveis de ambiente    | Servidor            | ❌ NUNCA  | ✅ Criptografado |

---

## 🏠 **1. Para a PoC (Desenvolvimento Local)**

### **✅ Como configurar:**

1. **Coloque seu arquivo** em:

   ```
   packages/backend/firebase-adminsdk.json
   ```

2. **O código detecta automaticamente:**

   - ✅ Se o arquivo existe → usa credenciais reais
   - ❌ Se não existe → usa modo MOCK

3. **Teste:**
   ```bash
   cd packages/backend
   node src/server.js
   ```

### **📝 Logs esperados:**

```
🔑 Credenciais reais encontradas, inicializando Firebase Admin...
✅ Firebase Admin SDK inicializado
```

---

## 🚀 **2. Para Produção (Cenários Reais)**

### **Opção A: Variáveis de Ambiente (Recomendada)**

#### **1. Converter JSON para variáveis:**

```bash
# Seu firebase-adminsdk.json vira:
FIREBASE_PROJECT_ID=push-notifications-poc-9bb04
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@push-notifications-poc-9bb04.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_CLIENT_ID=123456789
```

#### **2. Atualizar código:**

```javascript
// packages/backend/src/services/firebaseAdmin.js
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};
```

### **Opção B: Arquivo no Servidor (Menos Seguro)**

#### **1. Colocar arquivo no servidor:**

```bash
# No servidor de produção
/opt/app/firebase-adminsdk.json
```

#### **2. Atualizar código:**

```javascript
const serviceAccount = require("/opt/app/firebase-adminsdk.json");
```

---

## 🛡️ **3. Segurança por Cenário**

### **🏠 Desenvolvimento Local**

```bash
# ✅ SEGURO - arquivo local
packages/backend/firebase-adminsdk.json  # .gitignore protegido
```

### **☁️ Produção (Heroku, Railway, etc.)**

```bash
# ✅ SEGURO - variáveis de ambiente
heroku config:set FIREBASE_PROJECT_ID=seu-projeto
heroku config:set FIREBASE_PRIVATE_KEY="sua-chave-privada"
```

### **🐳 Produção (Docker)**

```dockerfile
# ✅ SEGURO - secrets do Docker
version: '3.8'
services:
  backend:
    environment:
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
    secrets:
      - firebase_credentials
```

### **☁️ Produção (AWS, GCP, Azure)**

```bash
# ✅ SEGURO - gerenciadores de secrets
# AWS Secrets Manager
# Google Secret Manager
# Azure Key Vault
```

---

## 🔧 **4. Implementação Prática**

### **Para sua PoC atual:**

1. **Coloque o arquivo:**

   ```bash
   # Copie seu firebase-adminsdk.json para:
   cp ~/Downloads/firebase-adminsdk.json packages/backend/
   ```

2. **Teste:**

   ```bash
   cd packages/backend
   node src/server.js
   # Deve mostrar: "🔑 Credenciais reais encontradas"
   ```

3. **Envie notificação:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/events/enviar \
     -H 'Content-Type: application/json' \
     -d '{"user_id":"test","notification_payload":{"title":"Teste Real","body":"Notificação real!"}}'
   ```

### **Para produção futura:**

1. **Configure variáveis de ambiente**
2. **Atualize o código** para usar `process.env`
3. **Deploy** com secrets seguros

---

## ⚠️ **5. O que NUNCA fazer**

### **❌ NUNCA commitar:**

```bash
# ❌ NUNCA suba isso
firebase-adminsdk.json
.env
*.pem
*.key
```

### **❌ NUNCA hardcodar:**

```javascript
// ❌ NUNCA faça isso
const serviceAccount = {
  private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
};
```

### **❌ NUNCA expor:**

```bash
# ❌ NUNCA exponha em logs
console.log(serviceAccount.private_key);
```

---

## 🎯 **6. Resumo por Cenário**

| Cenário      | Arquivo                  | Local               | Segurança        | Facilidade |
| ------------ | ------------------------ | ------------------- | ---------------- | ---------- |
| **PoC**      | `firebase-adminsdk.json` | `packages/backend/` | ✅ .gitignore    | ⭐⭐⭐     |
| **Produção** | Variáveis de ambiente    | Servidor            | ✅ Criptografado | ⭐⭐       |
| **Docker**   | Docker secrets           | Container           | ✅ Isolado       | ⭐⭐       |
| **Cloud**    | Secret Manager           | Cloud               | ✅ Máxima        | ⭐         |

---

## 🚀 **Próximos Passos**

1. **Agora:** Coloque seu `firebase-adminsdk.json` em `packages/backend/`
2. **Teste:** Rode o servidor e veja as notificações reais
3. **Futuro:** Configure variáveis de ambiente para produção

**Sua PoC está pronta para usar credenciais reais!** 🎉
