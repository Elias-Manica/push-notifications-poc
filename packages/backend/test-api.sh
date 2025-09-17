#!/bin/bash

# Script de teste para API de Push Notifications PoC
# Execute: chmod +x test-api.sh && ./test-api.sh

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api/v1"

echo "🧪 Testando API de Push Notifications PoC"
echo "=========================================="
echo ""

# 1. Health Check
echo "1️⃣ Testando Health Check..."
curl -s "$BASE_URL/health" | jq .
echo ""

# 2. Registrar token
echo "2️⃣ Registrando token FCM..."
curl -s -X POST "$API_BASE/notifications/tokens" \
  -H 'Content-Type: application/json' \
  -d '{"fcm_token":"token-test-123","device_id":"device-test-1","user_id":"user-test-a","notification_consent_status":"granted"}' | jq .
echo ""

# 3. Atualizar mesmo token
echo "3️⃣ Atualizando token existente..."
curl -s -X POST "$API_BASE/notifications/tokens" \
  -H 'Content-Type: application/json' \
  -d '{"fcm_token":"token-test-123","device_id":"device-test-1-updated","user_id":"user-test-a","notification_consent_status":"denied"}' | jq .
echo ""

# 4. Contar tokens
echo "4️⃣ Contando tokens registrados..."
curl -s "$API_BASE/notifications/tokens/count" | jq .
echo ""

# 5. Registrar token com consentimento granted
echo "5️⃣ Registrando token com consentimento 'granted'..."
curl -s -X POST "$API_BASE/notifications/tokens" \
  -H 'Content-Type: application/json' \
  -d '{"fcm_token":"token-granted-456","device_id":"device-granted-1","user_id":"user-test-a","notification_consent_status":"granted"}' | jq .
echo ""

# 6. Simular envio de notificação
echo "6️⃣ Simulando envio de notificação..."
curl -s -X POST "$API_BASE/events/enviar" \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"user-test-a","account_id":"acc-test-1","notification_payload":{"title":"Teste de Notificação","body":"Esta é uma notificação de teste","data":{"customKey":"customValue"}}}' | jq .
echo ""

# 7. Contar tokens novamente
echo "7️⃣ Contando tokens após simulação..."
curl -s "$API_BASE/notifications/tokens/count" | jq .
echo ""

# 8. Remover token por device_id
echo "8️⃣ Removendo token por device_id..."
curl -s -X DELETE "$API_BASE/notifications/tokens/device-test-1-updated" | jq .
echo ""

# 9. Contar tokens após remoção
echo "9️⃣ Contando tokens após remoção..."
curl -s "$API_BASE/notifications/tokens/count" | jq .
echo ""

# 10. Testar envio após remoção
echo "🔟 Testando envio após remoção..."
curl -s -X POST "$API_BASE/events/enviar" \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"user-test-a","account_id":"acc-test-1","notification_payload":{"title":"Teste Pós-Remoção","body":"Esta notificação deve encontrar apenas 1 token"}}' | jq .
echo ""

echo "✅ Testes concluídos!"
echo "📊 Verifique os logs do servidor para ver as operações registradas."
