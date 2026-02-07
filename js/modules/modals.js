/**
 * PETIID ADMIN - MODALS MODULE
 * Reusable modal system
 */

const modals = {
    /**
     * Open a modal by ID
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close a modal by ID
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Close all modals
     */
    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    /**
     * Create and show a dynamic modal
     */
    show(options) {
        const {
            id = 'dynamic-modal',
            title = '',
            content = '',
            size = 'md',
            actions = []
        } = options;

        // Remove existing dynamic modal
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        // Size classes
        const sizeClass = {
            sm: 'max-width: 400px;',
            md: 'max-width: 600px;',
            lg: 'max-width: 800px;',
            xl: 'max-width: 1000px;'
        }[size] || 'max-width: 600px;';

        // Build actions HTML
        const actionsHtml = actions.map(action => {
            const btnClass = action.type === 'danger' ? 'btn-danger' :
                action.type === 'primary' ? 'btn-primary' : 'btn-secondary';
            return `<button class="btn ${btnClass}" onclick="${action.onclick}">${action.label}</button>`;
        }).join('');

        // Create modal HTML
        const modalHtml = `
            <div id="${id}" class="modal-overlay">
                <div class="modal" style="${sizeClass}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close" onclick="modals.close('${id}')">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${actions.length > 0 ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
                </div>
            </div>
        `;

        // Insert and show
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Small delay to trigger animation
        requestAnimationFrame(() => {
            this.open(id);
        });

        return id;
    },

    /**
     * Show confirmation dialog
     */
    confirm(options) {
        return new Promise((resolve) => {
            const id = 'confirm-modal';
            const {
                title = '¿Estás seguro?',
                message = '',
                confirmText = 'Confirmar',
                cancelText = 'Cancelar',
                type = 'warning'
            } = options;

            const iconColor = type === 'danger' ? 'var(--danger)' : 'var(--warning)';

            this.show({
                id,
                title,
                content: `
                    <div style="text-align: center; padding: 20px 0;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" style="margin-bottom: 16px;">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <p style="color: var(--text-muted);">${message}</p>
                    </div>
                `,
                actions: [
                    { label: cancelText, type: 'secondary', onclick: `modals.close('${id}'); window._confirmResolve(false);` },
                    { label: confirmText, type: type, onclick: `modals.close('${id}'); window._confirmResolve(true);` }
                ]
            });

            window._confirmResolve = resolve;
        });
    },

    /**
     * Show alert dialog
     */
    alert(options) {
        const {
            title = 'Aviso',
            message = '',
            type = 'info'
        } = options;

        const id = 'alert-modal';
        const iconColor = {
            success: 'var(--success)',
            error: 'var(--danger)',
            warning: 'var(--warning)',
            info: 'var(--info)'
        }[type] || 'var(--info)';

        this.show({
            id,
            title,
            content: `
                <div style="text-align: center; padding: 20px 0;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" style="margin-bottom: 16px;">
                        ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' :
                    '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
                    </svg>
                    <p style="color: var(--text-muted);">${message}</p>
                </div>
            `,
            actions: [
                { label: 'Aceptar', type: 'primary', onclick: `modals.close('${id}')` }
            ]
        });
    }
};

// Export
window.modals = modals;
