// ===== PET MANAGEMENT =====
// Functions for viewing, editing, and deleting user pets

async function editPet(petId) {
    const { data: pet } = await _supabase.from('pets').select('*').eq('id', petId).single();

    const modal = document.getElementById('pet-modal');
    const modalBody = document.getElementById('pet-modal-body');

    modalBody.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <label class="info-label">Nombre</label>
                <input type="text" id="pet-name" value="${pet.name}" class="edit-field" />
            </div>
            <div class="info-item">
                <label class="info-label">Especie</label>
                <input type="text" id="pet-species" value="${pet.species || ''}" class="edit-field" />
            </div>
            <div class="info-item">
                <label class="info-label">Raza</label>
                <input type="text" id="pet-breed" value="${pet.breed || ''}" class="edit-field" />
            </div>
            <div class="info-item">
                <label class="info-label">Género</label>
                <select id="pet-gender" class="filter-select">
                    <option value="male" ${pet.gender === 'male' ? 'selected' : ''}>Macho</option>
                    <option value="female" ${pet.gender === 'female' ? 'selected' : ''}>Hembra</option>
                </select>
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
            <button class="btn-approve" onclick="savePetEdits('${petId}')">💾 Guardar Cambios</button>
            <button class="btn-danger" onclick="deletePet('${petId}')">🗑️ Eliminar Mascota</button>
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
        gender: document.getElementById('pet-gender').value,
        is_lost: document.getElementById('pet-status').value === 'lost'
    };

    const { error } = await _supabase.from('pets').update(updates).eq('id', petId);

    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }

    alert('✅ Mascota actualizada');
    closePetModal();

    // Refresh user details to show updated pet
    const currentUserId = window.currentUserId;
    if (currentUserId) {
        viewUserDetails(currentUserId);
    }
}

async function deletePet(petId) {
    const confirmation = confirm('⚠️ ¿Eliminar esta mascota permanentemente?\n\nEsta acción NO se puede deshacer.');

    if (!confirmation) return;

    const { error } = await _supabase.from('pets').delete().eq('id', petId);

    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }

    alert('✅ Mascota eliminada');
    closePetModal();

    // Refresh user details
    const currentUserId = window.currentUserId;
    if (currentUserId) {
        viewUserDetails(currentUserId);
    }
}

function closePetModal() {
    document.getElementById('pet-modal').style.display = 'none';
}
