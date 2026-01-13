/**
 * UnderTech - Cadastrar Cliente
 * Lógica da página de cadastro de clientes
 */

// Verificar autenticação
if (!auth.requireAuth()) {
  window.location.href = 'login.html';
}

// === GERENCIAMENTO DE TABS ===
const formTabs = document.querySelectorAll('.form-tab');
const formSections = document.querySelectorAll('.form-section');

formTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetSection = tab.dataset.tab;

    // Remover active de todas as tabs e seções
    formTabs.forEach(t => t.classList.remove('active'));
    formSections.forEach(s => s.classList.remove('active'));

    // Adicionar active na tab e seção clicada
    tab.classList.add('active');
    document.getElementById(`section-${targetSection}`).classList.add('active');
  });
});

// === MÁSCARAS DE INPUTS ===
function aplicarMascaraCPF(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  input.value = value;
}

function aplicarMascaraTelefone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length <= 11) {
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
  }
  input.value = value;
}

function aplicarMascaraCEP(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length <= 8) {
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
  }
  input.value = value;
}

// Aplicar máscaras nos inputs
const cpfInput = document.querySelector('input[name="cpf"]');
if (cpfInput) {
  cpfInput.addEventListener('input', (e) => {
    aplicarMascaraCPF(e.target);
  });
}

document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', (e) => {
    aplicarMascaraTelefone(e.target);
  });
});

// Aplicar máscara de CEP
const cepInput = document.querySelector('input[name="cep"]');
if (cepInput) {
  cepInput.addEventListener('input', (e) => {
    aplicarMascaraCEP(e.target);
  });
}

// === SUBMETER FORMULÁRIO ===
const formCadastrarCliente = document.getElementById('form-cadastrar-cliente');

formCadastrarCliente.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    nome: formData.get('nome'),
    cpf: formData.get('cpf')?.replace(/\D/g, ''),
    telefone: formData.get('telefone'),
    email: formData.get('instagram') ? `${formData.get('instagram')}@instagram.com` : null,
    endereco: formData.get('endereco'),
    cidade: formData.get('cidade'),
    estado: formData.get('estado'),
    observacoes: formData.get('observacoes')
  };

  try {
    const response = await api.post('/clientes', data);

    if (response.success) {
      utils.showToast('Cliente cadastrado com sucesso!', 'success');
      limparFormulario();
      carregarUltimosClientes();
    }
  } catch (error) {
    utils.showToast(error.message || 'Erro ao cadastrar cliente', 'error');
  }
});

// === LIMPAR FORMULÁRIO ===
function limparFormulario() {
  formCadastrarCliente.reset();
  
  // Voltar para a primeira tab
  formTabs.forEach(t => t.classList.remove('active'));
  formSections.forEach(s => s.classList.remove('active'));
  formTabs[0].classList.add('active');
  formSections[0].classList.add('active');
}

// Botão cancelar
document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);

// === CARREGAR ÚLTIMOS CLIENTES ===
async function carregarUltimosClientes() {
  try {
    const response = await api.get('/clientes?limit=10');

    if (response.success && response.data.length > 0) {
      renderizarTabelaClientes(response.data);
      document.getElementById('total-clients').textContent = response.data.length;
      document.getElementById('total-clients-db').textContent = response.pagination.total;
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

// === RENDERIZAR TABELA ===
function renderizarTabelaClientes(clientes) {
  const tbody = document.getElementById('recent-clients-tbody');
  tbody.innerHTML = '';

  clientes.forEach(cliente => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cliente.id}</td>
      <td>${cliente.nome}</td>
      <td>${formatarCPF(cliente.cpf)}</td>
      <td>${cliente.telefone}</td>
      <td>${cliente.telefone_contato || '-'}</td>
      <td>${cliente.email?.replace('@instagram.com', '') || '-'}</td>
      <td>
        <div class="action-icons">
          <svg class="action-icon" onclick="editarCliente(${cliente.id})" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <svg class="action-icon" onclick="deletarCliente(${cliente.id}, '${cliente.nome}')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// === FORMATAR CPF ===
function formatarCPF(cpf) {
  if (!cpf) return '-';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// === EDITAR CLIENTE ===
function editarCliente(id) {
  utils.showToast('Função de edição em desenvolvimento', 'info');
  // TODO: Implementar edição
}

// === DELETAR CLIENTE ===
async function deletarCliente(id, nome) {
  if (!confirm(`Tem certeza que deseja deletar o cliente "${nome}"?`)) return;

  try {
    await api.delete(`/clientes/${id}`);
    utils.showToast('Cliente deletado com sucesso!', 'success');
    carregarUltimosClientes();
  } catch (error) {
    utils.showToast(error.message || 'Erro ao deletar cliente', 'error');
  }
}

// === LOGOUT ===
document.getElementById('logout-btn').addEventListener('click', () => {
  auth.logout();
});

// === MENU MOBILE ===
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// === INICIALIZAÇÃO ===
// Carregar clientes ao iniciar a página
carregarUltimosClientes();