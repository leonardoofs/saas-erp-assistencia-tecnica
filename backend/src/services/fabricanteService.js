/**
 * Service para Fabricantes
 * Gerencia lógica de negócio para fabricantes
 */

const FabricanteRepository = require('../repositories/fabricanteRepository');

class FabricanteService {
  /**
   * Listar todos os fabricantes
   */
  static async listar(filtros = {}) {
    try {
      const fabricantes = await FabricanteRepository.findAll(filtros);
      return fabricantes;
    } catch (error) {
      console.error('Erro ao listar fabricantes:', error);
      throw new Error('Erro ao listar fabricantes');
    }
  }

  /**
   * Buscar fabricante por ID
   */
  static async buscarPorId(id) {
    try {
      const fabricante = await FabricanteRepository.findById(id);
      if (!fabricante) {
        throw new Error('Fabricante não encontrado');
      }
      return fabricante;
    } catch (error) {
      console.error('Erro ao buscar fabricante:', error);
      throw error;
    }
  }

  /**
   * Criar novo fabricante
   */
  static async criar(dados) {
    try {
      // Validar se nome já existe
      const fabricanteExistente = await FabricanteRepository.findByNome(dados.nome);
      if (fabricanteExistente) {
        throw new Error('Já existe um fabricante com este nome');
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const novoFabricante = await FabricanteRepository.create(dados);
      return novoFabricante;
    } catch (error) {
      console.error('Erro ao criar fabricante:', error);
      throw error;
    }
  }

  /**
   * Atualizar fabricante
   */
  static async atualizar(id, dados) {
    try {
      // Verificar se fabricante existe
      await this.buscarPorId(id);

      // Validar se novo nome já existe em outro fabricante
      if (dados.nome) {
        const fabricanteExistente = await FabricanteRepository.findByNome(dados.nome);
        if (fabricanteExistente && fabricanteExistente.id !== parseInt(id)) {
          throw new Error('Já existe um fabricante com este nome');
        }
      }

      // Validar cor
      if (dados.cor && !/^#[0-9A-F]{6}$/i.test(dados.cor)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
      }

      const fabricanteAtualizado = await FabricanteRepository.update(id, dados);
      return fabricanteAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar fabricante:', error);
      throw error;
    }
  }

  /**
   * Deletar fabricante
   */
  static async deletar(id) {
    try {
      // Verificar se fabricante existe
      await this.buscarPorId(id);

      // Verificar se tem produtos vinculados
      const temProdutos = await FabricanteRepository.hasProducts(id);
      if (temProdutos) {
        throw new Error('Não é possível excluir este fabricante pois existem produtos vinculados a ele');
      }

      await FabricanteRepository.delete(id);
      return { message: 'Fabricante excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao deletar fabricante:', error);
      throw error;
    }
  }
}

module.exports = FabricanteService;
