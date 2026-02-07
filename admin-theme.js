// ===== THEME SYSTEM =====
// Dark/Light mode toggle with localStorage persistence

function initTheme() {
    const savedTheme = localStorage.getItem('petiid-admin-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('petiid-admin-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        if (theme === 'dark') {
            themeBtn.innerHTML = '<i data-lucide="sun"></i><span>Tema Claro</span>';
        } else {
            themeBtn.innerHTML = '<i data-lucide="moon"></i><span>Tema Oscuro</span>';
        }
        // Re-initialize icons for the new content
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ===== NAVIGATION =====
// Handle navigation between sections

function navigateTo(sectionId) {
    console.log("Navegando a:", sectionId);

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('animate-up');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        // Force a reflow for animation
        void targetSection.offsetWidth;
        targetSection.classList.add('animate-up');
    }

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // On mobile, you might want to close sidebar here if implemented as overlay
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    // Lucide icons are initialized in index.html too, but safe here
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// Global logout function
async function logout() {
    if (!confirm('¿Cerrar sesión?')) return;
    const { error } = await _supabase.auth.signOut();
    if (error) alert(error.message);
    window.location.href = 'login.html';
}
