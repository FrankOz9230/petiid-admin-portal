/**
 * PETIID ADMIN - SPA ROUTER
 * Client-side navigation for single page app
 */

const router = {
    currentSection: 'dashboard',
    sections: ['dashboard', 'users', 'pets', 'posts', 'reports', 'analytics', 'lost-pets', 'system'],

    /**
     * Navigate to a section
     */
    navigateTo(sectionId) {
        if (!this.sections.includes(sectionId)) {
            console.warn('Unknown section:', sectionId);
            return;
        }

        // Update current section
        this.currentSection = sectionId;

        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update content sections
        document.querySelectorAll('.section').forEach(section => {
            if (section.id === `section-${sectionId}`) {
                section.classList.remove('hidden');
                section.classList.add('animate-in');
            } else {
                section.classList.add('hidden');
                section.classList.remove('animate-in');
            }
        });

        // Update URL hash
        window.location.hash = sectionId;

        // Trigger section load callback
        this.onSectionLoad(sectionId);

        // Close mobile sidebar
        this.closeMobileSidebar();
    },

    /**
     * Callback when section loads
     */
    async onSectionLoad(sectionId) {
        console.log('📍 Navigated to:', sectionId);

        // Load section-specific data
        switch (sectionId) {
            case 'dashboard':
                if (typeof dashboard !== 'undefined') await dashboard.load();
                break;
            case 'users':
                if (typeof users !== 'undefined') await users.load();
                break;
            case 'pets':
                if (typeof pets !== 'undefined') await pets.load();
                break;
            case 'posts':
                if (typeof posts !== 'undefined') await posts.load();
                break;
            case 'reports':
                if (typeof reports !== 'undefined') await reports.load();
                break;
            case 'analytics':
                if (typeof analytics !== 'undefined') await analytics.load();
                break;
            case 'lost-pets':
                if (typeof lostPets !== 'undefined') await lostPets.load();
                break;
            case 'system':
                if (typeof system !== 'undefined') await system.load();
                break;
        }
    },

    /**
     * Initialize router
     */
    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.navigateTo(hash);
        });

        // Bind click events to nav items
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.dataset.section);
            });
        });

        // Handle initial hash
        const initialHash = window.location.hash.slice(1) || 'dashboard';
        this.navigateTo(initialHash);

        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Sidebar overlay click to close
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeMobileSidebar());
        }
    },

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('active');
    },

    /**
     * Close mobile sidebar
     */
    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
    }
};

// CSS for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeSlideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-in {
        animation: fadeSlideIn 0.3s ease forwards;
    }
`;
document.head.appendChild(style);

// Export
window.router = router;
