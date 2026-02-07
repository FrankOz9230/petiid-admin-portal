// ===== TEMPORARY: SECURITY DISABLED =====
// This is a placeholder to prevent redirect loops
// Security will be re-enabled once login system is in place

console.log("⚠️ Security system temporarily disabled");

// Create a dummy security guard that always allows access
window.securityGuard = {
    validateAccess: async function () {
        console.log("✅ Access granted (security disabled)");
        return true;
    },
    forceLogout: async function () {
        console.log("Logout requested");
        await _supabase.auth.signOut();
        alert("Sesión cerrada");
        window.location.reload();
    }
};
