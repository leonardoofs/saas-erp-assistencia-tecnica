# UnderTech - Sistema de Gestão para Assistência Técnica

Sistema completo de gestão para assistências técnicas de celulares, desenvolvido com Node.js, Express e JavaScript Vanilla.

## Índice

- [Características](#características)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Segurança](#segurança)
- [Desenvolvimento](#desenvolvimento)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

## Características

- Cadastro e gerenciamento de clientes
- Sistema de autenticação com JWT
- Dashboard com métricas e estatísticas
- Gestão de ordens de serviço
- Gestão de reformas
- Cálculo automático de situação do cliente
- Interface responsiva e moderna
- Validações robustas no backend e frontend
- Rate limiting para proteção contra ataques
- Logs centralizados de erros

## Tecnologias

### Backend
- **Node.js** v18+
- **Express.js** - Framework web
- **SQLite** - Banco de dados (desenvolvimento)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP headers
- **compression** - Compressão de respostas
- **express-rate-limit** - Proteção contra ataques

### Frontend
- **HTML5** Semântico
- **CSS3** (Custom Properties, Grid, Flexbox)
- **JavaScript ES6+** (Vanilla, sem frameworks)
- Arquitetura orientada a objetos

## Pré-requisitos

- Node.js v18 ou superior
- npm v8 ou superior
- Git (opcional)

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd saas-erp-assistencia-tecnica
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 4. Gere um JWT Secret seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado e cole no arquivo `.env` na variável `JWT_SECRET`.

### 5. Inicialize o banco de dados

```bash
npm run setup
```

## Configuração

Edite o arquivo `.env` com suas configurações:

```env
# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Bcrypt
BCRYPT_ROUNDS=12

# Database
DATABASE_PATH=./backend/database/undertech.db

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
HELMET_ENABLED=true
```

### Configurações Importantes

- **JWT_SECRET**: SEMPRE mude em produção. Use um hash criptograficamente seguro.
- **BCRYPT_ROUNDS**: 12 é recomendado. Não use menos que 10.
- **CORS_ORIGIN**: Em produção, especifique apenas o domínio permitido.
- **NODE_ENV**: Mude para `production` ao fazer deploy.

## Uso

### Modo Desenvolvimento

```bash
npm run dev
```

Servidor iniciará em `http://localhost:3000` com auto-reload.

### Modo Produção

```bash
npm start
```

### Acessar o Sistema

1. Abra o navegador em `http://localhost:3000`
2. Faça login com as credenciais padrão:
   - **Usuário**: admin
   - **Senha**: admin123

**IMPORTANTE**: Altere a senha padrão imediatamente!

## Estrutura do Projeto

```
saas-erp-assistencia-tecnica/
│
├── backend/
│   ├── database/
│   │   └── undertech.db           # Banco de dados SQLite
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # Configuração do banco
│   │   │   └── jwt.js             # Configuração JWT
│   │   │
│   │   ├── controllers/           # Controladores (req/res)
│   │   │   ├── authController.js
│   │   │   ├── clientesController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── ordensController.js
│   │   │   └── reformasController.js
│   │   │
│   │   ├── middlewares/           # Middlewares
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validators/
│   │   │       ├── authValidator.js
│   │   │       └── clienteValidator.js
│   │   │
│   │   ├── repositories/          # Camada de dados
│   │   │   └── clienteRepository.js
│   │   │
│   │   ├── routes/                # Definição de rotas
│   │   │   ├── auth.js
│   │   │   ├── clientes.js
│   │   │   ├── dashboard-routes.js
│   │   │   ├── ordens.js
│   │   │   └── reformas.js
│   │   │
│   │   ├── services/              # Lógica de negócio
│   │   │   ├── clienteService.js
│   │   │   └── situacaoService.js
│   │   │
│   │   └── utils/                 # Utilitários
│   │       └── validators.js
│   │
│   └── server.js                  # Entrada do servidor
│
├── frontend/
│   ├── assets/
│   │   ├── css/                   # Estilos
│   │   │   ├── variables.css
│   │   │   ├── reset.css
│   │   │   ├── layout.css
│   │   │   ├── components.css
│   │   │   └── [page].css
│   │   │
│   │   ├── js/                    # Scripts
│   │   │   ├── config.js          # Configurações
│   │   │   ├── api.js             # Cliente HTTP
│   │   │   ├── auth.js            # Autenticação
│   │   │   ├── utils.js           # Utilitários
│   │   │   └── [page].js
│   │   │
│   │   └── img/                   # Imagens
│   │
│   ├── pages/                     # Páginas HTML
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── cadastrar-cliente.html
│   │   └── listar-clientes.html
│   │
│   └── index.html                 # Página inicial
│
├── .env                           # Variáveis de ambiente (não commitar!)
├── .env.example                   # Template de variáveis
├── .gitignore                     # Arquivos ignorados pelo Git
├── package.json                   # Dependências e scripts
├── CONTEXT.txt                    # Padrões do projeto
└── README.md                      # Este arquivo
```

## API Endpoints

### Autenticação

#### POST `/api/auth/register`
Registra novo usuário.

**Body:**
```json
{
  "username": "usuario",
  "password": "senha123",
  "name": "Nome Completo",
  "email": "email@example.com"
}
```

#### POST `/api/auth/login`
Autentica usuário.

**Body:**
```json
{
  "username": "usuario",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET `/api/auth/me`
Retorna dados do usuário logado (requer autenticação).

### Clientes

Todas as rotas de clientes requerem autenticação (header `Authorization: Bearer <token>`).

#### GET `/api/clientes`
Lista clientes com paginação.

**Query Params:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 50, máximo: 100)
- `search` (opcional): Termo de busca

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

#### GET `/api/clientes/:id`
Busca cliente por ID.

#### POST `/api/clientes`
Cria novo cliente.

**Body:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678901",
  "telefone": "(11) 98765-4321",
  "telefone_contato": "(11) 3456-7890",
  "email": "joao@email.com",
  "situacao": "ativo",
  "responsavel": "Maria",
  "endereco": "Rua Example, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567",
  "observacoes": "Cliente VIP"
}
```

#### PUT `/api/clientes/:id`
Atualiza cliente existente.

#### DELETE `/api/clientes/:id`
Remove cliente (somente se não tiver ordens/reformas).

### Dashboard

#### GET `/api/dashboard/ordens-servico`
Retorna estatísticas de ordens de serviço.

#### GET `/api/dashboard/reformas`
Retorna estatísticas de reformas.

## Segurança

O sistema implementa várias camadas de segurança:

### Backend

- **Helmet**: Configura headers HTTP seguros
- **CORS**: Controla origens permitidas
- **Rate Limiting**: Previne ataques de força bruta
  - Geral: 100 requisições por 15 minutos
  - Login: 5 tentativas por 15 minutos
  - Criação: 20 registros por hora
- **Bcrypt**: Hash de senhas com 12 rounds
- **JWT**: Tokens com expiração de 24h
- **Express Validator**: Validação e sanitização de dados
- **Error Handler**: Tratamento centralizado de erros

### Frontend

- **Validação de Entrada**: CPF, telefone, email, etc.
- **Token Storage**: JWT armazenado em localStorage
- **Auto-redirect**: Redireciona para login se token inválido

### Recomendações de Produção

1. **HTTPS**: SEMPRE use HTTPS em produção
2. **JWT_SECRET**: Use um hash criptograficamente seguro (64+ caracteres)
3. **CORS**: Configure apenas os domínios específicos
4. **Rate Limiting**: Ajuste conforme necessidade
5. **Logs**: Implemente sistema de logs (Winston, Bunyan, etc.)
6. **Monitoring**: Use APM (New Relic, Datadog, etc.)
7. **Backup**: Configure backup automático do banco
8. **PostgreSQL**: Migre de SQLite para PostgreSQL

## Desenvolvimento

### Scripts Disponíveis

```bash
# Iniciar em modo desenvolvimento (com auto-reload)
npm run dev

# Iniciar em modo produção
npm start

# Executar migrações
npm run migrate

# Resetar banco de dados
npm run reset-db

# Gerar secret JWT
npm run generate-secret
```

### Padrões de Código

Siga os padrões definidos em [`CONTEXT.txt`](./CONTEXT.txt):

- **Nomenclatura**: camelCase para variáveis/funções, PascalCase para classes
- **Idioma**: Código em inglês, domínio em português
- **Commits**: Conventional Commits (feat, fix, refactor, etc.)
- **Arquitetura**: Separação em camadas (Routes → Controllers → Services → Repositories)

### Adicionando Novas Features

1. Crie uma branch: `git checkout -b feature/nome-da-feature`
2. Siga os padrões de código
3. Documente suas mudanças
4. Teste localmente
5. Faça commit seguindo Conventional Commits
6. Abra um Pull Request

## Troubleshooting

### Erro: "EADDRINUSE"

A porta 3000 já está em uso. Mude a porta no `.env`:

```env
PORT=3001
```

### Erro: "JWT Secret not configured"

Configure a variável `JWT_SECRET` no arquivo `.env`.

### Erro: "Database file not found"

Execute o setup do banco de dados:

```bash
npm run setup
```

### Erro ao fazer login

1. Verifique se o servidor está rodando
2. Verifique o console do navegador para erros
3. Verifique se o CORS está configurado corretamente
4. Verifique se o usuário existe no banco

### Frontend não carrega estilos

Verifique se os arquivos CSS estão sendo servidos corretamente. O servidor Express deve estar configurado para servir arquivos estáticos.

## Licença

Este projeto é privado e de uso exclusivo da UnderTech.

---

**Desenvolvido por Leonardo**
**Última atualização**: Janeiro 2026
**Versão**: 2.0.0
