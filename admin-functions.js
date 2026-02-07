// Complete User Management System for Petiid Admin Panel
// This file contains all the advanced user management functions

// ===== PROFILE EDITING =====
async function saveProfileEdits(userId) {
    const updates = {
        first_name: document.getElementById('edit-first-name')?.value,
        last_name: document.getElementById('edit-last-name')?.value,
        display_name: document.getElementById('edit-display-name')?.value,
        username: document.getElementById('edit-username')?.value,
        city: document.getElementById('edit-city')?.value,
        country: document.getElementById('edit-country')?.value,
        state: document.getElementById('edit-state')?.value,
        bio: document.getElementById('edit-bio')?.value,
        occupation: document.getElementById('edit-occupation')?.value,
        trust_score: parseInt(document.getElementById('edit-trust-score')?.value) || 60
    };

    const { error } = await _supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        alert('❌ Error al actualizar perfil: ' + error.message);
        return false;
    }

    alert('✅ Perfil actualizado exitosamente');
    return true;
}

// ===== USER DELETION =====
async function deleteUserPermanently(userId, username) {
    const confirmation = prompt(`⚠️ PELIGRO: Vas a eliminar permanentemente al usuario "${username}" y TODOS sus datos.\n\nEsto incluye:\n- Su perfil\n- Todas sus mascotas\n- Todos sus posts\n- Todos sus reportes\n\nEsta acción NO SE PUEDE DESHACER.\n\nEscribe "ELIMINAR" para confirmar:`);

    if (confirmation !== 'ELIMINAR') {
        alert('Cancelado');
        return;
    }

    // Delete in cascade
    const { error: petsError } = await _supabase.from('pets').delete().eq('owner_id', userId);
    const { error: profileError } = await _supabase.from('profiles').delete().eq('id', userId);

    if (profileError) {
        alert('❌ Error al eliminar usuario: ' + profileError.message);
        return;
    }

    alert('✅ Usuario eliminado permanentemente');
    closeUserModal();
    loadAllUsers();
}

// ===== PASSWORD RESET =====
async function resetUserPassword(email) {
    const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://petiid.com/reset-password'
    });

    if (error) {
        alert('❌ Error al enviar email: ' + error.message);
        return;
    }

    alert(`✅ Email de reseteo enviado a ${email}`);
}

// ===== DATA EXPORT =====
async function exportUserData(userId) {
    const { data: user } = await _supabase.from('profiles').select('*').eq('id', userId).single();
    const { data: pets } = await _supabase.from('pets').select('*').eq('owner_id', userId);

    const exportData = {
        user,
        pets,
        exported_at: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user_${user.username}_data.json`;
    link.click();

    alert('✅ Datos exportados');
}

// ===== MANUAL VERIFICATION =====
async function toggleVerification(userId, currentStatus) {
    const newStatus = !currentStatus;

    const { error } = await _supabase
        .from('profiles')
        .update({ is_verified_vet: newStatus })
        .eq('id', userId);

    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }

    alert(newStatus ? '✅ Usuario verificado manualmente' : '❌ Verificación removida');
    viewUserDetails(userId);
}

// ===== PET MANAGEMENT =====
async function editPet(petId) {
    const { data: pet } = await _supabase.from('pets').select('*').eq('id', petId).single();

    const modal = document.getElementById('pet-modal');
    const modalBody = document.getElementById('pet-modal-body');

    modalBody.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <label class="info-label">Nombre</label>
                <input type="text" id="pet-name" value="${pet.name}" class="search-input" />
            </div>
            <div class="info-item">
                <label class="info-label">Especie</label>
                <input type="text" id="pet-species" value="${pet.species || ''}" class="search-input" />
            </div>
            <div class="info-item">
                <label class="info-label">Raza</label>
                <input type="text" id="pet-breed" value="${pet.breed || ''}" class="search-input" />
            </div>
            <div class="info-item">
                <label class="info-label">Estado</label>
                <select id="pet-status" class="filter-select">
                    <option value="active" ${!pet.is_lost ? 'selected' : ''}>Activa</option>
                    <option value="lost" ${pet.is_lost ? 'selected' : ''}>Perdida</option>
                </select>
            </div>
        </div>
        <div class="modal-actions">
            <button class="btn-approve" onclick="savePetEdits('${petId}')">Guardar Cambios</button>
            <button class="btn-danger" onclick="deletePet('${petId}')">Eliminar Mascota</button>
            <button class="btn-secondary" onclick="closePetModal()">Cancelar</button>
        </div>
    `;

    modal.style.display = 'flex';
}

async function savePetEdits(petId) {
    const updates = {
        name: document.getElementById('pet-name').value,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        is_lost: document.getElementById('pet-status').value === 'lost'
    };

    const { error } = await _supabase.from('pets').update(updates).eq('id', petId);

    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }

    alert('✅ Mascota actualizada');
    closePetModal();
}

async function deletePet(petId) {
    if (!confirm('¿Eliminar esta mascota permanentemente?')) return;

    const { error } = await _supabase.from('pets').delete().eq('id', petId);

    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }

    alert('✅ Mascota eliminada');
    closePetModal();
}

function closePetModal() {
    document.getElementById('pet-modal').style.display = 'none';
}
