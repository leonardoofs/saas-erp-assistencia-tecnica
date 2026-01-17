/**
 * UnderTech - Produto Service
 * Camada de lógica de negócio para produtos
 */

const ProdutoRepository = require('../repositories/produtoRepository');
const GrupoRepository = require('../repositories/grupoRepository');
const SubgrupoRepository = require('../repositories/subgrupoRepository');
const GarantiaRepository = require('../repositories/garantiaRepository');
const FabricanteRepository = require('../repositories/fabricanteRepository');

class ProdutoService {
  /**
   * Lista produtos com filtros e paginação
   */
  static async listar(filters = {}) {
    const { search, grupo_id, subgrupo_id, ativo, page = 1, limit = 50 } = filters;

    const resultado = await ProdutoRepository.findAll({
      search,
      grupo_id,
      subgrupo_id,
      ativo,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return {
      data: resultado.data,
      pagination: resultado.pagination
    };
  }

  /**
   * Busca produto por ID
   */
  static async buscarPorId(id) {
    const produto = await ProdutoRepository.findById(id);

    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    return produto;
  }

  /**
   * Gerar próximo código automático
   */
  static async gerarCodigo() {
    return await ProdutoRepository.generateNextCode();
  }

  /**
   * Cria novo produto
   */
  static async criar(dadosProduto) {
    // Validações de negócio
    await this._validarCriacaoProduto(dadosProduto);

    // Criar no repository
    const resultado = await ProdutoRepository.create(dadosProduto);

    return resultado;
  }

  /**
   * Atualiza produto existente
   */
  static async atualizar(id, dadosProduto) {
    // Verificar se existe
    const produtoExiste = await ProdutoRepository.findById(id);
    if (!produtoExiste) {
      throw new Error('Produto não encontrado');
    }

    // Validações de atualização
    await this._validarAtualizacaoProduto(id, dadosProduto);

    // Atualizar
    const resultado = await ProdutoRepository.update(id, dadosProduto);

    return resultado;
  }

  /**
   * Deleta produto
   */
  static async deletar(id) {
    // Verificar se existe
    const produto = await ProdutoRepository.findById(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    // Deletar
    await ProdutoRepository.delete(id);

    return { message: 'Produto excluído com sucesso' };
  }

  /**
   * Buscar produtos recentes
   */
  static async buscarRecentes(limit = 5) {
    return await ProdutoRepository.findRecent(limit);
  }

  /**
   * Estatísticas de produtos
   */
  static async estatisticas() {
    const countByGrupo = await ProdutoRepository.countByGrupo();
    const lowStock = await ProdutoRepository.findLowStock();

    return {
      por_grupo: countByGrupo,
      estoque_baixo: lowStock
    };
  }

  /**
   * Validações para criação
   */
  static async _validarCriacaoProduto(dadosProduto) {
    // Validar código único
    const produtoExistente = await ProdutoRepository.findByCodigo(dadosProduto.codigo);
    if (produtoExistente) {
      throw new Error('Código já está em uso');
    }

    // Validar grupo existe
    const grupo = await GrupoRepository.findById(dadosProduto.grupo_id);
    if (!grupo) {
      throw new Error('Grupo não encontrado');
    }

    // Validar subgrupo existe e pertence ao grupo
    const subgrupo = await SubgrupoRepository.findById(dadosProduto.subgrupo_id);
    if (!subgrupo) {
      throw new Error('Subgrupo não encontrado');
    }
    if (subgrupo.grupo_id !== dadosProduto.grupo_id) {
      throw new Error('Subgrupo não pertence ao grupo selecionado');
    }

    // Validar garantia existe
    const garantia = await GarantiaRepository.findById(dadosProduto.garantia_id);
    if (!garantia) {
      throw new Error('Garantia não encontrada');
    }

    // Validar fabricante se fornecido
    if (dadosProduto.fabricante_id) {
      const fabricante = await FabricanteRepository.findById(dadosProduto.fabricante_id);
      if (!fabricante) {
        throw new Error('Fabricante não encontrado');
      }
    }

    // Validar IMEI único (se fornecido e grupo for Aparelho)
    if (dadosProduto.imei_serie && grupo.nome === 'Aparelho') {
      const produtoComImei = await ProdutoRepository.findByImei(dadosProduto.imei_serie);
      if (produtoComImei) {
        throw new Error('IMEI/Série já está cadastrado');
      }
    }

    // Validar estoque
    if (dadosProduto.estoque_minimo && dadosProduto.estoque_maximo) {
      if (dadosProduto.estoque_minimo > dadosProduto.estoque_maximo) {
        throw new Error('Estoque mínimo não pode ser maior que estoque máximo');
      }
    }

    // Validar preços
    if (dadosProduto.preco_custo && dadosProduto.preco_venda) {
      if (parseFloat(dadosProduto.preco_venda) < parseFloat(dadosProduto.preco_custo)) {
        console.warn('⚠️ Aviso: Preço de venda menor que preço de custo');
      }
    }
  }

  /**
   * Validações para atualização
   */
  static async _validarAtualizacaoProduto(id, dadosProduto) {
    // Validar código único (se mudou)
    if (dadosProduto.codigo) {
      const produtoExistente = await ProdutoRepository.findByCodigo(dadosProduto.codigo);
      if (produtoExistente && produtoExistente.id !== parseInt(id)) {
        throw new Error('Código já está em uso');
      }
    }

    // Validar grupo existe (se mudou)
    if (dadosProduto.grupo_id) {
      const grupo = await GrupoRepository.findById(dadosProduto.grupo_id);
      if (!grupo) {
        throw new Error('Grupo não encontrado');
      }

      // Validar subgrupo pertence ao grupo (se ambos foram informados)
      if (dadosProduto.subgrupo_id) {
        const subgrupo = await SubgrupoRepository.findById(dadosProduto.subgrupo_id);
        if (!subgrupo) {
          throw new Error('Subgrupo não encontrado');
        }
        if (subgrupo.grupo_id !== dadosProduto.grupo_id) {
          throw new Error('Subgrupo não pertence ao grupo selecionado');
        }
      }
    }

    // Validar garantia existe (se mudou)
    if (dadosProduto.garantia_id) {
      const garantia = await GarantiaRepository.findById(dadosProduto.garantia_id);
      if (!garantia) {
        throw new Error('Garantia não encontrada');
      }
    }

    // Validar fabricante se fornecido (se mudou)
    if (dadosProduto.fabricante_id) {
      const fabricante = await FabricanteRepository.findById(dadosProduto.fabricante_id);
      if (!fabricante) {
        throw new Error('Fabricante não encontrado');
      }
    }

    // Validar IMEI único (se mudou)
    if (dadosProduto.imei_serie) {
      const produtoComImei = await ProdutoRepository.findByImei(dadosProduto.imei_serie);
      if (produtoComImei && produtoComImei.id !== parseInt(id)) {
        throw new Error('IMEI/Série já está cadastrado');
      }
    }

    // Validar estoque
    if (dadosProduto.estoque_minimo && dadosProduto.estoque_maximo) {
      if (dadosProduto.estoque_minimo > dadosProduto.estoque_maximo) {
        throw new Error('Estoque mínimo não pode ser maior que estoque máximo');
      }
    }

    // Validar preços
    if (dadosProduto.preco_custo && dadosProduto.preco_venda) {
      if (parseFloat(dadosProduto.preco_venda) < parseFloat(dadosProduto.preco_custo)) {
        console.warn('⚠️ Aviso: Preço de venda menor que preço de custo');
      }
    }
  }
}

module.exports = ProdutoService;
