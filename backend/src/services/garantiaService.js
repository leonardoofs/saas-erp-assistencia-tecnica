/**
 * Service para Garantias
 * Gerencia lógica de negócio para garantias
 */

const GarantiaRepository = require('../repositories/garantiaRepository');

class GarantiaService {
  /**
   * Listar todas as garantias
   */
  static async listar(filtros = {}) {
    try {
      const garantias = await GarantiaRepository.findAll(filtros);
      return garantias;
    } catch (error) {
      console.error('Erro ao listar garantias:', error);
      throw new Error('Erro ao listar garantias');
    }
  }

  /**
   * Buscar garantia por ID
   */
  static async buscarPorId(id) {
    try {
      const garantia = await GarantiaRepository.findById(id);
      if (!garantia) {
        throw new Error('Garantia não encontrada');
      }
      return garantia;
    } catch (error) {
      console.error('Erro ao buscar garantia:', error);
      throw error;
    }
  }

  /**
   * Criar nova garantia
   */
  static async criar(dados) {
    try {
      // Validar se nome já existe
      const garantiaExistente = await GarantiaRepository.findByNome(dados.nome);
      if (garantiaExistente) {
        throw new Error('Já existe uma garantia com este nome');
      }

      // Validar meses
      if (dados.meses === undefined || dados.meses < 0) {
        throw new Error('Meses deve ser um número maior ou igual a zero');
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const novaGarantia = await GarantiaRepository.create(dados);
      return novaGarantia;
    } catch (error) {
      console.error('Erro ao criar garantia:', error);
      throw error;
    }
  }

  /**
   * Atualizar garantia
   */
  static async atualizar(id, dados) {
    try {
      // Verificar se garantia existe
      await this.buscarPorId(id);

      // Validar se novo nome já existe em outra garantia
      if (dados.nome) {
        const garantiaExistente = await GarantiaRepository.findByNome(dados.nome);
        if (garantiaExistente && garantiaExistente.id !== parseInt(id)) {
          throw new Error('Já existe uma garantia com este nome');
        }
      }

      // Validar meses
      if (dados.meses !== undefined && dados.meses < 0) {
        throw new Error('Meses deve ser um número maior ou igual a zero');
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const garantiaAtualizada = await GarantiaRepository.update(id, dados);
      return garantiaAtualizada;
    } catch (error) {
      console.error('Erro ao atualizar garantia:', error);
      throw error;
    }
  }

  /**
   * Deletar garantia
   */
  static async deletar(id) {
    try {
      // Verificar se garantia existe
      await this.buscarPorId(id);

      // Verificar se tem produtos vinculados
      const temProdutos = await GarantiaRepository.hasProducts(id);
      if (temProdutos) {
        throw new Error('Não é possível excluir esta garantia pois existem produtos vinculados a ela');
      }

      await GarantiaRepository.delete(id);
      return { message: 'Garantia excluída com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar garantia:', error);
      throw error;
    }
  }
}

module.exports = GarantiaService;
