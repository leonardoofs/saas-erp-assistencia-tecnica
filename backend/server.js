require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const db = require('./src/config/database');

// Importar middlewares
const { generalLimiter, authLimiter } = require('./src/middlewares/rateLimiter');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard-routes');
const clientesRoutes = require('./src/routes/clientes');
const ordensRoutes = require('./src/routes/ordens');
const reformasRoutes = require('./src/routes/reformas');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
if (process.env.HELMET_ENABLED === 'true') {
  app.use(helmet({
    contentSecurityPolicy: false // Desabilitar CSP para permitir inline scripts do frontend
  }));
}

// CORS configurado
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compressão de respostas
app.use(compression());

// Rate limiting geral
app.use('/api/', generalLimiter);

// Parsers de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Log de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas da API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/reformas', reformasRoutes);

// Rota raiz - redireciona para frontend
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Tratamento de rotas não encontradas (404)
app.use(notFoundHandler);

// Tratamento global de erros
app.use(errorHandler);

// Inicializar banco de dados e servidor
db.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════');
      console.log(`UnderTech Server rodando!`);
      console.log(`Porta: ${PORT}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV}`);
      console.log('═══════════════════════════════════════');
    });
  })
  .catch(err => {
    console.error('Erro ao inicializar servidor:', err);
    process.exit(1);
  });