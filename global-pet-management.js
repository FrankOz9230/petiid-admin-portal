// ===== GLOBAL PET MANAGEMENT MODULE =====
// Logic for the master pet table and quality control

let allPetsData = [];

async function loadGlobalPets() {
    console.log("Cargando directorio global de mascotas...");
    const { data: pets, error } = await _supabase
        .from('pets')
        .select(`
            *,
            owner:profiles (
                display_name,
                username,
                role
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar mascotas:', error);
        return;
    }

    allPetsData = pets;
    renderPetsTable(pets);
}

function renderPetsTable(pets) {
    const tableBody = document.getElementById('pets-table-body');
    if (!tableBody) return;

    if (!pets || pets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">No hay mascotas registradas en el sistema.</td></tr>';
        return;
    }

    tableBody.innerHTML = pets.map(pet => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="${pet.photo_url || 'https://via.placeholder.com/40?text=Pet'}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/40?text=Pet'"/>
                    <div>
                        <div style="font-weight: 600;">${pet.name}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">${pet.breed || 'Sin raza'}</div>
                    </div>
                </div>
            </td>
            <td>${pet.species}</td>
            <td>
                <div style="font-weight: 500;">${pet.owner?.display_name || 'Sin dueño'}</div>
                <div class="tag ${getRoleTagClass(pet.owner?.role)}" style="font-size: 10px; padding: 2px 6px;">${pet.owner?.role || 'user'}</div>
            </td>
            <td>
                <span class="tag ${pet.is_lost ? 'tag-role-admin' : 'tag-role-vet'}">
                    ${pet.is_lost ? 'Perdida' : 'Activa'}
                </span>
            </td>
            <td>${new Date(pet.created_at).toLocaleDateString()}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="font-size: 12px;" onclick="viewPetDetails('${pet.id}')">Ver</button>
                    <button class="btn btn-secondary" style="font-size: 12px; color: var(--danger);" onclick="deletePetFromGlobal('${pet.id}', '${pet.name}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getRoleTagClass(role) {
    switch (role) {
        case 'admin': return 'tag-role-admin';
        case 'foundation': return 'tag-role-foundation';
        case 'veterinarian': return 'tag-role-vet';
        default: return 'tag-role-user';
    }
}

function filterPets() {
    const searchTerm = document.getElementById('pet-search').value.toLowerCase();
    const speciesFilter = document.getElementById('species-filter').value;

    const filtered = allPetsData.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(searchTerm);
        const matchesSpecies = speciesFilter === 'all' || pet.species === speciesFilter;
        return matchesSearch && matchesSpecies;
    });

    renderPetsTable(filtered);
}

async function deletePetFromGlobal(petId, petName) {
    if (!confirm(`¿Estás seguro de que quieres eliminar a "${petName}" permanentemente?`)) return;

    const { error } = await _supabase
        .from('pets')
        .delete()
        .eq('id', petId);

    if (error) {
        alert('Error al eliminar: ' + error.message);
        return;
    }

    alert('✅ Mascota eliminada');
    loadGlobalPets();
    loadDashboardStats();
}

async function viewPetDetails(petId) {
    // Open the same edit pet modal from user management or a new dedicated view
    if (typeof editPet === 'function') {
        editPet(petId);
    } else {
        alert('Información detallada: ID ' + petId);
    }
}
