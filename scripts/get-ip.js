#!/usr/bin/env node

/**
 * Script para descobrir o IP local da máquina
 * Útil para configurar a API no desenvolvimento mobile
 */

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pular interfaces internas e não IPv4
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        continue;
      }

      // Retornar o primeiro IP válido encontrado
      return iface.address;
    }
  }

  return 'localhost';
}

const ip = getLocalIP();
console.log(`🌐 Seu IP local é: ${ip}`);
console.log(`📱 Configure a API mobile como: http://${ip}:3000/api/v1`);
console.log(`\n💡 Para atualizar automaticamente, edite:`);
console.log(`   packages/frontend/src/config/api.js`);
console.log(`   E substitua 192.168.1.100 por ${ip}`);
