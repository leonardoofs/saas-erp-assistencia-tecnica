/**
 * UnderTech - Serviço de Situação de Clientes
 * 
 * 
 * REGRAS DE NEGÓCIO:
 * - Sem compra há 90 dias = "Em Risco"
 * - Sem compra há 180 dias = "Inativo"
 * - Com compra recente = "Ativo"
 */

const { runQuery, allQuery } = require('../config/database');

/**
 * Calcula a situação do cliente baseado na última compra
 * @param {Date|string} ultimaCompra - Data da última compra
 * @returns {string} - "ativo", "em_risco" ou "inativo"
 */
const calcularSituacao = (ultimaCompra) => {
  // Se não tem última compra, retorna null (não deveria acontecer)
  if (!ultimaCompra) {
    return null;
  }

  const hoje = new Date();
  const dataUltimaCompra = new Date(ultimaCompra);
  
  // Calcular diferença em dias
  const diferencaMs = hoje - dataUltimaCompra;
  const diasSemComprar = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  // Lógica atualizada:
  // ATIVO: até 90 dias
  // EM RISCO: > 90 e <= 180 dias
  // INATIVO: > 180 dias
  
  if (diasSemComprar <= 90) {
    return 'ativo';
  } else if (diasSemComprar <= 180) {
    return 'em_risco';
  } else {
    return 'inativo';
  }
};

const aplicarSituacaoEmClientes = (clientes) => {
  return clientes.map(cliente => ({
    ...cliente,
    situacao: calcularSituacao(cliente.ultima_compra)
  }));
};

/**
 * Atualiza a situação de todos os clientes
 * Deve ser executado periodicamente (diariamente)
 */
const atualizarSituacaoTodosClientes = async () => {
  try {
    console.log('Iniciando atualização de situação dos clientes...');

    // Buscar todos os clientes
    const clientes = await allQuery('SELECT id, ultima_compra, situacao FROM clientes');

    let atualizados = 0;
    let emRisco = 0;
    let inativos = 0;
    let ativos = 0;

    for (const cliente of clientes) {
      const novaSituacao = calcularSituacao(cliente.ultima_compra);

      // Só atualizar se a situação mudou
      if (cliente.situacao !== novaSituacao) {
        await runQuery(
          'UPDATE clientes SET situacao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [novaSituacao, cliente.id]
        );
        atualizados++;
      }

      // Contadores para relatório
      if (novaSituacao === 'em_risco') emRisco++;
      else if (novaSituacao === 'inativo') inativos++;
      else ativos++;
    }

    console.log('✅ Atualização concluída!');
    console.log(`   📊 Total de clientes: ${clientes.length}`);
    console.log(`   ✅ Ativos: ${ativos}`);
    console.log(`   ⚠️  Em Risco: ${emRisco}`);
    console.log(`   ❌ Inativos: ${inativos}`);
    console.log(`   🔄 Alterados: ${atualizados}`);

    return {
      success: true,
      total: clientes.length,
      ativos,
      emRisco,
      inativos,
      atualizados
    };

  } catch (error) {
    console.error('❌ Erro ao atualizar situação dos clientes:', error);
    throw error;
  }
};

/**
 * Atualiza a data da última compra de um cliente
 * @param {number} clienteId - ID do cliente
 */
const registrarCompra = async (clienteId) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    await runQuery(
      `UPDATE clientes 
       SET ultima_compra = ?, 
           situacao = 'ativo', 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [hoje, clienteId]
    );

    console.log(`✅ Compra registrada para cliente ID ${clienteId}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao registrar compra:', error);
    throw error;
  }
};

/**
 * Obtém clientes em risco (90+ dias sem compra)
 */
const getClientesEmRisco = async () => {
  try {
    const clientes = await allQuery(`
      SELECT id, nome, telefone, ultima_compra,
             CAST((julianday('now') - julianday(ultima_compra)) AS INTEGER) as dias_sem_compra
      FROM clientes
      WHERE situacao = 'em_risco'
      ORDER BY ultima_compra ASC
    `);

    return clientes;
  } catch (error) {
    console.error('Erro ao buscar clientes em risco:', error);
    throw error;
  }
};

/**
 * Obtém clientes inativos (180+ dias sem compra)
 */
const getClientesInativos = async () => {
  try {
    const clientes = await allQuery(`
      SELECT id, nome, telefone, ultima_compra,
             CAST((julianday('now') - julianday(ultima_compra)) AS INTEGER) as dias_sem_compra
      FROM clientes
      WHERE situacao = 'inativo'
      ORDER BY ultima_compra ASC
    `);

    return clientes;
  } catch (error) {
    console.error('Erro ao buscar clientes inativos:', error);
    throw error;
  }
};

module.exports = {
  calcularSituacao,
  aplicarSituacaoEmClientes,
  atualizarSituacaoTodosClientes,
  registrarCompra,
  getClientesEmRisco,
  getClientesInativos
};