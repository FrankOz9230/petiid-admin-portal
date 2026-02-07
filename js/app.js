/**
 * PETIID ADMIN - MAIN APP CONTROLLER
 * Application initialization and global utilities
 */

const app = {
    /**
     * Initialize the admin dashboard
     */
    async init() {
        console.log('🐾 Petiid Admin Dashboard - Initializing...');

        // Step 1: Security validation
        const accessGranted = await auth.validateAccess();
        if (!accessGranted) {
            console.error('❌ Access denied - stopping initialization');
            return;
        }

        // Step 2: Initialize theme
        this.initTheme();

        // Step 3: Update UI with admin info
        this.updateAdminUI();

        // Step 4: Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Step 5: Initialize router
        router.init();

        // Step 6: Setup global event listeners
        this.setupEventListeners();

        console.log('✅ Admin Dashboard initialized successfully');
    },

    /**
     * Initialize theme from localStorage
     */
    initTheme() {
        const savedTheme = localStorage.getItem('petiid-admin-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButtons(savedTheme);
    },

    /**
     * Toggle theme
     */
    toggleTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('petiid-admin-theme', theme);
        this.updateThemeButtons(theme);
    },

    /**
     * Update theme toggle buttons
     */
    updateThemeButtons(theme) {
        document.querySelectorAll('.theme-toggle button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    },

    /**
     * Update UI with admin information
     */
    updateAdminUI() {
        const adminInfo = auth.getAdminInfo();
        if (!adminInfo) return;

        // Update user profile in sidebar
        const avatarEl = document.querySelector('.user-avatar');
        const nameEl = document.querySelector('.user-name');
        const roleEl = document.querySelector('.user-role');

        if (avatarEl) {
            if (adminInfo.avatar) {
                avatarEl.innerHTML = `<img src="${adminInfo.avatar}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
            } else {
                avatarEl.textContent = adminInfo.initials;
            }
        }

        if (nameEl) nameEl.textContent = adminInfo.name;
        if (roleEl) roleEl.textContent = this.formatRole(adminInfo.role);
    },

    /**
     * Format role for display
     */
    formatRole(role) {
        const roleNames = {
            'admin': 'Administrador',
            'admin_global': 'Admin Global',
            'super_admin': 'Super Admin'
        };
        return roleNames[role] || role;
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Theme toggle buttons
        document.querySelectorAll('.theme-toggle button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleTheme(btn.dataset.theme);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                    await auth.logout();
                }
            });
        }

        // Global search
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleGlobalSearch(e.target.value);
                }, 300);
            });
        }

        // Modal close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    modals.close(overlay.id);
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modals.closeAll();
            }
        });
    },

    /**
     * Handle global search
     */
    handleGlobalSearch(query) {
        if (!query.trim()) return;

        console.log('🔍 Global search:', query);
        // TODO: Implement global search across users, pets, posts
    },

    /**
     * Show toast notification
     */
    toast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Add toast styles if not exists
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 2000;
                    animation: slideIn 0.3s ease;
                }
                .toast-success { border-left: 4px solid var(--success); }
                .toast-error { border-left: 4px solid var(--danger); }
                .toast-warning { border-left: 4px solid var(--warning); }
                .toast button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 20px;
                    cursor: pointer;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    },

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    },

    /**
     * Format relative time
     */
    formatRelativeTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;

        return this.formatDate(dateString);
    },

    /**
     * Format number with K/M suffix
     */
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
};

// Export
window.app = app;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
