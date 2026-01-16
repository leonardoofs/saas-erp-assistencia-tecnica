/**
 * UnderTech - Configurações do Frontend
 * Arquivo centralizado de configurações
 */

const CONFIG = {
  // URL da API
  API_BASE_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api',

  // Timeout de requisições (em ms)
  REQUEST_TIMEOUT: 30000,

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 50,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
  },

  // Configurações de toast/notificações
  TOAST: {
    DURATION: 3000,
    POSITION: 'top-right'
  },

  // Configurações de validação
  VALIDATION: {
    CPF_LENGTH: 11,
    PHONE_MIN_LENGTH: 10,
    PHONE_MAX_LENGTH: 11,
    CEP_LENGTH: 8,
    PASSWORD_MIN_LENGTH: 6
  },

  // Situações de cliente
  SITUACOES_CLIENTE: {
    ATIVO: 'ativo',
    EM_RISCO: 'em_risco',
    INATIVO: 'inativo'
  },

  // Configurações de cache
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000 // 5 minutos
  },

  // Ambiente
  ENV: window.location.hostname === 'localhost' ? 'development' : 'production',

  // Debug mode
  DEBUG: window.location.hostname === 'localhost'
};

// Congela o objeto para evitar modificações
Object.freeze(CONFIG);

// Logger utilitário
const Logger = {
  log: (...args) => {
    if (CONFIG.DEBUG) {
      console.log('[UnderTech]', ...args);
    }
  },

  error: (...args) => {
    if (CONFIG.DEBUG) {
      console.error('[UnderTech Error]', ...args);
    }
  },

  warn: (...args) => {
    if (CONFIG.DEBUG) {
      console.warn('[UnderTech Warning]', ...args);
    }
  }
};

// Exportar globalmente
window.CONFIG = CONFIG;
window.Logger = Logger;
