// ===== DASHBOARD DATA & SHARED UTILS =====
// Real-time metrics and initial data loading

async function loadDashboardStats() {
    console.log("Cargando estadísticas en tiempo real...");

    try {
        // 1. Total Users
        const { count: userCount, error: userError } = await _supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // 2. Total Pets
        const { count: petCount, error: petError } = await _supabase
            .from('pets')
            .select('*', { count: 'exact', head: true });

        // 3. Pending Foundations
        const { count: foundCount, error: foundError } = await _supabase
            .from('foundations')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // 4. Active Lost Reports (Checking if lost_reports table exists or use pets.is_lost)
        // For launch, we use pets where is_lost is true
        const { count: reportCount, error: reportError } = await _supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('is_lost', true);

        // Update UI with null checks
        if (userError) console.error("Error users:", userError);
        if (petError) console.error("Error pets:", petError);

        const statUsers = document.getElementById('stat-total-users');
        const statPets = document.getElementById('stat-total-pets');
        const statFoundations = document.getElementById('stat-pending-foundations');
        const statReports = document.getElementById('stat-active-reports');

        if (statUsers) statUsers.innerText = userCount !== null ? userCount.toLocaleString() : '0';
        if (statPets) statPets.innerText = petCount !== null ? petCount.toLocaleString() : '0';
        if (statFoundations) statFoundations.innerText = foundCount !== null ? foundCount : '0';
        if (statReports) statReports.innerText = reportCount !== null ? reportCount : '0';

        // Load Recent Users for Dashboard Table
        loadRecentUsers();

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
    }
}

async function loadRecentUsers() {
    const { data: recentUsers, error } = await _supabase
        .from('profiles')
        .select('id, display_name, username, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error recent users:", error);
        return;
    }

    const tableBody = document.querySelector('#dashboard-recent-users-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = recentUsers.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="avatar">${(user.display_name || user.username || 'U').charAt(0)}</div>
                    <div>
                        <div style="font-weight: 500;">${user.display_name || 'Sin nombre'}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">@${user.username}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Global logout function
async function logout() {
    if (!confirm('¿Cerrar sesión?')) return;
    const { error } = await _supabase.auth.signOut();
    if (error) alert(error.message);
    window.location.href = 'login.html';
}
