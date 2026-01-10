# UnderTech - Sistema de Gestão para Assistência Técnica

## 📋 Sobre o Projeto

Sistema completo de gestão para assistências técnicas de celulares, desenvolvido com arquitetura moderna e escalável.

---

## 🚀 Tecnologias Utilizadas

### Frontend
- HTML5 Semântico
- CSS3 (Custom Properties + Grid/Flexbox)
- JavaScript ES6+ (Modular)

### Backend
- Node.js + Express
- JWT para autenticação
- Bcrypt para criptografia de senhas
- SQLite (desenvolvimento) → PostgreSQL (produção)

---

## 📁 Estrutura do Projeto

```
undertech/
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── variables.css      # Cores, fontes, espaçamentos
│   │   │   ├── reset.css          # Normalização CSS
│   │   │   ├── layout.css         # Estrutura (sidebar, header)
│   │   │   ├── components.css     # Botões, cards, forms
│   │   │   ├── search-mode        # 
│   │   │   └── dashboard.css      # Específico do dashboard
│   │   ├── js/
│   │   │   ├── auth.js           # Gerenciamento de autenticação
│   │   │   ├── dashboard.js      # Lógica do dashboard
│   │   │   ├── api.js            # Cliente HTTP (fetch wrapper)
│   │   │   ├── router.js         # Sistema de rotas SPA
│   │   │   └── utils.js          # Funções auxiliares
│   │   └── img/
│   │       └── icons/            # Ícones SVG (NÃO POSSUI NENHUMA PASTA AINDA)
│   ├── pages/
│   │   ├── login.html
│   │   └── dashboard.html
│   └── index.html                # Entry point
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── dashboardController.js
│   │   ├── models/ (NÃO POSSUI ESSA PASTA E ESSES ARQUIVOS)
│   │   │   ├── User.js
│   │   │   ├── OrdemServico.js
│   │   │   └── Reforma.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── dashboard-routes.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js (NÃO POSSUI ESSE ARQUIVO)
│   │   └── config/
│   │       ├── database.js
│   │       └── jwt.js
│   ├── database/ (ESSA PASTA COM O ARQUIVO NÃO EXISTE)
│   │   └── undertech.db         # SQLite (gerado automaticamente)
│   └── server.js                # Entry point do backend
│
├── .env                         # Variáveis de ambiente
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Instalação e Configuração

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clone ou baixe o projeto**

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
PORT=3000
JWT_SECRET=sua_chave_secreta_super_segura_aqui
NODE_ENV=development
```

4. **Inicie o backend**
```bash
npm run dev
```
O servidor estará rodando em `http://localhost:3000`

5. **Abra o frontend**
Abra o arquivo `frontend/index.html` no navegador ou use um servidor local:
```bash
# Com Live Server (VS Code) ou
npx serve frontend
```

---

## 🔐 Autenticação

### Primeiro Acesso

O sistema criará automaticamente um usuário administrador:
- **Usuário:** admin
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere a senha padrão após o primeiro login!

### Como funciona

1. Usuário faz login → Backend valida credenciais
2. Backend gera token JWT → Frontend armazena no localStorage
3. Todas as requisições incluem o token no header
4. Backend valida token antes de processar requisições

---

## 📊 Módulos do Sistema

### ✅ FASE 1 - Implementado
- [x] Sistema de autenticação completo
- [x] Layout base (sidebar + header)
- [x] Dashboard inicial com toggle
- [x] API REST documentada
- [x] Banco de dados estruturado

### 🔄 FASE 2 - Em Desenvolvimento
- [ ] CRUD Ordens de Serviço
- [ ] Filtros e pesquisa
- [ ] Gestão de status e prioridades

### 📅 FASE 3 - Planejado
- [ ] CRUD Reformas de Aparelho
- [ ] Integração completa com dashboard

### 📅 FASE 4 - Planejado
- [ ] Clientes
- [ ] Produtos
- [ ] Estoque
- [ ] Financeiro
- [ ] Vendas
- [ ] Relatórios
- [ ] Configurações

---

## 🎨 Guia de Estilo

### Paleta de Cores
```css
--primary-orange: #FF9505;
--secondary-orange: #FEB062;
--dark-orange: #CC7600;
--dark-bg: #2B2B2B;
--darker-bg: #1C1C1C;
--darkest-bg: #131313;
--medium-gray: #505050;
--light-gray: #D4D4D2;
```

### Tipografia
- **Fredoka One:** Títulos e elementos de destaque
- **Montserrat:** Corpo de texto e interface

---

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/register    # Criar novo usuário
POST   /api/auth/login       # Fazer login
POST   /api/auth/logout      # Fazer logout
GET    /api/auth/me          # Dados do usuário logado
```

### Dashboard
```
GET    /api/dashboard/ordens-servico    # Stats de ordens
GET    /api/dashboard/reformas          # Stats de reformas
```

### Ordens de Serviço (FASE 2)
```
GET    /api/ordens           # Listar todas
POST   /api/ordens           # Criar nova
GET    /api/ordens/:id       # Buscar por ID
PUT    /api/ordens/:id       # Atualizar
DELETE /api/ordens/:id       # Deletar
```

### Reformas (FASE 3)
```
GET    /api/reformas         # Listar todas
POST   /api/reformas         # Criar nova
GET    /api/reformas/:id     # Buscar por ID
PUT    /api/reformas/:id     # Atualizar
DELETE /api/reformas/:id     # Deletar
```

---

## 🛡️ Segurança

### Implementado
✅ Senhas com hash bcrypt (10 rounds)  
✅ Tokens JWT com expiração  
✅ Validação de inputs  
✅ Headers de segurança  
✅ CORS configurado  
✅ Proteção contra SQL Injection  

### Próximos passos
- [ ] Rate limiting
- [ ] Logs de auditoria
- [ ] 2FA (autenticação de dois fatores)
- [ ] Backup automático do banco

---

## 📱 Responsividade

O sistema é **mobile-first** e se adapta a:
- 📱 Mobile (320px - 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (1024px+)

---

## 🐛 Debug e Logs

### Modo Desenvolvimento
```bash
npm run dev
```
Logs detalhados no console.

### Modo Produção
```bash
npm start
```
Apenas erros críticos são logados.

---

## 📦 Deploy

### Preparação para Produção

1. **Variáveis de ambiente**
```env
NODE_ENV=production
JWT_SECRET=chave_super_segura_gerada_randomicamente
DATABASE_URL=postgresql://...
```

2. **Migrar para PostgreSQL**
```bash
npm install pg pg-hstore
# Ajustar config/database.js
```

3. **Build do frontend**
```bash
# Minificar CSS/JS se necessário
npm run build
```

4. **Plataformas recomendadas**
- Backend: Heroku, Railway, Render
- Frontend: Vercel, Netlify
- Banco: Railway, Supabase, ElephantSQL

---

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento. Sugestões e melhorias são bem-vindas!

---

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

## 📞 Suporte

Dúvidas ou problemas? Entre em contato!

---

**Desenvolvido com 💙 para UnderTech**