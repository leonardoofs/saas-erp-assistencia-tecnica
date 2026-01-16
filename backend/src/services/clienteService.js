/**
 * UnderTech - Cliente Service
 * Camada de lógica de negócio para clientes
 */

const ClienteRepository = require('../repositories/clienteRepository');
const SituacaoService = require('./situacaoService');
const { validarCPF } = require('../utils/validators');

class ClienteService {
  /**
   * Lista clientes com filtros e paginação
   * 
   * @param {Object} filters - Filtros de busca
   * @param {string} filters.search - Termo de busca
   * @param {number} filters.page - Página atual
   * @param {number} filters.limit - Itens por página
   * @returns {Promise<Object>} Clientes e paginação
   */
  static async listar(filters = {}) {
    const { search, page = 1, limit = 50 } = filters;

    // Buscar clientes do repository
    const resultado = await ClienteRepository.findAll({
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Aplicar situação automática
    const clientesComSituacao = SituacaoService.aplicarSituacaoEmClientes(
      resultado.data
    );

    return {
      data: clientesComSituacao,
      pagination: resultado.pagination
    };
  }

  /**
   * Busca cliente por ID
   * 
   * @param {number} id - ID do cliente
   * @returns {Promise<Object>} Cliente encontrado
   * @throws {Error} Se cliente não encontrado
   */
  static async buscarPorId(id) {
    const cliente = await ClienteRepository.findById(id);

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Aplicar situação automática
    const [clienteComSituacao] = SituacaoService.aplicarSituacaoEmClientes([cliente]);

    return clienteComSituacao;
  }

  /**
   * Cria novo cliente
   * 
   * @param {Object} dadosCliente - Dados do cliente
   * @returns {Promise<Object>} Cliente criado
   * @throws {Error} Erros de validação
   */
  static async criar(dadosCliente) {
    // Validações de negócio
    await this._validarCriacaoCliente(dadosCliente);

    // Normalizar dados
    const dadosNormalizados = this._normalizarDadosCliente(dadosCliente);

    // Criar no repository
    const resultado = await ClienteRepository.create(dadosNormalizados);

    return resultado;
  }

  /**
   * Atualiza cliente existente
   * 
   * @param {number} id - ID do cliente
   * @param {Object} dadosCliente - Dados para atualizar
   * @returns {Promise<void>}
   * @throws {Error} Erros de validação
   */
  static async atualizar(id, dadosCliente) {
    // Verificar se existe
    const clienteExiste = await ClienteRepository.findById(id);
    if (!clienteExiste) {
      throw new Error('Cliente não encontrado');
    }

    // Validações de negócio
    await this._validarAtualizacaoCliente(id, dadosCliente);

    // Normalizar dados
    const dadosNormalizados = this._normalizarDadosCliente(dadosCliente);

    // Atualizar no repository
    await ClienteRepository.update(id, dadosNormalizados);
  }

  /**
   * Remove cliente
   * 
   * @param {number} id - ID do cliente
   * @returns {Promise<void>}
   * @throws {Error} Se cliente tem dependências
   */
  static async deletar(id) {
    // Verificar dependências
    const temOrdens = await ClienteRepository.hasOrdens(id);
    const temReformas = await ClienteRepository.hasReformas(id);

    if (temOrdens || temReformas) {
      throw new Error(
        'Não é possível deletar cliente com ordens/reformas associadas'
      );
    }

    await ClienteRepository.delete(id);
  }

  /**
   * Registra compra para atualizar situação
   * 
   * @param {number} clienteId - ID do cliente
   * @returns {Promise<void>}
   */
  static async registrarCompra(clienteId) {
    const hoje = new Date().toISOString().split('T')[0];

    await ClienteRepository.update(clienteId, {
      ultima_compra: hoje,
      situacao: 'ativo'
    });
  }

  /**
   * Validações para criação de cliente
   * @private
   */
  static async _validarCriacaoCliente(dados) {
    const { nome, telefone, cpf } = dados;

    // Validar campos obrigatórios
    if (!nome || !telefone) {
      throw new Error('Nome e telefone são obrigatórios');
    }

    // Validar CPF se fornecido
    if (cpf && !validarCPF(cpf)) {
      throw new Error('CPF inválido');
    }

    // Verificar CPF duplicado
    if (cpf) {
      const existente = await ClienteRepository.findByCPF(cpf);
      if (existente) {
        throw new Error(
          `CPF já cadastrado para o cliente "${existente.nome}"`
        );
      }
    }
  }

  /**
   * Validações para atualização de cliente
   * @private
   */
  static async _validarAtualizacaoCliente(id, dados) {
    const { cpf } = dados;

    // Validar CPF se fornecido
    if (cpf && !validarCPF(cpf)) {
      throw new Error('CPF inválido');
    }

    // Verificar CPF duplicado em outro cliente
    if (cpf) {
      const existente = await ClienteRepository.findByCPF(cpf);
      if (existente && existente.id !== id) {
        throw new Error(
          `CPF já cadastrado para o cliente "${existente.nome}"`
        );
      }
    }
  }

  /**
   * Normaliza dados do cliente
   * @private
   */
  static _normalizarDadosCliente(dados) {
    return {
      nome: dados.nome?.trim(),
      cpf: dados.cpf?.replace(/\D/g, '') || null,
      telefone: dados.telefone || 'Não informado',
      telefone_contato: dados.telefone_contato?.trim() || null,
      email: dados.email?.trim() || null,
      situacao: dados.situacao || 'ativo',
      responsavel: dados.responsavel?.trim(),
      endereco: dados.endereco?.trim() || null,
      cidade: dados.cidade?.trim() || null,
      estado: dados.estado?.toUpperCase().trim() || null,
      cep: dados.cep?.replace(/\D/g, '') || null,
      observacoes: dados.observacoes?.trim() || null,
      ultima_compra: dados.ultima_compra || null
    };
  }
}

module.exports = ClienteService;