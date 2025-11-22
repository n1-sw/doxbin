class Terminal {
    constructor() {
        this.container = document.getElementById('terminal-container');
        this.output = document.getElementById('terminal-output');
        this.restoreBtn = document.getElementById('terminal-restore');
        this.logs = [];
        this.isMinimized = false;
        
        this.setupControls();
        this.bootSequence();
    }
    
    setupControls() {
        document.getElementById('terminal-minimize').addEventListener('click', () => {
            this.minimize();
        });
        
        document.getElementById('terminal-close').addEventListener('click', () => {
            this.minimize();
        });
        
        this.restoreBtn.addEventListener('click', () => {
            this.restore();
        });
    }
    
    minimize() {
        this.isMinimized = true;
        this.container.classList.add('minimized');
        this.restoreBtn.style.display = 'block';
    }
    
    restore() {
        this.isMinimized = false;
        this.container.classList.remove('minimized');
        this.restoreBtn.style.display = 'none';
    }
    
    bootSequence() {
        const bootLogs = [
            { msg: 'INITIALIZING_SECURE_PROTOCOL_V2...', type: 'info' },
            { msg: 'CONNECTING_TO_ENCRYPTED_NODE_MESH...', type: 'warning' },
            { msg: 'CONNECTION_ESTABLISHED: 192.168.X.X', type: 'success' },
            { msg: 'LISTENING_FOR_PACKETS...', type: 'info' }
        ];
        
        bootLogs.forEach((log, index) => {
            setTimeout(() => {
                this.log(log.msg, log.type);
            }, index * 800);
        });
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const logEntry = { timestamp, message, type };
        
        this.logs.push(logEntry);
        if (this.logs.length > 30) { // Reduced from 50 to 30 for better performance
            this.logs.shift();
        }
        
        // Batch renders with requestAnimationFrame for better performance
        if (!this.renderScheduled) {
            this.renderScheduled = true;
            requestAnimationFrame(() => {
                this.render();
                this.renderScheduled = false;
            });
        }
    }
    
    render() {
        this.output.innerHTML = this.logs.map(log => `
            <div class="terminal-log">
                <span class="log-time">[${log.timestamp}]</span>
                <span class="log-message ${log.type}">› ${log.message}</span>
            </div>
        `).join('') + '<div class="log-message" style="animation: blink 1s infinite;">_</div>';
        
        this.output.scrollTop = this.output.scrollHeight;
    }
}

window.terminal = new Terminal();
