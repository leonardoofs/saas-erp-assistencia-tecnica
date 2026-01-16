/**
 * UnderTech - Cadastrar Cliente
 * Versão Refatorada com Arquitetura Orientada a Objetos
 */

// Verificar autenticação
if (!auth.requireAuth()) {
  window.location.href = 'login.html';
}

/**
 * Classe para gerenciar máscaras de input
 */
class InputMask {
  static aplicarCPF(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  }

  static aplicarTelefone(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    return value;
  }

  static aplicarCEP(value) {
    value = value.replace(/\D/g, '');
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  }

  static removerMascara(value) {
    return value.replace(/\D/g, '');
  }
}

/**
 * Classe para validações
 */
class Validador {
  static validarCPF(cpf) {
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

  static formatarCPF(cpf) {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

/**
 * Classe para gerenciar formulários
 */
class FormularioCliente {
  constructor() {
    this.form = document.getElementById('form-cadastrar-cliente');
    this.btnCancelar = document.getElementById('btn-cancelar');
    this.btnCadastrar = document.querySelector('.btn-cadastrar');

    this.inicializar();
  }

  inicializar() {
    this.carregarUsuarioLogado();
    this.configurarTabs();
    this.configurarMascaras();
    this.configurarCheckboxes();
    this.configurarEventos();
    this.carregarDadosParaEdicao();
  }

  carregarUsuarioLogado() {
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

  configurarTabs() {
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
  }

  configurarMascaras() {
    const cpfInput = document.querySelector('input[name="cpf"]');
    if (cpfInput) {
      cpfInput.addEventListener('input', (e) => {
        e.target.value = InputMask.aplicarCPF(e.target.value);
      });
    }

    document.querySelectorAll('input[type="tel"]').forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = InputMask.aplicarTelefone(e.target.value);
      });
    });

    const cepInput = document.querySelector('input[name="cep"]');
    if (cepInput) {
      cepInput.addEventListener('input', (e) => {
        e.target.value = InputMask.aplicarCEP(e.target.value);
      });
    }
  }

  configurarCheckboxes() {
    const cpfCheckbox = document.getElementById('cpf-nao-sabe');
    const cpfInputField = document.getElementById('cpf-input');

    if (cpfCheckbox && cpfInputField) {
      cpfCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          cpfInputField.value = '';
          cpfInputField.disabled = true;
          cpfInputField.removeAttribute('required');
        } else {
          cpfInputField.disabled = false;
          cpfInputField.setAttribute('required', 'required');
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
  }

  configurarEventos() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.btnCancelar.addEventListener('click', () => this.handleCancelar());
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    if (!this.validarFormulario(formData)) {
      return;
    }

    const data = this.construirDadosCliente(formData);

    try {
      const editId = new URLSearchParams(window.location.search).get('edit');

      if (editId) {
        await this.atualizarCliente(editId, data);
      } else {
        await this.criarCliente(data);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      utils.showToast(error.message || 'Erro ao salvar cliente', 'error');
    }
  }

  validarFormulario(formData) {
    const cpfNaoSabe = formData.get('cpf_nao_sabe');
    const cpfValue = formData.get('cpf');

    // CPF é obrigatório se o checkbox "não sei o CPF" não estiver marcado
    if (!cpfNaoSabe && !cpfValue) {
      utils.showToast('CPF é obrigatório. Marque "Não sei o CPF" se não souber', 'error');
      document.getElementById('cpf-input').focus();
      return false;
    }

    if (!cpfNaoSabe && cpfValue) {
      const cpfLimpo = InputMask.removerMascara(cpfValue);

      if (cpfLimpo.length > 0 && cpfLimpo.length !== 11) {
        utils.showToast('CPF deve conter exatamente 11 dígitos', 'error');
        document.getElementById('cpf-input').focus();
        return false;
      }

      if (cpfLimpo.length === 11 && !Validador.validarCPF(cpfLimpo)) {
        utils.showToast('CPF inválido. Verifique os números digitados', 'error');
        document.getElementById('cpf-input').focus();
        return false;
      }
    }

    const telefoneNaoSabe = formData.get('telefone_nao_sabe');
    const telefoneValue = formData.get('telefone');

    if (!telefoneNaoSabe && !telefoneValue) {
      utils.showToast('Telefone pessoal é obrigatório', 'error');
      document.getElementById('telefone-input').focus();
      return false;
    }

    return true;
  }

  construirDadosCliente(formData) {
    const cpfNaoSabe = formData.get('cpf_nao_sabe');
    const cpfValue = formData.get('cpf');
    const telefoneNaoSabe = formData.get('telefone_nao_sabe');
    const telefoneValue = formData.get('telefone');

    return {
      nome: formData.get('nome') || '',
      cpf: cpfNaoSabe ? null : (cpfValue ? InputMask.removerMascara(cpfValue) : null),
      telefone: telefoneNaoSabe ? 'Não informado' : (telefoneValue || ''),
      telefone_contato: formData.get('telefone_contato') || null,
      email: formData.get('instagram') ? `${formData.get('instagram').replace('@', '')}@instagram.com` : null,
      situacao: formData.get('situacao') || 'ativo',
      responsavel: formData.get('responsavel') || '',
      endereco: formData.get('endereco') || null,
      cidade: formData.get('cidade') || null,
      estado: formData.get('estado') || null,
      cep: formData.get('cep') ? InputMask.removerMascara(formData.get('cep')) : null,
      observacoes: formData.get('observacoes') || null
    };
  }

  async criarCliente(data) {
    const response = await api.post('/clientes', data);

    if (response.success) {
      utils.showToast('Cliente cadastrado com sucesso!', 'success');
      this.limparFormulario();
      listaClientesRecentes.carregar();
    }
  }

  async atualizarCliente(id, data) {
    const response = await api.put(`/clientes/${id}`, data);

    if (response.success) {
      utils.showToast('Cliente atualizado com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = 'listar-clientes.html';
      }, 1500);
    }
  }

  limparFormulario() {
    this.form.reset();

    document.getElementById('cpf-input').disabled = false;
    document.getElementById('telefone-input').disabled = false;
    document.getElementById('telefone-input').setAttribute('required', 'required');

    const formTabs = document.querySelectorAll('.form-tab');
    const formSections = document.querySelectorAll('.form-section');
    formTabs.forEach(t => t.classList.remove('active'));
    formSections.forEach(s => s.classList.remove('active'));
    formTabs[0].classList.add('active');
    formSections[0].classList.add('active');

    this.carregarUsuarioLogado();
    this.btnCadastrar.textContent = 'Cadastrar';
    window.history.replaceState({}, '', 'cadastrar-cliente.html');
  }

  handleCancelar() {
    if (new URLSearchParams(window.location.search).get('edit')) {
      window.location.href = 'listar-clientes.html';
    } else {
      this.limparFormulario();
    }
  }

  async carregarDadosParaEdicao() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
      try {
        const response = await api.get(`/clientes/${editId}`);

        if (response.success && response.data) {
          this.preencherFormulario(response.data);
          this.btnCadastrar.textContent = 'Atualizar Cliente';
          utils.showToast('Dados carregados para edição', 'info');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        utils.showToast(error.message || 'Erro ao carregar dados do cliente', 'error');
        setTimeout(() => {
          window.location.href = 'cadastrar-cliente.html';
        }, 2000);
      }
    }
  }

  preencherFormulario(cliente) {
    document.querySelector('input[name="nome"]').value = cliente.nome || '';

    if (cliente.cpf) {
      document.querySelector('input[name="cpf"]').value = Validador.formatarCPF(cliente.cpf);
    }

    document.querySelector('input[name="telefone"]').value = cliente.telefone || '';
    document.querySelector('input[name="telefone_contato"]').value = cliente.telefone_contato || '';
    document.querySelector('input[name="instagram"]').value = cliente.email?.replace('@instagram.com', '') || '';

    const selectResponsavel = document.querySelector('select[name="responsavel"]');
    selectResponsavel.innerHTML = '';
    const option = document.createElement('option');
    option.value = cliente.responsavel || auth.getUser().name;
    option.textContent = cliente.responsavel || auth.getUser().name;
    option.selected = true;
    selectResponsavel.appendChild(option);

    document.querySelector('input[name="endereco"]').value = cliente.endereco || '';
    document.querySelector('input[name="cidade"]').value = cliente.cidade || '';
    document.querySelector('input[name="estado"]').value = cliente.estado || '';

    if (cliente.cep) {
      const cepFormatado = cliente.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
      document.querySelector('input[name="cep"]').value = cepFormatado;
    }

    document.querySelector('textarea[name="observacoes"]').value = cliente.observacoes || '';
  }
}

/**
 * Classe para gerenciar a lista de clientes recentes
 */
class ListaClientesRecentes {
  constructor() {
    this.tbody = document.getElementById('recent-clients-tbody');
    this.totalClients = document.getElementById('total-clients');
    this.totalClientsDb = document.getElementById('total-clients-db');
  }

  async carregar() {
    try {
      const response = await api.get('/clientes?limit=10&page=1');

      if (response.success && response.data.length > 0) {
        this.renderizar(response.data);
        this.totalClients.textContent = response.data.length;
        this.totalClientsDb.textContent = response.pagination.total;
      } else {
        this.renderizarVazio();
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  }

  renderizar(clientes) {
    this.tbody.innerHTML = '';

    clientes.forEach(cliente => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${cliente.id}</td>
        <td>${cliente.nome}</td>
        <td>${Validador.formatarCPF(cliente.cpf)}</td>
        <td>${cliente.telefone}</td>
        <td>${cliente.telefone_contato || '-'}</td>
        <td>${cliente.email?.replace('@instagram.com', '') || '-'}</td>
        <td>
          <div class="action-icons">
            <svg class="action-icon" onclick="gerenciadorClientes.editar(${cliente.id})" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <svg class="action-icon" onclick="gerenciadorClientes.deletar(${cliente.id}, '${cliente.nome}')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
        </td>
      `;
      this.tbody.appendChild(row);
    });
  }

  renderizarVazio() {
    this.tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
          Nenhum cliente cadastrado ainda
        </td>
      </tr>
    `;
    this.totalClients.textContent = '0';
    this.totalClientsDb.textContent = '0';
  }
}

/**
 * Classe para gerenciar ações dos clientes
 */
class GerenciadorClientes {
  editar(id) {
    window.location.href = `cadastrar-cliente.html?edit=${id}`;
  }

  async deletar(id, nome) {
    if (!confirm(`Tem certeza que deseja deletar o cliente "${nome}"?`)) return;

    try {
      await api.delete(`/clientes/${id}`);
      utils.showToast('Cliente deletado com sucesso!', 'success');
      listaClientesRecentes.carregar();
    } catch (error) {
      utils.showToast(error.message || 'Erro ao deletar cliente', 'error');
    }
  }
}

/**
 * Inicialização da aplicação
 */
const formularioCliente = new FormularioCliente();
const listaClientesRecentes = new ListaClientesRecentes();
const gerenciadorClientes = new GerenciadorClientes();

// Carregar lista inicial
listaClientesRecentes.carregar();

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  auth.logout();
});

// Menu mobile
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});
