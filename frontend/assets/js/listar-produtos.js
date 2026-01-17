/**
 * UnderTech - Listar Produtos
 * Lógica da página de listagem de produtos
 */

// Verificar autenticação
if (!auth.requireAuth()) {
  window.location.href = 'login.html';
}

// === ESTADO DA PÁGINA ===
let currentPage = 1;
let totalPages = 1;
let searchTerm = '';
let categoriaFilter = '';
let statusFilter = '';
const itemsPerPage = 20;

// === FORMATADORES ===
function formatarMoeda(valor) {
  if (!valor && valor !== 0) return 'R$ 0,00';
  const numero = parseFloat(valor);
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarPorcentagem(valor) {
  if (!valor && valor !== 0) return '0,00%';
  const numero = parseFloat(valor);
  return numero.toFixed(2).replace('.', ',') + '%';
}

function traduzirCategoria(categoria) {
  const categorias = {
    'telas': 'Telas',
    'baterias': 'Baterias',
    'capinhas': 'Capinhas',
    'acessorios': 'Acessórios',
    'outros': 'Outros'
  };
  return categorias[categoria] || categoria;
}

function formatarData(dataString) {
  if (!dataString) return '-';
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// === CARREGAR PRODUTOS ===
async function carregarProdutos(page = 1, search = '', categoria = '', status = '') {
  try {
    currentPage = page;
    searchTerm = search;
    categoriaFilter = categoria;
    statusFilter = status;

    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px;">
          <div class="loading-spinner"></div>
          <div>Carregando produtos...</div>
        </td>
      </tr>
    `;

    let endpoint = `/produtos?page=${page}&limit=${itemsPerPage}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    if (categoria) {
      endpoint += `&categoria=${categoria}`;
    }
    if (status !== '') {
      endpoint += `&ativo=${status}`;
    }

    const response = await api.get(endpoint);

    if (response && response.success) {
      const data = response.data || [];
      const pagination = response.pagination || {
        page: 1,
        limit: itemsPerPage,
        total: 0,
        pages: 1
      };

      if (data.length === 0) {
        mostrarEstadoVazio(search, categoria, status);
      } else {
        renderizarTabela(data);
        renderizarPaginacao(pagination);
        atualizarInfo(pagination, data.length);
      }
    } else {
      mostrarEstadoVazio(search, categoria, status);
    }
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: var(--status-atrasada);">
          <div style="margin-bottom: 10px;">❌ Erro ao carregar produtos</div>
          <div style="font-size: 14px; color: #666;">Tente novamente em alguns instantes</div>
        </td>
      </tr>
    `;

    document.getElementById('showing-count').textContent = '0';
    document.getElementById('total-count').textContent = '0';
    document.getElementById('pagination-controls').innerHTML = '';
  }
}

// === RENDERIZAR TABELA ===
function renderizarTabela(produtos) {
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '';

  produtos.forEach(produto => {
    const row = document.createElement('tr');

    // Badge de status
    const statusClass = produto.ativo === 1 ? 'badge-ativo' : 'badge-inativo';
    const statusText = produto.ativo === 1 ? 'ATIVO' : 'INATIVO';

    row.innerHTML = `
      <td>${produto.id}</td>
      <td>${produto.codigo}</td>
      <td>${produto.nome}</td>
      <td>${traduzirCategoria(produto.categoria)}</td>
      <td>${produto.marca || '-'}</td>
      <td>${formatarMoeda(produto.preco_custo)}</td>
      <td>${formatarMoeda(produto.preco_venda)}</td>
      <td>${formatarPorcentagem(produto.margem_lucro || 0)}</td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-icons">
          <svg class="action-icon" onclick="visualizarProduto(${produto.id})" title="Visualizar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg class="action-icon" onclick="editarProduto(${produto.id})" title="Editar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <svg class="action-icon" onclick="deletarProduto(${produto.id}, '${produto.nome.replace(/'/g, "\\'")}')" title="Deletar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// === RENDERIZAR PAGINAÇÃO ===
function renderizarPaginacao(pagination) {
  totalPages = pagination.pages || 1;
  const controls = document.getElementById('pagination-controls');
  controls.innerHTML = '';

  if (totalPages <= 1) return;

  // Botão Anterior
  const btnPrev = document.createElement('button');
  btnPrev.className = 'pagination-btn';
  btnPrev.textContent = '‹';
  btnPrev.disabled = currentPage === 1;
  btnPrev.onclick = () => carregarProdutos(currentPage - 1, searchTerm, categoriaFilter, statusFilter);
  controls.appendChild(btnPrev);

  // Lógica de páginas
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  // Primeira página
  if (startPage > 1) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = '1';
    btn.onclick = () => carregarProdutos(1, searchTerm, categoriaFilter, statusFilter);
    controls.appendChild(btn);

    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      controls.appendChild(ellipsis);
    }
  }

  // Páginas do meio
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => carregarProdutos(i, searchTerm, categoriaFilter, statusFilter);
    controls.appendChild(btn);
  }

  // Última página
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'pagination-ellipsis';
      ellipsis.textContent = '...';
      controls.appendChild(ellipsis);
    }

    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = totalPages;
    btn.onclick = () => carregarProdutos(totalPages, searchTerm, categoriaFilter, statusFilter);
    controls.appendChild(btn);
  }

  // Botão Próximo
  const btnNext = document.createElement('button');
  btnNext.className = 'pagination-btn';
  btnNext.textContent = '›';
  btnNext.disabled = currentPage === totalPages;
  btnNext.onclick = () => carregarProdutos(currentPage + 1, searchTerm, categoriaFilter, statusFilter);
  controls.appendChild(btnNext);
}

// === ATUALIZAR INFO ===
function atualizarInfo(pagination, dataLength) {
  const showing = pagination.limit * (pagination.page - 1) + (dataLength || 0);
  document.getElementById('showing-count').textContent = showing;
  document.getElementById('total-count').textContent = pagination.total || 0;
}

// === ESTADO VAZIO ===
function mostrarEstadoVazio(search, categoria, status) {
  const tbody = document.getElementById('products-tbody');

  if (search || categoria || status !== '') {
    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            <div class="empty-state-text">Nenhum produto encontrado</div>
            <div class="empty-state-subtext">Tente ajustar seus filtros de busca</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="10">
          <div class="empty-state">
            <div class="empty-state-text">Nenhum produto cadastrado</div>
            <div class="empty-state-subtext">Comece cadastrando seu primeiro produto</div>
            <button class="btn-add" onclick="window.location.href='cadastrar-produto.html'" style="margin-top: 20px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Cadastrar Primeiro Produto
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  document.getElementById('showing-count').textContent = '0';
  document.getElementById('total-count').textContent = '0';
  document.getElementById('pagination-controls').innerHTML = '';
}

// === VISUALIZAR PRODUTO (MODAL) ===
async function visualizarProduto(id) {
  try {
    const response = await api.get(`/produtos/${id}`);

    if (!response.success || !response.data) {
      throw new Error('Produto não encontrado');
    }

    const produto = response.data;
    mostrarModalDetalhes(produto);

  } catch (error) {
    console.error('Erro ao visualizar produto:', error);
    utils.showToast(error.message || 'Erro ao carregar dados do produto', 'error');
  }
}

function mostrarModalDetalhes(produto) {
  const modalBodyContent = document.getElementById('modal-body-content');

  const statusText = produto.ativo === 1 ? 'Ativo' : 'Inativo';
  const statusClass = produto.ativo === 1 ? 'badge-ativo' : 'badge-inativo';

  modalBodyContent.innerHTML = `
    <div class="info-section">
      <h3 class="info-section-title">Informações Principais</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">ID:</span>
          <span class="info-value">#${produto.id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Código (SKU):</span>
          <span class="info-value">${produto.codigo}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nome:</span>
          <span class="info-value">${produto.nome}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Categoria:</span>
          <span class="info-value">${traduzirCategoria(produto.categoria)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Marca:</span>
          <span class="info-value">${produto.marca || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Modelo:</span>
          <span class="info-value">${produto.modelo || '-'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status:</span>
          <span class="badge ${statusClass}">${statusText}</span>
        </div>
      </div>
    </div>

    ${produto.descricao ? `
    <div class="info-section">
      <h3 class="info-section-title">Descrição</h3>
      <p class="info-observacoes">${produto.descricao}</p>
    </div>
    ` : ''}

    <div class="info-section">
      <h3 class="info-section-title">Precificação</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Preço de Custo:</span>
          <span class="info-value">${formatarMoeda(produto.preco_custo)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Preço de Venda:</span>
          <span class="info-value">${formatarMoeda(produto.preco_venda)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Margem de Lucro:</span>
          <span class="info-value">${formatarPorcentagem(produto.margem_lucro || 0)}</span>
        </div>
      </div>
    </div>

    ${produto.fornecedor ? `
    <div class="info-section">
      <h3 class="info-section-title">Fornecedor</h3>
      <p class="info-observacoes">${produto.fornecedor}</p>
    </div>
    ` : ''}

    ${produto.observacoes ? `
    <div class="info-section">
      <h3 class="info-section-title">Observações</h3>
      <p class="info-observacoes">${produto.observacoes}</p>
    </div>
    ` : ''}

    <div class="info-section">
      <h3 class="info-section-title">Registros</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Cadastrado em:</span>
          <span class="info-value">${formatarData(produto.created_at)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Última atualização:</span>
          <span class="info-value">${formatarData(produto.updated_at)}</span>
        </div>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn-modal-edit" onclick="editarProduto(${produto.id})">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Editar Produto
      </button>
    </div>
  `;

  // Mostrar modal
  const modal = document.getElementById('modal-detalhes');
  modal.style.display = 'flex';
}

function fecharModal() {
  const modal = document.getElementById('modal-detalhes');
  modal.style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('modal-detalhes');
  if (event.target === modal) {
    fecharModal();
  }
}

// === EDITAR PRODUTO ===
function editarProduto(id) {
  fecharModal();
  setTimeout(() => {
    window.location.href = `cadastrar-produto.html?edit=${id}`;
  }, 100);
}

// === DELETAR PRODUTO ===
async function deletarProduto(id, nome) {
  if (!confirm(`Tem certeza que deseja deletar o produto "${nome}"?`)) return;

  try {
    await api.delete(`/produtos/${id}`);
    utils.showToast('Produto deletado com sucesso!', 'success');
    carregarProdutos(currentPage, searchTerm, categoriaFilter, statusFilter);
  } catch (error) {
    utils.showToast(error.message || 'Erro ao deletar produto', 'error');
  }
}

// === BUSCA ===
const searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    carregarProdutos(1, e.target.value, categoriaFilter, statusFilter);
  }, 500);
});

// === FILTROS ===
const categoriaFilterEl = document.getElementById('categoria-filter');
const statusFilterEl = document.getElementById('status-filter');

categoriaFilterEl.addEventListener('change', (e) => {
  carregarProdutos(1, searchTerm, e.target.value, statusFilter);
});

statusFilterEl.addEventListener('change', (e) => {
  carregarProdutos(1, searchTerm, categoriaFilter, e.target.value);
});

// === LOGOUT ===
document.getElementById('logout-btn').addEventListener('click', () => {
  auth.logout();
});

// === MENU MOBILE ===
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// === INICIALIZAÇÃO ===
carregarProdutos(1, '', '', '');
