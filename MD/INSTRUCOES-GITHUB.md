# Instruções para Commit no GitHub - UnderTech v2.0.0

Este documento contém as instruções detalhadas para fazer o commit e push do projeto no GitHub.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que:

- [ ] Git está instalado (`git --version`)
- [ ] Você tem uma conta no GitHub
- [ ] Todos os testes foram executados e passaram
- [ ] Servidor funciona corretamente com `npm run dev`

---

## 🚀 Passo a Passo

### 1. Inicializar Repositório Git (Se Necessário)

```bash
cd "d:\1. LEONARDO\UnderTech\Sistema\saas-erp-assistencia-tecnica"

# Verificar se já é um repositório
git status

# Se não for, inicializar
git init
```

---

### 2. Configurar Git (Primeira Vez)

```bash
# Configurar nome
git config user.name "Leonardo"

# Configurar email
git config user.email "seu-email@example.com"

# Verificar configurações
git config --list
```

---

### 3. Verificar Arquivos a Serem Commitados

```bash
# Ver status
git status

# Ver o que será adicionado
git add --dry-run .
```

**Arquivos que DEVEM ser commitados:**
- ✅ Todos os arquivos `.js`, `.html`, `.css`
- ✅ Todos os arquivos de documentação (`.md`)
- ✅ `package.json` e `package-lock.json`
- ✅ `.env.example`
- ✅ `.gitignore`
- ✅ Scripts em `scripts/`
- ✅ Arquivos de backend em `backend/`
- ✅ Arquivos de frontend em `frontend/`

**Arquivos que NÃO devem ser commitados:**
- ❌ `.env` (credenciais)
- ❌ `node_modules/` (dependências)
- ❌ `*.db` (banco de dados)
- ❌ `*.log` (logs)
- ❌ `cadastrar-cliente-backup.js` (backup local)

---

### 4. Verificar .gitignore

```bash
cat .gitignore
```

**Deve conter:**
```
# Dependencies
node_modules/
package-lock.json  # Pode remover esta linha se quiser versionar
yarn.lock

# Environment variables
.env
.env.local
.env.production
.env.*.local

# Database
*.db
*.db-journal
backend/database/*.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Build
dist/
build/
.cache/

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp

# Archives
*.zip
*.tar.gz
*.rar

# Backups locais
*-backup.js
*-old.js

# Test files
frontend/pages/teste-api.html
backend/migrations/seed-test-*.js
backend/migrations/clean-test-*.js
```

---

### 5. Adicionar Arquivos ao Staging

```bash
# Adicionar todos os arquivos (respeitando .gitignore)
git add .

# Verificar o que foi adicionado
git status
```

**Saída esperada:**
```
On branch main

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   API.md
        new file:   BEST-PRACTICES.md
        new file:   CHANGELOG.md
        new file:   CHECKLIST-TESTES.md
        new file:   INSTRUCOES-GITHUB.md
        ...
        modified:   backend/server.js
        modified:   frontend/assets/js/api.js
        ...
```

---

### 6. Criar Commit

```bash
git commit -m "feat: implementa melhorias completas v2.0.0

## Segurança
- Adiciona rate limiting em 3 níveis (geral, login, criação)
- Implementa Helmet para headers HTTP seguros
- Configura CORS restritivo
- Aumenta rounds do bcrypt para 12
- Adiciona compressão de respostas

## Validações
- Implementa express-validator em todas as rotas
- Cria validadores para clientes e autenticação
- Adiciona sanitização automática de dados
- Mensagens de erro detalhadas e estruturadas

## Arquitetura
- Cria middleware centralizado de erros (errorHandler)
- Implementa classe AppError para erros customizados
- Refatora frontend em arquitetura OOP (classes)
- Adiciona configuração centralizada (config.js)

## Frontend
- Refatora cadastrar-cliente.js em classes:
  - InputMask (máscaras reutilizáveis)
  - Validador (validações client-side)
  - FormularioCliente (gerenciamento completo)
  - ListaClientesRecentes (renderização)
  - GerenciadorClientes (ações CRUD)
- Cria arquivo config.js para configurações
- Atualiza api.js para usar CONFIG dinâmico
- Adiciona config.js em todos os HTMLs

## Documentação
- Cria README.md completo (instalação, uso, estrutura)
- Cria API.md (documentação completa da API)
- Cria CHANGELOG.md (histórico de versões)
- Cria MELHORIAS-IMPLEMENTADAS.md (detalhamento técnico)
- Cria MIGRATION-GUIDE.md (guia de migração)
- Cria BEST-PRACTICES.md (melhores práticas)
- Cria CHECKLIST-TESTES.md (testes completos)
- Cria RELATORIO-MODIFICACOES.md (resumo executivo)
- Adiciona .env.example documentado

## Scripts
- Cria script de setup automático (npm run setup)
- Cria gerador de JWT secret (npm run generate-secret)
- Adiciona scripts ao package.json

## Performance
- Adiciona compressão gzip/deflate
- Otimiza queries SQL
- Limita tamanho de body
- Adiciona cache de configurações

## Dependências
- Instala helmet (^8.1.0)
- Instala compression (^1.8.1)
- Instala express-rate-limit (^8.2.1)

## Limpeza
- Remove arquivos duplicados
- Remove arquivos temporários
- Organiza estrutura de pastas
- Adiciona backups locais ao .gitignore

## Versão
- Atualiza package.json para v2.0.0
- Melhora descrição do projeto

BREAKING CHANGES: Nenhuma
COMPATIBILIDADE: Mantida com v1.0.0
TESTES: Checklist completo em CHECKLIST-TESTES.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### 7. Verificar Commit

```bash
# Ver último commit
git log -1

# Ver arquivos no commit
git show --name-only
```

---

### 8. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. **Nome do repositório**: `undertech-saas-erp` (ou nome de sua escolha)
3. **Descrição**: "Sistema completo e profissional de gestão para assistência técnica de celulares"
4. **Visibilidade**:
   - ✅ **Private** (recomendado - projeto empresarial)
   - ⚠️ Public (apenas se quiser compartilhar)
5. **NÃO marque**:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Clique em **Create repository**

---

### 9. Conectar Repositório Local ao GitHub

**GitHub vai mostrar comandos. Use estes:**

```bash
# Renomear branch para main (se necessário)
git branch -M main

# Adicionar origin
git remote add origin https://github.com/SEU-USUARIO/undertech-saas-erp.git

# Verificar remote
git remote -v
```

---

### 10. Fazer Push

```bash
# Primeira vez (com -u para tracking)
git push -u origin main
```

**Será solicitado autenticação:**
- Opção 1: Username + Personal Access Token
- Opção 2: GitHub CLI
- Opção 3: SSH Key

---

### 11. Verificar no GitHub

1. Acesse: https://github.com/SEU-USUARIO/undertech-saas-erp
2. Verifique:
   - [ ] Todos os arquivos presentes
   - [ ] README.md aparece formatado
   - [ ] .env não está lá (confidencial)
   - [ ] node_modules não está lá
   - [ ] Descrição do commit correta

---

## 🔐 Autenticação no GitHub

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em **Generate new token (classic)**
3. Selecione escopos:
   - [x] repo (todos)
   - [x] workflow
4. Gere o token
5. **COPIE O TOKEN** (não será mostrado novamente)
6. Use como senha ao fazer push

**Salvar credenciais (opcional):**
```bash
git config credential.helper store
```

---

### Opção 2: SSH Key

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub
# https://github.com/settings/keys
```

Depois, usar URL SSH:
```bash
git remote set-url origin git@github.com:SEU-USUARIO/undertech-saas-erp.git
git push -u origin main
```

---

## 📝 Commits Futuros

### Workflow Normal

```bash
# 1. Ver mudanças
git status

# 2. Adicionar mudanças
git add .

# 3. Commitar
git commit -m "tipo(escopo): mensagem curta

Descrição detalhada (opcional)
"

# 4. Enviar
git push
```

---

### Tipos de Commit (Conventional Commits)

```bash
# Nova funcionalidade
git commit -m "feat(clientes): adiciona filtro por cidade"

# Correção de bug
git commit -m "fix(auth): corrige validação de token"

# Refatoração
git commit -m "refactor(services): extrai lógica para helper"

# Documentação
git commit -m "docs: atualiza README com novos endpoints"

# Estilo/formatação
git commit -m "style: formata código com prettier"

# Testes
git commit -m "test(clientes): adiciona testes unitários"

# Manutenção
git commit -m "chore: atualiza dependências de segurança"

# Performance
git commit -m "perf(queries): otimiza busca de clientes"
```

---

## 🌿 Trabalhando com Branches

### Criar Feature Branch

```bash
# Criar e mudar para nova branch
git checkout -b feature/nome-da-feature

# Fazer mudanças e commitar
git add .
git commit -m "feat: implementa nova feature"

# Enviar branch
git push -u origin feature/nome-da-feature
```

### Merge para Main

```bash
# Voltar para main
git checkout main

# Fazer merge
git merge feature/nome-da-feature

# Enviar
git push

# Deletar branch local (opcional)
git branch -d feature/nome-da-feature

# Deletar branch remota (opcional)
git push origin --delete feature/nome-da-feature
```

---

## 🔄 Sincronizar com GitHub

### Baixar Mudanças

```bash
# Buscar e mesclar
git pull

# Ou separado
git fetch
git merge origin/main
```

---

## ↩️ Desfazer Mudanças

### Antes do Commit

```bash
# Descartar mudanças em arquivo específico
git checkout -- arquivo.js

# Descartar todas as mudanças
git reset --hard HEAD
```

### Depois do Commit (Local)

```bash
# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Desfazer último commit (descarta mudanças)
git reset --hard HEAD~1
```

### Depois do Push

```bash
# Reverter commit específico
git revert <commit-hash>
git push
```

---

## 📊 Status do Repositório

### Ver Histórico

```bash
# Log simples
git log --oneline

# Log detalhado
git log --graph --decorate --all

# Log de um arquivo
git log --follow arquivo.js
```

### Ver Diferenças

```bash
# Diferenças não commitadas
git diff

# Diferenças de arquivo específico
git diff arquivo.js

# Diferenças entre commits
git diff commit1 commit2
```

---

## 🏷️ Tags e Releases

### Criar Tag

```bash
# Tag leve
git tag v2.0.0

# Tag anotada (recomendado)
git tag -a v2.0.0 -m "Versão 2.0.0 - Refatoração completa"

# Enviar tag
git push origin v2.0.0

# Enviar todas as tags
git push --tags
```

### Criar Release no GitHub

1. Acesse: https://github.com/SEU-USUARIO/undertech-saas-erp/releases
2. Clique em **Create a new release**
3. Tag: `v2.0.0`
4. Título: "v2.0.0 - Sistema Profissional Completo"
5. Descrição: Copie do CHANGELOG.md
6. Clique em **Publish release**

---

## 🐛 Troubleshooting

### Erro: "fatal: not a git repository"

```bash
git init
```

### Erro: "remote origin already exists"

```bash
git remote remove origin
git remote add origin <url>
```

### Erro: "failed to push some refs"

```bash
# Baixar mudanças primeiro
git pull --rebase origin main
git push
```

### Erro: "Authentication failed"

- Verificar Personal Access Token
- Verificar SSH key
- Tentar GitHub CLI: `gh auth login`

### Conflitos de Merge

```bash
# 1. Ver arquivos em conflito
git status

# 2. Editar arquivos manualmente

# 3. Marcar como resolvido
git add arquivo-resolvido.js

# 4. Finalizar merge
git commit
```

---

## ✅ Checklist Final

Antes de fazer push:

- [ ] Todos os testes passaram
- [ ] Sem erros no código
- [ ] .env não está sendo commitado
- [ ] node_modules não está sendo commitado
- [ ] Commit message segue padrão
- [ ] README atualizado
- [ ] CHANGELOG atualizado

Depois do push:

- [ ] Verificar no GitHub que tudo está correto
- [ ] Verificar que .env não foi exposto
- [ ] Testar clone em outro diretório
- [ ] Documentar mudanças importantes

---

## 📚 Recursos Úteis

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Docs](https://docs.github.com/)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

**Seu projeto está pronto para o GitHub!** 🎉

**Próximos passos após o push:**
1. Configurar GitHub Actions (CI/CD) - opcional
2. Configurar branch protection rules
3. Adicionar colaboradores (se necessário)
4. Criar issues para melhorias futuras
5. Configurar Projects para organização

---

**Boa sorte!** 🚀
