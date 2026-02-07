/**
 * PETIID ADMIN - AUTHENTICATION & SECURITY
 * Admin access validation and session management
 */

const auth = {
    currentUser: null,
    currentProfile: null,

    /**
     * Validate admin access
     * @returns {Promise<boolean>}
     */
    async validateAccess() {
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                console.warn('❌ No active session');
                this.redirectToLogin();
                return false;
            }

            this.currentUser = session.user;

            // Get user profile to check role
            const profile = await db.getProfile(session.user.id);

            if (!profile) {
                console.warn('❌ No profile found');
                this.redirectToLogin();
                return false;
            }

            // Check if user has admin role
            const allowedRoles = ['admin', 'admin_global', 'super_admin'];
            if (!allowedRoles.includes(profile.role)) {
                console.warn('❌ Insufficient permissions:', profile.role);
                this.showAccessDenied();
                return false;
            }

            this.currentProfile = profile;
            console.log('✅ Admin access granted:', profile.email);

            // Log access
            this.logAccess('ADMIN_LOGIN');

            return true;
        } catch (error) {
            console.error('❌ Auth error:', error);
            this.redirectToLogin();
            return false;
        }
    },

    /**
     * Log admin action for audit
     */
    async logAccess(action, details = {}) {
        try {
            await supabase.from('access_logs').insert({
                user_id: this.currentUser?.id,
                action_type: action,
                details: JSON.stringify(details),
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.warn('Could not log access:', error);
        }
    },

    /**
     * Get client IP (best effort)
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    },

    /**
     * Logout user
     */
    async logout() {
        await this.logAccess('ADMIN_LOGOUT');
        await supabase.auth.signOut();
        this.redirectToLogin();
    },

    /**
     * Show login form instead of redirecting
     */
    redirectToLogin() {
        this.showLoginForm();
    },

    /**
     * Display inline login form
     */
    showLoginForm() {
        document.body.innerHTML = `
            <div class="login-container">
                <div class="login-glow"></div>
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                                <path d="m8.5 8.5 7 7" />
                            </svg>
                        </div>
                        <h1>Petiid <span>Admin</span></h1>
                        <p>Acceso exclusivo al panel de administración</p>
                    </div>
                    
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" placeholder="••••••••" required>
                        </div>
                        <div id="login-error" class="login-error"></div>
                        <button type="submit" class="login-btn" id="login-btn">
                            <span>Entrar al Panel</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </form>
                    
                    <div class="login-footer">
                        <a href="../HOME/index.html">← Volver al inicio</a>
                    </div>
                </div>
            </div>
            
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0f;
                    font-family: 'Inter', -apple-system, sans-serif;
                    position: relative;
                    overflow: hidden;
                }
                
                .login-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                
                .login-card {
                    background: rgba(20, 20, 30, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 48px;
                    width: 100%;
                    max-width: 420px;
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                
                .login-header {
                    text-align: center;
                    margin-bottom: 36px;
                }
                
                .login-logo {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    box-shadow: 0 10px 30px -5px rgba(251, 146, 60, 0.4);
                }
                
                .login-logo svg {
                    width: 32px;
                    height: 32px;
                    color: white;
                }
                
                .login-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #f8fafc;
                    margin-bottom: 8px;
                }
                
                .login-header h1 span {
                    color: #fb923c;
                }
                
                .login-header p {
                    color: #64748b;
                    font-size: 14px;
                }
                
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .form-group label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #94a3b8;
                }
                
                .form-group input {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px;
                    font-size: 15px;
                    color: #f8fafc;
                    transition: all 0.2s;
                    outline: none;
                }
                
                .form-group input::placeholder {
                    color: #475569;
                }
                
                .form-group input:focus {
                    border-color: #fb923c;
                    box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
                }
                
                .login-error {
                    color: #ef4444;
                    font-size: 13px;
                    text-align: center;
                    min-height: 20px;
                }
                
                .login-btn {
                    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px 24px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px -3px rgba(251, 146, 60, 0.4);
                }
                
                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px -5px rgba(251, 146, 60, 0.5);
                }
                
                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .login-btn svg {
                    width: 18px;
                    height: 18px;
                }
                
                .login-footer {
                    margin-top: 28px;
                    text-align: center;
                }
                
                .login-footer a {
                    color: #64748b;
                    text-decoration: none;
                    font-size: 13px;
                    transition: color 0.2s;
                }
                
                .login-footer a:hover {
                    color: #fb923c;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .login-btn.loading span {
                    opacity: 0;
                }
                
                .login-btn.loading::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border: 2px solid transparent;
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
            </style>
        `;

        // Setup form handler
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    },

    /**
     * Handle login form submission
     */
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('login-btn');
        const errorEl = document.getElementById('login-error');

        btn.disabled = true;
        btn.classList.add('loading');
        errorEl.textContent = '';

        try {
            // Check if we're on file:// protocol
            if (window.location.protocol === 'file:') {
                throw new Error('Para iniciar sesión, accede desde https://moises.petiid.com');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Reload to validate access
            window.location.reload();

        } catch (error) {
            console.error('Login error:', error);

            // Better error messages
            let message = error.message || 'Error al iniciar sesión';

            if (error.message?.includes('fetch') || error.name === 'TypeError') {
                message = 'Error de red. Verifica tu conexión o accede desde https://moises.petiid.com';
            } else if (error.message?.includes('Invalid login')) {
                message = 'Email o contraseña incorrectos';
            } else if (error.message?.includes('Email not confirmed')) {
                message = 'Debes confirmar tu email antes de iniciar sesión';
            }

            errorEl.textContent = message;
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    },

    /**
     * Show access denied message
     */
    showAccessDenied() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Inter, sans-serif;
                background: #0f172a;
                color: #f8fafc;
                text-align: center;
                padding: 20px;
            ">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h1 style="margin: 24px 0 12px; font-size: 28px;">Acceso Denegado</h1>
                <p style="color: #94a3b8; margin-bottom: 24px;">No tienes permisos para acceder al panel de administración.</p>
                <button onclick="auth.logout()" style="
                    background: #fb923c;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">Volver al Inicio</button>
            </div>
        `;
    },

    /**
     * Get current admin info for UI
     */
    getAdminInfo() {
        if (!this.currentProfile) return null;

        return {
            name: this.currentProfile.username || this.currentProfile.email?.split('@')[0] || 'Admin',
            email: this.currentProfile.email,
            role: this.currentProfile.role,
            avatar: this.currentProfile.avatar_url,
            initials: this.getInitials(this.currentProfile.username || this.currentProfile.email)
        };
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return 'A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
};

// Export
window.auth = auth;
