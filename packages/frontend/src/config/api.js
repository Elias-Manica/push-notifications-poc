/**
 * API Configuration
 *
 * Configuração da API para diferentes ambientes
 */

// Detectar se está rodando em dispositivo móvel
const isMobile = window.Capacitor !== undefined;

// Configurações por ambiente
const configs = {
  // Desenvolvimento web (localhost)
  web: {
    API_BASE_URL: 'http://localhost:3000/api/v1',
  },

  // Desenvolvimento mobile (substitua pelo seu IP local)
  mobile: {
    // ⚠️ IMPORTANTE: Substitua pelo seu IP local
    // Para descobrir seu IP: npm run get-ip
    API_BASE_URL: 'http://192.168.0.108:3000/api/v1',
  },

  // Produção (quando deployar)
  production: {
    API_BASE_URL: 'https://seu-backend.com/api/v1',
  },
};

// Detectar ambiente
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  if (isMobile) {
    return 'mobile';
  }

  return 'web';
};

// Exportar configuração atual
const currentConfig = configs[getEnvironment()];

export const API_BASE_URL = currentConfig.API_BASE_URL;
export const IS_MOBILE = isMobile;
export const ENVIRONMENT = getEnvironment();

// Log para debug
console.log(`🌐 API Config:`, {
  environment: ENVIRONMENT,
  isMobile: IS_MOBILE,
  apiUrl: API_BASE_URL,
});

export default currentConfig;
