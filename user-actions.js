// ===== MISSING ACTION FUNCTIONS =====
// Critical functions that are referenced in user-modal-ui.js but not defined

async function saveAllProfileChanges(userId) {
    console.log("Saving profile changes for user:", userId);

    const updates = {
        first_name: document.getElementById('edit-first-name')?.value,
        last_name: document.getElementById('edit-last-name')?.value,
        display_name: document.getElementById('edit-display-name')?.value,
        username: document.getElementById('edit-username')?.value,
        trust_score: parseInt(document.getElementById('edit-trust-score')?.value) || 60,
        city: document.getElementById('edit-city')?.value,
        state: document.getElementById('edit-state')?.value,
        country: document.getElementById('edit-country')?.value,
        occupation: document.getElementById('edit-occupation')?.value,
        bio: document.getElementById('edit-bio')?.value,
        role: document.getElementById('new-role-select')?.value,
        is_suspended: !document.getElementById('account-active-toggle')?.checked
    };

    const { error } = await _supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        alert('❌ Error al guardar: ' + error.message);
        return;
    }

    alert('✅ Perfil actualizado exitosamente');

    // Reload user data and refresh view
    await viewUserDetails(userId);

    // Reload tables if they exist
    if (typeof loadAllUsers === 'function') loadAllUsers();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
}

async function deleteUserPermanently(userId, username) {
    if (!confirm(`⚠️ ¿ELIMINAR PERMANENTEMENTE a @${username}?\n\nEsta acción NO se puede deshacer y eliminará:\n- Perfil del usuario\n- Todas sus mascotas\n- Todos sus posts\n- Todo su historial\n\n¿Estás absolutamente seguro?`)) {
        return;
    }

    if (!confirm(`Última confirmación: Escribe "ELIMINAR" para confirmar`)) {
        return;
    }

    const { error } = await _supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) {
        alert('❌ Error al eliminar: ' + error.message);
        return;
    }

    alert('✅ Usuario eliminado permanentemente');
    closeUserModal();

    if (typeof loadAllUsers === 'function') loadAllUsers();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
}

async function resetUserPassword(email) {
    if (!confirm(`¿Enviar email de reseteo de contraseña a ${email}?`)) return;

    const { error } = await _supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://moises.petiid.com/reset-password'
    });

    if (error) {
        alert('❌ Error: ' + error.message);
        return;
    }

    alert('✅ Email de reseteo enviado a ' + email);
}

async function exportUserData(userId) {
    const { data: user } = await _supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    const { data: pets } = await _supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId);

    const exportData = {
        user,
        pets,
        exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_${user.username}_${Date.now()}.json`;
    a.click();

    alert('✅ Datos exportados');
}

function sendNotificationToUser(userId, username) {
    const message = prompt(`Escribe el mensaje para @${username}:`);
    if (!message) return;

    // This would require a backend notification system
    // For now, just show a placeholder
    alert(`📧 Función de notificaciones en desarrollo.\n\nMensaje que se enviaría:\n"${message}"`);
}

async function toggleVerification(userId, currentStatus) {
    const newStatus = !currentStatus;

    const { error } = await _supabase
        .from('profiles')
        .update({ is_verified_vet: newStatus })
        .eq('id', userId);

    if (error) {
        alert('Error: ' + error.message);
        return;
    }

    alert(newStatus ? '✅ Usuario verificado' : '❌ Verificación removida');
    await viewUserDetails(userId);
}

// Export all functions to window
window.saveAllProfileChanges = saveAllProfileChanges;
window.deleteUserPermanently = deleteUserPermanently;
window.resetUserPassword = resetUserPassword;
window.exportUserData = exportUserData;
window.sendNotificationToUser = sendNotificationToUser;
window.toggleVerification = toggleVerification;
window.toggleEditMode = toggleEditMode;

console.log("✅ Action functions loaded and exported");
