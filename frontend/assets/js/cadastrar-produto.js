/**
 * UnderTech - Cadastrar Produto v2.0
 * Sistema completo com gestão de grupos, subgrupos, garantias e fabricantes
 */

// Verificar autenticação
if (!auth.requireAuth()) window.location.href = 'login.html';

// Estado global
const state = {
  grupos: [],
  subgrupos: [],
  garantias: [],
  fabricantes: [],
  grupoSelecionado: null
};

// ====================
// INICIALIZAÇÃO
// ====================
document.addEventListener('DOMContentLoaded', async () => {
  await carregarDados();
  configurarEventos();
  configurarCamposCondicionais();
  configurarAbas();
});

async function carregarDados() {
  try {
    const [grupos, subgrupos, garantias, fabricantes] = await Promise.all([
      api.get('/grupos'),
      api.get('/subgrupos'),
      api.get('/garantias'),
      api.get('/fabricantes')
    ]);

    state.grupos = grupos.data;
    state.subgrupos = subgrupos.data;
    state.garantias = garantias.data;
    state.fabricantes = fabricantes.data;

    populateSelects();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    mostrarMensagem('Erro ao carregar dados do sistema', 'error');
  }
}

function populateSelects() {
  // Grupos
  const grupoSelect = document.getElementById('grupo-select');
  grupoSelect.innerHTML = '<option value="">Selecione...</option>' +
    state.grupos.map(g => `<option value="${g.id}" style="background-color: ${g.cor}22; color: ${g.cor};">${g.nome}</option>`).join('');

  // Garantias
  const garantiaSelect = document.getElementById('garantia-select');
  garantiaSelect.innerHTML = '<option value="">Selecione...</option>' +
    state.garantias.map(g => `<option value="${g.id}" style="background-color: ${g.cor}22; color: ${g.cor};">${g.nome} (${g.meses} meses)</option>`).join('');

  // Fabricantes
  const fabricanteSelect = document.getElementById('fabricante-select');
  fabricanteSelect.innerHTML = '<option value="">Selecione...</option>' +
    state.fabricantes.map(f => `<option value="${f.id}" style="background-color: ${f.cor}22; color: ${f.cor};">${f.nome}</option>`).join('');
}

// ====================
// EVENTOS
// ====================
function configurarEventos() {
  // Gerar código
  document.getElementById('btn-gerar-codigo').addEventListener('click', async () => {
    try {
      const res = await api.get('/produtos/gerar-codigo');
      document.querySelector('[name="codigo"]').value = res.data.codigo;
      mostrarMensagem('Código gerado com sucesso', 'success');
    } catch (error) {
      mostrarMensagem('Erro ao gerar código', 'error');
    }
  });

  // Grupo change
  document.getElementById('grupo-select').addEventListener('change', (e) => {
    const grupoId = parseInt(e.target.value);
    state.grupoSelecionado = grupoId;
    atualizarSubgrupos(grupoId);
    toggleCamposAparelho(grupoId);
  });

  // Checkbox IMEI
  document.getElementById('imei-nao-informado').addEventListener('change', (e) => {
    const imeiInput = document.getElementById('imei-input');
    imeiInput.disabled = e.target.checked;
    if (e.target.checked) imeiInput.value = '';
  });

  // Submit form
  document.getElementById('form-cadastrar-produto').addEventListener('submit', handleSubmit);

  // Cancelar
  document.getElementById('btn-cancelar').addEventListener('click', () => {
    if (confirm('Deseja cancelar o cadastro?')) {
      document.getElementById('form-cadastrar-produto').reset();
    }
  });
}

function configurarCamposCondicionais() {
  // Os campos de aparelho são mostrados/ocultos dinamicamente
  toggleCamposAparelho(null);
}

function atualizarSubgrupos(grupoId) {
  const subgrupoSelect = document.getElementById('subgrupo-select');
  if (!grupoId) {
    subgrupoSelect.innerHTML = '<option value="">Selecione um grupo primeiro...</option>';
    subgrupoSelect.disabled = true;
    return;
  }

  const subgruposFiltrados = state.subgrupos.filter(s => s.grupo_id === grupoId);
  subgrupoSelect.disabled = false;
  subgrupoSelect.innerHTML = '<option value="">Selecione...</option>' +
    subgruposFiltrados.map(s => `<option value="${s.id}" style="background-color: ${s.cor}22; color: ${s.cor};">${s.nome}</option>`).join('');
}

function toggleCamposAparelho(grupoId) {
  const camposAparelho = document.getElementById('campos-aparelho');
  const camposEstoque = document.getElementById('campos-estoque');
  const grupo = state.grupos.find(g => g.id === grupoId);
  const isAparelho = grupo && grupo.nome === 'Aparelho';

  // Mostrar/ocultar campos de aparelho
  camposAparelho.style.display = isAparelho ? 'block' : 'none';

  // Mostrar/ocultar campos de estoque (apenas para acessórios)
  camposEstoque.style.display = isAparelho ? 'none' : 'block';

  // Ajustar required dos campos de aparelho
  ['fabricante-select', 'cor-input', 'armazenamento-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.required = isAparelho;
  });

  // Ajustar required dos campos de estoque
  ['estoque-atual-input', 'estoque-minimo-input', 'estoque-maximo-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.required = id === 'estoque-atual-input' && !isAparelho;
      if (isAparelho) {
        el.value = '0'; // Zerar valores de estoque para aparelhos
      }
    }
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  // Converter para números
  ['grupo_id', 'subgrupo_id', 'garantia_id', 'fabricante_id', 'estoque_atual', 'estoque_minimo', 'estoque_maximo'].forEach(field => {
    if (data[field]) data[field] = parseInt(data[field]);
  });

  ['preco_custo', 'preco_venda'].forEach(field => {
    if (data[field]) data[field] = parseFloat(data[field]);
  });

  // Limpar campos vazios
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === null) delete data[key];
  });

  try {
    await api.post('/produtos', data);
    mostrarMensagem('Produto cadastrado com sucesso!', 'success');
    e.target.reset();
    setTimeout(() => window.location.reload(), 1500);
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao cadastrar produto', 'error');
  }
}

// ====================
// MODAIS
// ====================
function openGrupoModal() {
  document.getElementById('modal-grupo').style.display = 'flex';
  carregarGrupos();
}
function closeGrupoModal() {
  document.getElementById('modal-grupo').style.display = 'none';
}

function openSubgrupoModal() {
  document.getElementById('modal-subgrupo').style.display = 'flex';
  const select = document.getElementById('subgrupo-grupo');
  select.innerHTML = '<option value="">Selecione...</option>' + state.grupos.map(g => `<option value="${g.id}">${g.nome}</option>`).join('');
  carregarSubgrupos();
}
function closeSubgrupoModal() {
  document.getElementById('modal-subgrupo').style.display = 'none';
}

function openGarantiaModal() {
  document.getElementById('modal-garantia').style.display = 'flex';
  carregarGarantias();
}
function closeGarantiaModal() {
  document.getElementById('modal-garantia').style.display = 'none';
}

function openFabricanteModal() {
  document.getElementById('modal-fabricante').style.display = 'flex';
  carregarFabricantes();
}
function closeFabricanteModal() {
  document.getElementById('modal-fabricante').style.display = 'none';
}

// ====================
// CRUD GRUPOS
// ====================
document.getElementById('form-grupo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('grupo-nome').value;
  const cor = document.getElementById('grupo-cor').value;

  try {
    await api.post('/grupos', { nome, cor });
    mostrarMensagem('Grupo adicionado!', 'success');
    e.target.reset();
    await carregarDados();
    carregarGrupos();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao adicionar grupo', 'error');
  }
});

async function carregarGrupos() {
  const res = await api.get('/grupos');
  const list = document.getElementById('grupos-list');
  list.innerHTML = res.data.map(g => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; background: ${g.cor}11;">
      <div style="width: 30px; height: 30px; background: ${g.cor}; border-radius: 4px;"></div>
      <span style="flex: 1; font-weight: 500;">${g.nome}</span>
      <button onclick="deletarGrupo(${g.id})" class="btn-delete" style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Excluir</button>
    </div>
  `).join('');
}

async function deletarGrupo(id) {
  if (!confirm('Tem certeza? Isso removerá todos os subgrupos vinculados!')) return;
  try {
    await api.delete(`/grupos/${id}`);
    mostrarMensagem('Grupo excluído!', 'success');
    await carregarDados();
    carregarGrupos();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao excluir grupo', 'error');
  }
}

// ====================
// CRUD SUBGRUPOS
// ====================
document.getElementById('form-subgrupo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const grupo_id = parseInt(document.getElementById('subgrupo-grupo').value);
  const nome = document.getElementById('subgrupo-nome').value;
  const cor = document.getElementById('subgrupo-cor').value;

  try {
    await api.post('/subgrupos', { nome, cor, grupo_id });
    mostrarMensagem('Subgrupo adicionado!', 'success');
    e.target.reset();
    await carregarDados();
    carregarSubgrupos();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao adicionar subgrupo', 'error');
  }
});

async function carregarSubgrupos() {
  const res = await api.get('/subgrupos');
  const list = document.getElementById('subgrupos-list');
  list.innerHTML = res.data.map(s => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; background: ${s.cor}11;">
      <div style="width: 30px; height: 30px; background: ${s.cor}; border-radius: 4px;"></div>
      <div style="flex: 1;">
        <div style="font-weight: 500;">${s.nome}</div>
        <div style="font-size: 12px; color: #666;">Grupo: ${s.grupo_nome}</div>
      </div>
      <button onclick="deletarSubgrupo(${s.id})" class="btn-delete" style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Excluir</button>
    </div>
  `).join('');
}

async function deletarSubgrupo(id) {
  if (!confirm('Tem certeza?')) return;
  try {
    await api.delete(`/subgrupos/${id}`);
    mostrarMensagem('Subgrupo excluído!', 'success');
    await carregarDados();
    carregarSubgrupos();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao excluir subgrupo', 'error');
  }
}

// ====================
// CRUD GARANTIAS
// ====================
document.getElementById('form-garantia').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('garantia-nome').value;
  const meses = parseInt(document.getElementById('garantia-meses').value);
  const cor = document.getElementById('garantia-cor').value;

  try {
    await api.post('/garantias', { nome, meses, cor });
    mostrarMensagem('Garantia adicionada!', 'success');
    e.target.reset();
    await carregarDados();
    carregarGarantias();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao adicionar garantia', 'error');
  }
});

async function carregarGarantias() {
  const res = await api.get('/garantias');
  const list = document.getElementById('garantias-list');
  list.innerHTML = res.data.map(g => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; background: ${g.cor}11;">
      <div style="width: 30px; height: 30px; background: ${g.cor}; border-radius: 4px;"></div>
      <div style="flex: 1;">
        <div style="font-weight: 500;">${g.nome}</div>
        <div style="font-size: 12px; color: #666;">${g.meses} meses</div>
      </div>
      <button onclick="deletarGarantia(${g.id})" class="btn-delete" style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Excluir</button>
    </div>
  `).join('');
}

async function deletarGarantia(id) {
  if (!confirm('Tem certeza?')) return;
  try {
    await api.delete(`/garantias/${id}`);
    mostrarMensagem('Garantia excluída!', 'success');
    await carregarDados();
    carregarGarantias();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao excluir garantia', 'error');
  }
}

// ====================
// CRUD FABRICANTES
// ====================
document.getElementById('form-fabricante').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('fabricante-nome').value;
  const cor = document.getElementById('fabricante-cor').value;

  try {
    await api.post('/fabricantes', { nome, cor });
    mostrarMensagem('Fabricante adicionado!', 'success');
    e.target.reset();
    await carregarDados();
    carregarFabricantes();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao adicionar fabricante', 'error');
  }
});

async function carregarFabricantes() {
  const res = await api.get('/fabricantes');
  const list = document.getElementById('fabricantes-list');
  list.innerHTML = res.data.map(f => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px; background: ${f.cor}11;">
      <div style="width: 30px; height: 30px; background: ${f.cor}; border-radius: 4px;"></div>
      <span style="flex: 1; font-weight: 500;">${f.nome}</span>
      <button onclick="deletarFabricante(${f.id})" class="btn-delete" style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Excluir</button>
    </div>
  `).join('');
}

async function deletarFabricante(id) {
  if (!confirm('Tem certeza?')) return;
  try {
    await api.delete(`/fabricantes/${id}`);
    mostrarMensagem('Fabricante excluído!', 'success');
    await carregarDados();
    carregarFabricantes();
  } catch (error) {
    mostrarMensagem(error.message || 'Erro ao excluir fabricante', 'error');
  }
}

// ====================
// CONTROLE DE ABAS
// ====================
function configurarAbas() {
  const tabs = document.querySelectorAll('.form-tab');
  const sections = document.querySelectorAll('.form-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Remove active de todas as tabs e seções
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // Adiciona active na tab e seção clicada
      tab.classList.add('active');
      document.getElementById(`section-${targetTab}`).classList.add('active');
    });
  });
}

// ====================
// UTILIDADES
// ====================
function mostrarMensagem(msg, tipo) {
  alert(msg);
}
