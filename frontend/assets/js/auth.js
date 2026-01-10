/**
 * UnderTech - Autenticação
 * Gerenciamento de login, logout e sessão
 */

class AuthManager {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Obtém token do localStorage
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtém dados do usuário do localStorage
   */
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Salva token e dados do usuário
   */
  setAuth(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Remove autenticação (logout)
   */
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Faz login
   */
  async login(username, password) {
    try {
      const response = await authAPI.login(username, password);
      
      if (response.success) {
        this.setAuth(response.data.token, response.data.user);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Faz logout
   */
  logout() {
    this.clearAuth();
    window.location.href = '/pages/login.html';
  }

  /**
   * Redireciona para login se não autenticado
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/pages/login.html';
      return false;
    }
    return true;
  }

  /**
   * Redireciona para dashboard se já autenticado
   */
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = '/pages/dashboard.html';
      return true;
    }
    return false;
  }
}

// Instância global
const auth = new AuthManager();
window.auth = auth;