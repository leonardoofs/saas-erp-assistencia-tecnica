const { allQuery } = require('../config/database');

/**
 * Calcula as estatísticas de prazo de entrega
 * @param {Array} items - Array de ordens ou reformas
 * @returns {Object} Estatísticas de prazo
 */
const calcularEstatisticasPrazo = (items) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  let atrasadas = 0;
  let paraHoje = 0;
  let paraAmanha = 0;
  let finalizadas = 0;

  items.forEach(item => {
    const prazo = new Date(item.prazo_entrega);
    prazo.setHours(0, 0, 0, 0);

    if (item.status === 'finalizado' || item.status === 'entregue') {
      finalizadas++;
    } else if (prazo < hoje) {
      atrasadas++;
    } else if (prazo.getTime() === hoje.getTime()) {
      paraHoje++;
    } else if (prazo.getTime() === amanha.getTime()) {
      paraAmanha++;
    }
  });

  return { atrasadas, paraHoje, paraAmanha, finalizadas };
};

/**
 * Calcula as estatísticas de prioridade
 * @param {Array} items - Array de ordens ou reformas
 * @returns {Object} Estatísticas de prioridade
 */
const calcularEstatisticasPrioridade = (items) => {
  let normal = 0;
  let alta = 0;
  let urgente = 0;

  // Apenas contar items não finalizados
  items.forEach(item => {
    if (item.status !== 'finalizado' && item.status !== 'entregue') {
      switch (item.prioridade.toLowerCase()) {
        case 'normal':
          normal++;
          break;
        case 'alta':
          alta++;
          break;
        case 'urgente':
          urgente++;
          break;
      }
    }
  });

  return { normal, alta, urgente };
};

/**
 * Obter estatísticas de Ordens de Serviço
 */
const getOrdensServico = async (req, res) => {
  try {
    // Buscar todas as ordens de serviço
    const ordens = await allQuery('SELECT * FROM ordens_servico');

    // Calcular estatísticas
    const prazo = calcularEstatisticasPrazo(ordens);
    const prioridade = calcularEstatisticasPrioridade(ordens);

    res.json({
      success: true,
      data: {
        tipo: 'ordens_servico',
        prazo,
        prioridade,
        total: ordens.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de ordens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

/**
 * Obter estatísticas de Reformas de Aparelho
 */
const getReformas = async (req, res) => {
  try {
    // Buscar todas as reformas
    const reformas = await allQuery('SELECT * FROM reformas_aparelho');

    // Calcular estatísticas
    const prazo = calcularEstatisticasPrazo(reformas);
    const prioridade = calcularEstatisticasPrioridade(reformas);

    res.json({
      success: true,
      data: {
        tipo: 'reformas_aparelho',
        prazo,
        prioridade,
        total: reformas.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de reformas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
};

module.exports = {
  getOrdensServico,
  getReformas
};