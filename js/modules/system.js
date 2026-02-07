/**
 * PETIID ADMIN - SYSTEM MODULE
 * System configuration, breeds, and audit logs
 */

const system = {
    /**
     * Load system section
     */
    async load() {
        console.log('⚙️ Loading system config...');

        try {
            await Promise.all([
                this.loadBreeds(),
                this.loadAuditLogs(),
                this.loadDeletionRequests()
            ]);

            console.log('✅ System config loaded');
        } catch (error) {
            console.error('❌ System load error:', error);
            app.toast('Error cargando configuración', 'error');
        }
    },

    /**
     * Load breeds list
     */
    async loadBreeds() {
        try {
            const { data } = await db.query('breeds', {
                select: 'id, name, species, is_active',
                order: { column: 'name', ascending: true }
            });

            const tbody = document.getElementById('breeds-table-body');
            if (!tbody) return;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay razas configuradas</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(breed => `
                <tr>
                    <td>${breed.name}</td>
                    <td>${this.formatSpecies(breed.species)}</td>
                    <td>
                        ${breed.is_active !== false
                    ? '<span class="pill pill-active">Activa</span>'
                    : '<span class="pill pill-banned">Inactiva</span>'}
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="btn btn-ghost btn-sm" onclick="system.editBreed('${breed.id}')" title="Editar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn btn-ghost btn-sm text-danger" onclick="system.deleteBreed('${breed.id}')" title="Eliminar">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading breeds:', error);
        }
    },

    /**
     * Format species
     */
    formatSpecies(species) {
        const names = {
            'dog': '🐕 Perro',
            'cat': '🐈 Gato',
            'bird': '🐦 Ave',
            'rabbit': '🐰 Conejo',
            'other': '🐾 Otro'
        };
        return names[species?.toLowerCase()] || species || '-';
    },

    /**
     * Show add breed modal
     */
    addBreed() {
        modals.show({
            id: 'breed-modal',
            title: 'Agregar Raza',
            size: 'sm',
            content: `
                <form id="breed-form">
                    <div class="form-group">
                        <label class="form-label">Nombre de la Raza</label>
                        <input type="text" class="form-input" name="name" required placeholder="Ej: Labrador Retriever">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Especie</label>
                        <select class="form-input" name="species" required>
                            <option value="dog">Perro</option>
                            <option value="cat">Gato</option>
                            <option value="bird">Ave</option>
                            <option value="rabbit">Conejo</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>
                </form>
            `,
            actions: [
                { label: 'Cancelar', type: 'secondary', onclick: `modals.close('breed-modal')` },
                { label: 'Agregar', type: 'primary', onclick: `system.saveBreed()` }
            ]
        });
    },

    /**
     * Save new breed
     */
    async saveBreed() {
        const form = document.getElementById('breed-form');
        if (!form) return;

        const formData = new FormData(form);
        const breedData = {
            name: formData.get('name'),
            species: formData.get('species'),
            is_active: true
        };

        try {
            await db.insert('breeds', breedData);

            modals.close('breed-modal');
            app.toast('Raza agregada', 'success');
            await auth.logAccess('BREED_ADDED', { breedData });
            await this.loadBreeds();
        } catch (error) {
            console.error('Error saving breed:', error);
            app.toast('Error al agregar raza', 'error');
        }
    },

    /**
     * Edit breed
     */
    async editBreed(breedId) {
        // Fetch breed data
        const { data: breed } = await supabaseClient
            .from('breeds')
            .select('*')
            .eq('id', breedId)
            .single();

        if (!breed) return;

        modals.show({
            id: 'breed-modal',
            title: 'Editar Raza',
            size: 'sm',
            content: `
                <form id="breed-form">
                    <input type="hidden" name="id" value="${breed.id}">
                    <div class="form-group">
                        <label class="form-label">Nombre de la Raza</label>
                        <input type="text" class="form-input" name="name" value="${breed.name}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Especie</label>
                        <select class="form-input" name="species" required>
                            <option value="dog" ${breed.species === 'dog' ? 'selected' : ''}>Perro</option>
                            <option value="cat" ${breed.species === 'cat' ? 'selected' : ''}>Gato</option>
                            <option value="bird" ${breed.species === 'bird' ? 'selected' : ''}>Ave</option>
                            <option value="rabbit" ${breed.species === 'rabbit' ? 'selected' : ''}>Conejo</option>
                            <option value="other" ${breed.species === 'other' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" name="is_active" ${breed.is_active !== false ? 'checked' : ''}>
                            Raza activa
                        </label>
                    </div>
                </form>
            `,
            actions: [
                { label: 'Cancelar', type: 'secondary', onclick: `modals.close('breed-modal')` },
                { label: 'Guardar', type: 'primary', onclick: `system.updateBreed('${breedId}')` }
            ]
        });
    },

    /**
     * Update breed
     */
    async updateBreed(breedId) {
        const form = document.getElementById('breed-form');
        if (!form) return;

        const formData = new FormData(form);
        const updates = {
            name: formData.get('name'),
            species: formData.get('species'),
            is_active: formData.get('is_active') === 'on'
        };

        try {
            await db.update('breeds', breedId, updates);

            modals.close('breed-modal');
            app.toast('Raza actualizada', 'success');
            await auth.logAccess('BREED_UPDATED', { breedId, updates });
            await this.loadBreeds();
        } catch (error) {
            console.error('Error updating breed:', error);
            app.toast('Error al actualizar', 'error');
        }
    },

    /**
     * Delete breed
     */
    async deleteBreed(breedId) {
        const confirmed = await modals.confirm({
            title: 'Eliminar Raza',
            message: '¿Estás seguro de eliminar esta raza?',
            confirmText: 'Eliminar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await db.delete('breeds', breedId);

            app.toast('Raza eliminada', 'success');
            await auth.logAccess('BREED_DELETED', { breedId });
            await this.loadBreeds();
        } catch (error) {
            console.error('Error deleting breed:', error);
            app.toast('Error al eliminar', 'error');
        }
    },

    /**
     * Load audit logs
     */
    async loadAuditLogs() {
        try {
            const { data } = await db.query('access_logs', {
                select: 'id, action_type, details, created_at, user:profiles!user_id(username)',
                order: { column: 'created_at', ascending: false },
                limit: 20
            });

            const tbody = document.getElementById('audit-logs-body');
            if (!tbody) return;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay logs de auditoría</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(log => `
                <tr>
                    <td>${app.formatRelativeTime(log.created_at)}</td>
                    <td><span class="pill pill-user">${log.action_type}</span></td>
                    <td>${log.user?.username || 'Sistema'}</td>
                    <td class="text-muted text-sm">${this.formatDetails(log.details)}</td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading audit logs:', error);
        }
    },

    /**
     * Format log details
     */
    formatDetails(details) {
        if (!details) return '-';
        try {
            const parsed = typeof details === 'string' ? JSON.parse(details) : details;
            return Object.entries(parsed)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')
                .slice(0, 100);
        } catch {
            return String(details).slice(0, 100);
        }
    },

    /**
     * Load account deletion requests
     */
    async loadDeletionRequests() {
        try {
            const { data } = await db.query('account_deletion_requests', {
                select: 'id, status, reason, created_at, user:profiles!user_id(id, username, email)',
                order: { column: 'created_at', ascending: false },
                limit: 20
            });

            const tbody = document.getElementById('deletion-requests-body');
            if (!tbody) return;

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay solicitudes de eliminación</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(req => `
                <tr>
                    <td>
                        <div class="table-user-info">
                            <div class="table-user-name">${req.user?.username || 'Usuario'}</div>
                            <div class="table-user-email">${req.user?.email || ''}</div>
                        </div>
                    </td>
                    <td class="text-sm">${req.reason || '-'}</td>
                    <td>${this.getRequestStatusBadge(req.status)}</td>
                    <td>${app.formatRelativeTime(req.created_at)}</td>
                    <td>
                        ${req.status === 'pending' ? `
                            <div class="action-btns">
                                <button class="btn btn-ghost btn-sm text-success" 
                                        onclick="system.processDeletion('${req.id}', '${req.user?.id}')" title="Procesar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </button>
                                <button class="btn btn-ghost btn-sm text-muted" 
                                        onclick="system.rejectDeletion('${req.id}')" title="Rechazar">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                        ` : '-'}
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error loading deletion requests:', error);
        }
    },

    /**
     * Get request status badge
     */
    getRequestStatusBadge(status) {
        const badges = {
            'pending': '<span class="pill pill-pending">Pendiente</span>',
            'approved': '<span class="pill pill-active">Aprobada</span>',
            'rejected': '<span class="pill pill-banned">Rechazada</span>',
            'completed': '<span class="pill pill-vet">Completada</span>'
        };
        return badges[status] || status;
    },

    /**
     * Process account deletion
     */
    async processDeletion(requestId, userId) {
        const confirmed = await modals.confirm({
            title: 'Procesar Eliminación de Cuenta',
            message: 'Esta acción eliminará permanentemente la cuenta del usuario y todos sus datos. ¿Continuar?',
            confirmText: 'Eliminar Cuenta',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            // Delete user profile (this should cascade to related data)
            if (userId) {
                await db.delete('profiles', userId);
            }

            // Update request status
            await db.update('account_deletion_requests', requestId, {
                status: 'completed',
                processed_at: new Date().toISOString()
            });

            app.toast('Cuenta eliminada correctamente', 'success');
            await auth.logAccess('ACCOUNT_DELETED', { requestId, userId });
            await this.loadDeletionRequests();
        } catch (error) {
            console.error('Error processing deletion:', error);
            app.toast('Error al procesar eliminación', 'error');
        }
    },

    /**
     * Reject deletion request
     */
    async rejectDeletion(requestId) {
        try {
            await db.update('account_deletion_requests', requestId, {
                status: 'rejected',
                processed_at: new Date().toISOString()
            });

            app.toast('Solicitud rechazada', 'success');
            await auth.logAccess('DELETION_REJECTED', { requestId });
            await this.loadDeletionRequests();
        } catch (error) {
            console.error('Error rejecting deletion:', error);
            app.toast('Error al rechazar', 'error');
        }
    }
};

// Export
window.system = system;
