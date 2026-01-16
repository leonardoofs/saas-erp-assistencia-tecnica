# Melhores Práticas - UnderTech

Este documento descreve as melhores práticas para desenvolvimento, manutenção e deploy do projeto UnderTech.

---

## Índice
- [Desenvolvimento](#desenvolvimento)
- [Git e Versionamento](#git-e-versionamento)
- [Segurança](#segurança)
- [Performance](#performance)
- [Testes](#testes)
- [Deploy](#deploy)
- [Monitoramento](#monitoramento)

---

## Desenvolvimento

### Configuração do Ambiente

#### Sempre Use Variáveis de Ambiente

```javascript
// ❌ Evitar
const JWT_SECRET = 'meu_secret_hardcoded';
const PORT = 3000;

// ✅ Preferir
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
```

#### Nunca Commite Credenciais

```bash
# .gitignore deve conter:
.env
.env.local
.env.production
*.db
node_modules/
```

#### Use Configurações Separadas

```javascript
// config/development.js
module.exports = {
  db: {
    host: 'localhost',
    debug: true
  }
};

// config/production.js
module.exports = {
  db: {
    host: process.env.DB_HOST,
    debug: false
  }
};
```

---

### Arquitetura e Organização

#### Siga a Separação de Camadas

```
Routes → Controllers → Services → Repositories → Database
```

**Regras:**
- Controllers **não** acessam o banco diretamente
- Services contêm **toda** a lógica de negócio
- Repositories são a **única** interface com o banco
- Routes apenas definem endpoints e middlewares

#### Exemplo Correto

```javascript
// ✅ CORRETO
// Route
router.post('/clientes', validateCreateCliente, clientesController.criarCliente);

// Controller
const criarCliente = async (req, res, next) => {
  try {
    const cliente = await ClienteService.criar(req.body);
    res.status(201).json({ success: true, data: cliente });
  } catch (error) {
    next(error);
  }
};

// Service
static async criar(dadosCliente) {
  await this._validarCriacaoCliente(dadosCliente);
  const dadosNormalizados = this._normalizarDadosCliente(dadosCliente);
  return await ClienteRepository.create(dadosNormalizados);
}

// Repository
static async create(dados) {
  const sql = 'INSERT INTO clientes (...) VALUES (...)';
  return await db.run(sql, [dados]);
}
```

#### Exemplo Incorreto

```javascript
// ❌ ERRADO - Controller acessando banco diretamente
const criarCliente = async (req, res) => {
  const sql = 'INSERT INTO clientes (...) VALUES (...)';
  await db.run(sql, [req.body]);
  res.json({ success: true });
};
```

---

### Nomenclatura

#### JavaScript/TypeScript

```javascript
// Variáveis e funções: camelCase
const nomeCliente = 'João';
function buscarClientePorId(id) { }

// Classes: PascalCase
class ClienteService { }
class ApiClient { }

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'http://...';

// Privado (convenção): prefixo _
class ClienteService {
  static _validarDados(dados) { } // Método privado
}

// Boolean: prefixos is, has, should
const isValid = true;
const hasPermission = false;
const shouldRedirect = true;
```

#### Arquivos e Pastas

```bash
# Arquivos: kebab-case
cliente-service.js
auth-middleware.js

# Pastas: lowercase (inglês)
controllers/
services/
middlewares/
```

#### Rotas

```javascript
// kebab-case
GET /api/clientes
POST /api/ordens-servico
PUT /api/perfil-usuario
```

---

### Tratamento de Erros

#### Use AppError para Erros Conhecidos

```javascript
const { AppError } = require('../middlewares/errorHandler');

// ✅ CORRETO
if (!cliente) {
  throw new AppError('Cliente não encontrado', 404);
}

if (cpfDuplicado) {
  throw new AppError('CPF já cadastrado', 400);
}

// ❌ EVITAR
if (!cliente) {
  res.status(404).json({ success: false, message: 'Não encontrado' });
  return;
}
```

#### Sempre Passe Erros para next()

```javascript
// ✅ CORRETO
const controller = async (req, res, next) => {
  try {
    // lógica
  } catch (error) {
    next(error); // Middleware de erros trata
  }
};

// ❌ EVITAR
const controller = async (req, res) => {
  try {
    // lógica
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
```

#### Use CatchAsync para Código Limpo

```javascript
const { catchAsync } = require('../middlewares/errorHandler');

// ✅ CORRETO - Sem try-catch repetitivo
const listarClientes = catchAsync(async (req, res) => {
  const clientes = await ClienteService.listar(req.query);
  res.json({ success: true, data: clientes });
});
```

---

### Validações

#### Sempre Valide no Backend

Mesmo que o frontend valide, **sempre** valide no backend.

```javascript
// ✅ CORRETO
const { validateCreateCliente } = require('../middlewares/validators/clienteValidator');
router.post('/clientes', validateCreateCliente, controller);
```

#### Use Express-Validator

```javascript
// ✅ CORRETO
body('email')
  .trim()
  .isEmail().withMessage('Email inválido')
  .normalizeEmail()

// ❌ EVITAR validação manual
if (!email || !email.includes('@')) {
  throw new Error('Email inválido');
}
```

---

## Git e Versionamento

### Commits

#### Use Conventional Commits

```bash
# Formato
<type>(<scope>): <subject>

# Tipos
feat: nova funcionalidade
fix: correção de bug
refactor: refatoração sem mudar funcionalidade
docs: apenas documentação
style: formatação, ponto e vírgula, etc
test: adição de testes
chore: manutenção (deps, config, etc)

# Exemplos
feat(clientes): adiciona validação de CPF
fix(auth): corrige token expirado não redirecionando
refactor(services): extrai lógica para ClienteService
docs: atualiza README com instruções de deploy
chore: atualiza dependências de segurança
```

#### Boas Práticas

```bash
# ✅ CORRETO
git commit -m "feat(clientes): adiciona busca por CPF"

# ❌ EVITAR
git commit -m "alterações"
git commit -m "fix"
git commit -m "mudanças diversas"
```

---

### Branches

#### Estratégia de Branches

```
main (produção)
  ↓
develop (desenvolvimento)
  ↓
feature/nome-da-feature
hotfix/nome-do-bug
```

#### Nomenclatura

```bash
# Features
git checkout -b feature/cadastro-produtos
git checkout -b feature/relatorio-vendas

# Correções
git checkout -b fix/validacao-cpf
git checkout -b fix/erro-login

# Hotfixes (produção)
git checkout -b hotfix/corrige-calculo-total
```

---

## Segurança

### Autenticação

#### JWT

```javascript
// ✅ CORRETO
const token = jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// ❌ EVITAR
const token = jwt.sign(
  { id: user.id, password: user.password }, // Não inclua senha!
  'secret_fraco',
  { expiresIn: '30d' } // Muito tempo
);
```

#### Senhas

```javascript
// ✅ CORRETO
const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const hash = await bcrypt.hash(password, rounds);

// ❌ EVITAR
const hash = await bcrypt.hash(password, 5); // Muito fraco
const hash = await bcrypt.hash(password, 15); // Muito lento
```

---

### Validação e Sanitização

```javascript
// ✅ CORRETO
body('nome')
  .trim() // Remove espaços
  .escape() // Escapa HTML
  .notEmpty()
  .isLength({ min: 3, max: 100 })

// ✅ CORRETO
const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não-dígitos

// ❌ EVITAR SQL Injection
const sql = `SELECT * FROM users WHERE id = ${req.params.id}`; // PERIGOSO!

// ✅ CORRETO - Use prepared statements
const sql = 'SELECT * FROM users WHERE id = ?';
await db.get(sql, [req.params.id]);
```

---

### CORS

```javascript
// ❌ EVITAR em produção
app.use(cors({ origin: '*' }));

// ✅ CORRETO
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

---

### Rate Limiting

```javascript
// ✅ CORRETO - Rate limit por tipo de rota
app.use('/api/', generalLimiter);      // 100 req/15min
app.use('/api/auth', authLimiter);     // 5 req/15min
app.use('/api/clientes', createLimiter); // 20 req/hora
```

---

## Performance

### Database

#### Use Índices

```sql
-- ✅ CORRETO
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_ordens_cliente_id ON ordens_servico(cliente_id);
```

#### Limite Resultados

```javascript
// ✅ CORRETO
const clientes = await ClienteRepository.findAll({
  limit: 50,
  offset: (page - 1) * 50
});

// ❌ EVITAR
const clientes = await db.all('SELECT * FROM clientes'); // Todos!
```

#### Selecione Apenas Necessário

```javascript
// ✅ CORRETO
const sql = 'SELECT id, nome, cpf FROM clientes WHERE ...';

// ❌ EVITAR
const sql = 'SELECT * FROM clientes WHERE ...';
```

---

### API

#### Use Compressão

```javascript
// ✅ CORRETO (já implementado)
const compression = require('compression');
app.use(compression());
```

#### Cache de Respostas

```javascript
// ✅ CORRETO
const cache = new Map();

const getDashboard = async (req, res) => {
  const cacheKey = 'dashboard_stats';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return res.json(cached.data);
  }

  const data = await DashboardService.getStats();
  cache.set(cacheKey, { data, timestamp: Date.now() });

  res.json(data);
};
```

---

## Testes

### Estrutura

```javascript
describe('ClienteService', () => {
  describe('criar', () => {
    it('deve criar cliente com dados válidos', async () => {
      // Arrange
      const dadosCliente = {
        nome: 'João Silva',
        telefone: '11987654321'
      };

      // Act
      const resultado = await ClienteService.criar(dadosCliente);

      // Assert
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeGreaterThan(0);
    });

    it('deve rejeitar CPF inválido', async () => {
      // Arrange
      const dadosCliente = {
        nome: 'João Silva',
        cpf: '12345678901', // inválido
        telefone: '11987654321'
      };

      // Act & Assert
      await expect(ClienteService.criar(dadosCliente))
        .rejects
        .toThrow('CPF inválido');
    });
  });
});
```

---

## Deploy

### Checklist

```bash
# 1. Variáveis de Ambiente
NODE_ENV=production
JWT_SECRET=<64_chars_secure>
CORS_ORIGIN=https://seudominio.com
DATABASE_URL=postgresql://...

# 2. Dependências
npm ci --production

# 3. Build (se necessário)
npm run build

# 4. Migrações
npm run migrate

# 5. Health Check
curl https://seudominio.com/api/health

# 6. Logs
pm2 logs undertech
```

---

### Nginx

```nginx
# /etc/nginx/sites-available/undertech
server {
    listen 443 ssl http2;
    server_name seudominio.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # Segurança
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoramento

### Logs Estruturados

```javascript
// ✅ CORRETO
const logger = require('./config/logger');

logger.info('Cliente criado', {
  clienteId: cliente.id,
  userId: req.user.id,
  timestamp: new Date()
});

logger.error('Erro ao processar pagamento', {
  error: error.message,
  stack: error.stack,
  orderId: ordem.id
});

// ❌ EVITAR
console.log('Cliente criado');
console.error('Erro:', error);
```

---

### Métricas

```javascript
// Exemplo com Prometheus
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
});
```

---

### Health Check

```javascript
// ✅ CORRETO
app.get('/health', async (req, res) => {
  try {
    // Verificar banco
    await db.get('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

## Resumo

### Sempre Faça
- ✅ Valide dados no backend
- ✅ Use variáveis de ambiente
- ✅ Siga a arquitetura em camadas
- ✅ Trate erros adequadamente
- ✅ Use HTTPS em produção
- ✅ Implemente rate limiting
- ✅ Faça logs estruturados
- ✅ Escreva testes
- ✅ Use commits descritivos
- ✅ Documente mudanças

### Nunca Faça
- ❌ Commite credenciais
- ❌ Use `SELECT *` em queries
- ❌ Acesse banco no controller
- ❌ Ignore erros
- ❌ Use CORS aberto (`*`) em produção
- ❌ Hardcode valores sensíveis
- ❌ Ignore warnings de segurança
- ❌ Pule validações no backend
- ❌ Deploy sem testes
- ❌ Use senhas fracas

---

**Mantenha este documento atualizado conforme o projeto evolui!**
