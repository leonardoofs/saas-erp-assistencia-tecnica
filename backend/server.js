require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./src/config/database');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard-routes');
const clientesRoutes = require('./src/routes/clientes');
const ordensRoutes = require('./src/routes/ordens');
const reformasRoutes = require('./src/routes/reformas');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/reformas', reformasRoutes);

// Rota raiz - redireciona para frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

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