# Changelog - UnderTech

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.0.0] - 2026-01-15

### Adicionado

#### Segurança
- Implementado **Helmet** para headers HTTP seguros
- Implementado **Rate Limiting** em três níveis:
  - Geral: 100 requisições por 15 minutos
  - Autenticação: 5 tentativas por 15 minutos
  - Criação: 20 registros por hora
- Adicionado **Compression** para otimização de respostas
- Bcrypt configurável via variável de ambiente (BCRYPT_ROUNDS)
- CORS configurado de forma restritiva
- Validação completa com **express-validator** em todas as rotas

#### Validações
- Criado validador completo para clientes (`clienteValidator.js`)
- Criado validador para autenticação (`authValidator.js`)
- Validações de CPF, telefone, email, CEP
- Sanitização automática de dados de entrada
- Mensagens de erro detalhadas e estruturadas

#### Tratamento de Erros
- Middleware centralizado de erros (`errorHandler.js`)
- Classe `AppError` para erros customizados
- Logger estruturado com níveis de log
- Diferenciação entre erros operacionais e de programação
- Stack trace apenas em ambiente de desenvolvimento

#### Frontend
- Refatoração completa do `cadastrar-cliente.js` em classes OOP:
  - Classe `InputMask` para máscaras
  - Classe `Validador` para validações
  - Classe `FormularioCliente` para gerenciamento do formulário
  - Classe `ListaClientesRecentes` para tabela
  - Classe `GerenciadorClientes` para ações CRUD
- Arquivo `config.js` centralizado com configurações
- Logger frontend para debug
- API client atualizado para usar configurações dinâmicas

#### Documentação
- **README.md** completo com:
  - Instruções de instalação detalhadas
  - Estrutura do projeto
  - Guia de uso
  - Troubleshooting
  - Recomendações de segurança
- **API.md** com documentação completa da API:
  - Todos os endpoints documentados
  - Exemplos de requisições
  - Códigos de status HTTP
  - Exemplos em JavaScript e cURL
- **CONTEXT.txt** atualizado com novos padrões
- Comentários JSDoc em funções importantes

#### Scripts
- `npm run setup` - Setup inicial do projeto
- `npm run generate-secret` - Gera JWT secret seguro
- Script de inicialização automática do banco
- Geração automática de JWT secret no setup

#### Configuração
- Arquivo `.env.example` documentado
- Novas variáveis de ambiente:
  - `BCRYPT_ROUNDS`
  - `RATE_LIMIT_WINDOW_MS`
  - `RATE_LIMIT_MAX_REQUESTS`
  - `HELMET_ENABLED`
- Configurações separadas para desenvolvimento e produção

### Modificado

#### Backend
- **server.js** refatorado com todas as melhorias de segurança
- **authController.js** atualizado para usar `AppError` e bcrypt configurável
- Rotas atualizadas para incluir validadores
- Remoção de variáveis não utilizadas
- Tratamento de erros padronizado com `next()`

#### Frontend
- **api.js** atualizado para usar configurações dinâmicas
- Timeout configurável para requisições
- Melhor tratamento de erros 401
- Log estruturado de requisições

### Melhorado

#### Performance
- Compressão gzip/deflate de respostas
- Otimização de queries SQL
- Cache de configurações

#### Segurança
- Aumento de rounds do bcrypt de 10 para 12
- CORS restritivo (não mais `*`)
- Validação rigorosa de entrada
- Limite de tamanho de body (10mb)
- Headers de segurança via Helmet

#### Código
- Separação clara de responsabilidades
- Código mais modular e reutilizável
- Nomenclatura consistente
- Melhor tratamento de erros
- Comentários e documentação

#### Experiência do Desenvolvedor
- Setup automatizado
- Documentação completa
- Scripts utilitários
- Mensagens de erro claras
- Logger estruturado

### Corrigido
- Warnings do TypeScript/VSCode sobre variáveis não utilizadas
- Tratamento inconsistente de erros nos controllers
- CORS aberto em desenvolvimento
- JWT secret fraco
- Falta de validação no backend
- Mensagens de erro genéricas

### Segurança
- CVE-NONE: Nenhuma vulnerabilidade conhecida
- Todas as dependências atualizadas
- Rate limiting para prevenir ataques
- Validação e sanitização de dados
- Headers HTTP seguros

---

## [1.0.0] - 2024-01-01

### Inicial
- Sistema básico de gestão
- CRUD de clientes
- Autenticação JWT
- Dashboard
- Frontend em Vanilla JS
- Backend com Express
- Banco de dados SQLite

---

## Roadmap Futuro

### [2.1.0] - Planejado
- [ ] Testes unitários e de integração
- [ ] CI/CD com GitHub Actions
- [ ] Logs estruturados com Winston
- [ ] Monitoramento com APM
- [ ] Backup automático do banco

### [3.0.0] - Planejado
- [ ] Migração para PostgreSQL
- [ ] API de notificações
- [ ] Suporte a múltiplos idiomas
- [ ] Relatórios em PDF
- [ ] Dashboard com gráficos interativos
- [ ] Sistema de permissões avançado

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**
**Versionamento segue [Semantic Versioning](https://semver.org/)**
