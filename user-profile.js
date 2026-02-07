// ===== USER PROFILE MANAGEMENT =====
// Functions for editing and managing user profiles

async function saveAllProfileChanges(userId) {
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
        trust_score: parseInt(document.getElementById('edit-trust-score')?.value) || 60,
        role: document.getElementById('new-role-select')?.value,
        is_suspended: !document.getElementById('account-active-toggle')?.checked
    };

    const { error } = await _supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        alert('❌ Error al actualizar: ' + error.message);
        return;
    }

    alert('✅ Perfil actualizado exitosamente');
    closeUserModal();
    loadAllUsers();
}

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

    // Refresh the modal
    const currentUserId = window.currentUserId;
    if (currentUserId) {
        viewUserDetails(currentUserId);
    }
}
