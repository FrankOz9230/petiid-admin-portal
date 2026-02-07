/**
 * PETIID ADMIN - USERS MODULE
 * Full user management with CRUD operations
 */

const users = {
    allUsers: [],
    filteredUsers: [],
    currentPage: 1,
    pageSize: 20,
    filters: {
        search: '',
        role: 'all',
        status: 'all',
        country: 'all'
    },

    /**
     * Load users section
     */
    async load() {
        console.log('👥 Loading users...');

        try {
            await this.fetchUsers();
            this.renderTable();
            console.log('✅ Users loaded:', this.allUsers.length);
        } catch (error) {
            console.error('❌ Users load error:', error);
            app.toast('Error cargando usuarios', 'error');
        }
    },

    /**
     * Fetch all users from database
     */
    async fetchUsers() {
        const { data, error } = await db.query('profiles', {
            select: `
                id, username, email, first_name, last_name, 
                avatar_url, role, trust_score, 
                country, city, created_at
            `,
            order: { column: 'created_at', ascending: false }
        });

        if (error) {
            console.error('Error fetching users:', error);
        }

        this.allUsers = data || [];
        this.applyFilters();
    },

    /**
     * Apply filters to users
     */
    applyFilters() {
        this.filteredUsers = this.allUsers.filter(user => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchesSearch =
                    user.username?.toLowerCase().includes(searchLower) ||
                    user.email?.toLowerCase().includes(searchLower) ||
                    user.first_name?.toLowerCase().includes(searchLower) ||
                    user.last_name?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Role filter
            if (this.filters.role !== 'all' && user.role !== this.filters.role) {
                return false;
            }

            // Status filter
            // Status filter - disabled since no status column exists
            // All users are considered active

            // Country filter
            if (this.filters.country !== 'all' && user.country !== this.filters.country) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
    },

    /**
     * Handle filter change
     */
    onFilterChange(filterType, value) {
        this.filters[filterType] = value;
        this.applyFilters();
        this.renderTable();
    },

    /**
     * Handle search input
     */
    onSearch(value) {
        this.filters.search = value;
        this.applyFilters();
        this.renderTable();
    },

    /**
     * Render users table
     */
    renderTable() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageUsers = this.filteredUsers.slice(start, end);

        if (pageUsers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <h3>No se encontraron usuarios</h3>
                            <p>Intenta con otros filtros</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageUsers.map(user => `
            <tr>
                <td>
                    <div class="table-user">
                        <img src="${user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || 'U')}" 
                             alt="" class="table-avatar">
                        <div class="table-user-info">
                            <div class="table-user-name">${user.username || user.first_name || 'Sin nombre'}</div>
                            <div class="table-user-email">${user.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td><span class="pill pill-${user.role || 'user'}">${this.formatRole(user.role)}</span></td>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">${user.trust_score || 0}</span>
                        ${this.getTrustBadge(user.trust_score)}
                    </div>
                </td>
                <td>${user.country || '-'}</td>
                <td>
                    <span class="pill pill-active">Activo</span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-ghost btn-sm tooltip" data-tooltip="Ver" onclick="users.viewUser('${user.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm tooltip" data-tooltip="Editar" onclick="users.editUser('${user.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm tooltip text-danger" data-tooltip="Banear" 
                                onclick="users.toggleBan('${user.id}', true)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Update pagination info
        this.renderPagination();
    },

    /**
     * Format role for display
     */
    formatRole(role) {
        const roles = {
            'user': 'Usuario',
            'foundation': 'Fundación',
            'vet': 'Veterinario',
            'admin': 'Admin',
            'admin_global': 'Admin Global'
        };
        return roles[role] || role || 'Usuario';
    },

    /**
     * Get trust score badge
     */
    getTrustBadge(score) {
        if (!score || score < 30) return '<span class="text-danger text-xs">Bajo</span>';
        if (score < 70) return '<span class="text-warning text-xs">Medio</span>';
        return '<span class="text-success text-xs">Alto</span>';
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        const paginationEl = document.getElementById('users-pagination');
        if (!paginationEl) return;

        paginationEl.innerHTML = `
            <span class="text-muted text-sm">
                Mostrando ${Math.min(this.filteredUsers.length, (this.currentPage - 1) * this.pageSize + 1)} - 
                ${Math.min(this.currentPage * this.pageSize, this.filteredUsers.length)} de ${this.filteredUsers.length}
            </span>
            <div class="flex gap-2">
                <button class="btn btn-secondary btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="users.goToPage(${this.currentPage - 1})">Anterior</button>
                <button class="btn btn-secondary btn-sm" ${this.currentPage >= totalPages ? 'disabled' : ''} 
                        onclick="users.goToPage(${this.currentPage + 1})">Siguiente</button>
            </div>
        `;
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    /**
     * View user details
     */
    async viewUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;

        // Fetch additional data
        const [{ data: petsData }, { data: postsData }] = await Promise.all([
            db.query('pets', { filters: { owner_id: userId }, select: 'id, name, photo_url, species' }),
            db.query('posts', { filters: { user_id: userId }, select: 'id, content, created_at', limit: 5 })
        ]);

        modals.show({
            id: 'user-detail-modal',
            title: 'Detalles del Usuario',
            size: 'lg',
            content: `
                <div class="user-detail">
                    <div class="flex items-center gap-4 mb-4">
                        <img src="${user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username || 'U')}" 
                             style="width:80px;height:80px;border-radius:16px;object-fit:cover;">
                        <div>
                            <h3 style="font-size:20px;margin-bottom:4px;">${user.username || 'Sin nombre'}</h3>
                            <p class="text-muted">${user.email}</p>
                            <div class="flex gap-2 mt-2">
                                <span class="pill pill-${user.role}">${this.formatRole(user.role)}</span>
                                <span class="pill pill-active">Activo</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom:24px;">
                        <div class="stat-card" style="padding:16px;">
                            <div class="stat-value" style="font-size:24px;">${user.trust_score || 0}</div>
                            <div class="stat-label">Trust Score</div>
                        </div>
                        <div class="stat-card" style="padding:16px;">
                            <div class="stat-value" style="font-size:24px;">${petsData?.length || 0}</div>
                            <div class="stat-label">Mascotas</div>
                        </div>
                        <div class="stat-card" style="padding:16px;">
                            <div class="stat-value" style="font-size:24px;">${postsData?.length || 0}</div>
                            <div class="stat-label">Posts</div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">Información</h4>
                        <table class="data-table" style="font-size:13px;">
                            <tr><td class="text-muted" style="width:120px;">País</td><td>${user.country || '-'}</td></tr>
                            <tr><td class="text-muted">Ciudad</td><td>${user.city || '-'}</td></tr>
                            <tr><td class="text-muted">Registro</td><td>${app.formatDate(user.created_at)}</td></tr>
                        </table>
                    </div>

                    ${petsData && petsData.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="font-semibold mb-2">Mascotas</h4>
                            <div class="flex gap-2" style="flex-wrap:wrap;">
                                ${petsData.map(pet => `
                                    <div style="display:flex;align-items:center;gap:8px;background:var(--bg-tertiary);padding:8px 12px;border-radius:8px;">
                                        <img src="${pet.photo_url || 'https://via.placeholder.com/24'}" style="width:24px;height:24px;border-radius:6px;object-fit:cover;">
                                        <span class="text-sm">${pet.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `,
            actions: [
                { label: 'Cerrar', type: 'secondary', onclick: `modals.close('user-detail-modal')` },
                { label: 'Editar Usuario', type: 'primary', onclick: `modals.close('user-detail-modal'); users.editUser('${userId}')` }
            ]
        });
    },

    /**
     * Edit user modal
     */
    async editUser(userId) {
        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;

        modals.show({
            id: 'user-edit-modal',
            title: 'Editar Usuario',
            size: 'md',
            content: `
                <form id="edit-user-form">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" class="form-input" name="username" value="${user.username || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" value="${user.email || ''}" readonly>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rol</label>
                        <select class="form-input" name="role">
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuario</option>
                            <option value="foundation" ${user.role === 'foundation' ? 'selected' : ''}>Fundación</option>
                            <option value="vet" ${user.role === 'vet' ? 'selected' : ''}>Veterinario</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Trust Score (0-100)</label>
                        <input type="number" class="form-input" name="trust_score" min="0" max="100" value="${user.trust_score || 50}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">País</label>
                        <input type="text" class="form-input" name="country" value="${user.country || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Ciudad</label>
                        <input type="text" class="form-input" name="city" value="${user.city || ''}">
                    </div>
                </form>
            `,
            actions: [
                { label: 'Cancelar', type: 'secondary', onclick: `modals.close('user-edit-modal')` },
                { label: 'Guardar Cambios', type: 'primary', onclick: `users.saveUser('${userId}')` }
            ]
        });
    },

    /**
     * Save user changes
     */
    async saveUser(userId) {
        const form = document.getElementById('edit-user-form');
        if (!form) return;

        const formData = new FormData(form);
        const updates = {
            username: formData.get('username'),
            role: formData.get('role'),
            trust_score: parseInt(formData.get('trust_score')) || 50,
            country: formData.get('country'),
            city: formData.get('city')
        };

        try {
            await db.update('profiles', userId, updates);

            modals.close('user-edit-modal');
            app.toast('Usuario actualizado correctamente', 'success');

            // Log action
            await auth.logAccess('USER_EDITED', { userId, updates });

            // Refresh data
            await this.load();
        } catch (error) {
            console.error('Error saving user:', error);
            app.toast('Error al guardar cambios', 'error');
        }
    },

    /**
     * Toggle user ban status
     */
    async toggleBan(userId, shouldBan) {
        const confirmed = await modals.confirm({
            title: shouldBan ? 'Banear Usuario' : 'Desbanear Usuario',
            message: shouldBan
                ? '¿Estás seguro de banear a este usuario? No podrá acceder a la app.'
                : '¿Deseas restaurar el acceso de este usuario?',
            confirmText: shouldBan ? 'Banear' : 'Desbanear',
            type: shouldBan ? 'danger' : 'warning'
        });

        if (!confirmed) return;

        try {
            // Note: profiles table doesn't have a status/banned column
            // This would need to be added to the database to work properly
            app.toast('Función no disponible - se requiere columna status en profiles', 'warning');

            // Log action
            await auth.logAccess(shouldBan ? 'USER_BANNED' : 'USER_UNBANNED', { userId });

        } catch (error) {
            console.error('Error toggling ban:', error);
            app.toast('Error al cambiar estado', 'error');
        }
    },

    /**
     * Delete user
     */
    async deleteUser(userId) {
        const confirmed = await modals.confirm({
            title: 'Eliminar Usuario',
            message: 'Esta acción es IRREVERSIBLE. ¿Estás completamente seguro?',
            confirmText: 'Eliminar Permanentemente',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await db.delete('profiles', userId);

            app.toast('Usuario eliminado', 'success');
            await auth.logAccess('USER_DELETED', { userId });
            await this.load();
        } catch (error) {
            console.error('Error deleting user:', error);
            app.toast('Error al eliminar usuario', 'error');
        }
    }
};

// Export
window.users = users;
