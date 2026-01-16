# UnderTech - Documentação da API

## Visão Geral

Base URL: `http://localhost:3000/api`

Todas as respostas seguem o formato:

```json
{
  "success": true|false,
  "message": "Mensagem opcional",
  "data": { ... },
  "errors": [ ... ] // Apenas em caso de validação
}
```

## Autenticação

A maioria dos endpoints requer autenticação via JWT. Inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

---

## Endpoints de Autenticação

### POST /api/auth/register

Registra um novo usuário no sistema.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "string (3-50 chars, alfanumérico + underscore)",
  "password": "string (min 6 chars, deve conter maiúsculas, minúsculas e números)",
  "name": "string (3-100 chars, apenas letras)",
  "email": "string (opcional, formato email válido)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 1,
    "username": "usuario",
    "name": "Nome Completo"
  }
}
```

**Erros Possíveis:**
- **400**: Dados inválidos ou usuário já existe
- **500**: Erro interno do servidor

---

### POST /api/auth/login

Autentica um usuário e retorna token JWT.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "username": "usuario",
      "name": "Nome Completo",
      "email": "email@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Erros Possíveis:**
- **400**: Dados inválidos
- **401**: Credenciais incorretas
- **429**: Muitas tentativas de login (rate limit)
- **500**: Erro interno do servidor

---

### GET /api/auth/me

Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "usuario",
      "name": "Nome Completo",
      "role": "admin"
    }
  }
}
```

**Erros Possíveis:**
- **401**: Token inválido ou expirado
- **500**: Erro interno do servidor

---

## Endpoints de Clientes

Todos os endpoints de clientes requerem autenticação.

### GET /api/clientes

Lista clientes com paginação e busca.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número da página (default: 1, min: 1)
- `limit` (opcional): Itens por página (default: 50, min: 1, max: 100)
- `search` (opcional): Termo de busca (max: 100 chars)

**Exemplo:**
```
GET /api/clientes?page=1&limit=20&search=João
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
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
      "observacoes": "Cliente VIP",
      "ultima_compra": "2024-01-15",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Erros Possíveis:**
- **400**: Parâmetros inválidos
- **401**: Token inválido
- **500**: Erro interno do servidor

---

### GET /api/clientes/:id

Busca um cliente específico por ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros de URL:**
- `id`: ID do cliente (número inteiro positivo)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
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
    "observacoes": "Cliente VIP",
    "ultima_compra": "2024-01-15",
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**Erros Possíveis:**
- **400**: ID inválido
- **401**: Token inválido
- **404**: Cliente não encontrado
- **500**: Erro interno do servidor

---

### POST /api/clientes

Cria um novo cliente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nome": "string (3-100 chars, apenas letras) - obrigatório",
  "cpf": "string (11 dígitos numéricos) - opcional",
  "telefone": "string (formato: (XX) XXXXX-XXXX) - obrigatório",
  "telefone_contato": "string (formato: (XX) XXXXX-XXXX) - opcional",
  "email": "string (formato email válido) - opcional",
  "situacao": "string (ativo|em_risco|inativo) - opcional",
  "responsavel": "string (3-100 chars) - obrigatório",
  "endereco": "string (max 200 chars) - opcional",
  "cidade": "string (max 100 chars) - opcional",
  "estado": "string (2 chars, UF) - opcional",
  "cep": "string (8 dígitos) - opcional",
  "observacoes": "string (max 500 chars) - opcional"
}
```

**Exemplo:**
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

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Cliente cadastrado com sucesso",
  "data": {
    "id": 1
  }
}
```

**Erros Possíveis:**
- **400**: Dados inválidos, CPF duplicado ou campos obrigatórios ausentes
- **401**: Token inválido
- **429**: Limite de criações atingido (rate limit)
- **500**: Erro interno do servidor

---

### PUT /api/clientes/:id

Atualiza um cliente existente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros de URL:**
- `id`: ID do cliente (número inteiro positivo)

**Body:**
Mesmos campos do POST, todos opcionais.

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso"
}
```

**Erros Possíveis:**
- **400**: Dados inválidos ou CPF duplicado
- **401**: Token inválido
- **404**: Cliente não encontrado
- **500**: Erro interno do servidor

---

### DELETE /api/clientes/:id

Remove um cliente do sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros de URL:**
- `id`: ID do cliente (número inteiro positivo)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Cliente deletado com sucesso"
}
```

**Erros Possíveis:**
- **400**: Cliente possui ordens/reformas associadas
- **401**: Token inválido
- **404**: Cliente não encontrado
- **500**: Erro interno do servidor

---

## Endpoints de Dashboard

### GET /api/dashboard/ordens-servico

Retorna estatísticas de ordens de serviço.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pendentes": 30,
    "em_andamento": 50,
    "concluidas": 70
  }
}
```

---

### GET /api/dashboard/reformas

Retorna estatísticas de reformas.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "total": 80,
    "pendentes": 15,
    "em_andamento": 25,
    "concluidas": 40
  }
}
```

---

## Rate Limiting

A API implementa rate limiting para proteção:

- **Geral**: 100 requisições por 15 minutos
- **Login**: 5 tentativas por 15 minutos
- **Criação de recursos**: 20 criações por hora

Headers de resposta:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

Quando o limite é excedido:
```json
{
  "success": false,
  "message": "Muitas requisições deste IP. Tente novamente em X minutos."
}
```

---

## Códigos de Status HTTP

- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **400 Bad Request**: Dados inválidos ou erro de validação
- **401 Unauthorized**: Token ausente, inválido ou expirado
- **404 Not Found**: Recurso não encontrado
- **429 Too Many Requests**: Rate limit excedido
- **500 Internal Server Error**: Erro interno do servidor

---

## Exemplos de Uso

### JavaScript (Fetch API)

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'usuario',
    password: 'senha123'
  })
});

const data = await response.json();
const token = data.data.token;

// Listar clientes
const clientesResponse = await fetch('http://localhost:3000/api/clientes?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const clientes = await clientesResponse.json();
console.log(clientes.data);
```

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"usuario","password":"senha123"}'

# Listar clientes
curl -X GET http://localhost:3000/api/clientes?page=1&limit=20 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Criar cliente
curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "(11) 98765-4321",
    "responsavel": "Maria"
  }'
```

---

**Última atualização**: Janeiro 2026
