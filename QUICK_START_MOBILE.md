# 🚀 Quick Start - Mobile Development

## ⚡ Rodar o App Mobile + Backend (3 comandos)

```bash
# 1. Terminal 1: Rodar Backend
npm run dev:backend

# 2. Terminal 2: Rodar Mobile
npm run mobile:sync
npm run mobile:android  # ou mobile:ios
```

## 🔧 Configuração de Rede (Importante!)

### **Para dispositivos físicos:**

```bash
# 1. Descobrir seu IP local
npm run get-ip

# 2. Atualizar a configuração
# Editar: packages/frontend/src/config/api.js
# Substituir o IP na linha 21
```

## 📱 Comandos Essenciais

```bash
# Desenvolvimento
npm run dev:backend          # Backend
npm run mobile:sync         # Build + sync mobile
npm run mobile:android      # Abrir Android Studio
npm run mobile:ios          # Abrir Xcode

# Descoberta de IP
npm run get-ip              # Descobrir IP local
```

## 🔄 Fluxo de Desenvolvimento

1. **Fazer mudanças no código React**
2. **`npm run mobile:sync`** (build + sync)
3. **Rodar no dispositivo** (Android Studio/Xcode)

## 🐛 Problemas Comuns

### **App não conecta no backend:**

- ✅ Backend rodando? `npm run dev:backend`
- ✅ IP correto? `npm run get-ip`
- ✅ Testar API: `http://SEU_IP:3000/health`

### **Build falha:**

```bash
cd packages/frontend
rm -rf dist
npm run build
npm run cap:sync
```

---

**💡 Dica:** Mantenha o backend sempre rodando em um terminal separado!
