# Guia de Migração para a Versão 2.0

Este guia ajuda na transição do código antigo para a nova versão refatorada.

---

## Tabela de Conteúdos
- [Frontend](#frontend)
- [Backend](#backend)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Testes](#testes)
- [Deploy](#deploy)

---

## Frontend

### Migração do cadastrar-cliente.js

#### Opção 1: Usar a Versão Refatorada (Recomendado)

1. Faça backup do arquivo atual:
```bash
cp frontend/assets/js/cadastrar-cliente.js frontend/assets/js/cadastrar-cliente-old.js
```

2. Substitua pelo arquivo refatorado:
```bash
cp frontend/assets/js/cadastrar-cliente-refactored.js frontend/assets/js/cadastrar-cliente.js
```

3. Adicione o arquivo de configuração no HTML **ANTES** de outros scripts:
```html
<!-- Em cadastrar-cliente.html -->
<script src="../assets/js/config.js"></script>
<script src="../assets/js/utils.js"></script>
<script src="../assets/js/auth.js"></script>
<script src="../assets/js/api.js"></script>
<script src="../assets/js/cadastrar-cliente.js"></script>
```

#### Opção 2: Migração Gradual

Se preferir manter o código atual e migrar gradualmente:

1. **Adicione o arquivo config.js** no seu HTML
2. **Atualize o api.js** para usar CONFIG
3. **Migre função por função** usando as classes como referência

**Exemplo de migração de máscara:**

```javascript
// Código antigo
function aplicarMascaraCPF(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  input.value = value;
}

// Código novo (reutilizável)
class InputMask {
  static aplicarCPF(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  }
}

// Uso
cpfInput.addEventListener('input', (e) => {
  e.target.value = InputMask.aplicarCPF(e.target.value);
});
```

### Atualizando Outros Arquivos

#### api.js

Se ainda não atualizou:

```javascript
// Antes
const API_BASE_URL = 'http://localhost:3000/api';
const api = new ApiClient(API_BASE_URL);

// Depois
const api = new ApiClient(); // Usa CONFIG.API_BASE_URL automaticamente
```

#### Outros arquivos .js

Adicione verificação de CONFIG onde necessário:

```javascript
// No início do arquivo
if (typeof CONFIG === 'undefined') {
  console.error('CONFIG não carregado. Adicione config.js no HTML.');
}
```

---

## Backend

### Atualizando Controllers

#### Padrão Antigo
```javascript
const criarCliente = async (req, res) => {
  try {
    // lógica
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erro interno'
    });
  }
};
```

#### Padrão Novo
```javascript
const { AppError } = require('../middlewares/errorHandler');

const criarCliente = async (req, res, next) => {
  try {
    // lógica

    // Para erros conhecidos
    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    res.json({ success: true });
  } catch (error) {
    next(error); // Passa para o middleware de erros
  }
};
```

### Adicionando Validações nas Rotas

#### Antes
```javascript
router.post('/', clientesController.criarCliente);
```

#### Depois
```javascript
const { validateCreateCliente } = require('../middlewares/validators/clienteValidator');

router.post('/', validateCreateCliente, clientesController.criarCliente);
```

### Usando CatchAsync (Opcional)

Para evitar try-catch repetitivo:

```javascript
const { catchAsync } = require('../middlewares/errorHandler');

const criarCliente = catchAsync(async (req, res) => {
  // Não precisa de try-catch
  // Erros são capturados automaticamente
  const cliente = await ClienteService.criar(req.body);
  res.json({ success: true, data: cliente });
});
```

---

## Variáveis de Ambiente

### Adicione as Novas Variáveis

Edite seu `.env`:

```env
# Novas variáveis obrigatórias
BCRYPT_ROUNDS=12
HELMET_ENABLED=true

# Novas variáveis opcionais (com valores padrão)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Atualize essas (importante para segurança)
CORS_ORIGIN=http://localhost:3000  # Era '*' antes
JWT_SECRET=<gere_um_novo_secret_seguro>
```

### Gerar Novo JWT Secret

```bash
npm run generate-secret
```

Copie o resultado e cole no `.env`.

---

## Server.js

### Adicione os Novos Middlewares

```javascript
// No topo
const helmet = require('helmet');
const compression = require('compression');
const { generalLimiter, authLimiter } = require('./src/middlewares/rateLimiter');
const { errorHandler, notFoundHandler } = require('./src/middlewares/errorHandler');

// Depois das importações
if (process.env.HELMET_ENABLED === 'true') {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(compression());
app.use('/api/', generalLimiter);

// Nas rotas
app.use('/api/auth', authLimiter, authRoutes);

// No final (substituir tratamento de erros antigo)
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## Testes

### Estrutura Recomendada

```
tests/
├── unit/
│   ├── services/
│   ├── validators/
│   └── utils/
├── integration/
│   ├── auth.test.js
│   └── clientes.test.js
└── e2e/
    └── fluxo-completo.test.js
```

### Exemplo de Teste (Jest + Supertest)

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../backend/server');

describe('POST /api/auth/login', () => {
  it('deve retornar token com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  it('deve rejeitar credenciais inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'senha_errada'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

---

## Deploy

### Checklist de Produção

#### 1. Ambiente

```bash
# .env de produção
NODE_ENV=production
PORT=443
JWT_SECRET=<secret_super_seguro_64_chars>
CORS_ORIGIN=https://seudominio.com
HELMET_ENABLED=true
BCRYPT_ROUNDS=12
```

#### 2. Banco de Dados

Migrar de SQLite para PostgreSQL:

```javascript
// backend/src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

#### 3. HTTPS

Configure reverse proxy (Nginx):

```nginx
server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. Process Manager

Use PM2:

```bash
npm install -g pm2
pm2 start backend/server.js --name undertech
pm2 startup
pm2 save
```

#### 5. Logs

Configure logs estruturados:

```bash
npm install winston
```

```javascript
// backend/src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

#### 6. Monitoramento

Configure APM (New Relic, Datadog, etc):

```javascript
// No topo do server.js
require('newrelic'); // ou outro APM
```

---

## Rollback (Se Necessário)

### Se algo der errado:

1. **Frontend**:
```bash
cp frontend/assets/js/cadastrar-cliente-old.js frontend/assets/js/cadastrar-cliente.js
```

2. **Backend**:
```bash
git checkout HEAD~1 backend/server.js
git checkout HEAD~1 backend/src/routes/
```

3. **Variáveis de Ambiente**:
```bash
cp .env.backup .env
```

---

## Suporte

### Problemas Comuns

#### Erro: "CONFIG is not defined"

**Solução**: Adicione `<script src="../assets/js/config.js"></script>` antes de outros scripts.

#### Erro: "Cannot find module 'helmet'"

**Solução**: Execute `npm install helmet compression express-rate-limit`

#### Erro: Rate limit muito restritivo

**Solução**: Ajuste as variáveis no `.env`:
```env
RATE_LIMIT_MAX_REQUESTS=200  # Aumentar limite
RATE_LIMIT_WINDOW_MS=900000  # Manter janela
```

#### Erro: CORS bloqueando requisições

**Solução**: Configure CORS_ORIGIN corretamente:
```env
# Desenvolvimento
CORS_ORIGIN=http://localhost:3000

# Produção
CORS_ORIGIN=https://seudominio.com
```

---

## Verificação Pós-Migração

Execute este checklist:

- [ ] `npm install` concluído sem erros
- [ ] `npm run setup` executado
- [ ] Arquivo `.env` configurado corretamente
- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Login funciona
- [ ] CRUD de clientes funciona
- [ ] Validações estão ativas
- [ ] Rate limiting funciona (teste múltiplas requisições)
- [ ] Erros são logados corretamente
- [ ] Frontend carrega sem erros no console
- [ ] Máscaras funcionam
- [ ] Todas as páginas acessíveis

---

## Contato

Para dúvidas sobre a migração, consulte:
- [README.md](README.md) - Documentação geral
- [API.md](API.md) - Documentação da API
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças
- [MELHORIAS-IMPLEMENTADAS.md](MELHORIAS-IMPLEMENTADAS.md) - Detalhes das melhorias

---

**Boa sorte com a migração!** 🚀
