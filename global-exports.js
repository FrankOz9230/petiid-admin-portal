// ===== GLOBAL FUNCTION EXPORTS =====
// This file ensures all action functions are globally accessible for onclick handlers

console.log("🔧 Loading global function exports...");

// Wait for all modules to load, then export functions
window.addEventListener('DOMContentLoaded', () => {
    // User Management Functions
    if (typeof viewUserDetails !== 'undefined') {
        window.viewUserDetails = viewUserDetails;
        console.log("✅ viewUserDetails exported");
    }

    if (typeof closeUserModal !== 'undefined') {
        window.closeUserModal = closeUserModal;
        console.log("✅ closeUserModal exported");
    }

    if (typeof switchTab !== 'undefined') {
        window.switchTab = switchTab;
        console.log("✅ switchTab exported");
    }

    if (typeof enableEditMode !== 'undefined') {
        window.enableEditMode = enableEditMode;
        console.log("✅ enableEditMode exported");
    }

    if (typeof saveUserChanges !== 'undefined') {
        window.saveUserChanges = saveUserChanges;
        console.log("✅ saveUserChanges exported");
    }

    if (typeof deleteUserPermanently !== 'undefined') {
        window.deleteUserPermanently = deleteUserPermanently;
        console.log("✅ deleteUserPermanently exported");
    }

    // Pet Management Functions
    if (typeof viewPetDetails !== 'undefined') {
        window.viewPetDetails = viewPetDetails;
        console.log("✅ viewPetDetails exported");
    }

    if (typeof deletePetFromGlobal !== 'undefined') {
        window.deletePetFromGlobal = deletePetFromGlobal;
        console.log("✅ deletePetFromGlobal exported");
    }

    if (typeof closePetModal !== 'undefined') {
        window.closePetModal = closePetModal;
        console.log("✅ closePetModal exported");
    }

    // Foundation Management Functions
    if (typeof approveFoundation !== 'undefined') {
        window.approveFoundation = approveFoundation;
        console.log("✅ approveFoundation exported");
    }

    if (typeof rejectFoundation !== 'undefined') {
        window.rejectFoundation = rejectFoundation;
        console.log("✅ rejectFoundation exported");
    }

    // Filter Functions
    if (typeof filterUsers !== 'undefined') {
        window.filterUsers = filterUsers;
        console.log("✅ filterUsers exported");
    }

    console.log("✅ All available functions exported to window object");
});
