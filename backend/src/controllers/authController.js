const bcrypt = require('bcryptjs');
const { runQuery, getQuery } = require('../config/database');
const { generateToken } = require('../config/jwt');

/**
 * Registrar novo usuário
 */
const register = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    // Validação básica
    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Preencha todos os campos obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const userExists = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário ou email já cadastrado'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

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
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
};

/**
 * Login de usuário
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuário e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const user = await getQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário ou senha inválidos'
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Usuário ou senha inválidos'
      });
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
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
};

/**
 * Obter dados do usuário logado
 */
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};