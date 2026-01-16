/**
 * UnderTech - Rate Limiter Middleware
 * Proteção contra ataques de força bruta e DDoS
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter geral para todas as requisições
 * 100 requisições por 15 minutos por IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para rotas de autenticação
 * 5 tentativas por 15 minutos por IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Não conta requisições bem-sucedidas
});

/**
 * Rate limiter para criação de recursos
 * 20 criações por hora
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: {
    success: false,
    message: 'Limite de criações atingido. Tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter
};
