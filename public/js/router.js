class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }
    
    register(path, handler) {
        this.routes[path] = handler;
    }
    
    async handleRoute() {
        let hash = window.location.hash.slice(1) || '/';
        
        if (hash.startsWith('/post/')) {
            const id = hash.split('/')[2];
            if (this.routes['/post/:id']) {
                await this.routes['/post/:id'](id);
                this.updateNavigation('/');
                return;
            }
        }
        
        const handler = this.routes[hash] || this.routes['/404'];
        if (handler) {
            await handler();
            this.updateNavigation(hash);
        }
        
        this.currentRoute = hash;
    }
    
    updateNavigation(path) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + path) {
                link.classList.add('active');
            }
        });
    }
    
    navigate(path) {
        window.location.hash = path;
    }
}

window.router = new Router();
