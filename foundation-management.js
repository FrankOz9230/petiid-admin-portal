// ===== FOUNDATION MANAGEMENT MODULE =====
// Logic for verifying shelters and foundations for Petiid launch

async function loadPendingFoundations() {
    console.log("Cargando fundaciones pendientes...");
    const { data: foundations, error } = await _supabase
        .from('foundations')
        .select(`
            *,
            profiles:user_id (
                display_name,
                email,
                username
            )
        `)
        .eq('status', 'pending');

    if (error) {
        console.error('Error al cargar fundaciones:', error);
        return;
    }

    renderFoundationsTable(foundations);
}

function renderFoundationsTable(foundations) {
    const tableBody = document.getElementById('foundations-table-body');
    if (!tableBody) return;

    if (!foundations || foundations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">No hay fundaciones pendientes de verificación.</td></tr>';
        return;
    }

    tableBody.innerHTML = foundations.map(found => `
        <tr>
            <td>
                <div style="font-weight: 600;">${found.name}</div>
                <div style="font-size: 12px; color: var(--text-muted);">ID: ${found.id}</div>
            </td>
            <td>
                <div class="user-cell">
                    <div class="avatar">${(found.profiles?.display_name || found.profiles?.username || 'F').charAt(0)}</div>
                    <div>
                        <div style="font-weight: 500;">${found.profiles?.display_name || 'Sin nombre'}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">@${found.profiles?.username || ''}</div>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="viewDocument('${found.rut_url}')">📄 RUT</button>
                    <button class="btn btn-secondary" style="font-size: 11px; padding: 4px 8px;" onclick="viewDocument('${found.id_card_url}')">📄 Cédula</button>
                </div>
            </td>
            <td>${new Date(found.created_at).toLocaleDateString()}</td>
            <td><span class="tag" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">Pendiente</span></td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" style="background: var(--success); font-size: 12px;" onclick="approveFoundation('${found.id}', '${found.user_id}')">Aprobar</button>
                    <button class="btn btn-secondary" style="border: 1px solid var(--danger); color: var(--danger); font-size: 12px;" onclick="rejectFoundation('${found.id}')">Rechazar</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function approveFoundation(foundId, userId) {
    if (!confirm('¿Seguro que quieres aprobar esta fundación? Se le asignará el rol de FUNDACIÓN y podrá subir mascotas en adopción.')) return;

    // 1. Update foundation status
    const { error: foundError } = await _supabase
        .from('foundations')
        .update({ status: 'approved', verified_at: new Date().toISOString() })
        .eq('id', foundId);

    if (foundError) {
        alert('Error al actualizar registro: ' + foundError.message);
        return;
    }

    // 2. Update user profile role and verification flag
    const { error: profileError } = await _supabase
        .from('profiles')
        .update({
            role: 'foundation',
            is_verified: true
        })
        .eq('id', userId);

    if (profileError) {
        alert('Error al actualizar rol del usuario: ' + profileError.message);
        return;
    }

    alert('✅ Fundación aprobada exitosamente');
    loadPendingFoundations();
    loadDashboardStats(); // Refresh counters
}

async function rejectFoundation(foundId) {
    const reason = prompt('Motivo del rechazo (se enviará al usuario):');
    if (reason === null) return;

    const { error } = await _supabase
        .from('foundations')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', foundId);

    if (error) {
        alert('Error: ' + error.message);
        return;
    }

    alert('❌ Solicitud rechazada');
    loadPendingFoundations();
    loadDashboardStats();
}

function viewDocument(url) {
    if (!url || url === 'undefined' || url === 'null') {
        alert('Documento no disponible');
        return;
    }
    window.open(url, '_blank');
}
