class App {
    constructor() {
        this.isDarkTheme = true;
        this.user = null;
    }
    
    async init() {
        await this.loadUserState();
        this.setupThemeToggle();
        this.setupUserMenu();
        this.setupMobileMenu();
        this.registerRoutes();
        this.loadThemePreference();
    }
    
    async loadUserState() {
        try {
            const { user } = await API.getCurrentUser();
            if (user) {
                this.user = user;
                document.getElementById('user-status').textContent = user.username.toUpperCase();
                // Show create post button for admins
                if (user.is_admin) {
                    document.getElementById('create-post-btn').style.display = 'flex';
                }
                // Show chat button for logged-in users
                const chatBtn = document.getElementById('chat-toggle-btn');
                if (chatBtn) {
                    chatBtn.style.display = 'flex';
                    // Initialize chat with admin status
                    Chat.init(user.id, user.username, user.is_admin);
                }
            }
        } catch (error) {
        }
    }
    
    setupThemeToggle() {
        const themeBtn = document.getElementById('theme-toggle');
        const moonIcon = themeBtn.querySelector('.moon-icon');
        const sunIcon = themeBtn.querySelector('.sun-icon');
        
        themeBtn.addEventListener('click', () => {
            this.isDarkTheme = !this.isDarkTheme;
            
            if (this.isDarkTheme) {
                document.body.classList.remove('light-theme');
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
            } else {
                document.body.classList.add('light-theme');
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
            }
            
            localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
        });
    }
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            this.isDarkTheme = false;
            document.body.classList.add('light-theme');
            const themeBtn = document.getElementById('theme-toggle');
            const moonIcon = themeBtn.querySelector('.moon-icon');
            const sunIcon = themeBtn.querySelector('.sun-icon');
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    }
    
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (!mobileMenuBtn) return;
        
        mobileMenuBtn.addEventListener('click', () => {
            const desktopNav = document.querySelector('.desktop-nav');
            if (!desktopNav) return;
            
            // Toggle nav display on mobile
            const isHidden = desktopNav.style.display === 'none';
            desktopNav.style.cssText = `
                display: ${isHidden ? 'flex' : 'none'};
                position: absolute;
                top: 60px;
                left: 0;
                right: 0;
                background: var(--color-bg-secondary);
                flex-direction: column;
                gap: 0;
                border-bottom: 1px solid var(--color-border);
                padding: 12px 0;
                z-index: 1000;
            `;
            
            // Close menu when clicking elsewhere
            if (!isHidden) {
                setTimeout(() => {
                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('.desktop-nav') && !e.target.closest('#mobile-menu-btn')) {
                            desktopNav.style.display = 'none';
                        }
                    }, { once: true });
                }, 0);
            }
        });
    }
    
    setupUserMenu() {
        const userBtn = document.getElementById('user-menu-btn');
        
        userBtn.addEventListener('click', async () => {
            if (this.user) {
                // Remove existing dropdown if any
                const existingDropdown = document.getElementById('user-dropdown');
                if (existingDropdown) {
                    existingDropdown.remove();
                    return;
                }
                
                // Create dropdown menu
                const dropdown = document.createElement('div');
                dropdown.id = 'user-dropdown';
                dropdown.style.cssText = `
                    position: absolute;
                    top: 60px;
                    right: 20px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    min-width: 200px;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                `;
                
                dropdown.innerHTML = `
                    <div style="padding: 12px 0; border-bottom: 1px solid var(--color-border);">
                        <div style="padding: 8px 16px; font-size: 12px; color: var(--color-muted);">
                            ${this.user.email}
                        </div>
                        <div style="padding: 8px 16px; font-size: 12px; color: var(--color-primary); font-weight: bold;">
                            ${this.user.username.toUpperCase()}
                        </div>
                    </div>
                    <button onclick="router.navigate('/profile')" style="width: 100%; padding: 12px 16px; background: none; border: none; color: var(--color-fg); text-align: left; cursor: pointer; font-size: 14px; border-bottom: 1px solid var(--color-border); hover: background: var(--color-bg-tertiary);">
                        👤 VIEW PROFILE
                    </button>
                    <button onclick="window.app.logout()" style="width: 100%; padding: 12px 16px; background: none; border: none; color: var(--color-destructive); text-align: left; cursor: pointer; font-size: 14px;">
                        🚪 LOGOUT
                    </button>
                `;
                
                document.body.appendChild(dropdown);
                
                // Close dropdown when clicking elsewhere
                setTimeout(() => {
                    document.addEventListener('click', (e) => {
                        if (!e.target.closest('#user-menu-btn') && !e.target.closest('#user-dropdown')) {
                            dropdown.remove();
                        }
                    }, { once: true });
                }, 0);
            } else {
                router.navigate('/login');
            }
        });
    }
    
    async logout() {
        try {
            await API.logout();
            this.user = null;
            document.getElementById('user-status').textContent = 'ACCESS';
            document.getElementById('create-post-btn').style.display = 'none';
            const chatBtn = document.getElementById('chat-toggle-btn');
            if (chatBtn) {
                chatBtn.style.display = 'none';
            }
            const chatWindow = document.getElementById('chat-window');
            if (chatWindow) {
                chatWindow.style.display = 'none';
            }
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) dropdown.remove();
            if (Chat.socket) Chat.socket.disconnect();
            terminal.log('USER_LOGGED_OUT', 'warning');
            router.navigate('/');
        } catch (error) {
            terminal.log('LOGOUT_ERROR', 'error');
        }
    }
    
    registerRoutes() {
        router.register('/', Pages.home);
        router.register('/about', Pages.about);
        router.register('/login', Pages.login);
        router.register('/register', Pages.register);
        router.register('/forgot-password', Pages.forgotPassword);
        router.register('/admin', Pages.admin);
        router.register('/profile', Pages.profile);
        router.register('/post/:id', Pages.postDetail);
        router.register('/404', Pages.notFound);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new App();
    await window.app.init();
    terminal.log('APPLICATION_INITIALIZED', 'success');
    router.handleRoute();
    
    // Hide loading animation once app is ready
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('hidden');
            // Remove from DOM after animation completes
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 300);
});
