#!/bin/bash
# setup-mobile-dev.sh
# Script para configurar desenvolvimento mobile com adb reverse

echo "🔧 Configurando desenvolvimento mobile..."

# Adicionar adb ao PATH (macOS)
export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools

# Verificar se adb está disponível
if ! command -v adb &> /dev/null; then
    echo "❌ adb não encontrado. Verifique se o Android SDK está instalado."
    echo "   Caminho esperado: $HOME/Library/Android/sdk/platform-tools"
    exit 1
fi

# Listar dispositivos conectados
echo "📱 Dispositivos conectados:"
adb devices -l

# Aplicar reverse para todos os dispositivos
echo "🔄 Aplicando reverse tcp:3000 para todos os dispositivos..."
for s in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do 
    echo "   📱 Aplicando reverse para dispositivo: $s"
    adb -s $s reverse tcp:3000 tcp:3000
done

echo ""
echo "✅ Setup concluído!"
echo "🌐 Backend: http://localhost:3000"
echo "📱 Mobile: Execute 'npm run cap:open:android'"
echo ""
echo "💡 Para verificar se funcionou:"
echo "   - No navegador do emulador: http://localhost:3000/health"
echo "   - Deve retornar JSON com status do backend"
