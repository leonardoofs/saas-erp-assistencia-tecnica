/**
 * UnderTech - API Client
 * Cliente HTTP para comunicação com o backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Classe para gerenciar chamadas HTTP
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Define os headers padrão para requisições
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Método genérico para fazer requisições
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Se token inválido/expirado, redirecionar para login
      if (response.status === 401) {
        console.warn('🔒 Token inválido ou expirado. Redirecionando para login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/pages/login.html';
        throw new Error('Token inválido. Faça login novamente.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET'
    });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}

// Instância global da API
const api = new ApiClient(API_BASE_URL);

/**
 * Módulo de autenticação
 */
const authAPI = {
  /**
   * Fazer login
   */
  async login(username, password) {
    return api.post('/auth/login', { username, password }, { auth: false });
  },

  /**
   * Registrar novo usuário
   */
  async register(userData) {
    return api.post('/auth/register', userData, { auth: false });
  },

  /**
   * Obter dados do usuário logado
   */
  async getMe() {
    return api.get('/auth/me');
  }
};

/**
 * Módulo de dashboard
 */
const dashboardAPI = {
  /**
   * Obter estatísticas de ordens de serviço
   */
  async getOrdensServico() {
    return api.get('/dashboard/ordens-servico');
  },

  /**
   * Obter estatísticas de reformas
   */
  async getReformas() {
    return api.get('/dashboard/reformas');
  }
};

// Exportar para uso global
window.api = api;
window.authAPI = authAPI;
window.dashboardAPI = dashboardAPI;