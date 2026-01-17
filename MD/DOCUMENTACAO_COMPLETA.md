# UnderTech v2.0.0 - Documentação Completa do Sistema

**Sistema de Gestão para Assistência Técnica de Celulares**

---

## 📑 Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Tecnologias Utilizadas](#2-tecnologias-utilizadas)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Backend - API REST](#5-backend---api-rest)
6. [Frontend - Interface do Usuário](#6-frontend---interface-do-usuário)
7. [Banco de Dados](#7-banco-de-dados)
8. [Módulos Implementados](#8-módulos-implementados)
9. [Fluxos de Funcionamento](#9-fluxos-de-funcionamento)
10. [Guia de Instalação](#10-guia-de-instalação)
11. [Guia de Uso](#11-guia-de-uso)
12. [Manutenção e Expansão](#12-manutenção-e-expansão)

---

## 1. Visão Geral do Projeto

### O que é o UnderTech?

O **UnderTech** é um sistema ERP (Enterprise Resource Planning) SaaS desenvolvido especificamente para **assistências técnicas de celulares**. O sistema permite gerenciar:

- **Clientes**: Cadastro completo com situação automática (Novo, Ativo, Em Risco, Inativo)
- **Produtos**: Controle de peças e acessórios com cálculo automático de margem
- **Ordens de Serviço**: Gestão de reparos e manutenções
- **Reformas de Aparelho**: Controle de aparelhos reformados
- **Estoque**: Controle de inventário
- **Financeiro**: Gestão financeira
- **Relatórios**: Análises e insights do negócio

### Características Principais

✅ **100% Web**: Acesse de qualquer lugar
✅ **Responsivo**: Funciona em desktop, tablet e mobile
✅ **Offline-First**: Banco de dados local SQLite
✅ **Seguro**: Autenticação JWT com bcrypt
✅ **Moderno**: Interface limpa e intuitiva
✅ **Escalável**: Arquitetura em camadas

---

## 2. Tecnologias Utilizadas

### Backend (API)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | v18+ | Runtime JavaScript |
| **Express.js** | 4.x | Framework web |
| **SQLite** | 3.x | Banco de dados |
| **bcrypt** | 5.x | Hash de senhas |
| **jsonwebtoken** | 9.x | Autenticação JWT |
| **express-validator** | 7.x | Validação de dados |

### Frontend

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura das páginas |
| **CSS3** | Estilização (CSS Variables, Flexbox, Grid) |
| **JavaScript ES6+** | Lógica (Classes, Async/Await, Fetch API) |
| **Google Fonts** | Tipografia (Montserrat, Inter) |

### Ferramentas de Desenvolvimento

- **Git**: Controle de versão
- **npm**: Gerenciador de pacotes
- **Nodemon**: Hot reload do servidor

---

## 3. Arquitetura do Sistema

### Arquitetura Geral

```
┌─────────────────────────────────────────────────┐
│              FRONTEND (HTML/CSS/JS)              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Login   │  │Dashboard│  │Módulos  │         │
│  └─────────┘  └─────────┘  └─────────┘         │
└───────────────────┬─────────────────────────────┘
                    │ HTTP/JSON
                    │ (Fetch API)
┌───────────────────▼─────────────────────────────┐
│               BACKEND (Node.js)                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Routes (Endpoints REST)           │  │
│  └─────────────────┬────────────────────────┘  │
│  ┌─────────────────▼────────────────────────┐  │
│  │      Services (Lógica de Negócio)        │  │
│  └─────────────────┬────────────────────────┘  │
│  ┌─────────────────▼────────────────────────┐  │
│  │    Repositories (Acesso a Dados)         │  │
│  └─────────────────┬────────────────────────┘  │
└────────────────────┼────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         BANCO DE DADOS (SQLite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ usuarios │  │ clientes │  │ produtos │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
```

### Padrão de Arquitetura: MVC + Repository Pattern

#### 1. **Routes (Rotas)**
Definem os endpoints da API e fazem validações básicas.

```javascript
// Exemplo: /api/produtos
router.post('/', createValidation, async (req, res) => {
  // Delega para o Service
  const produto = await ProdutoService.criar(req.body);
  res.json({ success: true, data: produto });
});
```

#### 2. **Services (Serviços)**
Contêm a lógica de negócio.

```javascript
class ProdutoService {
  static async criar(dados) {
    // Validações de negócio
    await this._validarCriacaoProduto(dados);
    // Delega para o Repository
    return await ProdutoRepository.create(dados);
  }
}
```

#### 3. **Repositories (Repositórios)**
Acessam o banco de dados.

```javascript
class ProdutoRepository {
  static async create(produtoData) {
    const query = 'INSERT INTO produtos ...';
    return await runQuery(query, params);
  }
}
```

### Vantagens desta Arquitetura

✅ **Separação de Responsabilidades**: Cada camada tem uma função clara
✅ **Testabilidade**: Fácil criar testes unitários
✅ **Manutenibilidade**: Mudanças isoladas em cada camada
✅ **Escalabilidade**: Fácil adicionar novos módulos
✅ **Reutilização**: Services podem ser usados em múltiplas rotas

---

## 4. Estrutura de Pastas

```
saas-erp-assistencia-tecnica/
│
├── backend/                          # Servidor Node.js
│   ├── config/
│   │   └── database.js              # Configuração SQLite
│   ├── migrations/                   # Scripts de criação de tabelas
│   │   ├── create-usuarios-table.js
│   │   ├── create-clientes-table.js
│   │   └── create-produtos-table.js
│   ├── src/
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    # Verificação JWT
│   │   │   └── validators/          # Validações
│   │   │       ├── clienteValidator.js
│   │   │       └── produtoValidator.js
│   │   ├── repositories/            # Acesso a dados
│   │   │   ├── clienteRepository.js
│   │   │   └── produtoRepository.js
│   │   ├── routes/                  # Endpoints API
│   │   │   ├── authRoutes.js
│   │   │   ├── clienteRoutes.js
│   │   │   └── produtoRoutes.js
│   │   └── services/                # Lógica de negócio
│   │       ├── clienteService.js
│   │       ├── produtoService.js
│   │       └── situacaoService.js
│   ├── database.db                  # Banco SQLite
│   └── server.js                    # Servidor principal
│
├── frontend/                         # Interface do usuário
│   ├── assets/
│   │   ├── css/                     # Estilos
│   │   │   ├── variables.css        # Variáveis CSS globais
│   │   │   ├── reset.css            # Reset CSS
│   │   │   ├── layout.css           # Layout principal
│   │   │   ├── components.css       # Componentes
│   │   │   ├── dashboard.css        # Dashboard
│   │   │   ├── cadastrar-cliente.css
│   │   │   ├── listar-clientes.css
│   │   │   ├── cadastrar-produto.css
│   │   │   └── listar-produtos.css
│   │   └── js/                      # Scripts
│   │       ├── config.js            # Configurações
│   │       ├── utils.js             # Utilitários
│   │       ├── api.js               # Cliente HTTP
│   │       ├── auth.js              # Autenticação
│   │       ├── sidebar.js           # Navegação
│   │       ├── cadastrar-cliente.js
│   │       ├── listar-clientes.js
│   │       ├── cadastrar-produto.js
│   │       └── listar-produtos.js
│   └── pages/                       # Páginas HTML
│       ├── login.html
│       ├── dashboard.html
│       ├── cadastrar-cliente.html
│       ├── listar-clientes.html
│       ├── cadastrar-produto.html
│       └── listar-produtos.html
│
├── MD/                              # Documentação
│   ├── API.md                       # Documentação da API
│   └── DOCUMENTACAO_COMPLETA.md     # Este documento
│
├── package.json                     # Dependências
└── README.md                        # Readme do projeto
```

---

## 5. Backend - API REST

### Como Funciona a API?

A API é o **intermediário** entre o frontend (páginas que você vê) e o banco de dados (onde os dados ficam guardados).

**Analogia do Restaurante:**
- **Frontend** = Você (cliente)
- **API** = Garçom
- **Banco de Dados** = Cozinha

Você faz um pedido → O garçom leva para a cozinha → A cozinha prepara → O garçom traz de volta

### Endpoints Disponíveis

#### 🔐 Autenticação (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Criar nova conta |
| POST | `/api/auth/login` | Fazer login |

**Exemplo de uso:**

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'senha123'
  })
});

const data = await response.json();
// Retorna: { success: true, token: "eyJhbGc...", user: {...} }
```

#### 👥 Clientes (`/api/clientes`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes` | Listar clientes (com filtros) |
| GET | `/api/clientes/:id` | Buscar por ID |
| POST | `/api/clientes` | Criar cliente |
| PUT | `/api/clientes/:id` | Atualizar cliente |
| DELETE | `/api/clientes/:id` | Deletar cliente |

**Filtros disponíveis:**
- `search`: Buscar por nome, CPF ou telefone
- `page`: Página atual (padrão: 1)
- `limit`: Itens por página (padrão: 50)

**Exemplo:**

```javascript
// Listar clientes (página 1, buscar "João")
GET /api/clientes?page=1&limit=20&search=João

// Criar cliente
POST /api/clientes
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "telefone": "11999999999",
  "responsavel": "Admin"
}
```

#### 📦 Produtos (`/api/produtos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Listar produtos (com filtros) |
| GET | `/api/produtos/:id` | Buscar por ID |
| GET | `/api/produtos/recentes` | Produtos recentes |
| POST | `/api/produtos` | Criar produto |
| PUT | `/api/produtos/:id` | Atualizar produto |
| DELETE | `/api/produtos/:id` | Deletar produto |

**Filtros disponíveis:**
- `search`: Buscar por nome, código, marca ou modelo
- `categoria`: Filtrar por categoria
- `ativo`: Filtrar por status (1 = ativo, 0 = inativo)
- `page`: Página atual
- `limit`: Itens por página

**Exemplo:**

```javascript
// Listar produtos ativos de telas
GET /api/produtos?categoria=telas&ativo=1

// Criar produto
POST /api/produtos
{
  "codigo": "TELA001",
  "nome": "Tela iPhone 13",
  "categoria": "telas",
  "preco_custo": 150.00,
  "preco_venda": 280.00,
  "ativo": 1
}
```

### Autenticação JWT

Todas as rotas (exceto login e register) exigem autenticação via **JWT Token**.

**Como funciona:**

1. Usuário faz login
2. API retorna um token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Frontend salva o token no `localStorage`
4. Toda requisição inclui o token no header:

```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

5. API verifica se o token é válido
6. Se válido, processa a requisição
7. Se inválido, retorna erro 401 (Não autorizado)

### Validações

O sistema usa **express-validator** para validar dados:

**Exemplo de validação de produto:**

```javascript
// Em produtoValidator.js
const createValidation = [
  body('codigo')
    .notEmpty().withMessage('Código é obrigatório')
    .isLength({ min: 1, max: 50 }),

  body('nome')
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 255 }),

  body('preco_venda')
    .optional()
    .isFloat({ min: 0 }).withMessage('Preço deve ser positivo')
];
```

Se a validação falhar, a API retorna:

```json
{
  "success": false,
  "message": "Erros de validação",
  "errors": [
    {
      "msg": "Código é obrigatório",
      "param": "codigo",
      "location": "body"
    }
  ]
}
```

---

## 6. Frontend - Interface do Usuário

### Estrutura das Páginas

Todas as páginas seguem o mesmo padrão:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Google Fonts -->
  <!-- CSS: variables → reset → layout → components → específico -->
</head>
<body>
  <div class="app-container">
    <!-- Header (logo, notificações, usuário) -->
    <header class="header">...</header>

    <!-- Layout -->
    <div class="layout-wrapper">
      <!-- Sidebar (menu lateral) -->
      <aside class="sidebar">...</aside>

      <!-- Conteúdo principal -->
      <main class="content">...</main>
    </div>
  </div>

  <!-- Scripts: config → utils → api → auth → sidebar → específico -->
</body>
</html>
```

### Sistema de Design

#### Cores (CSS Variables)

```css
/* Cores principais */
--primary: #6b46c1;        /* Roxo principal */
--primary-dark: #553399;   /* Roxo escuro */
--primary-light: #f3effa;  /* Roxo claro */

/* Status */
--status-pendente: #f59e0b;    /* Laranja - Pendente */
--status-andamento: #3b82f6;   /* Azul - Em andamento */
--status-finalizada: #7b7bc4;  /* Roxo - Finalizada */
--status-atrasada: #e56868;    /* Vermelho - Atrasada */
--status-hoje: #c4b454;        /* Amarelo - Hoje */

/* Situação de clientes */
--situacao-novo: #7b7bc4;      /* Azul - Novo */
--situacao-ativo: #6bae6b;     /* Verde - Ativo */
--situacao-em-risco: #c4b454;  /* Amarelo - Em risco */
--situacao-inativo: #e56868;   /* Vermelho - Inativo */
```

#### Tipografia

```css
/* Títulos */
font-family: 'Montserrat', sans-serif;
font-weight: 700; /* Bold */

/* Texto */
font-family: 'Inter', sans-serif;
font-weight: 400; /* Regular */
```

#### Componentes Reutilizáveis

**Badges de Status:**

```html
<span class="badge badge-ativo">ATIVO</span>
<span class="badge badge-inativo">INATIVO</span>
```

**Badges de Situação:**

```html
<span class="situacao-badge situacao-novo">NOVO</span>
<span class="situacao-badge situacao-ativo">ATIVO</span>
<span class="situacao-badge situacao-em-risco">EM RISCO</span>
<span class="situacao-badge situacao-inativo">INATIVO</span>
```

**Botões:**

```html
<button class="btn-add">Novo Cliente</button>
<button class="btn-cadastrar">Cadastrar</button>
<button class="btn-cancelar">Cancelar</button>
```

### JavaScript - Arquitetura Orientada a Objetos

O frontend usa **classes ES6** para organizar o código:

**Exemplo: cadastrar-produto.js**

```javascript
// Classe para formatação
class Formatador {
  static formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}

// Classe para gerenciar o formulário
class FormularioProduto {
  constructor() {
    this.form = document.getElementById('form-cadastrar-produto');
    this.inicializar();
  }

  inicializar() {
    this.configurarEventos();
    this.configurarCalculoMargem();
  }

  async handleSubmit(e) {
    e.preventDefault();
    const data = this.construirDadosProduto(formData);
    await this.criarProduto(data);
  }
}

// Instanciar
const formularioProduto = new FormularioProduto();
```

### Comunicação com a API

Todas as requisições usam o módulo `api.js`:

```javascript
// api.js
const api = {
  async get(endpoint) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  async post(endpoint, data) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};

// Uso
const produtos = await api.get('/produtos');
const novoProduto = await api.post('/produtos', { codigo: 'PROD001', ... });
```

---

## 7. Banco de Dados

### Tecnologia: SQLite

**Por que SQLite?**

✅ Não precisa de servidor separado
✅ Arquivo único (`database.db`)
✅ Rápido e leve
✅ Perfeito para aplicações pequenas/médias
✅ Fácil de fazer backup (copiar o arquivo)

### Tabelas

#### 1. `usuarios`

Armazena usuários do sistema.

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nome completo
- `username`: Nome de usuário (único)
- `password`: Senha (hash bcrypt)
- `role`: Papel (admin/user)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

#### 2. `clientes`

Armazena informações dos clientes.

```sql
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  telefone_contato TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  observacoes TEXT,
  responsavel TEXT,
  ultima_compra DATETIME,
  situacao TEXT GENERATED ALWAYS AS (
    CASE
      WHEN ultima_compra IS NULL THEN 'novo'
      WHEN julianday('now') - julianday(ultima_compra) <= 90 THEN 'ativo'
      WHEN julianday('now') - julianday(ultima_compra) <= 180 THEN 'em_risco'
      ELSE 'inativo'
    END
  ) STORED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campo Calculado Automático: `situacao`**

A situação do cliente é **calculada automaticamente** pelo banco de dados baseado no campo `ultima_compra`:

- **novo**: Sem compra registrada
- **ativo**: Comprou nos últimos 90 dias (cliente quente 🔥)
- **em_risco**: Comprou entre 91-180 dias (cliente morno ⚠️)
- **inativo**: Comprou há mais de 180 dias (cliente frio ❄️)

#### 3. `produtos`

Armazena peças e acessórios.

```sql
CREATE TABLE produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'outros',
  marca TEXT,
  modelo TEXT,
  preco_custo REAL NOT NULL DEFAULT 0,
  preco_venda REAL NOT NULL DEFAULT 0,
  margem_lucro REAL GENERATED ALWAYS AS (
    CASE
      WHEN preco_custo > 0 THEN
        ((preco_venda - preco_custo) / preco_custo * 100)
      ELSE 0
    END
  ) STORED,
  fornecedor TEXT,
  observacoes TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Campo Calculado Automático: `margem_lucro`**

A margem de lucro é **calculada automaticamente** pelo banco de dados:

```
margem_lucro = ((preco_venda - preco_custo) / preco_custo) * 100
```

**Exemplo:**
- Preço de custo: R$ 100,00
- Preço de venda: R$ 150,00
- Margem: ((150 - 100) / 100) * 100 = **50%**

**Categorias disponíveis:**
- `telas`: Telas de celular
- `baterias`: Baterias
- `capinhas`: Capinhas e cases
- `acessorios`: Acessórios diversos
- `outros`: Outros produtos

### Migrations (Criação de Tabelas)

As tabelas são criadas através de **migrations** (scripts):

```javascript
// backend/migrations/create-produtos-table.js
const db = require('../config/database');

db.run(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    // ... campos
  )
`, (err) => {
  if (err) {
    console.error('❌ Erro ao criar tabela:', err);
  } else {
    console.log('✅ Tabela produtos criada com sucesso!');
  }
});
```

**Como executar:**

```bash
node backend/migrations/create-produtos-table.js
```

---

## 8. Módulos Implementados

### 8.1. Módulo de Autenticação 🔐

**Funcionalidades:**
- ✅ Registro de novos usuários
- ✅ Login com username/password
- ✅ Hash de senha com bcrypt
- ✅ Geração de token JWT
- ✅ Verificação de token em todas as rotas protegidas
- ✅ Logout (limpa token do localStorage)

**Arquivos:**
- Backend: `authRoutes.js`, `authMiddleware.js`
- Frontend: `login.html`, `auth.js`

**Fluxo de Login:**

1. Usuário digita username e senha
2. Frontend envia POST para `/api/auth/login`
3. Backend verifica se usuário existe
4. Backend compara senha (bcrypt.compare)
5. Se válido, gera token JWT
6. Frontend salva token no localStorage
7. Frontend redireciona para dashboard

---

### 8.2. Módulo de Dashboard 📊

**Funcionalidades:**
- ✅ Cards de status (Pendentes, Hoje, Em Andamento, Finalizadas, Atrasadas)
- ✅ Gráfico de ordens de serviço
- ✅ Modo de busca rápida
- ✅ Navegação sidebar com dropdowns

**Arquivos:**
- Frontend: `dashboard.html`, `dashboard.css`, `dashboard.js`

**Componentes:**
- **Welcome Section**: Boas-vindas com nome do usuário
- **Status Cards**: Visão rápida dos status
- **Charts**: Gráficos de desempenho
- **Search Mode**: Busca rápida de clientes/produtos

---

### 8.3. Módulo de Clientes 👥

#### 8.3.1. Cadastrar Cliente

**Funcionalidades:**
- ✅ Formulário com duas abas (Dados Gerais, Campos Adicionais)
- ✅ Validação de CPF
- ✅ Máscaras de input (CPF, telefone, CEP)
- ✅ Checkbox "Não sabe o CPF"
- ✅ Responsável preenchido automaticamente
- ✅ Tabela de últimos cadastros
- ✅ Edição inline

**Arquivos:**
- Frontend: `cadastrar-cliente.html`, `cadastrar-cliente.js`, `cadastrar-cliente.css`
- Backend: `clienteRoutes.js`, `clienteService.js`, `clienteRepository.js`

**Validações:**
- CPF: 11 dígitos, algoritmo de validação
- Telefone: 10 ou 11 dígitos
- Nome: Obrigatório, mínimo 3 caracteres

**Campos:**
- **Obrigatórios**: Nome, CPF (ou "Não sabe"), Telefone, Responsável
- **Opcionais**: Telefone contato, Instagram, Endereço, Cidade, Estado, CEP, Observações

#### 8.3.2. Listar Clientes

**Funcionalidades:**
- ✅ Listagem paginada (20 itens/página)
- ✅ Busca em tempo real
- ✅ Badges de situação (Novo, Ativo, Em Risco, Inativo)
- ✅ Ações: Visualizar, Editar, Deletar
- ✅ Modal de detalhes completo
- ✅ Filtros e ordenação

**Arquivos:**
- Frontend: `listar-clientes.html`, `listar-clientes.js`, `listar-clientes.css`

**Badges de Situação:**

```css
/* NOVO - Azul */
.situacao-novo {
  background: linear-gradient(135deg, #7b7bc4 0%, #5a5aa8 100%);
}

/* ATIVO - Verde */
.situacao-ativo {
  background: linear-gradient(135deg, #6bae6b 0%, #5a9a5a 100%);
}

/* EM RISCO - Amarelo */
.situacao-em-risco {
  background: linear-gradient(135deg, #c4b454 0%, #a89943 100%);
}

/* INATIVO - Vermelho */
.situacao-inativo {
  background: linear-gradient(135deg, #e56868 0%, #c45a5a 100%);
}
```

---

### 8.4. Módulo de Produtos 📦

#### 8.4.1. Cadastrar Produto

**Funcionalidades:**
- ✅ Formulário com duas abas (Dados Gerais, Campos Adicionais)
- ✅ Cálculo automático de margem de lucro
- ✅ Categorias predefinidas
- ✅ Status ativo/inativo
- ✅ Tabela de últimos produtos cadastrados
- ✅ Validação de preço de venda vs custo

**Arquivos:**
- Frontend: `cadastrar-produto.html`, `cadastrar-produto.js`, `cadastrar-produto.css`
- Backend: `produtoRoutes.js`, `produtoService.js`, `produtoRepository.js`

**Campos:**
- **Obrigatórios**: Código (SKU), Nome
- **Opcionais**: Descrição, Categoria, Marca, Modelo, Preço Custo, Preço Venda, Fornecedor, Observações, Status

**Cálculo de Margem:**

O sistema calcula a margem em **dois lugares**:

1. **No formulário** (JavaScript em tempo real):
```javascript
const margem = ((precoVenda - precoCusto) / precoCusto) * 100;
margemDisplay.value = formatarPorcentagem(margem);
```

2. **No banco de dados** (campo calculado):
```sql
margem_lucro REAL GENERATED ALWAYS AS (
  ((preco_venda - preco_custo) / preco_custo * 100)
) STORED
```

**Aviso de Margem Negativa:**

Se o preço de venda for menor que o custo, o sistema exibe um aviso:

```javascript
if (precoVenda < precoCusto) {
  const confirmar = confirm('⚠️ Atenção: O preço de venda é menor que o preço de custo. Deseja continuar mesmo assim?');
  if (!confirmar) return false;
}
```

#### 8.4.2. Listar Produtos

**Funcionalidades:**
- ✅ Listagem paginada (20 itens/página)
- ✅ Busca em tempo real (nome, código, marca, modelo)
- ✅ Filtros: Categoria, Status
- ✅ Badges de status (Ativo/Inativo)
- ✅ Modal de detalhes completo
- ✅ Ações: Visualizar, Editar, Deletar
- ✅ Exibição de margem de lucro

**Arquivos:**
- Frontend: `listar-produtos.html`, `listar-produtos.js`, `listar-produtos.css`

**Filtros Disponíveis:**

```html
<!-- Filtro de Categoria -->
<select id="categoria-filter">
  <option value="">Todas as categorias</option>
  <option value="telas">Telas</option>
  <option value="baterias">Baterias</option>
  <option value="capinhas">Capinhas</option>
  <option value="acessorios">Acessórios</option>
  <option value="outros">Outros</option>
</select>

<!-- Filtro de Status -->
<select id="status-filter">
  <option value="">Todos os status</option>
  <option value="1">Ativos</option>
  <option value="0">Inativos</option>
</select>
```

---

## 9. Fluxos de Funcionamento

### 9.1. Fluxo: Cadastrar um Cliente

```
┌─────────────────────────────────────────────┐
│ 1. Usuário acessa cadastrar-cliente.html   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 2. JavaScript carrega nome do responsável  │
│    (auth.getUser().name)                    │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 3. Usuário preenche formulário:            │
│    - Nome: "João Silva"                     │
│    - CPF: "123.456.789-00"                  │
│    - Telefone: "(11) 99999-9999"            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 4. Usuário clica em "Cadastrar"            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 5. JavaScript valida campos:               │
│    - CPF válido? ✅                         │
│    - Telefone válido? ✅                    │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 6. JavaScript envia POST para API:         │
│    POST /api/clientes                       │
│    {                                        │
│      nome: "João Silva",                    │
│      cpf: "12345678900",                    │
│      telefone: "11999999999",               │
│      responsavel: "Admin"                   │
│    }                                        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 7. API valida dados (express-validator)    │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 8. ClienteService.criar() valida:          │
│    - CPF único no banco? ✅                 │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 9. ClienteRepository.create() insere no DB │
│    INSERT INTO clientes (...)               │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 10. API retorna sucesso:                   │
│     {                                       │
│       success: true,                        │
│       message: "Cliente cadastrado!",       │
│       data: { id: 1, nome: "João", ... }    │
│     }                                       │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 11. JavaScript mostra toast de sucesso     │
│     "✅ Cliente cadastrado com sucesso!"    │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 12. Limpa formulário e recarrega tabela    │
│     de últimos cadastros                    │
└─────────────────────────────────────────────┘
```

### 9.2. Fluxo: Cálculo Automático de Situação do Cliente

```
┌─────────────────────────────────────────────┐
│ Cliente cadastrado sem compras              │
│ ultima_compra = NULL                        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ Banco calcula situação:                     │
│ WHEN ultima_compra IS NULL THEN 'novo'      │
└──────────────────┬──────────────────────────┘
                   ▼
        ┌──────────────────┐
        │ Situação = NOVO  │
        │ Badge Azul 🔵    │
        └──────────────────┘

        ... Cliente faz uma compra ...

┌─────────────────────────────────────────────┐
│ Sistema registra compra:                    │
│ UPDATE clientes                             │
│ SET ultima_compra = '2026-01-16'            │
│ WHERE id = 1                                │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ Banco recalcula automaticamente:            │
│ julianday('now') - julianday(ultima_compra) │
│ = 0 dias (hoje)                             │
└──────────────────┬──────────────────────────┘
                   ▼
        ┌──────────────────┐
        │ Situação = ATIVO │
        │ Badge Verde 🟢   │
        └──────────────────┘

        ... Passam 100 dias sem compra ...

┌─────────────────────────────────────────────┐
│ Banco recalcula automaticamente:            │
│ = 100 dias                                  │
│ WHEN dias <= 180 THEN 'em_risco'            │
└──────────────────┬──────────────────────────┘
                   ▼
      ┌──────────────────────┐
      │ Situação = EM RISCO  │
      │ Badge Amarelo 🟡     │
      └──────────────────────┘

        ... Passam mais 100 dias (total 200) ...

┌─────────────────────────────────────────────┐
│ Banco recalcula automaticamente:            │
│ = 200 dias                                  │
│ ELSE 'inativo'                              │
└──────────────────┬──────────────────────────┘
                   ▼
       ┌──────────────────────┐
       │ Situação = INATIVO   │
       │ Badge Vermelho 🔴    │
       └──────────────────────┘
```

### 9.3. Fluxo: Editar um Produto

```
┌─────────────────────────────────────────────┐
│ 1. Usuário clica em "Editar" no produto #5 │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 2. Redireciona para:                        │
│    cadastrar-produto.html?edit=5            │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 3. JavaScript detecta parâmetro "edit"      │
│    const editId = URLSearchParams.get('edit') │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 4. Busca dados do produto:                 │
│    GET /api/produtos/5                      │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 5. API retorna dados:                       │
│    {                                        │
│      id: 5,                                 │
│      codigo: "TELA001",                     │
│      nome: "Tela iPhone 13",                │
│      preco_custo: 150.00,                   │
│      preco_venda: 280.00,                   │
│      margem_lucro: 86.67                    │
│    }                                        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 6. JavaScript preenche formulário           │
│    com os dados retornados                  │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 7. Botão muda de "Cadastrar" para          │
│    "Atualizar Produto"                      │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 8. Usuário altera preço de venda para      │
│    R$ 300,00                                │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 9. Margem recalcula automaticamente:        │
│    ((300 - 150) / 150) * 100 = 100%         │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 10. Usuário clica em "Atualizar"           │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 11. JavaScript envia PUT para API:         │
│     PUT /api/produtos/5                     │
│     { ... dados atualizados ... }           │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 12. API atualiza no banco:                 │
│     UPDATE produtos SET ... WHERE id = 5    │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 13. Toast de sucesso e redireciona para    │
│     listar-produtos.html                    │
└─────────────────────────────────────────────┘
```

---

## 10. Guia de Instalação

### Pré-requisitos

- **Node.js** v18 ou superior ([baixar](https://nodejs.org/))
- **Git** ([baixar](https://git-scm.com/))
- Editor de código (recomendado: VS Code)

### Passo a Passo

#### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/saas-erp-assistencia-tecnica.git
cd saas-erp-assistencia-tecnica
```

#### 2. Instalar dependências

```bash
npm install
```

Isso instala:
- express
- bcrypt
- jsonwebtoken
- express-validator
- sqlite3
- nodemon (dev)

#### 3. Criar as tabelas do banco de dados

```bash
# Criar tabela de usuários
node backend/migrations/create-usuarios-table.js

# Criar tabela de clientes
node backend/migrations/create-clientes-table.js

# Criar tabela de produtos
node backend/migrations/create-produtos-table.js
```

Você verá mensagens de sucesso:
```
✅ Tabela usuarios criada com sucesso!
✅ Tabela clientes criada com sucesso!
✅ Tabela produtos criada com sucesso!
```

#### 4. Criar primeiro usuário

Acesse: `http://localhost:3000/pages/login.html`

Clique em "Criar Conta" e preencha:
- Nome: Seu Nome
- Usuário: admin
- Senha: senha123

#### 5. Iniciar o servidor

```bash
npm start
```

Você verá:
```
Conectado ao banco de dados SQLite
Banco de dados inicializado com sucesso
🚀 Servidor rodando em http://localhost:3000
```

#### 6. Acessar o sistema

Abra o navegador em: `http://localhost:3000/pages/login.html`

Faça login com as credenciais que você criou!

---

## 11. Guia de Uso

### 11.1. Primeiro Acesso

1. **Login**
   - Acesse `http://localhost:3000/pages/login.html`
   - Digite usuário e senha
   - Clique em "Entrar"

2. **Dashboard**
   - Você verá a tela inicial com os cards de status
   - No menu lateral (sidebar), você tem acesso a todos os módulos

### 11.2. Cadastrar Cliente

1. Menu lateral → **Clientes** → **Cadastrar cliente**
2. Preencha os campos obrigatórios:
   - Nome
   - CPF (ou marque "Não sabe")
   - Telefone
   - Responsável (preenchido automaticamente)
3. Opcionalmente, clique na aba "Campos Adicionais" para adicionar:
   - Endereço
   - Cidade, Estado, CEP
   - Observações
4. Clique em **Cadastrar**
5. ✅ Cliente cadastrado com sucesso!

### 11.3. Visualizar Clientes

1. Menu lateral → **Clientes** → **Listar clientes**
2. Você verá todos os clientes cadastrados
3. Use a **barra de busca** para filtrar por nome, CPF ou telefone
4. Observe as **badges de situação**:
   - 🔵 **NOVO**: Cliente sem compras
   - 🟢 **ATIVO**: Comprou nos últimos 90 dias
   - 🟡 **EM RISCO**: Comprou entre 91-180 dias
   - 🔴 **INATIVO**: Comprou há mais de 180 dias

### 11.4. Editar Cliente

**Opção 1: Da tabela de cadastro**
1. Na página de cadastro, role até a tabela "Últimos cadastros"
2. Clique no ícone de **lápis** (editar)

**Opção 2: Da listagem**
1. Em "Listar clientes"
2. Clique no ícone de **lápis** (editar) na linha do cliente
3. Faça as alterações
4. Clique em **Atualizar Cliente**

### 11.5. Cadastrar Produto

1. Menu lateral → **Produtos** → **Cadastrar produto**
2. Preencha os campos:
   - **Código (SKU)**: Código único (ex: TELA001)
   - **Nome**: Nome do produto
   - **Categoria**: Selecione (Telas, Baterias, etc.)
   - **Preço de Custo**: Quanto você pagou
   - **Preço de Venda**: Quanto vai vender
3. Observe que a **Margem de Lucro** é calculada automaticamente!
4. Opcionalmente, adicione Marca, Modelo, Fornecedor, Observações
5. Clique em **Cadastrar**

### 11.6. Visualizar Produtos

1. Menu lateral → **Produtos** → **Listar produtos**
2. Você verá todos os produtos
3. Use os **filtros**:
   - Busca por nome/código/marca/modelo
   - Filtro de categoria
   - Filtro de status (Ativo/Inativo)
4. Clique no ícone de **olho** para ver detalhes completos

### 11.7. Sair do Sistema

Clique no **ícone de usuário** no canto superior direito do cabeçalho.

---

## 12. Manutenção e Expansão

### 12.1. Como Adicionar um Novo Módulo

Vamos usar o exemplo de criar um módulo "Ordens de Serviço".

#### Passo 1: Criar a Migração (Banco de Dados)

Crie: `backend/migrations/create-ordens-table.js`

```javascript
const db = require('../config/database');

db.run(`
  CREATE TABLE IF NOT EXISTS ordens_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    valor REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  )
`, (err) => {
  if (err) {
    console.error('❌ Erro ao criar tabela:', err);
  } else {
    console.log('✅ Tabela ordens_servico criada!');
  }
  db.close();
});
```

Execute: `node backend/migrations/create-ordens-table.js`

#### Passo 2: Criar o Repository

Crie: `backend/src/repositories/ordemRepository.js`

```javascript
const { runQuery, getQuery, allQuery } = require('../config/database');

class OrdemRepository {
  static async findAll({ page = 1, limit = 50 }) {
    const offset = (page - 1) * limit;
    const query = 'SELECT * FROM ordens_servico ORDER BY created_at DESC LIMIT ? OFFSET ?';
    return await allQuery(query, [limit, offset]);
  }

  static async findById(id) {
    const query = 'SELECT * FROM ordens_servico WHERE id = ?';
    return await getQuery(query, [id]);
  }

  static async create(ordemData) {
    const query = `
      INSERT INTO ordens_servico (cliente_id, descricao, status, valor)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      ordemData.cliente_id,
      ordemData.descricao,
      ordemData.status || 'pendente',
      ordemData.valor || 0
    ];
    const result = await runQuery(query, params);
    return await this.findById(result.lastID);
  }

  // ... outros métodos (update, delete)
}

module.exports = OrdemRepository;
```

#### Passo 3: Criar o Service

Crie: `backend/src/services/ordemService.js`

```javascript
const OrdemRepository = require('../repositories/ordemRepository');

class OrdemService {
  static async listar(filters = {}) {
    return await OrdemRepository.findAll(filters);
  }

  static async buscarPorId(id) {
    const ordem = await OrdemRepository.findById(id);
    if (!ordem) {
      throw new Error('Ordem de serviço não encontrada');
    }
    return ordem;
  }

  static async criar(dadosOrdem) {
    // Validações de negócio aqui
    return await OrdemRepository.create(dadosOrdem);
  }

  // ... outros métodos
}

module.exports = OrdemService;
```

#### Passo 4: Criar as Routes

Crie: `backend/src/routes/ordemRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const OrdemService = require('../services/ordemService');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { page, limit } = req.query;
    const ordens = await OrdemService.listar({ page, limit });
    res.json({ success: true, data: ordens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ordem = await OrdemService.criar(req.body);
    res.status(201).json({ success: true, data: ordem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ... outras rotas

module.exports = router;
```

#### Passo 5: Registrar as Routes no Server

Em `backend/server.js`, adicione:

```javascript
app.use('/api/ordens', require('./src/routes/ordemRoutes'));
```

#### Passo 6: Criar o Frontend

Crie os arquivos:
- `frontend/pages/cadastrar-ordem.html`
- `frontend/pages/listar-ordens.html`
- `frontend/assets/js/cadastrar-ordem.js`
- `frontend/assets/js/listar-ordens.js`
- `frontend/assets/css/cadastrar-ordem.css`
- `frontend/assets/css/listar-ordens.css`

Siga o mesmo padrão dos módulos de Clientes e Produtos!

#### Passo 7: Adicionar ao Menu

Em `frontend/pages/dashboard.html`, o dropdown de Ordens de Serviço já existe! Basta atualizar os links:

```html
<li class="nav-item-dropdown" id="dropdown-ordens">
  <button class="nav-item-toggle">
    <span>Ordens de serviço</span>
  </button>
  <ul class="nav-submenu">
    <li><a href="cadastrar-ordem.html">Cadastrar O.S.</a></li>
    <li><a href="listar-ordens.html">Listar O.S.</a></li>
  </ul>
</li>
```

### 12.2. Padrões de Código

#### Nomenclatura

- **Arquivos**: camelCase ou kebab-case
  - ✅ `clienteRepository.js`
  - ✅ `cadastrar-cliente.html`
  - ❌ `Cliente_repository.js`

- **Classes**: PascalCase
  - ✅ `class ClienteService`
  - ❌ `class clienteService`

- **Funções/Variáveis**: camelCase
  - ✅ `async function criarCliente()`
  - ✅ `const nomeCompleto`
  - ❌ `const nome_completo`

- **Constantes**: UPPER_SNAKE_CASE
  - ✅ `const API_URL`
  - ✅ `const MAX_RETRY_ATTEMPTS`

#### Comentários

Use comentários JSDoc:

```javascript
/**
 * Cria um novo cliente no sistema
 *
 * @param {Object} dadosCliente - Dados do cliente
 * @param {string} dadosCliente.nome - Nome completo
 * @param {string} dadosCliente.cpf - CPF sem formatação
 * @returns {Promise<Object>} Cliente criado
 * @throws {Error} Se CPF já existe
 */
static async criar(dadosCliente) {
  // implementação
}
```

#### Estrutura de Funções Assíncronas

Sempre use try/catch:

```javascript
async function carregarClientes() {
  try {
    const response = await api.get('/clientes');
    // processar resposta
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    utils.showToast('Erro ao carregar clientes', 'error');
  }
}
```

### 12.3. Boas Práticas

#### 1. Segurança

✅ **FAÇA:**
- Sempre valide dados no backend
- Use prepared statements (proteção contra SQL injection)
- Hash senhas com bcrypt
- Verifique tokens JWT em rotas protegidas
- Sanitize inputs

❌ **NÃO FAÇA:**
- Confiar apenas em validações do frontend
- Armazenar senhas em texto plano
- Expor informações sensíveis em mensagens de erro

#### 2. Performance

✅ **FAÇA:**
- Use paginação em listagens grandes
- Implemente debounce em buscas (500ms)
- Minimize requisições à API
- Cache dados quando apropriado

❌ **NÃO FAÇA:**
- Carregar todos os registros de uma vez
- Fazer requisições a cada tecla digitada

#### 3. Manutenibilidade

✅ **FAÇA:**
- Siga o padrão existente (Repository → Service → Routes)
- Reutilize componentes e estilos
- Documente código complexo
- Use nomes descritivos

❌ **NÃO FAÇA:**
- Criar código duplicado
- Usar nomes vagos (`data`, `temp`, `x`)
- Deixar código comentado sem motivo

### 12.4. Backup e Restauração

#### Fazer Backup

O banco de dados é um único arquivo: `backend/database.db`

Para fazer backup:

```bash
# Windows
copy backend\database.db backup\database_2026-01-16.db

# Linux/Mac
cp backend/database.db backup/database_$(date +%Y-%m-%d).db
```

#### Restaurar Backup

```bash
# Windows
copy backup\database_2026-01-16.db backend\database.db

# Linux/Mac
cp backup/database_2026-01-16.db backend/database.db
```

**Dica:** Configure backups automáticos diários!

### 12.5. Troubleshooting

#### Problema: "Token inválido" ao fazer login

**Causa:** Token expirou ou foi corrompido

**Solução:**
1. Abra o console do navegador (F12)
2. Execute: `localStorage.removeItem('token')`
3. Faça login novamente

#### Problema: "Erro ao conectar com a API"

**Causa:** Servidor não está rodando

**Solução:**
1. Verifique se o servidor está ativo: `npm start`
2. Verifique se está na porta 3000: `http://localhost:3000`

#### Problema: Tabela não existe

**Causa:** Migração não foi executada

**Solução:**
Execute as migrações:

```bash
node backend/migrations/create-usuarios-table.js
node backend/migrations/create-clientes-table.js
node backend/migrations/create-produtos-table.js
```

#### Problema: Margem de lucro não aparece

**Causa:** Versão antiga do SQLite sem suporte a GENERATED ALWAYS

**Solução:**
Atualize o SQLite para versão 3.31.0 ou superior

---

## 📚 Glossário

- **API**: Interface de programação de aplicações - intermediário entre frontend e backend
- **Backend**: Parte do servidor que processa lógica e dados
- **bcrypt**: Biblioteca para criar hash de senhas
- **CRUD**: Create, Read, Update, Delete - operações básicas
- **Endpoint**: URL específica da API (ex: `/api/clientes`)
- **Frontend**: Parte visual do sistema (HTML/CSS/JS)
- **Hash**: Transformação irreversível de texto (usado em senhas)
- **JWT**: JSON Web Token - token de autenticação
- **Margem de Lucro**: Percentual de lucro sobre o custo
- **Migration**: Script para criar/modificar tabelas do banco
- **Repository**: Camada que acessa o banco de dados
- **REST**: Estilo de arquitetura de APIs
- **Service**: Camada com lógica de negócio
- **SQLite**: Banco de dados leve em arquivo único
- **Token**: Código único para autenticação

---

## 📞 Suporte e Contribuição

### Encontrou um bug?

1. Verifique se já não foi reportado
2. Abra uma issue no GitHub com:
   - Descrição do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)

### Quer contribuir?

1. Fork o projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona nova feature'`
4. Push para a branch: `git push origin minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 🎉 Conclusão

Parabéns! Você agora tem uma compreensão completa do sistema **UnderTech v2.0.0**.

Este documento cobriu:
- ✅ Arquitetura e tecnologias
- ✅ Estrutura de pastas
- ✅ Como funciona o backend (API)
- ✅ Como funciona o frontend
- ✅ Banco de dados e tabelas
- ✅ Todos os módulos implementados
- ✅ Fluxos de funcionamento
- ✅ Instalação e uso
- ✅ Como expandir o sistema

**Próximos passos sugeridos:**

1. Implementar módulo de **Ordens de Serviço**
2. Implementar módulo de **Estoque**
3. Adicionar **relatórios e gráficos**
4. Implementar **notificações em tempo real**
5. Adicionar **exportação para PDF/Excel**

---

**Desenvolvido com ❤️ para assistências técnicas de celulares**

**UnderTech v2.0.0** - Sistema de Gestão Completo

---

*Última atualização: 16 de Janeiro de 2026*
