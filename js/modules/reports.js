/**
 * PETIID ADMIN - REPORTS MODULE
 * Content moderation and report handling
 */

const reports = {
    allReports: [],
    filteredReports: [],
    currentPage: 1,
    pageSize: 15,
    filters: {
        status: 'pending',
        type: 'all'
    },

    /**
     * Load reports section
     */
    async load() {
        console.log('🚨 Loading reports...');

        try {
            await this.fetchReports();
            this.renderTable();
            this.updateStats();
            console.log('✅ Reports loaded:', this.allReports.length);
        } catch (error) {
            console.error('❌ Reports load error:', error);
            app.toast('Error cargando reportes', 'error');
        }
    },

    /**
     * Fetch all reports
     */
    async fetchReports() {
        // Simplified query - fetch reports without complex joins first
        const { data } = await db.query('moderation_reports', {
            select: `
                id, reason, status, created_at, reporter_id, reported_user_id
            `,
            order: { column: 'created_at', ascending: false }
        });

        this.allReports = data || [];
        this.applyFilters();
    },

    /**
     * Apply filters
     */
    applyFilters() {
        this.filteredReports = this.allReports.filter(report => {
            if (this.filters.status !== 'all' && report.status !== this.filters.status) {
                return false;
            }
            if (this.filters.type !== 'all') {
                return false; // Skip type filtering since column may not exist
            }
            return true;
        });
        this.currentPage = 1;
    },

    /**
     * Update stats counts
     */
    updateStats() {
        const pending = this.allReports.filter(r => r.status === 'pending').length;
        const resolved = this.allReports.filter(r => r.status === 'resolved').length;
        const dismissed = this.allReports.filter(r => r.status === 'dismissed').length;

        const pendingEl = document.getElementById('reports-pending-count');
        const resolvedEl = document.getElementById('reports-resolved-count');
        const dismissedEl = document.getElementById('reports-dismissed-count');

        if (pendingEl) pendingEl.textContent = pending;
        if (resolvedEl) resolvedEl.textContent = resolved;
        if (dismissedEl) dismissedEl.textContent = dismissed;
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
     * Render reports table
     */
    renderTable() {
        const tbody = document.getElementById('reports-table-body');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageReports = this.filteredReports.slice(start, end);

        if (pageReports.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <h3>No hay reportes ${this.filters.status === 'pending' ? 'pendientes' : ''}</h3>
                            <p>¡Excelente! Todo está en orden 🎉</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageReports.map(report => `
            <tr>
                <td>
                    <span class="pill pill-pending">
                        Reporte
                    </span>
                </td>
                <td>
                    <div class="text-sm">${report.reason || 'Sin razón especificada'}</div>
                </td>
                <td>
                    <span class="text-sm">${report.reporter_id ? 'Usuario' : 'Anónimo'}</span>
                </td>
                <td>
                    ${report.reported_user_id ? `
                        <span class="text-sm">Usuario reportado</span>
                    ` : '<span class="text-muted text-sm">-</span>'}
                </td>
                <td>${this.getStatusBadge(report.status)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-ghost btn-sm" onclick="reports.viewReport('${report.id}')" title="Ver">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        ${report.status === 'pending' ? `
                            <button class="btn btn-ghost btn-sm text-success" onclick="reports.resolveReport('${report.id}')" title="Resolver">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                            <button class="btn btn-ghost btn-sm text-muted" onclick="reports.dismissReport('${report.id}')" title="Descartar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
    },

    /**
     * Get pill class for content type
     */
    getTypePillClass(type) {
        const classes = {
            'post': 'pill-user',
            'comment': 'pill-vet',
            'user': 'pill-foundation',
            'pet': 'pill-pending'
        };
        return classes[type] || 'pill-user';
    },

    /**
     * Format content type
     */
    formatContentType(type) {
        const types = {
            'post': 'Publicación',
            'comment': 'Comentario',
            'user': 'Usuario',
            'pet': 'Mascota'
        };
        return types[type] || type || 'Contenido';
    },

    /**
     * Get status badge
     */
    getStatusBadge(status) {
        const badges = {
            'pending': '<span class="pill pill-pending">Pendiente</span>',
            'resolved': '<span class="pill pill-active">Resuelto</span>',
            'dismissed': '<span class="pill" style="background:var(--bg-tertiary);color:var(--text-muted);">Descartado</span>'
        };
        return badges[status] || status;
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredReports.length / this.pageSize);
        const paginationEl = document.getElementById('reports-pagination');
        if (!paginationEl) return;

        paginationEl.innerHTML = `
            <span class="text-muted text-sm">
                ${this.filteredReports.length} reportes
            </span>
            <div class="flex gap-2">
                <button class="btn btn-secondary btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="reports.goToPage(${this.currentPage - 1})">Anterior</button>
                <button class="btn btn-secondary btn-sm" ${this.currentPage >= totalPages ? 'disabled' : ''} 
                        onclick="reports.goToPage(${this.currentPage + 1})">Siguiente</button>
            </div>
        `;
    },

    /**
     * Go to page
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    },

    /**
     * View report details
     */
    async viewReport(reportId) {
        const report = this.allReports.find(r => r.id === reportId);
        if (!report) return;

        modals.show({
            id: 'report-detail-modal',
            title: 'Detalles del Reporte',
            size: 'md',
            content: `
                <div class="report-detail">
                    <div class="mb-4" style="padding:16px;background:var(--bg-tertiary);border-radius:12px;">
                        <div class="flex justify-between items-center mb-2">
                            <span class="pill pill-pending">
                                Reporte
                            </span>
                            ${this.getStatusBadge(report.status)}
                        </div>
                        <p style="font-size:15px;">${report.reason || 'Sin razón especificada'}</p>
                    </div>

                    <div class="mb-4">
                        <h4 class="font-semibold mb-2 text-sm text-muted">REPORTADO POR</h4>
                        <div class="flex items-center gap-3">
                            <div class="" style="width:40px;height:40px;border-radius:10px;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                            <div>
                                <div class="font-medium">${report.reporter_id ? 'Usuario #' + report.reporter_id.substring(0, 8) : 'Anónimo'}</div>
                                <div class="text-sm text-muted">${app.formatRelativeTime(report.created_at)}</div>
                            </div>
                        </div>
                    </div>

                    ${report.reported_user ? `
                        <div class="mb-4">
                            <h4 class="font-semibold mb-2 text-sm text-muted">USUARIO REPORTADO</h4>
                            <div class="flex items-center gap-3">
                                <img src="${report.reported_user.profile_picture_url || 'https://via.placeholder.com/40'}" 
                                     style="width:40px;height:40px;border-radius:10px;">
                                <div>
                                    <div class="font-medium">${report.reported_user.username}</div>
                                    <button class="btn btn-secondary btn-sm mt-1" onclick="users.viewUser('${report.reported_user.id}')">
                                        Ver perfil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `,
            actions: report.status === 'pending' ? [
                { label: 'Cerrar', type: 'secondary', onclick: `modals.close('report-detail-modal')` },
                { label: 'Descartar', type: 'secondary', onclick: `modals.close('report-detail-modal'); reports.dismissReport('${reportId}')` },
                { label: 'Tomar Acción', type: 'danger', onclick: `modals.close('report-detail-modal'); reports.takeAction('${reportId}')` }
            ] : [
                { label: 'Cerrar', type: 'secondary', onclick: `modals.close('report-detail-modal')` }
            ]
        });
    },

    /**
     * Resolve a report
     */
    async resolveReport(reportId) {
        try {
            await db.update('moderation_reports', reportId, {
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                resolved_by: auth.currentUser?.id
            });

            app.toast('Reporte resuelto', 'success');
            await auth.logAccess('REPORT_RESOLVED', { reportId });
            await this.load();
        } catch (error) {
            console.error('Error resolving report:', error);
            app.toast('Error al resolver', 'error');
        }
    },

    /**
     * Dismiss a report
     */
    async dismissReport(reportId) {
        const confirmed = await modals.confirm({
            title: 'Descartar Reporte',
            message: '¿Estás seguro de descartar este reporte? Se marcará como no válido.',
            confirmText: 'Descartar',
            type: 'warning'
        });

        if (!confirmed) return;

        try {
            await db.update('moderation_reports', reportId, {
                status: 'dismissed',
                resolved_at: new Date().toISOString(),
                resolved_by: auth.currentUser?.id
            });

            app.toast('Reporte descartado', 'success');
            await auth.logAccess('REPORT_DISMISSED', { reportId });
            await this.load();
        } catch (error) {
            console.error('Error dismissing report:', error);
            app.toast('Error al descartar', 'error');
        }
    },

    /**
     * Take action on a report (ban user, delete content, etc.)
     */
    async takeAction(reportId) {
        const report = this.allReports.find(r => r.id === reportId);
        if (!report) return;

        modals.show({
            id: 'report-action-modal',
            title: 'Tomar Acción',
            size: 'sm',
            content: `
                <div class="mb-4">
                    <p class="text-muted mb-4">Selecciona la acción a tomar:</p>
                    
                    <div class="flex flex-col gap-2">
                        ${report.reported_user_id ? `
                            <button class="btn btn-secondary" style="justify-content:flex-start;" 
                                    onclick="reports.warnUser('${report.reported_user_id}', '${reportId}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                Advertir al usuario
                            </button>
                            <button class="btn btn-danger" style="justify-content:flex-start;" 
                                    onclick="reports.banUser('${report.reported_user_id}', '${reportId}')">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                </svg>
                                Banear usuario
                            </button>
                        ` : ''}}
                        <button class="btn btn-secondary" style="justify-content:flex-start;" 
                                onclick="reports.deleteContent('${reportId}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Eliminar contenido
                        </button>
                    </div>
                </div>
            `,
            actions: [
                { label: 'Cancelar', type: 'secondary', onclick: `modals.close('report-action-modal')` }
            ]
        });
    },

    /**
     * Warn user
     */
    async warnUser(userId, reportId) {
        modals.close('report-action-modal');

        // TODO: Implement warning system (could be email, in-app notification, or trust score reduction)
        try {
            // Reduce trust score as a warning
            const user = await db.getProfile(userId);
            const newScore = Math.max(0, (user.trust_score || 50) - 10);
            await db.update('profiles', userId, { trust_score: newScore });

            await this.resolveReport(reportId);
            app.toast('Usuario advertido (-10 Trust Score)', 'warning');
            await auth.logAccess('USER_WARNED', { userId, reportId });
        } catch (error) {
            console.error('Error warning user:', error);
            app.toast('Error al advertir', 'error');
        }
    },

    /**
     * Ban user from report
     */
    async banUser(userId, reportId) {
        modals.close('report-action-modal');

        const confirmed = await modals.confirm({
            title: 'Banear Usuario',
            message: 'Esta acción prohibirá al usuario acceder a la aplicación.',
            confirmText: 'Banear',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await db.update('profiles', userId, { status: 'banned' });
            await this.resolveReport(reportId);
            app.toast('Usuario baneado', 'success');
            await auth.logAccess('USER_BANNED_FROM_REPORT', { userId, reportId });
        } catch (error) {
            console.error('Error banning user:', error);
            app.toast('Error al banear', 'error');
        }
    },

    /**
     * Delete reported content
     */
    async deleteContent(reportId) {
        modals.close('report-action-modal');

        const report = this.allReports.find(r => r.id === reportId);
        if (!report) return;

        const confirmed = await modals.confirm({
            title: 'Eliminar Contenido',
            message: 'Esta acción eliminará permanentemente el contenido reportado.',
            confirmText: 'Eliminar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            // Delete based on content type
            if (report.content_type === 'post' && report.post_id) {
                await db.delete('posts', report.post_id);
            } else if (report.content_type === 'comment' && report.comment_id) {
                await db.delete('comments', report.comment_id);
            }

            await this.resolveReport(reportId);
            app.toast('Contenido eliminado', 'success');
            await auth.logAccess('CONTENT_DELETED_FROM_REPORT', { reportId, contentType: report.content_type });
        } catch (error) {
            console.error('Error deleting content:', error);
            app.toast('Error al eliminar', 'error');
        }
    }
};

// Export
window.reports = reports;
