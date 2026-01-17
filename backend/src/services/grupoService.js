/**
 * Service para Grupos de Produtos
 * Gerencia lógica de negócio para grupos
 */

const GrupoRepository = require('../repositories/grupoRepository');

class GrupoService {
  /**
   * Listar todos os grupos
   */
  static async listar(filtros = {}) {
    try {
      const grupos = await GrupoRepository.findAll(filtros);
      return grupos;
    } catch (error) {
      console.error('Erro ao listar grupos:', error);
      throw new Error('Erro ao listar grupos');
    }
  }

  /**
   * Buscar grupo por ID
   */
  static async buscarPorId(id) {
    try {
      const grupo = await GrupoRepository.findById(id);
      if (!grupo) {
        throw new Error('Grupo não encontrado');
      }
      return grupo;
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      throw error;
    }
  }

  /**
   * Criar novo grupo
   */
  static async criar(dados) {
    try {
      // Validar se nome já existe
      const grupoExistente = await GrupoRepository.findByNome(dados.nome);
      if (grupoExistente) {
        throw new Error('Já existe um grupo com este nome');
      }

      // Validar cor (formato hex)
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const novoGrupo = await GrupoRepository.create(dados);
      return novoGrupo;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  }

  /**
   * Atualizar grupo
   */
  static async atualizar(id, dados) {
    try {
      // Verificar se grupo existe
      await this.buscarPorId(id);

      // Validar se novo nome já existe em outro grupo
      if (dados.nome) {
        const grupoExistente = await GrupoRepository.findByNome(dados.nome);
        if (grupoExistente && grupoExistente.id !== parseInt(id)) {
          throw new Error('Já existe um grupo com este nome');
        }
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const grupoAtualizado = await GrupoRepository.update(id, dados);
      return grupoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    }
  }

  /**
   * Deletar grupo
   */
  static async deletar(id) {
    try {
      // Verificar se grupo existe
      await this.buscarPorId(id);

      // Verificar se tem produtos vinculados
      const temProdutos = await GrupoRepository.hasProducts(id);
      if (temProdutos) {
        throw new Error('Não é possível excluir este grupo pois existem produtos vinculados a ele');
      }

      await GrupoRepository.delete(id);
      return { message: 'Grupo excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      throw error;
    }
  }
}

module.exports = GrupoService;
