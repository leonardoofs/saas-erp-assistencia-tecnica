const { verifyToken } = require('../config/jwt');
const { getQuery } = require('../config/database');

/**
 * Middleware para verificar autenticação
 * Valida o token JWT e adiciona o usuário ao request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Buscar token no header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    // Extrair token (formato: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // Verificar token
    const decoded = verifyToken(token);
    
    // Buscar usuário no banco
    const user = await getQuery(
      'SELECT id, username, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar se usuário é admin
 */
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};