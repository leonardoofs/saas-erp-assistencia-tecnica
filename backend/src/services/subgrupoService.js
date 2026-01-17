/**
 * Service para Subgrupos de Produtos
 * Gerencia lógica de negócio para subgrupos
 */

const SubgrupoRepository = require('../repositories/subgrupoRepository');
const GrupoRepository = require('../repositories/grupoRepository');

class SubgrupoService {
  /**
   * Listar todos os subgrupos
   */
  static async listar(filtros = {}) {
    try {
      const subgrupos = await SubgrupoRepository.findAll(filtros);
      return subgrupos;
    } catch (error) {
      console.error('Erro ao listar subgrupos:', error);
      throw new Error('Erro ao listar subgrupos');
    }
  }

  /**
   * Buscar subgrupo por ID
   */
  static async buscarPorId(id) {
    try {
      const subgrupo = await SubgrupoRepository.findById(id);
      if (!subgrupo) {
        throw new Error('Subgrupo não encontrado');
      }
      return subgrupo;
    } catch (error) {
      console.error('Erro ao buscar subgrupo:', error);
      throw error;
    }
  }

  /**
   * Criar novo subgrupo
   */
  static async criar(dados) {
    try {
      // Validar se grupo existe
      const grupo = await GrupoRepository.findById(dados.grupo_id);
      if (!grupo) {
        throw new Error('Grupo não encontrado');
      }

      // Validar se nome já existe neste grupo
      const subgrupoExistente = await SubgrupoRepository.findByNomeAndGrupo(dados.nome, dados.grupo_id);
      if (subgrupoExistente) {
        throw new Error('Já existe um subgrupo com este nome neste grupo');
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const novoSubgrupo = await SubgrupoRepository.create(dados);
      return novoSubgrupo;
    } catch (error) {
      console.error('Erro ao criar subgrupo:', error);
      throw error;
    }
  }

  /**
   * Atualizar subgrupo
   */
  static async atualizar(id, dados) {
    try {
      // Verificar se subgrupo existe
      await this.buscarPorId(id);

      // Validar se grupo existe (se mudou)
      if (dados.grupo_id) {
        const grupo = await GrupoRepository.findById(dados.grupo_id);
        if (!grupo) {
          throw new Error('Grupo não encontrado');
        }
      }

      // Validar se novo nome já existe em outro subgrupo do mesmo grupo
      if (dados.nome && dados.grupo_id) {
        const subgrupoExistente = await SubgrupoRepository.findByNomeAndGrupo(dados.nome, dados.grupo_id);
        if (subgrupoExistente && subgrupoExistente.id !== parseInt(id)) {
          throw new Error('Já existe um subgrupo com este nome neste grupo');
        }
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const subgrupoAtualizado = await SubgrupoRepository.update(id, dados);
      return subgrupoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar subgrupo:', error);
      throw error;
    }
  }

  /**
   * Deletar subgrupo
   */
  static async deletar(id) {
    try {
      // Verificar se subgrupo existe
      await this.buscarPorId(id);

      // Verificar se tem produtos vinculados
      const temProdutos = await SubgrupoRepository.hasProducts(id);
      if (temProdutos) {
        throw new Error('Não é possível excluir este subgrupo pois existem produtos vinculados a ele');
      }

      await SubgrupoRepository.delete(id);
      return { message: 'Subgrupo excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar subgrupo:', error);
      throw error;
    }
  }
}

module.exports = SubgrupoService;
