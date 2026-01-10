/**
 * UnderTech - Sidebar Navigation
 * Controle de dropdown e navegação
 */

class SidebarManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindDropdownEvents();
    this.setActiveItemFromURL();
  }

  /**
   * Vincula eventos de clique nos dropdowns
   */
  bindDropdownEvents() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.nav-item-toggle');
      
      if (toggle) {
        e.preventDefault();
        this.toggleDropdown(toggle);
      }
    });
  }

  /**
   * Alterna estado do dropdown
   */
  toggleDropdown(toggle) {
    const isOpen = toggle.classList.contains('open');
    const submenu = toggle.nextElementSibling;
    
    if (!submenu || !submenu.classList.contains('nav-submenu')) return;

    // Fechar todos os outros dropdowns
    this.closeAllDropdowns();

    if (!isOpen) {
      // Abrir este dropdown
      toggle.classList.add('open');
      submenu.classList.add('open');
    }
  }

  /**
   * Fecha todos os dropdowns abertos
   */
  closeAllDropdowns() {
    document.querySelectorAll('.nav-item-toggle.open').forEach(toggle => {
      toggle.classList.remove('open');
    });
    
    document.querySelectorAll('.nav-submenu.open').forEach(submenu => {
      submenu.classList.remove('open');
    });
  }

  /**
   * Define item ativo baseado na URL atual
   */
  setActiveItemFromURL() {
    const currentPath = window.location.pathname;
    
    // Remove active de todos
    document.querySelectorAll('.nav-item, .nav-subitem, .nav-item-toggle').forEach(item => {
      item.classList.remove('active');
    });

    // Encontra e ativa o item correspondente
    const activeItem = document.querySelector(`[href="${currentPath}"]`);
    
    if (activeItem) {
      activeItem.classList.add('active');
      
      // Se for subitem, abrir o dropdown pai
      if (activeItem.classList.contains('nav-subitem')) {
        const parentDropdown = activeItem.closest('.nav-item-dropdown');
        if (parentDropdown) {
          const toggle = parentDropdown.querySelector('.nav-item-toggle');
          const submenu = parentDropdown.querySelector('.nav-submenu');
          
          if (toggle && submenu) {
            toggle.classList.add('open', 'active');
            submenu.classList.add('open');
          }
        }
      }
    }
  }

  /**
   * Abre um dropdown específico programaticamente
   */
  openDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const toggle = dropdown.querySelector('.nav-item-toggle');
    const submenu = dropdown.querySelector('.nav-submenu');

    if (toggle && submenu) {
      this.closeAllDropdowns();
      toggle.classList.add('open');
      submenu.classList.add('open');
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.sidebarManager = new SidebarManager();
});

// Exportar para uso global
window.SidebarManager = SidebarManager;