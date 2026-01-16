# Checklist de Testes - UnderTech v2.0.0

Este documento contém todos os testes que devem ser executados para garantir que o sistema está funcionando corretamente após as melhorias implementadas.

---

## 📋 Índice
- [Pré-requisitos](#pré-requisitos)
- [Testes de Instalação](#testes-de-instalação)
- [Testes de Backend](#testes-de-backend)
- [Testes de Frontend](#testes-de-frontend)
- [Testes de Segurança](#testes-de-segurança)
- [Testes de Performance](#testes-de-performance)
- [Testes End-to-End](#testes-end-to-end)
- [Checklist Final](#checklist-final)

---

## Pré-requisitos

### Antes de Começar

- [ ] Node.js v18+ instalado
- [ ] npm v8+ instalado
- [ ] Git configurado (opcional)
- [ ] Navegador moderno (Chrome, Firefox, Edge)
- [ ] Editor de texto para logs

---

## Testes de Instalação

### 1. Instalação de Dependências

```bash
cd "d:\1. LEONARDO\UnderTech\Sistema\saas-erp-assistencia-tecnica"
npm install
```

**Verificar:**
- [ ] Comando executado sem erros
- [ ] Pasta `node_modules` criada
- [ ] Arquivo `package-lock.json` atualizado
- [ ] Total de 243 pacotes instalados

**Se houver erro:**
- Verificar conexão com internet
- Limpar cache: `npm cache clean --force`
- Tentar novamente

---

### 2. Setup Inicial

```bash
npm run setup
```

**Verificar:**
- [ ] Arquivo `.env` criado automaticamente
- [ ] JWT_SECRET gerado automaticamente
- [ ] Diretório `backend/database` criado
- [ ] Banco de dados inicializado
- [ ] Mensagem de sucesso exibida

**Saída Esperada:**
```
=================================================
UnderTech - Setup Inicial do Projeto
=================================================

Criando arquivo .env...
Arquivo .env criado com sucesso!
JWT_SECRET gerado automaticamente.

Criando diretório do banco de dados...
Diretório criado com sucesso!

Inicializando banco de dados...
Banco de dados inicializado com sucesso!

=================================================
Setup concluído com sucesso!
=================================================
```

**Se houver erro:**
- Verificar permissões de escrita
- Verificar se `.env` já existe
- Verificar se diretórios podem ser criados

---

### 3. Verificar Arquivos Criados

```bash
ls -la
```

**Verificar:**
- [ ] `.env` existe e não está vazio
- [ ] `.env.example` existe
- [ ] `backend/database/undertech.db` criado
- [ ] Todos os arquivos de documentação presentes

---

## Testes de Backend

### 1. Iniciar Servidor

```bash
npm run dev
```

**Verificar:**
- [ ] Servidor inicia sem erros
- [ ] Porta 3000 disponível
- [ ] Mensagem de inicialização aparece:

```
═══════════════════════════════════════
UnderTech Server rodando!
Porta: 3000
URL: http://localhost:3000
Ambiente: development
═══════════════════════════════════════
```

**Se houver erro "EADDRINUSE":**
- Porta 3000 já em uso
- Mudar PORT no `.env`
- Ou matar processo: `npx kill-port 3000`

---

### 2. Health Check

Abrir navegador em: `http://localhost:3000`

**Verificar:**
- [ ] Página inicial carrega
- [ ] Sem erros no console do navegador
- [ ] Sem erros no terminal do servidor

---

### 3. Testar Endpoints da API

#### Teste de Login (Sem Rate Limit)

Abrir Postman/Insomnia ou usar cURL:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Verificar:**
- [ ] Status 200 OK
- [ ] Resposta contém token
- [ ] Resposta contém dados do usuário
- [ ] Token JWT válido

**Resposta Esperada:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "name": "Administrador",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Teste de Login com Credenciais Inválidas

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha_errada"}'
```

**Verificar:**
- [ ] Status 401 Unauthorized
- [ ] Mensagem de erro apropriada
- [ ] Sem stack trace exposto

**Resposta Esperada:**
```json
{
  "success": false,
  "message": "Usuário ou senha inválidos"
}
```

---

#### Teste de Rate Limiting (Login)

Executar o mesmo comando 6 vezes seguidas:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"teste"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
```

**Verificar:**
- [ ] Primeiras 5 tentativas: Status 401
- [ ] 6ª tentativa: Status 429 (Too Many Requests)
- [ ] Mensagem de rate limit

**Resposta na 6ª tentativa:**
```json
{
  "success": false,
  "message": "Muitas tentativas de login. Tente novamente em 15 minutos."
}
```

**Aguardar 15 minutos ou reiniciar servidor para limpar limite**

---

#### Teste de Validação (Dados Inválidos)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"a","password":"123"}'
```

**Verificar:**
- [ ] Status 400 Bad Request
- [ ] Mensagens de validação detalhadas
- [ ] Array de erros com field, message

**Resposta Esperada:**
```json
{
  "success": false,
  "message": "Erros de validação",
  "errors": [
    {
      "field": "username",
      "message": "Usuário deve ter entre 3 e 50 caracteres",
      "value": "a"
    },
    {
      "field": "password",
      "message": "Senha deve ter no mínimo 6 caracteres",
      "value": "123"
    }
  ]
}
```

---

#### Teste de CORS

Abrir Console do Navegador em `http://localhost:3000` e executar:

```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Verificar:**
- [ ] Requisição completa sem erro CORS
- [ ] Resposta recebida corretamente
- [ ] Headers CORS presentes

---

### 4. Testar Endpoints de Clientes

#### Listar Clientes (Autenticado)

Primeiro, faça login e copie o token. Depois:

```bash
TOKEN="seu_token_aqui"

curl -X GET "http://localhost:3000/api/clientes?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Verificar:**
- [ ] Status 200 OK
- [ ] Paginação presente
- [ ] Array de clientes
- [ ] Dados formatados corretamente

---

#### Criar Cliente com Validação

```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901",
    "telefone": "(11) 98765-4321",
    "responsavel": "Admin"
  }'
```

**Verificar:**
- [ ] Status 201 Created
- [ ] Cliente criado com ID
- [ ] Mensagem de sucesso

---

#### Criar Cliente com Dados Inválidos

```bash
TOKEN="seu_token_aqui"

curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "12",
    "cpf": "123",
    "telefone": "abc"
  }'
```

**Verificar:**
- [ ] Status 400 Bad Request
- [ ] Erros de validação detalhados
- [ ] Campos inválidos identificados

---

### 5. Testar Compressão

```bash
curl -H "Accept-Encoding: gzip, deflate" \
  http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -i | grep -i "content-encoding"
```

**Verificar:**
- [ ] Header `Content-Encoding: gzip` presente
- [ ] Resposta comprimida

---

### 6. Testar Headers de Segurança (Helmet)

```bash
curl -I http://localhost:3000
```

**Verificar presença dos headers:**
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `Strict-Transport-Security` (se HTTPS)
- [ ] `X-DNS-Prefetch-Control: off`

---

## Testes de Frontend

### 1. Página de Login

Abrir: `http://localhost:3000/pages/login.html`

**Verificar:**
- [ ] Página carrega sem erros
- [ ] Console sem erros JavaScript
- [ ] Formulário visível
- [ ] Campos de username e password presentes

**Testar Login:**
- [ ] Username: `admin`
- [ ] Password: `admin123`
- [ ] Clicar em "Entrar"
- [ ] Redirecionamento para dashboard
- [ ] Token salvo no localStorage

---

### 2. Dashboard

Após login, verificar:

**Verificar:**
- [ ] Dashboard carrega
- [ ] Menu lateral visível
- [ ] Cards de estatísticas aparecem
- [ ] Sem erros no console
- [ ] CONFIG carregado (verificar no console: `window.CONFIG`)

**No Console:**
```javascript
console.log(window.CONFIG);
// Deve mostrar objeto com configurações
```

---

### 3. Cadastrar Cliente

Abrir: `http://localhost:3000/pages/cadastrar-cliente.html`

**Verificar UI:**
- [ ] Formulário carrega
- [ ] Tabs funcionam (Dados, Adicionais, Observações)
- [ ] Campos com placeholders corretos
- [ ] Botões visíveis

**Testar Máscaras:**
- [ ] CPF: Digite "12345678901" → Vira "123.456.789-01"
- [ ] Telefone: Digite "11987654321" → Vira "(11) 98765-4321"
- [ ] CEP: Digite "01234567" → Vira "01234-567"

**Testar Validação CPF:**
- [ ] CPF inválido: "11111111111" → Erro
- [ ] CPF válido: "12345678909" → Aceito

**Testar Checkboxes:**
- [ ] "Não sabe CPF" → Campo CPF desabilita
- [ ] "Não sabe Telefone" → Campo telefone desabilita

**Cadastrar Cliente de Teste:**
1. Nome: "Cliente Teste"
2. Telefone: "(11) 98765-4321"
3. Responsável: (já preenchido)
4. Clicar "Cadastrar"

**Verificar:**
- [ ] Toast de sucesso aparece
- [ ] Cliente aparece na tabela abaixo
- [ ] Formulário limpa após cadastro

---

### 4. Listar Clientes

Abrir: `http://localhost:3000/pages/listar-clientes.html`

**Verificar:**
- [ ] Lista de clientes carrega
- [ ] Paginação funciona
- [ ] Busca funciona
- [ ] Botões de ação (editar, deletar) aparecem

**Testar Busca:**
- [ ] Digite "Cliente Teste" no campo de busca
- [ ] Cliente criado anteriormente aparece

**Testar Edição:**
- [ ] Clicar no ícone de editar
- [ ] Redirecionado para cadastro com dados preenchidos
- [ ] URL contém `?edit=ID`
- [ ] Botão muda para "Atualizar Cliente"

**Testar Deleção:**
- [ ] Clicar no ícone de deletar
- [ ] Confirmação aparece
- [ ] Confirmar → Cliente removido
- [ ] Toast de sucesso

---

### 5. Logout

**Verificar:**
- [ ] Clicar no botão de logout
- [ ] Redirecionamento para login
- [ ] Token removido do localStorage
- [ ] Tentar acessar dashboard → Redireciona para login

---

## Testes de Segurança

### 1. Acesso Não Autorizado

```bash
# Sem token
curl http://localhost:3000/api/clientes
```

**Verificar:**
- [ ] Status 401 Unauthorized
- [ ] Mensagem de erro apropriada

---

### 2. Token Inválido

```bash
curl -H "Authorization: Bearer token_invalido" \
  http://localhost:3000/api/clientes
```

**Verificar:**
- [ ] Status 401 Unauthorized
- [ ] Sem stack trace exposto

---

### 3. SQL Injection (Proteção)

```bash
TOKEN="seu_token_aqui"

curl -X GET "http://localhost:3000/api/clientes/1' OR '1'='1" \
  -H "Authorization: Bearer $TOKEN"
```

**Verificar:**
- [ ] Status 400 ou 404 (não 500)
- [ ] Query não executada
- [ ] Sem dados vazados

---

### 4. XSS (Proteção)

No formulário de cadastro, tentar:
- Nome: `<script>alert('XSS')</script>`

**Verificar:**
- [ ] Script não executa
- [ ] Dados sanitizados
- [ ] Armazenado como texto puro

---

## Testes de Performance

### 1. Compressão

```bash
# Sem compressão
curl http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -o response.json

# Tamanho do arquivo
ls -lh response.json

# Com compressão
curl -H "Accept-Encoding: gzip" \
  http://localhost:3000/api/clientes \
  -H "Authorization: Bearer $TOKEN" \
  -o response.gz

ls -lh response.gz
```

**Verificar:**
- [ ] Arquivo .gz é 70-90% menor

---

### 2. Rate Limiting - Geral

```bash
for i in {1..105}; do
  curl http://localhost:3000/ -o /dev/null -s -w "%{http_code}\n"
  sleep 0.1
done
```

**Verificar:**
- [ ] Primeiras 100 requisições: 200
- [ ] Requisições 101-105: 429

---

## Testes End-to-End

### Fluxo Completo de Cliente

1. **Login**
   - [ ] Fazer login com admin/admin123
   - [ ] Verificar redirecionamento

2. **Cadastrar Cliente**
   - [ ] Ir para cadastrar cliente
   - [ ] Preencher todos os dados
   - [ ] Incluir CPF válido
   - [ ] Incluir telefone
   - [ ] Adicionar observações
   - [ ] Cadastrar
   - [ ] Verificar toast de sucesso

3. **Visualizar Cliente**
   - [ ] Ir para listar clientes
   - [ ] Buscar cliente criado
   - [ ] Verificar dados corretos

4. **Editar Cliente**
   - [ ] Clicar em editar
   - [ ] Modificar nome
   - [ ] Modificar telefone
   - [ ] Atualizar
   - [ ] Verificar toast de sucesso
   - [ ] Verificar dados atualizados na lista

5. **Deletar Cliente**
   - [ ] Clicar em deletar
   - [ ] Confirmar
   - [ ] Verificar toast de sucesso
   - [ ] Cliente removido da lista

6. **Logout**
   - [ ] Fazer logout
   - [ ] Verificar redirecionamento

---

## Checklist Final

### Antes do Commit

- [ ] Todas as melhorias implementadas
- [ ] Todos os testes passando
- [ ] Sem erros no console
- [ ] Sem warnings no terminal
- [ ] Documentação completa
- [ ] README atualizado
- [ ] .gitignore configurado
- [ ] .env não commitado
- [ ] package.json atualizado

### Arquivos para Commitar

```bash
# Verificar arquivos modificados
git status

# Adicionar todos os arquivos relevantes
git add .

# NÃO adicionar:
# - .env (já no .gitignore)
# - node_modules/ (já no .gitignore)
# - *.db (já no .gitignore)
# - cadastrar-cliente-backup.js (backup local)
```

### Criar Commit

```bash
git commit -m "feat: implementa melhorias v2.0.0

- Adiciona validações com express-validator
- Implementa rate limiting em 3 níveis
- Adiciona helmet para segurança HTTP
- Refatora frontend em arquitetura OOP
- Cria middleware de erros centralizado
- Adiciona compressão de respostas
- Documenta completamente a API
- Cria scripts de setup automático
- Atualiza todas as dependências

BREAKING CHANGES: Nenhuma
COMPATIBILIDADE: Mantida com v1.0.0

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### Enviar para GitHub

```bash
# Primeira vez
git branch -M main
git remote add origin https://github.com/seu-usuario/undertech.git
git push -u origin main

# Próximas vezes
git push
```

---

## 🐛 Troubleshooting

### Problema: npm install falha

**Solução:**
```bash
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install
```

---

### Problema: Porta 3000 em uso

**Solução:**
```bash
# Windows
npx kill-port 3000

# Ou mudar no .env
PORT=3001
```

---

### Problema: Banco não inicializa

**Solução:**
```bash
rm backend/database/undertech.db
npm run setup
```

---

### Problema: Token inválido constante

**Solução:**
1. Limpar localStorage do navegador
2. Fazer logout
3. Fazer login novamente
4. Verificar JWT_SECRET no .env

---

### Problema: CONFIG is not defined

**Solução:**
Verificar se config.js está sendo carregado ANTES dos outros scripts no HTML:
```html
<script src="../assets/js/config.js"></script> <!-- PRIMEIRO -->
<script src="../assets/js/api.js"></script>
```

---

## ✅ Critérios de Aceitação

O sistema está pronto para commit quando:

- [ ] **100% dos testes básicos passando**
- [ ] **Sem erros no console do navegador**
- [ ] **Sem erros no terminal do servidor**
- [ ] **Documentação completa e atualizada**
- [ ] **Rate limiting funcionando**
- [ ] **Validações ativas**
- [ ] **Frontend refatorado funcionando**
- [ ] **Compressão ativa**
- [ ] **Headers de segurança presentes**
- [ ] **.gitignore configurado corretamente**

---

## 📊 Resumo de Execução

| Categoria | Total | Passou | Falhou |
|-----------|-------|--------|--------|
| Instalação | 3 | ___ | ___ |
| Backend | 6 | ___ | ___ |
| Frontend | 5 | ___ | ___ |
| Segurança | 4 | ___ | ___ |
| Performance | 2 | ___ | ___ |
| End-to-End | 1 | ___ | ___ |
| **TOTAL** | **21** | ___ | ___ |

---

**Data de Execução**: _______________
**Executado por**: _______________
**Resultado Final**: [ ] APROVADO  [ ] REPROVADO

---

**Boa sorte com os testes!** 🚀
