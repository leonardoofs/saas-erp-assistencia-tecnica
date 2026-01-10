/**
 * UnderTech - Dashboard
 * Arquitetura com estado central + dados reais da API
 */

class Dashboard {
  constructor() {
    this.state = {
      tab: 'ordens',      // ordens | reformas
      mode: 'prazos'      // prazos | pesquisa
    };

    this.init();
  }

  async init() {
    if (!auth.requireAuth()) return;

    this.cacheDOM();
    this.loadUserInfo();
    this.bindEvents();
    await this.loadDashboardData(this.state.tab);
    
    // Auto-refresh a cada 30 segundos quando estiver no modo prazos
    this.startAutoRefresh();
  }

  /* =========================
     AUTO REFRESH
  ========================== */
  startAutoRefresh() {
    // Limpar interval anterior se existir
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Auto-refresh a cada 30 segundos (apenas no modo prazos)
    this.refreshInterval = setInterval(() => {
      if (this.state.mode === 'prazos') {
        this.loadDashboardData(this.state.tab);
        console.log('🔄 Dashboard atualizado automaticamente');
      }
    }, 30000); // 30 segundos
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /* =========================
     CACHE DE ELEMENTOS
  ========================== */
  cacheDOM() {
    this.tabsContainer = document.querySelector('.dashboard-tabs');
    this.subTabsContainer = document.querySelector('.sub-tabs');
    this.sidebar = document.querySelector('.sidebar');
    this.content = document.querySelector('.content');
  }

  /* =========================
     EVENTOS (delegação)
  ========================== */
  bindEvents() {
    document.addEventListener('click', (e) => {
      this.handleGlobalClick(e);
    });
  }

  handleGlobalClick(e) {
    const target = e.target.closest('button, .user-avatar');
    if (!target) return;

    /* Tabs principais */
    if (target.id === 'tab-ordens') return this.switchTab('ordens');
    if (target.id === 'tab-reformas') return this.switchTab('reformas');

    /* Sub-tabs */
    if (target.id === 'btn-atualizar') return this.refresh();
    if (target.id === 'btn-pesquisa') return this.switchMode('pesquisa');
    if (target.id === 'btn-prazos') return this.switchMode('prazos');

    /* Menu mobile */
    if (target.id === 'menu-toggle') {
      return this.sidebar?.classList.toggle('open');
    }

    /* Logout */
    if (target.id === 'logout-btn') return auth.logout();
  }

  /* =========================
     USER
  ========================== */
  loadUserInfo() {
    const user = auth.getUser();
    const title = document.querySelector('.welcome-title');

    if (user && title) {
      title.textContent = `Seja bem vindo, ${user.name}`;
    }
  }

  /* =========================
     UI STATE
  ========================== */
  async switchTab(tab) {
    if (this.state.tab === tab) return;

    this.state.tab = tab;
    this.updateTabsUI();
    
    // Se estiver no modo pesquisa, atualiza os dados da tabela
    if (this.state.mode === 'pesquisa') {
      await this.renderSearchTable();
    } else {
      await this.loadDashboardData(tab);
    }
  }

  switchMode(mode) {
    this.state.mode = mode;
    this.updateSubTabsUI();
    this.toggleModeDisplay();
    
    // Se mudou para pesquisa, renderiza a tabela
    if (mode === 'pesquisa') {
      this.renderSearchTable();
    }
    
    console.log(`Modo ativo: ${mode}`);
  }

  refresh() {
    if (this.state.mode === 'pesquisa') {
      this.renderSearchTable();
    } else {
      this.loadDashboardData(this.state.tab);
    }
    utils.showToast('Dados atualizados!', 'success');
  }

  /* =========================
     UI RENDER
  ========================== */
  updateTabsUI() {
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });

    const active =
      this.state.tab === 'ordens'
        ? document.getElementById('tab-ordens')
        : document.getElementById('tab-reformas');

    if (active) {
      active.classList.add('active');
      active.setAttribute('aria-selected', 'true');
      active.setAttribute('tabindex', '0');
      active.focus();
    }
  }

  updateSubTabsUI() {
    document.getElementById('btn-pesquisa')
      ?.classList.toggle('active', this.state.mode === 'pesquisa');

    document.getElementById('btn-prazos')
      ?.classList.toggle('active', this.state.mode === 'prazos');
  }

  toggleModeDisplay() {
    const prazosMode = document.querySelectorAll('.dashboard-section.prazos-mode');
    const searchMode = document.querySelector('.search-container');

    if (this.state.mode === 'pesquisa') {
      prazosMode.forEach(section => section.classList.add('hidden'));
      if (searchMode) searchMode.classList.add('active');
    } else {
      prazosMode.forEach(section => section.classList.remove('hidden'));
      if (searchMode) searchMode.classList.remove('active');
    }
  }

  /* =========================
     MODO PESQUISA - TABELA
  ========================== */
  async renderSearchTable() {
    const isOrdens = this.state.tab === 'ordens';
    
    // Atualizar cabeçalho da primeira coluna
    const firstHeader = document.querySelector('.results-table th:first-child');
    if (firstHeader) {
      firstHeader.textContent = isOrdens ? 'O.S.' : 'R.A.';
    }

    const tbody = document.getElementById('results-tbody');
    if (!tbody) return;

    // Limpar tabela e mostrar loading
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Carregando...</td></tr>';

    try {
      // Buscar dados da API com limite de 20 itens por página
      const endpoint = isOrdens ? '/ordens?limit=20' : '/reformas?limit=20';
      const response = await api.get(endpoint);

      if (!response.success || !response.data) {
        throw new Error('Erro ao carregar dados');
      }

      const data = response.data;

      // Limpar tabela
      tbody.innerHTML = '';

      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Nenhum registro encontrado</td></tr>';
        return;
      }

      // Renderizar linhas
      data.forEach(item => {
        const row = this.createTableRow(item, isOrdens);
        tbody.appendChild(row);
      });

      // Atualizar contador
      const resultsInfo = document.querySelector('.results-info');
      if (resultsInfo) {
        const pagination = response.pagination;
        if (pagination) {
          resultsInfo.textContent = `Mostrando ${data.length} de ${pagination.total} registros (Página ${pagination.page} de ${pagination.pages})`;
        } else {
          resultsInfo.textContent = `Mostrando ${data.length} registros`;
        }
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: red;">Erro ao carregar dados</td></tr>';
      utils.showToast('Erro ao carregar dados', 'error');
    }
  }

  /**
   * Cria uma linha da tabela
   */
  createTableRow(item, isOrdens) {
    const row = document.createElement('tr');
    
    // Calcular status do prazo
    const prazoStatus = this.calcularPrazoStatus(item.prazo_entrega);
    
    // Definir classes das badges
    const prazoClass = `prazo-${prazoStatus.classe}`;
    const prioridadeClass = `priority-${item.prioridade}`;
    const situacaoClass = this.getStatusClass(item.status);

    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.cliente_nome}</td>
      <td>${item.aparelho}${item.marca ? ' ' + item.marca : ''}</td>
      <td><span class="prazo-badge ${prazoClass}">${prazoStatus.texto}</span></td>
      <td><span class="priority-badge ${prioridadeClass}">${this.formatPrioridade(item.prioridade)}</span></td>
      <td><span class="status-badge ${situacaoClass}">${this.formatStatus(item.status)}</span></td>
      <td>R$ ${parseFloat(item.valor || 0).toFixed(2)}</td>
      <td>
        <div class="table-actions">
          ${this.getActionIcons()}
        </div>
      </td>
    `;

    return row;
  }

  /**
   * Calcula status do prazo baseado na data
   */
  calcularPrazoStatus(prazoEntrega) {
    // Obter data de hoje sem timezone
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const hojeDate = new Date(hojeStr + 'T00:00:00');
    
    // Calcular amanhã
    const amanha = new Date(hojeDate);
    amanha.setDate(amanha.getDate() + 1);
    
    // Converter prazo para date sem timezone
    const prazoDate = new Date(prazoEntrega + 'T00:00:00');
    
    // Comparar apenas as datas (ano, mês, dia)
    const prazoStr = `${prazoDate.getFullYear()}-${String(prazoDate.getMonth() + 1).padStart(2, '0')}-${String(prazoDate.getDate()).padStart(2, '0')}`;
    const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;

    if (prazoStr < hojeStr) {
      return { texto: 'Atrasado', classe: 'atrasado' };
    } else if (prazoStr === hojeStr) {
      return { texto: 'Hoje', classe: 'hoje' };
    } else if (prazoStr === amanhaStr) {
      return { texto: 'Amanhã', classe: 'amanha' };
    } else {
      return { texto: 'Sem pressa', classe: 'sem-pressa' };
    }
  }

  /**
   * Retorna classe CSS para o status
   */
  getStatusClass(status) {
    const statusMap = {
      'aguardando_pecas': 'status-aguardando',
      'em_andamento': 'status-andamento',
      'autorizado': 'status-autorizado',
      'finalizado': 'status-finalizado'
    };
    return statusMap[status] || 'status-aguardando';
  }

  /**
   * Formata texto do status
   */
  formatStatus(status) {
    const statusMap = {
      'aguardando_pecas': 'Aguardando peças',
      'em_andamento': 'Em Andamento',
      'autorizado': 'Autorizado',
      'finalizado': 'Finalizado'
    };
    return statusMap[status] || status;
  }

  /**
   * Formata texto da prioridade
   */
  formatPrioridade(prioridade) {
    const prioridadeMap = {
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return prioridadeMap[prioridade] || prioridade;
  }

  /**
   * Retorna HTML dos ícones de ação
   */
  getActionIcons() {
    return `
      <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
      <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
        <line x1="18" y1="9" x2="12" y2="15"></line>
        <line x1="12" y1="9" x2="18" y2="15"></line>
      </svg>
      <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
  }

  /* =========================
     DATA - MODO PRAZOS
  ========================== */
  async loadDashboardData(type) {
    try {
      this.showLoading();

      const response =
        type === 'ordens'
          ? await dashboardAPI.getOrdensServico()
          : await dashboardAPI.getReformas();

      this.renderDashboard(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      utils.showToast('Erro ao carregar dados', 'error');
    } finally {
      this.hideLoading();
    }
  }

  renderDashboard(data) {
    this.updateCard('status-card--atrasada', data.prazo.atrasadas);
    this.updateCard('status-card--hoje', data.prazo.paraHoje);
    this.updateCard('status-card--amanha', data.prazo.paraAmanha);
    this.updateCard('status-card--finalizadas', data.prazo.finalizadas);

    this.updateCard('status-card--normal', data.prioridade.normal);
    this.updateCard('status-card--alta', data.prioridade.alta);
    this.updateCard('status-card--urgente', data.prioridade.urgente);
  }

  updateCard(type, value) {
    const el = document.querySelector(`.status-card.${type} .status-number`);
    if (!el) return;

    // Atualização direta sem animação (melhor performance)
    el.textContent = value;
  }

  /* =========================
     LOADING
  ========================== */
  showLoading() {
    if (this.content?.querySelector('.spinner')) return;

    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    this.content?.appendChild(spinner);
  }

  hideLoading() {
    this.content?.querySelector('.spinner')?.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new Dashboard();
});