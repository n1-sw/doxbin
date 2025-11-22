/**
 * DEVELOPER TOOLS PROTECTION
 * Hides JS files from dev tools Sources panel when opened
 */

class DevToolsProtection {
    constructor() {
        this.devToolsOpen = false;
        this.isBlocked = false;
        this.init();
    }

    init() {
        this.detectDevTools();
        setInterval(() => this.detectDevTools(), 100);
        this.preventKeyboardShortcuts();
        document.addEventListener('contextmenu', (e) => {
            if (this.devToolsOpen) e.preventDefault();
        });
    }

    detectDevTools() {
        let isOpen = false;

        const threshold = 160;
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            isOpen = true;
        }

        try {
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                isOpen = true;
            }
        } catch (e) {}

        if (isOpen && !this.devToolsOpen) {
            this.devToolsOpen = true;
            this.blockSite();
        } else if (!isOpen && this.devToolsOpen) {
            this.devToolsOpen = false;
            this.unblockSite();
        }
    }

    blockSite() {
        if (this.isBlocked) return;
        this.isBlocked = true;

        const app = document.getElementById('app');
        const header = document.querySelector('.main-header');
        const footer = document.querySelector('.main-footer');
        const terminal = document.getElementById('terminal-container');
        const chat = document.getElementById('chat-window');

        if (app) app.style.display = 'none';
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (terminal) terminal.style.display = 'none';
        if (chat) chat.style.display = 'none';

        let overlay = document.getElementById('devtools-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'devtools-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0a0a0a;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            `;
            overlay.innerHTML = `
                <div style="text-align: center; color: #fff; font-family: monospace;">
                    <h1 style="color: #3b82f6; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4); margin-bottom: 20px;">
                        ⚠️ ACCESS_DENIED ⚠️
                    </h1>
                    <p style="font-size: 18px; margin-bottom: 10px;">Developer tools are not permitted</p>
                    <p style="font-size: 14px; color: #888;">Close developer tools to continue</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
        }

        this.disableAllInteractions();
    }

    unblockSite() {
        if (!this.isBlocked) return;
        this.isBlocked = false;

        const app = document.getElementById('app');
        const header = document.querySelector('.main-header');
        const footer = document.querySelector('.main-footer');
        const terminal = document.getElementById('terminal-container');
        const chat = document.getElementById('chat-window');

        if (app) app.style.display = '';
        if (header) header.style.display = '';
        if (footer) footer.style.display = '';
        if (terminal) terminal.style.display = '';
        if (chat) chat.style.display = '';

        const overlay = document.getElementById('devtools-overlay');
        if (overlay) overlay.style.display = 'none';

        this.enableAllInteractions();
    }

    preventKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.shiftKey && e.key === 'J') ||
                (e.ctrlKey && e.key === 'u') ||
                (e.metaKey && e.altKey && e.key === 'i')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            if (this.devToolsOpen) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);
    }

    disableAllInteractions() {
        const preventEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        document.addEventListener('mousedown', preventEvent, true);
        document.addEventListener('mouseup', preventEvent, true);
        document.addEventListener('click', preventEvent, true);
        document.addEventListener('keydown', preventEvent, true);
        document.addEventListener('keyup', preventEvent, true);
        document.addEventListener('keypress', preventEvent, true);
        document.addEventListener('touchstart', preventEvent, true);
        document.addEventListener('touchend', preventEvent, true);
        document.addEventListener('touchmove', preventEvent, true);
    }

    enableAllInteractions() {
        const preventEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        document.removeEventListener('mousedown', preventEvent, true);
        document.removeEventListener('mouseup', preventEvent, true);
        document.removeEventListener('click', preventEvent, true);
        document.removeEventListener('keydown', preventEvent, true);
        document.removeEventListener('keyup', preventEvent, true);
        document.removeEventListener('keypress', preventEvent, true);
        document.removeEventListener('touchstart', preventEvent, true);
        document.removeEventListener('touchend', preventEvent, true);
        document.removeEventListener('touchmove', preventEvent, true);
    }
}

window.devToolsProtection = new DevToolsProtection();
