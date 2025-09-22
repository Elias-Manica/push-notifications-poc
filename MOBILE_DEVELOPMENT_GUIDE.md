# Guia de Desenvolvimento Mobile + Web

Este guia documenta como rodar o projeto Push Notifications PoC tanto no navegador (web) quanto no Android (mobile) simultaneamente durante o desenvolvimento.

## 📋 Pré-requisitos

- Node.js 18+
- Android Studio com SDK configurado
- Emulador Android ou dispositivo físico
- Backend rodando na porta 3000

## 🚀 Setup Inicial

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm install

# No frontend
cd packages/frontend
npm install
```

### 2. Configurar Firebase

- Certifique-se de que `google-services.json` está em `packages/frontend/android/app/`
- Verifique se o `firebase-adminsdk.json` no backend aponta para o mesmo projeto Firebase

## 🌐 Desenvolvimento Web

### Rodar o backend

```bash
cd packages/backend
npm start
```

### Rodar o frontend web

```bash
cd packages/frontend
npm run dev
```

Acesse: http://localhost:3001

## 📱 Desenvolvimento Mobile (Android)

### 1. Configurar adb reverse (OBRIGATÓRIO)

O emulador Android não consegue acessar `localhost` da máquina host diretamente. Use o adb reverse para mapear a porta:

```bash
# Adicionar adb ao PATH (macOS)
export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools

# Aplicar reverse para todos os dispositivos conectados
for s in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  adb -s $s reverse tcp:3000 tcp:3000;
done

# Ou para um dispositivo específico
adb -s emulator-5554 reverse tcp:3000 tcp:3000
```

### 2. Build e sincronizar

```bash
cd packages/frontend

# Build do frontend
npm run build

# Sincronizar com Android
npm run cap:sync:android
```

### 3. Abrir no Android Studio

```bash
npm run cap:open:android
```

### 4. Rodar no emulador/dispositivo

- No Android Studio: Build → Make Project
- Run no emulador ou dispositivo

## 🔄 Workflow de Desenvolvimento

### Para mudanças no frontend:

1. Edite o código em `packages/frontend/src/`
2. Execute:
   ```bash
   cd packages/frontend
   npm run build
   npm run cap:sync:android
   ```
3. No Android Studio: Build → Make Project
4. Rode novamente no emulador

### Para mudanças no backend:

1. Edite o código em `packages/backend/src/`
2. Reinicie o backend:
   ```bash
   cd packages/backend
   npm start
   ```

## 🛠️ Troubleshooting

### "Failed to fetch" no mobile

- **Causa**: Emulador não consegue acessar localhost
- **Solução**: Execute os comandos adb reverse acima
- **Verificação**: No navegador do emulador, acesse http://localhost:3000/health

### "Default FirebaseApp is not initialized"

- **Causa**: `google-services.json` não encontrado ou plugin não aplicado
- **Solução**:
  - Verifique se `google-services.json` está em `android/app/`
  - Execute `npm run cap:sync:android`
  - Rebuild no Android Studio

### "SenderId mismatch"

- **Causa**: Projetos Firebase diferentes entre web/mobile/backend
- **Solução**: Unifique todos os apps no mesmo projeto Firebase

### Loader infinito no mobile

- **Causa**: Service Worker não resolve no Capacitor
- **Solução**: Já implementado timeout no `App.jsx`

### Múltiplos dispositivos conectados

```bash
# Listar dispositivos
adb devices -l

# Aplicar reverse para dispositivo específico
adb -s emulator-5554 reverse tcp:3000 tcp:3000

# Remover reverse
adb -s emulator-5554 reverse --remove tcp:3000
```

## 📝 Scripts Úteis

### Script para setup completo (macOS)

```bash
#!/bin/bash
# setup-mobile-dev.sh

echo "🔧 Configurando desenvolvimento mobile..."

# Adicionar adb ao PATH
export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools

# Aplicar reverse para todos os dispositivos
for s in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
  echo "📱 Aplicando reverse para dispositivo: $s"
  adb -s $s reverse tcp:3000 tcp:3000;
done

echo "✅ Setup concluído!"
echo "🌐 Backend: http://localhost:3000"
echo "📱 Mobile: Execute 'npm run cap:open:android'"
```

### Script para rebuild rápido

```bash
#!/bin/bash
# rebuild-mobile.sh

cd packages/frontend
npm run build
npm run cap:sync:android
echo "✅ Mobile rebuild concluído!"
echo "📱 Abra o Android Studio e rode novamente"
```

## 🔍 Verificações

### Backend funcionando

```bash
curl http://localhost:3000/health
```

### Emulador acessando backend

- No navegador do emulador: http://localhost:3000/health
- Deve retornar JSON com status

### Tokens registrados

```bash
curl http://localhost:3000/api/v1/notifications/tokens
```

## 📱 Testando Push Notifications

### 1. Login no app mobile

- Faça login como "Usuário A (Conta X)"
- Verifique se o token foi registrado no backend

### 2. Enviar notificação

```bash
curl -X POST http://localhost:3000/api/v1/events/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-a",
    "account_id": "account-x",
    "notification_payload": {
      "title": "Teste Mobile",
      "body": "Notificação enviada do backend"
    }
  }'
```

### 3. Verificar recebimento

- App em foreground: deve mostrar notificação na UI
- App em background: deve aparecer notificação do sistema

## 🎯 Dicas de Desenvolvimento

1. **Sempre execute adb reverse** antes de rodar o app mobile
2. **Use o mesmo projeto Firebase** para web, mobile e backend
3. **Rebuild após mudanças** no frontend antes de testar no mobile
4. **Verifique logs** no Android Studio Logcat para debug
5. **Teste em device físico** quando possível (melhor para push notifications)

## 📚 Recursos Adicionais

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Development](https://developer.android.com/)
