/**
 * PETIID ADMIN - DASHBOARD MODULE
 * KPI stats, charts, and overview data
 */

const dashboard = {
    stats: {},

    /**
     * Load dashboard data
     */
    async load() {
        console.log('📊 Loading dashboard data...');

        try {
            await Promise.all([
                this.loadStats(),
                this.loadRecentUsers(),
                this.loadRecentPets(),
                this.loadPendingReports()
            ]);

            console.log('✅ Dashboard loaded');
        } catch (error) {
            console.error('❌ Dashboard load error:', error);
            app.toast('Error cargando dashboard', 'error');
        }
    },

    /**
     * Load KPI statistics
     */
    async loadStats() {
        try {
            // Parallel count queries
            const [totalUsers, totalPets, totalPosts, pendingReports, lostPets] = await Promise.all([
                db.count('profiles'),
                db.count('pets'),
                db.count('posts'),
                db.count('moderation_reports', { status: 'pending' }),
                db.count('lost_reports', { status: 'active' })
            ]);

            this.stats = { totalUsers, totalPets, totalPosts, pendingReports, lostPets };

            // Update UI
            this.updateStatCard('stat-users', totalUsers, 'Usuarios Totales');
            this.updateStatCard('stat-pets', totalPets, 'Mascotas Registradas');
            this.updateStatCard('stat-posts', totalPosts, 'Publicaciones');
            this.updateStatCard('stat-reports', pendingReports, 'Reportes Pendientes');
            this.updateStatCard('stat-lost', lostPets, 'Mascotas Perdidas');

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    /**
     * Update a stat card value
     */
    updateStatCard(elementId, value, label) {
        const valueEl = document.querySelector(`#${elementId} .stat-value`);
        const labelEl = document.querySelector(`#${elementId} .stat-label`);

        if (valueEl) {
            valueEl.textContent = app.formatNumber(value || 0);
        }
        if (labelEl) {
            labelEl.textContent = label;
        }
    },

    /**
     * Load recent users
     */
    async loadRecentUsers() {
        try {
            const { data: users } = await db.query('profiles', {
                select: 'id, username, email, profile_picture_url, role, created_at',
                order: { column: 'created_at', ascending: false },
                limit: 5
            });

            const tbody = document.getElementById('recent-users-table');
            if (!tbody) return;

            if (!users || users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay usuarios recientes</td></tr>';
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>
                        <div class="table-user">
                            <img src="${user.profile_picture_url || 'https://via.placeholder.com/36'}" alt="" class="table-avatar">
                            <div class="table-user-info">
                                <div class="table-user-name">${user.username || 'Sin nombre'}</div>
                                <div class="table-user-email">${user.email || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="pill pill-${user.role || 'user'}">${user.role || 'user'}</span></td>
                    <td>${app.formatRelativeTime(user.created_at)}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="users.viewUser('${user.id}')" title="Ver detalles">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading recent users:', error);
        }
    },

    /**
     * Load recent pets
     */
    async loadRecentPets() {
        try {
            const { data: petsData } = await db.query('pets', {
                select: 'id, name, species, breed, photo_url, created_at, profiles(username)',
                order: { column: 'created_at', ascending: false },
                limit: 5
            });

            const tbody = document.getElementById('recent-pets-table');
            if (!tbody) return;

            if (!petsData || petsData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay mascotas recientes</td></tr>';
                return;
            }

            tbody.innerHTML = petsData.map(pet => `
                <tr>
                    <td>
                        <div class="table-user">
                            <img src="${pet.photo_url || 'https://via.placeholder.com/36'}" alt="" class="table-avatar">
                            <span class="table-user-name">${pet.name || 'Sin nombre'}</span>
                        </div>
                    </td>
                    <td>${pet.species || '-'}</td>
                    <td>${pet.profiles?.username || 'Desconocido'}</td>
                    <td>${app.formatRelativeTime(pet.created_at)}</td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading recent pets:', error);
        }
    },

    /**
     * Load pending reports
     */
    async loadPendingReports() {
        try {
            const { data: reportsData } = await db.query('moderation_reports', {
                select: 'id, reason, content_type, created_at, reporter:profiles!reporter_id(username)',
                filters: { status: 'pending' },
                order: { column: 'created_at', ascending: false },
                limit: 5
            });

            const tbody = document.getElementById('pending-reports-table');
            if (!tbody) return;

            if (!reportsData || reportsData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay reportes pendientes 🎉</td></tr>';
                return;
            }

            tbody.innerHTML = reportsData.map(report => `
                <tr>
                    <td><span class="pill pill-pending">${report.content_type || 'Contenido'}</span></td>
                    <td>${report.reason || 'Sin razón especificada'}</td>
                    <td>${report.reporter?.username || 'Anónimo'}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="reports.viewReport('${report.id}')" title="Ver reporte">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading pending reports:', error);
        }
    }
};

// Export
window.dashboard = dashboard;
