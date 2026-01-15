/**
 * UnderTech - Cadastrar Cliente
 * VERSÃO CORRIGIDA - Atualização funcionando
 */

if (!auth.requireAuth()) {
  window.location.href = 'login.html';
}

// === CARREGAR USUÁRIO LOGADO ===
function carregarUsuarioLogado() {
  const user = auth.getUser();
  const selectResponsavel = document.querySelector('select[name="responsavel"]');
  
  if (user && selectResponsavel) {
    selectResponsavel.innerHTML = '';
    const option = document.createElement('option');
    option.value = user.name;
    option.textContent = user.name;
    option.selected = true;
    selectResponsavel.appendChild(option);
  }
}

// === GERENCIAMENTO DE TABS ===
const formTabs = document.querySelectorAll('.form-tab');
const formSections = document.querySelectorAll('.form-section');

formTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetSection = tab.dataset.tab;
    formTabs.forEach(t => t.classList.remove('active'));
    formSections.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`section-${targetSection}`).classList.add('active');
  });
});

// === MÁSCARAS ===
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

const cpfInput = document.querySelector('input[name="cpf"]');
if (cpfInput) {
  cpfInput.addEventListener('input', (e) => aplicarMascaraCPF(e.target));
}

document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('input', (e) => aplicarMascaraTelefone(e.target));
});

const cepInput = document.querySelector('input[name="cep"]');
if (cepInput) {
  cepInput.addEventListener('input', (e) => aplicarMascaraCEP(e.target));
}

// === CHECKBOXES "NÃO SABE" ===
const cpfCheckbox = document.getElementById('cpf-nao-sabe');
const cpfInputField = document.getElementById('cpf-input');

if (cpfCheckbox && cpfInputField) {
  cpfCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      cpfInputField.value = '';
      cpfInputField.disabled = true;
    } else {
      cpfInputField.disabled = false;
    }
  });
}

const telefoneCheckbox = document.getElementById('telefone-nao-sabe');
const telefoneInputField = document.getElementById('telefone-input');

if (telefoneCheckbox && telefoneInputField) {
  telefoneCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      telefoneInputField.value = '';
      telefoneInputField.disabled = true;
      telefoneInputField.removeAttribute('required');
    } else {
      telefoneInputField.disabled = false;
      telefoneInputField.setAttribute('required', 'required');
    }
  });
}

// === VALIDAÇÃO DE CPF ===
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto >= 10 ? 0 : resto;
  if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto >= 10 ? 0 : resto;
  if (digitoVerificador2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// === SUBMETER FORMULÁRIO ===
const formCadastrarCliente = document.getElementById('form-cadastrar-cliente');

formCadastrarCliente.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  
  const cpfNaoSabe = formData.get('cpf_nao_sabe');
  const cpfValue = formData.get('cpf');
  
  if (!cpfNaoSabe && cpfValue) {
    const cpfLimpo = cpfValue.replace(/\D/g, '');
    
    if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
      utils.showToast('CPF deve conter exatamente 11 dígitos', 'error');
      document.getElementById('cpf-input').focus();
      return;
    }
    
    if (cpfLimpo.length === 11 && !validarCPF(cpfLimpo)) {
      utils.showToast('CPF inválido. Verifique os números digitados', 'error');
      document.getElementById('cpf-input').focus();
      return;
    }
  }
  
  const telefoneNaoSabe = formData.get('telefone_nao_sabe');
  const telefoneValue = formData.get('telefone');
  
  if (!telefoneNaoSabe && !telefoneValue) {
    utils.showToast('Telefone pessoal é obrigatório', 'error');
    document.getElementById('telefone-input').focus();
    return;
  }

  // 🔧 CORREÇÃO: Garantir que TODOS os campos sejam enviados
  const data = {
    nome: formData.get('nome') || '',
    cpf: cpfNaoSabe ? null : (cpfValue ? cpfValue.replace(/\D/g, '') : null),
    telefone: telefoneNaoSabe ? 'Não informado' : (telefoneValue || ''),
    telefone_contato: formData.get('telefone_contato') || null,
    email: formData.get('instagram') ? `${formData.get('instagram').replace('@', '')}@instagram.com` : null,
    situacao: formData.get('situacao') || 'ativo',
    responsavel: formData.get('responsavel') || '',
    endereco: formData.get('endereco') || null,
    cidade: formData.get('cidade') || null,
    estado: formData.get('estado') || null,
    cep: formData.get('cep') ? formData.get('cep').replace(/\D/g, '') : null,
    observacoes: formData.get('observacoes') || null
  };

  try {
    const editId = new URLSearchParams(window.location.search).get('edit');
    
    if (editId) {
      console.log('📤 Enviando dados para atualizar:', data);
      const response = await api.put(`/clientes/${editId}`, data);
      
      if (response.success) {
        utils.showToast('Cliente atualizado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = 'listar-clientes.html';
        }, 1500);
      }
    } else {
      const response = await api.post('/clientes', data);

      if (response.success) {
        utils.showToast('Cliente cadastrado com sucesso!', 'success');
        limparFormulario();
        carregarUltimosClientes();
      }
    }
  } catch (error) {
    console.error('❌ Erro ao salvar:', error);
    utils.showToast(error.message || 'Erro ao salvar cliente', 'error');
  }
});

// === LIMPAR FORMULÁRIO ===
function limparFormulario() {
  formCadastrarCliente.reset();
  
  document.getElementById('cpf-input').disabled = false;
  document.getElementById('telefone-input').disabled = false;
  document.getElementById('telefone-input').setAttribute('required', 'required');
  
  formTabs.forEach(t => t.classList.remove('active'));
  formSections.forEach(s => s.classList.remove('active'));
  formTabs[0].classList.add('active');
  formSections[0].classList.add('active');
  
  carregarUsuarioLogado();
  
  // Resetar botão
  document.querySelector('.btn-cadastrar').textContent = 'Cadastrar';
  
  // Limpar parâmetro da URL
  window.history.replaceState({}, '', 'cadastrar-cliente.html');
}

document.getElementById('btn-cancelar').addEventListener('click', () => {
  if (new URLSearchParams(window.location.search).get('edit')) {
    window.location.href = 'listar-clientes.html';
  } else {
    limparFormulario();
  }
});

// === CARREGAR ÚLTIMOS CLIENTES ===
async function carregarUltimosClientes() {
  try {
    const response = await api.get('/clientes?limit=10&page=1');

    if (response.success && response.data.length > 0) {
      renderizarTabelaClientes(response.data);
      document.getElementById('total-clients').textContent = response.data.length;
      document.getElementById('total-clients-db').textContent = response.pagination.total;
    } else {
      const tbody = document.getElementById('recent-clients-tbody');
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
            Nenhum cliente cadastrado ainda
          </td>
        </tr>
      `;
      document.getElementById('total-clients').textContent = '0';
      document.getElementById('total-clients-db').textContent = '0';
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

function formatarCPF(cpf) {
  if (!cpf) return '-';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// === EDITAR CLIENTE ===
function editarCliente(id) {
  window.location.href = `cadastrar-cliente.html?edit=${id}`;
}

// === CARREGAR DADOS PARA EDIÇÃO ===
async function carregarDadosParaEdicao() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    try {
      const response = await api.get(`/clientes/${editId}`);
      
      if (response.success && response.data) {
        const cliente = response.data;
        
        // Preencher campos
        document.querySelector('input[name="nome"]').value = cliente.nome || '';
        
        // CPF com formatação
        if (cliente.cpf) {
          document.querySelector('input[name="cpf"]').value = formatarCPF(cliente.cpf);
        }
        
        document.querySelector('input[name="telefone"]').value = cliente.telefone || '';
        document.querySelector('input[name="telefone_contato"]').value = cliente.telefone_contato || '';
        document.querySelector('input[name="instagram"]').value = cliente.email?.replace('@instagram.com', '') || '';
        document.querySelector('select[name="situacao"]').value = cliente.situacao || 'ativo';
        
        // Select de responsável
        const selectResponsavel = document.querySelector('select[name="responsavel"]');
        selectResponsavel.innerHTML = '';
        const option = document.createElement('option');
        option.value = cliente.responsavel || auth.getUser().name;
        option.textContent = cliente.responsavel || auth.getUser().name;
        option.selected = true;
        selectResponsavel.appendChild(option);
        
        // Campos adicionais
        document.querySelector('input[name="endereco"]').value = cliente.endereco || '';
        document.querySelector('input[name="cidade"]').value = cliente.cidade || '';
        document.querySelector('input[name="estado"]').value = cliente.estado || '';
        
        if (cliente.cep) {
          const cepFormatado = cliente.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
          document.querySelector('input[name="cep"]').value = cepFormatado;
        }
        
        document.querySelector('textarea[name="observacoes"]').value = cliente.observacoes || '';
        
        // Mudar texto do botão
        document.querySelector('.btn-cadastrar').textContent = 'Atualizar Cliente';
        
        utils.showToast('Dados carregados para edição', 'info');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      utils.showToast(error.message || 'Erro ao carregar dados do cliente', 'error');
      setTimeout(() => {
        window.location.href = 'cadastrar-cliente.html';
      }, 2000);
    }
  }
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
carregarUsuarioLogado();
carregarDadosParaEdicao();
carregarUltimosClientes();