/**
 * PETIID ADMIN - PETS MODULE
 * Full pet management with CRUD operations
 */

const pets = {
    allPets: [],
    filteredPets: [],
    currentPage: 1,
    pageSize: 20,
    filters: {
        search: '',
        species: 'all',
        status: 'all'
    },

    /**
     * Load pets section
     */
    async load() {
        console.log('🐕 Loading pets...');

        try {
            await this.fetchPets();
            this.renderTable();
            console.log('✅ Pets loaded:', this.allPets.length);
        } catch (error) {
            console.error('❌ Pets load error:', error);
            app.toast('Error cargando mascotas', 'error');
        }
    },

    /**
     * Fetch all pets from database
     */
    async fetchPets() {
        const { data } = await db.query('pets', {
            select: `
                id, name, species, breed, gender, photo_urls, image_url,
                bio, status, created_at,
                owner:profiles!owner_id(id, username, email, avatar_url)
            `,
            order: { column: 'created_at', ascending: false }
        });

        this.allPets = data || [];
        this.applyFilters();
    },

    /**
     * Apply filters
     */
    applyFilters() {
        this.filteredPets = this.allPets.filter(pet => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchesSearch =
                    pet.name?.toLowerCase().includes(searchLower) ||
                    pet.breed?.toLowerCase().includes(searchLower) ||
                    pet.owner?.username?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }

            // Species filter
            if (this.filters.species !== 'all' && pet.species !== this.filters.species) {
                return false;
            }

            // Status filter
            if (this.filters.status === 'lost' && pet.status !== 'lost') return false;
            if (this.filters.status === 'adopted' && pet.status !== 'adopted') return false;
            if (this.filters.status === 'normal' && (pet.status === 'lost' || pet.status === 'adopted')) return false;

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
     * Handle search
     */
    onSearch(value) {
        this.filters.search = value;
        this.applyFilters();
        this.renderTable();
    },

    /**
     * Render pets table
     */
    renderTable() {
        const tbody = document.getElementById('pets-table-body');
        if (!tbody) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pagePets = this.filteredPets.slice(start, end);

        if (pagePets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                                <path d="m8.5 8.5 7 7"></path>
                            </svg>
                            <h3>No se encontraron mascotas</h3>
                            <p>Intenta con otros filtros</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pagePets.map(pet => `
            <tr>
                <td>
                    <div class="table-user">
                        <img src="${(pet.photo_urls && pet.photo_urls[0]) || pet.image_url || 'https://via.placeholder.com/36'}" alt="" class="table-avatar">
                        <div class="table-user-info">
                            <div class="table-user-name">${pet.name || 'Sin nombre'}</div>
                            <div class="table-user-email">${pet.breed || pet.species || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${this.formatSpecies(pet.species)}</td>
                <td>
                    <div class="table-user">
                        <img src="${pet.owner?.avatar_url || 'https://via.placeholder.com/24'}" alt="" 
                             style="width:24px;height:24px;border-radius:6px;">
                        <span>${pet.owner?.username || 'Desconocido'}</span>
                    </div>
                </td>
                <td>${this.getStatusBadge(pet)}</td>
                <td>${app.formatRelativeTime(pet.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-ghost btn-sm" onclick="pets.viewPet('${pet.id}')" title="Ver">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm" onclick="pets.editPet('${pet.id}')" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-ghost btn-sm text-danger" onclick="pets.deletePet('${pet.id}')" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
    },

    /**
     * Format species name
     */
    formatSpecies(species) {
        const names = {
            'dog': '🐕 Perro',
            'cat': '🐈 Gato',
            'bird': '🐦 Ave',
            'rabbit': '🐰 Conejo',
            'hamster': '🐹 Hamster',
            'fish': '🐠 Pez',
            'other': '🐾 Otro'
        };
        return names[species?.toLowerCase()] || species || '-';
    },

    /**
     * Get status badge
     */
    getStatusBadge(pet) {
        if (pet.status === 'lost') return '<span class="pill pill-banned">Perdido</span>';
        if (pet.status === 'adopted') return '<span class="pill pill-foundation">Adoptado</span>';
        return '<span class="pill pill-active">Normal</span>';
    },

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredPets.length / this.pageSize);
        const paginationEl = document.getElementById('pets-pagination');
        if (!paginationEl) return;

        paginationEl.innerHTML = `
            <span class="text-muted text-sm">
                Mostrando ${Math.min(this.filteredPets.length, (this.currentPage - 1) * this.pageSize + 1)} - 
                ${Math.min(this.currentPage * this.pageSize, this.filteredPets.length)} de ${this.filteredPets.length}
            </span>
            <div class="flex gap-2">
                <button class="btn btn-secondary btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} 
                        onclick="pets.goToPage(${this.currentPage - 1})">Anterior</button>
                <button class="btn btn-secondary btn-sm" ${this.currentPage >= totalPages ? 'disabled' : ''} 
                        onclick="pets.goToPage(${this.currentPage + 1})">Siguiente</button>
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
     * View pet details
     */
    async viewPet(petId) {
        const pet = this.allPets.find(p => p.id === petId);
        if (!pet) return;

        // Fetch medical records
        const { data: medicalData } = await db.query('medical_records', {
            filters: { pet_id: petId },
            order: { column: 'date', ascending: false },
            limit: 5
        });

        modals.show({
            id: 'pet-detail-modal',
            title: 'Detalles de la Mascota',
            size: 'lg',
            content: `
                <div class="pet-detail">
                    <div class="flex items-center gap-4 mb-4">
                        <img src="${(pet.photo_urls && pet.photo_urls[0]) || pet.image_url || 'https://via.placeholder.com/100'}" 
                             style="width:100px;height:100px;border-radius:16px;object-fit:cover;">
                        <div>
                            <h3 style="font-size:22px;margin-bottom:4px;">${pet.name || 'Sin nombre'}</h3>
                            <p class="text-muted">${pet.breed || ''} • ${this.formatSpecies(pet.species)}</p>
                            <div class="flex gap-2 mt-2">
                                ${this.getStatusBadge(pet)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">Información</h4>
                        <table class="data-table" style="font-size:13px;">
                            <tr><td class="text-muted" style="width:120px;">Género</td><td>${pet.gender || '-'}</td></tr>
                            <tr><td class="text-muted">Dueño</td><td>${pet.owner?.username || 'Desconocido'} (${pet.owner?.email || ''})</td></tr>
                            <tr><td class="text-muted">Bio</td><td>${pet.bio || '-'}</td></tr>
                            <tr><td class="text-muted">Registrado</td><td>${app.formatDate(pet.created_at)}</td></tr>
                        </table>
                    </div>

                    ${medicalData && medicalData.length > 0 ? `
                        <div class="mb-4">
                            <h4 class="font-semibold mb-2">Historial Médico Reciente</h4>
                            <table class="data-table" style="font-size:13px;">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${medicalData.map(record => `
                                        <tr>
                                            <td>${app.formatDate(record.date)}</td>
                                            <td>${record.type || '-'}</td>
                                            <td>${record.description || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : ''}
                </div>
            `,
            actions: [
                { label: 'Cerrar', type: 'secondary', onclick: `modals.close('pet-detail-modal')` },
                { label: 'Editar', type: 'primary', onclick: `modals.close('pet-detail-modal'); pets.editPet('${petId}')` }
            ]
        });
    },

    /**
     * Edit pet modal
     */
    async editPet(petId) {
        const pet = this.allPets.find(p => p.id === petId);
        if (!pet) return;

        modals.show({
            id: 'pet-edit-modal',
            title: 'Editar Mascota',
            size: 'md',
            content: `
                <form id="edit-pet-form">
                    <div class="form-group">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-input" name="name" value="${pet.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Especie</label>
                        <select class="form-input" name="species">
                            <option value="dog" ${pet.species === 'dog' ? 'selected' : ''}>Perro</option>
                            <option value="cat" ${pet.species === 'cat' ? 'selected' : ''}>Gato</option>
                            <option value="bird" ${pet.species === 'bird' ? 'selected' : ''}>Ave</option>
                            <option value="rabbit" ${pet.species === 'rabbit' ? 'selected' : ''}>Conejo</option>
                            <option value="other" ${pet.species === 'other' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Raza</label>
                        <input type="text" class="form-input" name="breed" value="${pet.breed || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Género</label>
                        <select class="form-input" name="gender">
                            <option value="male" ${pet.gender === 'male' ? 'selected' : ''}>Macho</option>
                            <option value="female" ${pet.gender === 'female' ? 'selected' : ''}>Hembra</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bio</label>
                        <textarea class="form-input" name="bio" rows="3">${pet.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="is_lost" ${pet.status === 'lost' ? 'checked' : ''}> Perdido
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" name="is_adopted" ${pet.status === 'adopted' ? 'checked' : ''}> Adoptado
                            </label>
                        </div>
                    </div>
                </form>
            `,
            actions: [
                { label: 'Cancelar', type: 'secondary', onclick: `modals.close('pet-edit-modal')` },
                { label: 'Guardar', type: 'primary', onclick: `pets.savePet('${petId}')` }
            ]
        });
    },

    /**
     * Save pet changes
     */
    async savePet(petId) {
        const form = document.getElementById('edit-pet-form');
        if (!form) return;

        const formData = new FormData(form);
        const isLost = formData.get('is_lost') === 'on';
        const isAdopted = formData.get('is_adopted') === 'on';
        let status = 'active';
        if (isLost) status = 'lost';
        else if (isAdopted) status = 'adopted';

        const updates = {
            name: formData.get('name'),
            species: formData.get('species'),
            breed: formData.get('breed'),
            gender: formData.get('gender'),
            bio: formData.get('bio'),
            status: status
        };

        try {
            await db.update('pets', petId, updates);

            modals.close('pet-edit-modal');
            app.toast('Mascota actualizada', 'success');
            await auth.logAccess('PET_EDITED', { petId, updates });
            await this.load();
        } catch (error) {
            console.error('Error saving pet:', error);
            app.toast('Error al guardar', 'error');
        }
    },

    /**
     * Delete pet
     */
    async deletePet(petId) {
        const confirmed = await modals.confirm({
            title: 'Eliminar Mascota',
            message: 'Esta acción eliminará permanentemente la mascota y todo su historial.',
            confirmText: 'Eliminar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await db.delete('pets', petId);

            app.toast('Mascota eliminada', 'success');
            await auth.logAccess('PET_DELETED', { petId });
            await this.load();
        } catch (error) {
            console.error('Error deleting pet:', error);
            app.toast('Error al eliminar', 'error');
        }
    }
};

// Export
window.pets = pets;
