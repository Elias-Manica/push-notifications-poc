#!/bin/bash
# rebuild-mobile.sh
# Script para rebuild rápido do mobile após mudanças no frontend

echo "🔄 Rebuild mobile..."

# Navegar para o diretório do frontend
cd packages/frontend

# Build do frontend
echo "📦 Building frontend..."
npm run build

# Sincronizar com Android
echo "🔄 Sincronizando com Android..."
npm run cap:sync:android

echo ""
echo "✅ Mobile rebuild concluído!"
echo "📱 Próximos passos:"
echo "   1. Abra o Android Studio: npm run cap:open:android"
echo "   2. Build → Make Project"
echo "   3. Run no emulador/dispositivo"
