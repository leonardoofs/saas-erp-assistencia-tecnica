const bcrypt = require('bcryptjs');
const { runQuery, getQuery } = require('../config/database');
const { generateToken } = require('../config/jwt');
const { AppError } = require('../middlewares/errorHandler');

// Número de rounds do bcrypt (configurável via env)
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Registrar novo usuário
 */
const register = async (req, res, next) => {
  try {
    const { username, password, name, email } = req.body;

    // Verificar se usuário já existe
    const userExists = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (userExists) {
      throw new AppError('Usuário ou email já cadastrado', 400);
    }

    // Hash da senha com rounds configuráveis
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Inserir usuário
    const result = await runQuery(
      'INSERT INTO users (username, password, name, email) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, email]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: result.id,
        username,
        name
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuário
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Buscar usuário
    const user = await getQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      throw new AppError('Usuário ou senha inválidos', 401);
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Usuário ou senha inválidos', 401);
    }

    // Gerar token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Obter dados do usuário logado
 */
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};