/**
 * UnderTech - Listar Clientes
 * Lógica da página de listagem de clientes
 */

// Verificar autenticação
if (!auth.requireAuth()) {
  window.location.href = 'login.html';
}

// === ESTADO DA PÁGINA ===
let currentPage = 1;
let totalPages = 1;
let searchTerm = '';
const itemsPerPage = 20;

// === CARREGAR CLIENTES ===
async function carregarClientes(page = 1, search = '') {
  try {
    currentPage = page;
    searchTerm = search;

    // Mostrar loading
    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px;">
          <div class="loading-spinner"></div>
          <div>Carregando clientes...</div>
        </td>
      </tr>
    `;

    // Buscar clientes da API
    let endpoint = `/clientes?page=${page}&limit=${itemsPerPage}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }

    const response = await api.get(endpoint);

    // Verificar se a resposta é válida
    if (response && response.success) {
      const data = response.data || [];
      const pagination = response.pagination || {
        page: 1,
        limit: itemsPerPage,
        total: 0,
        pages: 1,
        data: []
      };

      if (data.length === 0) {
        mostrarEstadoVazio(search);
      } else {
        renderizarTabela(data);
        renderizarPaginacao(pagination);
        atualizarInfo(pagination, data.length);
      }
    } else {
      // Se não houver dados ou sucesso for false
      mostrarEstadoVazio(search);
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--status-atrasada);">
          <div style="margin-bottom: 10px;">❌ Erro ao carregar clientes</div>
          <div style="font-size: 14px; color: #666;">Tente novamente em alguns instantes</div>
        </td>
      </tr>
    `;
    
    // Resetar informações
    document.getElementById('showing-count').textContent = '0';
    document.getElementById('total-count').textContent = '0';
    document.getElementById('pagination-controls').innerHTML = '';
  }
}

// === RENDERIZAR TABELA ===
function renderizarTabela(clientes) {
  const tbody = document.getElementById('clients-tbody');
  tbody.innerHTML = '';

  clientes.forEach(cliente => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cliente.id}</td>
      <td>${cliente.nome}</td>
      <td>${formatarCPF(cliente.cpf)}</td>
      <td>${cliente.telefone || '-'}</td>
      <td>${cliente.email?.replace('@instagram.com', '') || '-'}</td>
      <td>
        <span class="situacao-badge situacao-${cliente.situacao || 'ativo'}">
          ${cliente.situacao || 'Ativo'}
        </span>
      </td>
      <td>
        <div class="action-icons">
          <svg class="action-icon" onclick="visualizarCliente(${cliente.id})" title="Visualizar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <svg class="action-icon" onclick="editarCliente(${cliente.id})" title="Editar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <svg class="action-icon" onclick="deletarCliente(${cliente.id}, '${cliente.nome}')" title="Deletar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

  // Se só tiver 1 página, não mostrar paginação
  if (totalPages <= 1) return;

  // Botão Anterior
  const btnPrev = document.createElement('button');
  btnPrev.className = 'pagination-btn';
  btnPrev.textContent = '‹';
  btnPrev.disabled = currentPage === 1;
  btnPrev.onclick = () => carregarClientes(currentPage - 1, searchTerm);
  controls.appendChild(btnPrev);

  // Botões de páginas
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => carregarClientes(i, searchTerm);
    controls.appendChild(btn);
  }

  // Botão Próximo
  const btnNext = document.createElement('button');
  btnNext.className = 'pagination-btn';
  btnNext.textContent = '›';
  btnNext.disabled = currentPage === totalPages;
  btnNext.onclick = () => carregarClientes(currentPage + 1, searchTerm);
  controls.appendChild(btnNext);
}

// === ATUALIZAR INFO ===
function atualizarInfo(pagination, dataLength) {
  const showing = pagination.limit * (pagination.page - 1) + (dataLength || 0);
  document.getElementById('showing-count').textContent = showing;
  document.getElementById('total-count').textContent = pagination.total || 0;
}

// === ESTADO VAZIO ===
function mostrarEstadoVazio(search) {
  const tbody = document.getElementById('clients-tbody');
  
  if (search) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-text">Nenhum cliente encontrado</div>
            <div class="empty-state-subtext">Tente ajustar sua busca</div>
          </div>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-text">Nenhum cliente cadastrado</div>
            <div class="empty-state-subtext">Comece cadastrando seu primeiro cliente</div>
            <button class="btn-add" onclick="window.location.href='cadastrar-cliente.html'" style="margin-top: 20px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Cadastrar Primeiro Cliente
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

// === FORMATAÇÃO ===
function formatarCPF(cpf) {
  if (!cpf) return '-';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// === AÇÕES ===
function visualizarCliente(id) {
  utils.showToast('Visualização em desenvolvimento', 'info');
  // TODO: Abrir modal com detalhes do cliente
}

function editarCliente(id) {
  window.location.href = `cadastrar-cliente.html?edit=${id}`;
}

async function deletarCliente(id, nome) {
  if (!confirm(`Tem certeza que deseja deletar o cliente "${nome}"?`)) return;

  try {
    await api.delete(`/clientes/${id}`);
    utils.showToast('Cliente deletado com sucesso!', 'success');
    carregarClientes(currentPage, searchTerm);
  } catch (error) {
    utils.showToast(error.message || 'Erro ao deletar cliente', 'error');
  }
}

// === BUSCA ===
const searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    carregarClientes(1, e.target.value);
  }, 500); // Debounce de 500ms
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
carregarClientes(1, '');