// ===== USER TABLE MANAGEMENT MODULE =====
// Logic for handling the main users table, search, and filters

let allUsersData = [];

async function loadAllUsers() {
    console.log("Cargando todos los usuarios...");
    const { data: users, error } = await _supabase
        .from('profiles')
        .select('*, pets(count)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar usuarios:', error);
        return;
    }

    allUsersData = users;
    renderUserTable(users);
}

function renderUserTable(users) {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No se encontraron usuarios.</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="avatar">${(user.display_name || user.username || 'U').charAt(0)}</div>
                    <div>
                        <div style="font-weight: 600;">${user.display_name || 'Sin nombre'}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">@${user.username}</div>
                    </div>
                </div>
            </td>
            <td><span class="tag ${getRoleTagClass(user.role)}">${user.role}</span></td>
            <td>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-weight: 600;">${user.trust_score || 60}</span>
                    <div style="width: 40px; height: 4px; background: var(--border); border-radius: 2px;">
                        <div style="width: ${user.trust_score || 60}%; height: 100%; background: var(--primary); border-radius: 2px;"></div>
                    </div>
                </div>
            </td>
            <td>${user.pets?.[0]?.count || 0}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewUserDetails('${user.id}')">Ver Detalles</button>
            </td>
        </tr>
    `).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;

    const filtered = allUsersData.filter(user => {
        const matchesSearch =
            user.email?.toLowerCase().includes(searchTerm) ||
            user.username?.toLowerCase().includes(searchTerm) ||
            user.display_name?.toLowerCase().includes(searchTerm);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    renderUserTable(filtered);
}

function getRoleTagClass(role) {
    switch (role) {
        case 'admin': return 'tag-role-admin';
        case 'foundation': return 'tag-role-foundation';
        case 'veterinarian': return 'tag-role-vet';
        default: return 'tag-role-user';
    }
}
