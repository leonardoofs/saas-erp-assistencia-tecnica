/**
 * UnderTech - Error Handler Middleware
 * Tratamento centralizado de erros
 */

/**
 * Classe para erros customizados da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Logger de erros (pode ser integrado com serviços como Sentry)
 */
const logError = (err, req) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('=== ERRO DETALHADO ===');
    console.error(errorInfo);
    console.error('Stack:', err.stack);
    console.error('=====================');
  } else {
    console.error(JSON.stringify(errorInfo));
  }
};

/**
 * Middleware de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logError(err, req);

  // Definir status code padrão
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Ambiente de desenvolvimento - retorna mais informações
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  // Ambiente de produção - retorna informações limitadas
  if (err.isOperational) {
    // Erros operacionais (conhecidos) - pode mostrar ao cliente
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }

  // Erros de programação ou desconhecidos - mensagem genérica
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Erro interno do servidor'
  });
};

/**
 * Middleware para rotas não encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Rota ${req.originalUrl} não encontrada`,
    404
  );
  next(error);
};

/**
 * Wrapper para funções async (evita try-catch repetitivo)
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  catchAsync
};
