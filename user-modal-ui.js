// ===== USER MODAL UI =====
// Functions for rendering the tabbed user modal interface

let currentTab = 'profile';
let isEditMode = false; // NEW: Track edit mode state

function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Reset edit mode when switching tabs
    isEditMode = false;

    // Render appropriate tab content
    switch (tabName) {
        case 'profile':
            renderProfileTab();
            break;
        case 'activity':
            renderActivityTab();
            break;
        case 'pets':
            renderPetsTab();
            break;
        case 'actions':
            renderActionsTab();
            break;
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    renderProfileTab();
}

function renderProfileTab() {
    const { user } = window.currentUserData;
    const modalBody = document.getElementById('user-modal-body');
    const isActive = !user.is_suspended;

    if (isEditMode) {
        // EDIT MODE: Show input fields
        modalBody.innerHTML = `
            <div class="tab-content active">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Editar Perfil</h3>
                    <button class="btn-secondary" onclick="toggleEditMode()">❌ Cancelar</button>
                </div>
                
                <h4 style="margin-bottom: 12px; color: var(--text-muted); font-size: 14px;">INFORMACIÓN PERSONAL</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <label class="info-label">Nombre</label>
                        <input type="text" id="edit-first-name" class="edit-field" value="${user.first_name || ''}" placeholder="Nombre" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Apellido</label>
                        <input type="text" id="edit-last-name" class="edit-field" value="${user.last_name || ''}" placeholder="Apellido" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Display Name</label>
                        <input type="text" id="edit-display-name" class="edit-field" value="${user.display_name || ''}" placeholder="Nombre a mostrar" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Username</label>
                        <input type="text" id="edit-username" class="edit-field" value="${user.username}" placeholder="@username" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Email</label>
                        <input type="email" class="edit-field" value="${user.email}" disabled style="opacity: 0.5;" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Trust Score (0-100)</label>
                        <input type="number" id="edit-trust-score" class="edit-field" value="${user.trust_score || 60}" min="0" max="100" />
                    </div>
                </div>

                <h4 style="margin: 24px 0 12px; color: var(--text-muted); font-size: 14px;">UBICACIÓN</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <label class="info-label">Ciudad</label>
                        <input type="text" id="edit-city" class="edit-field" value="${user.city || ''}" placeholder="Ciudad" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Estado/Provincia</label>
                        <input type="text" id="edit-state" class="edit-field" value="${user.state || ''}" placeholder="Estado" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">País</label>
                        <input type="text" id="edit-country" class="edit-field" value="${user.country || ''}" placeholder="País" />
                    </div>
                    <div class="info-item">
                        <label class="info-label">Ocupación</label>
                        <input type="text" id="edit-occupation" class="edit-field" value="${user.occupation || ''}" placeholder="Ocupación" />
                    </div>
                </div>

                <h4 style="margin: 24px 0 12px; color: var(--text-muted); font-size: 14px;">BIOGRAFÍA</h4>
                <textarea id="edit-bio" class="edit-field" placeholder="Biografía del usuario">${user.bio || ''}</textarea>

                <div class="modal-section">
                    <h4 style="margin-bottom: 12px; color: var(--text-muted); font-size: 14px;">ROL Y ESTADO</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label class="info-label">Rol</label>
                            <select id="new-role-select" class="filter-select" style="width: 100%;">
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuario Regular</option>
                                <option value="veterinarian" ${user.role === 'veterinarian' ? 'selected' : ''}>Veterinario</option>
                                <option value="foundation" ${user.role === 'foundation' ? 'selected' : ''}>Fundación</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        <div class="info-item">
                            <label class="info-label">Estado de Cuenta</label>
                            <div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="account-active-toggle" ${isActive ? 'checked' : ''}>
                                    <span class="toggle-slider"></span>
                                </label>
                                <span style="margin-left: 12px; color: var(--text-muted);">${isActive ? 'Activa' : 'Suspendida'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-section">
                    <h4 style="margin-bottom: 12px; color: var(--text-muted); font-size: 14px;">VERIFICACIÓN MANUAL</h4>
                    <label class="toggle-switch">
                        <input type="checkbox" id="manual-verification-toggle" ${user.is_verified_vet ? 'checked' : ''} onchange="toggleVerification('${user.id}', ${user.is_verified_vet})">
                        <span class="toggle-slider"></span>
                    </label>
                    <span style="margin-left: 12px; color: var(--text-muted);">Verificado como Profesional</span>
                </div>

                <div class="modal-actions">
                    <button class="btn-approve" onclick="saveAllProfileChanges('${user.id}')">💾 Guardar Todos los Cambios</button>
                    <button class="btn-secondary" onclick="toggleEditMode()">Cancelar</button>
                </div>
            </div>
        `;
    } else {
        // READ-ONLY MODE: Show static values
        modalBody.innerHTML = `
            <div class="tab-content active">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Información del Usuario</h3>
                    <button class="btn-approve" onclick="toggleEditMode()">✏️ Editar Perfil</button>
                </div>
                
                <h4 style="margin-bottom: 12px; color: var(--text-muted); font-size: 14px;">INFORMACIÓN PERSONAL</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Nombre Completo</span>
                        <span class="info-value">${user.first_name || 'No especificado'} ${user.last_name || ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Display Name</span>
                        <span class="info-value">${user.display_name || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Username</span>
                        <span class="info-value">@${user.username}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">${user.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Trust Score</span>
                        <span class="info-value">${user.trust_score || 60}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ocupación</span>
                        <span class="info-value">${user.occupation || 'No especificada'}</span>
                    </div>
                </div>

                <h4 style="margin: 24px 0 12px; color: var(--text-muted); font-size: 14px;">UBICACIÓN</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Ciudad</span>
                        <span class="info-value">${user.city || 'No especificada'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Estado/Provincia</span>
                        <span class="info-value">${user.state || 'No especificado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">País</span>
                        <span class="info-value">${user.country || 'No especificado'}</span>
                    </div>
                </div>

                <h4 style="margin: 24px 0 12px; color: var(--text-muted); font-size: 14px;">BIOGRAFÍA</h4>
                <p style="color: var(--text); line-height: 1.6;">${user.bio || 'Sin biografía'}</p>

                <div class="modal-section">
                    <h4 style="margin-bottom: 12px; color: var(--text-muted); font-size: 14px;">ROL Y ESTADO</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Rol</span>
                            <span class="info-value">${user.role.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado de Cuenta</span>
                            <span class="info-value">${isActive ? '✅ Activa' : '❌ Suspendida'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Verificación Profesional</span>
                            <span class="info-value">${user.is_verified_vet ? '✅ Verificado' : '❌ No verificado'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderActivityTab() {
    const { user } = window.currentUserData;
    const modalBody = document.getElementById('user-modal-body');

    modalBody.innerHTML = `
        <div class="tab-content active">
            <h3>Información de Cuenta</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Fecha de Registro</span>
                    <span class="info-value">${new Date(user.created_at).toLocaleString('es-ES')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Última Actualización</span>
                    <span class="info-value">${user.updated_at ? new Date(user.updated_at).toLocaleString('es-ES') : 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">ID de Usuario</span>
                    <span class="info-value" style="font-size: 11px;">${user.id}</span>
                </div>
            </div>

            <div class="modal-section">
                <h3>Historial de Actividad</h3>
                <p style="color: var(--text-muted); font-size: 14px;">
                    📊 Próximamente: Historial completo de posts, reportes de pérdida, comentarios y acciones del usuario.
                </p>
            </div>
        </div>
    `;
}

function renderPetsTab() {
    const { pets } = window.currentUserData;
    const modalBody = document.getElementById('user-modal-body');

    modalBody.innerHTML = `
        <div class="tab-content active">
            <h3>Mascotas Registradas (${pets?.length || 0})</h3>
            ${pets && pets.length > 0 ? pets.map(pet => `
                <div class="pet-card" style="cursor: pointer; position: relative;" onclick="editPet('${pet.id}')">
                    <img src="${pet.photo_url || 'https://via.placeholder.com/50'}" class="pet-photo" alt="${pet.name}" />
                    <div style="flex: 1;">
                        <div style="font-weight: 600; font-size: 15px;">${pet.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                            ${pet.species || 'Mascota'} ${pet.breed ? `• ${pet.breed}` : ''}
                        </div>
                        <div style="font-size: 11px; margin-top: 6px;">
                            ${pet.is_lost ? '<span style="color: #ef4444; font-weight: 600;">🚨 PERDIDA</span>' : '<span style="color: #22c55e;">✓ Activa</span>'}
                        </div>
                    </div>
                    <button class="btn-view" onclick="event.stopPropagation(); editPet('${pet.id}')">✏️ Editar</button>
                </div>
            `).join('') : '<p style="color: var(--text-muted); padding: 20px; text-align: center;">Este usuario no tiene mascotas registradas.</p>'}
        </div>
    `;
}

function renderActionsTab() {
    const { user } = window.currentUserData;
    const modalBody = document.getElementById('user-modal-body');

    modalBody.innerHTML = `
        <div class="tab-content active">
            <h3>Acciones Rápidas</h3>
            
            <div class="modal-section">
                <button class="btn-secondary" style="width: 100%; margin-bottom: 12px; text-align: left; padding: 14px 20px;" onclick="resetUserPassword('${user.email}')">
                    🔑 Enviar Email de Reseteo de Contraseña
                </button>
                <button class="btn-secondary" style="width: 100%; margin-bottom: 12px; text-align: left; padding: 14px 20px;" onclick="exportUserData('${user.id}')">
                    📥 Exportar Datos del Usuario (JSON)
                </button>
                <button class="btn-secondary" style="width: 100%; text-align: left; padding: 14px 20px;" onclick="sendNotificationToUser('${user.id}', '${user.username}')">
                    📧 Enviar Notificación Directa
                </button>
            </div>

            <div class="danger-zone">
                <h3>⚠️ Zona Peligrosa</h3>
                <p style="color: var(--text-muted); margin-bottom: 16px; font-size: 14px;">
                    Las siguientes acciones son <strong>irreversibles</strong> y eliminarán permanentemente los datos del usuario.
                </p>
                <button class="btn-danger" style="width: 100%; padding: 14px 20px;" onclick="deleteUserPermanently('${user.id}', '${user.username}')">
                    🗑️ Eliminar Usuario Permanentemente
                </button>
            </div>
        </div>
    `;
}

async function viewUserDetails(userId) {
    window.currentUserId = userId;

    const { data: user } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    const { data: pets } = await _supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId);

    const modal = document.getElementById('user-modal');
    const modalTitle = document.getElementById('user-modal-title');

    modalTitle.innerText = `${user.display_name || user.username}`;

    // Store user data globally for tab switching
    window.currentUserData = { user, pets };

    // Reset to profile tab
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index === 0);
    });

    // Show profile tab by default
    renderProfileTab();

    modal.style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
    window.currentUserData = null;
    window.currentUserId = null;
}
