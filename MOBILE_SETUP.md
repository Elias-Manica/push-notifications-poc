# 📱 Push Notifications POC - Guia Mobile

Este documento explica como rodar a aplicação mobile (Android/iOS) junto com o backend.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Backend API   │    │   Firebase      │
│   (Capacitor)   │◄──►│   (Node.js)     │◄──►│   (FCM/APNs)    │
│   Android/iOS   │    │   Port: 3000    │    │   (Futuro)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Como Rodar o Projeto Completo

### 1. **Instalação Inicial** (apenas na primeira vez)

```bash
# Na raiz do projeto
npm run install:all
```

### 2. **Rodar Backend + Mobile App**

#### **Opção A: Rodar tudo junto (Recomendado)**

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Mobile (após mudanças no frontend)
cd packages/frontend
npm run cap:sync
npm run cap:open:android  # ou cap:open:ios
```

#### **Opção B: Script automatizado**

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend + Mobile
cd packages/frontend
npm run dev & npm run cap:sync
```

### 3. **Desenvolvimento Mobile**

#### **Fluxo de Desenvolvimento:**

1. **Fazer mudanças no código React** (`packages/frontend/src/`)
2. **Buildar e sincronizar:**
   ```bash
   cd packages/frontend
   npm run cap:sync
   ```
3. **Abrir no IDE nativo:**
   ```bash
   npm run cap:open:android  # Android Studio
   npm run cap:open:ios      # Xcode
   ```
4. **Rodar no dispositivo/emulador**

## 📋 Scripts Disponíveis

### **Scripts do Projeto Raiz:**

```bash
npm run dev:backend     # Rodar backend em modo dev
npm run start:backend   # Rodar backend em produção
npm run dev:frontend    # Rodar frontend web
npm run build:frontend  # Buildar frontend
npm run dev             # Rodar backend + frontend juntos
```

### **Scripts Mobile:**

```bash
cd packages/frontend

# Mobile
npm run cap:sync              # Build + sync todas as plataformas
npm run cap:sync:android      # Build + sync apenas Android
npm run cap:sync:ios          # Build + sync apenas iOS
npm run cap:open:android      # Abrir Android Studio
npm run cap:open:ios          # Abrir Xcode

# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run build                  # Build para produção
npm run preview               # Preview do build
```

## 🔧 Configuração de Rede

### **Para Dispositivos Físicos:**

O app mobile precisa acessar o backend. Por padrão, a API está configurada para `localhost:3000`, mas dispositivos físicos não conseguem acessar `localhost` do seu computador.

#### **Solução 1: Usar IP da máquina**

1. Descubra seu IP local:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig
   ```

2. Atualize a configuração da API:

   ```javascript
   // packages/frontend/src/services/api.js
   const API_BASE_URL = 'http://SEU_IP_LOCAL:3000/api/v1';
   // Exemplo: 'http://192.168.1.100:3000/api/v1'
   ```

3. Rebuild e sync:
   ```bash
   npm run cap:sync
   ```

#### **Solução 2: Usar ngrok (Recomendado para testes)**

```bash
# Instalar ngrok
npm install -g ngrok

# Expor o backend
ngrok http 3000

# Usar a URL do ngrok na API
# Exemplo: https://abc123.ngrok.io/api/v1
```

## 📱 Testando no Dispositivo

### **Android:**

1. **Emulador:** Abra o Android Studio e rode o projeto
2. **Dispositivo Físico:**
   - Conecte via USB
   - Ative "Depuração USB" nas configurações do Android
   - Rode no Android Studio

### **iOS:**

1. **Simulador:** Abra o Xcode e rode o projeto
2. **Dispositivo Físico:**
   - Conecte via USB
   - Configure certificados de desenvolvimento no Xcode
   - Rode no Xcode

## 🔄 Fluxo de Desenvolvimento Completo

### **Cenário: Fazer uma mudança no frontend**

```bash
# 1. Rodar o backend
npm run dev:backend

# 2. Fazer mudanças no código React
# (editar arquivos em packages/frontend/src/)

# 3. Buildar e sincronizar
cd packages/frontend
npm run cap:sync

# 4. Abrir no IDE nativo
npm run cap:open:android  # ou iOS

# 5. Rodar no dispositivo/emulador
# (usar botão Run no Android Studio/Xcode)
```

### **Cenário: Testar push notifications**

```bash
# 1. Rodar backend
npm run dev:backend

# 2. Rodar frontend web para testar API
npm run dev:frontend

# 3. Acessar http://localhost:3001
# 4. Registrar token e testar notificações

# 5. Depois rodar no mobile
cd packages/frontend
npm run cap:sync
npm run cap:open:android
```

## 🐛 Troubleshooting

### **Problema: App não consegue acessar o backend**

- ✅ Verificar se o backend está rodando na porta 3000
- ✅ Verificar se o IP está correto na configuração da API
- ✅ Testar a API no navegador: `http://SEU_IP:3000/health`

### **Problema: Build falha**

```bash
# Limpar cache e rebuildar
cd packages/frontend
rm -rf dist node_modules/.vite
npm run build
npm run cap:sync
```

### **Problema: Sync falha**

```bash
# Limpar e recriar plataformas
npx cap sync --force
```

### **Problema: Xcode não abre**

```bash
# Verificar se Xcode está instalado
xcode-select --print-path
# Deve apontar para /Applications/Xcode.app/Contents/Developer
```

## 📚 Próximos Passos

### **Para implementar push notifications mobile:**

1. **Android:**

   - Configurar Firebase Cloud Messaging (FCM)
   - Adicionar `@capacitor/push-notifications`
   - Configurar `google-services.json`

2. **iOS:**

   - Configurar Apple Push Notification service (APNs)
   - Adicionar certificados de desenvolvimento
   - Configurar `GoogleService-Info.plist`

3. **Backend:**
   - Integrar Firebase Admin SDK
   - Configurar credenciais do Firebase
   - Implementar envio real de notificações

## 🎯 Resumo dos Comandos Essenciais

```bash
# Rodar tudo
npm run dev:backend                    # Terminal 1
cd packages/frontend && npm run cap:sync && npm run cap:open:android  # Terminal 2

# Desenvolvimento
npm run cap:sync                       # Após mudanças no código
npm run cap:open:android              # Abrir Android Studio
npm run cap:open:ios                  # Abrir Xcode
```

---

**💡 Dica:** Mantenha sempre o backend rodando em um terminal separado durante o desenvolvimento mobile!
