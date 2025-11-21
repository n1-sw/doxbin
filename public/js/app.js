class App {
    constructor() {
        this.isDarkTheme = true;
        this.crtEnabled = true;
        this.user = null;
        
        this.init();
    }
    
    async init() {
        await this.loadUserState();
        this.setupThemeToggle();
        this.setupCRTToggle();
        this.setupUserMenu();
        this.registerRoutes();
        this.loadThemePreference();
    }
    
    async loadUserState() {
        try {
            const { user } = await API.getCurrentUser();
            if (user) {
                this.user = user;
                document.getElementById('user-status').textContent = user.username.toUpperCase();
            }
        } catch (error) {
            console.log('No active session');
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
                terminal.log('THEME_SWITCHED: DARK_MODE', 'info');
            } else {
                document.body.classList.add('light-theme');
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
                terminal.log('THEME_SWITCHED: LIGHT_MODE', 'info');
            }
            
            localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
        });
    }
    
    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.getElementById('theme-toggle').click();
        }
    }
    
    setupCRTToggle() {
        const crtBtn = document.getElementById('crt-toggle');
        const crtStatus = document.getElementById('crt-status');
        
        crtBtn.addEventListener('click', () => {
            this.crtEnabled = !this.crtEnabled;
            
            if (this.crtEnabled) {
                document.body.classList.add('crt-enabled');
                document.querySelector('.scanline').style.display = 'block';
                crtStatus.textContent = 'ON';
                terminal.log('CRT_EFFECT: ENABLED', 'success');
            } else {
                document.body.classList.remove('crt-enabled');
                document.querySelector('.scanline').style.display = 'none';
                crtStatus.textContent = 'OFF';
                terminal.log('CRT_EFFECT: DISABLED', 'warning');
            }
        });
    }
    
    setupUserMenu() {
        const userBtn = document.getElementById('user-menu-btn');
        
        userBtn.addEventListener('click', async () => {
            if (this.user) {
                const confirmLogout = confirm(`Logged in as ${this.user.email}. Logout?`);
                if (confirmLogout) {
                    try {
                        await API.logout();
                        this.user = null;
                        document.getElementById('user-status').textContent = 'ACCESS';
                        terminal.log('USER_LOGGED_OUT', 'warning');
                        router.navigate('/');
                    } catch (error) {
                        terminal.log('LOGOUT_ERROR', 'error');
                    }
                }
            } else {
                router.navigate('/login');
            }
        });
    }
    
    registerRoutes() {
        router.register('/', Pages.home);
        router.register('/tools', Pages.tools);
        router.register('/about', Pages.about);
        router.register('/login', Pages.login);
        router.register('/register', Pages.register);
        router.register('/admin', Pages.admin);
        router.register('/post/:id', Pages.postDetail);
        router.register('/404', Pages.notFound);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    terminal.log('APPLICATION_INITIALIZED', 'success');
});
