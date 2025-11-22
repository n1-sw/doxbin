// Safe terminal logger that checks if terminal exists
const safeLog = (message, type = 'info') => {
    if (typeof terminal !== 'undefined' && terminal.log) {
        terminal.log(message, type);
    }
};

// HTML escape function to prevent XSS
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Format duration with proper pluralization
const formatDuration = (days) => {
    if (days === 1) return '1 day';
    if (days < 1) return 'Today';
    return `${days} days`;
};

const Pages = {
    async home() {
        const appEl = document.getElementById('app');
        appEl.innerHTML = '<div class="loading">Loading database...</div>';
        
        try {
            const [{ posts }, { totalUsers }] = await Promise.all([
                API.getPosts(),
                API.getStats()
            ]);
            const totalEntries = posts.length;
            const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
            
            const html = `
                <div class="container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">TOTAL ENTRIES</div>
                            <div class="stat-value">${totalEntries}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">ACTIVE USERS</div>
                            <div class="stat-value">${totalUsers}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">TOTAL VIEWS</div>
                            <div class="stat-value">${(totalViews / 1000).toFixed(1)}k</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">SYSTEM STATUS</div>
                            <div class="stat-value" style="font-size: 18px; color: var(--color-primary);">● ONLINE</div>
                        </div>
                    </div>
                    
                    <div class="section-header">
                        › LATEST_LEAKS_DATABASE
                    </div>
                    <p style="font-size: 11px; color: var(--color-muted); margin-bottom: 16px;">
                        Sorted by: DATE_ADDED (DESC) // Displaying ${posts.length} entries
                    </p>
                    
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>📁 SUBJECT / FILENAME</th>
                                    <th>⚠ RISK LEVEL</th>
                                    <th>👤 UPLOADER</th>
                                    <th>📅 DATE</th>
                                    <th>👁 ACTIVITY</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${posts.map(post => `
                                    <tr style="cursor: pointer;" onclick="router.navigate('/post/${post.id}')">
                                        <td>${post.title} <span class="badge low">NEW</span></td>
                                        <td><span class="badge ${post.risk_level}">${post.risk_level.toUpperCase()}</span></td>
                                        <td>🔴 ${post.uploader_name || 'Admin'}</td>
                                        <td>${new Date(post.created_at).toISOString().split('T')[0]}</td>
                                        <td>👁 ${(post.views / 1000).toFixed(1)}k 💬 ${post.comments || 0}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            
            appEl.innerHTML = html;
            safeLog('PAGE_LOADED: DATABASE_INDEX', 'success');
        } catch (error) {
            appEl.innerHTML = `
                <div class="container">
                    <div class="card" style="text-align: center; padding: 64px; color: var(--color-destructive);">
                        <h2>ERROR: FAILED_TO_LOAD_DATABASE</h2>
                        <p style="margin-top: 16px; color: var(--color-muted);">${error.message}</p>
                    </div>
                </div>
            `;
            safeLog('ERROR: FAILED_TO_LOAD_DATABASE', 'error');
        }
    },
    
    tools() {
        const html = `
            <div class="container" style="max-width: 800px;">
                <div style="margin-bottom: 32px; border-bottom: 1px solid var(--color-border); padding-bottom: 16px;">
                    <h1 style="font-size: 28px; font-weight: bold; color: var(--color-primary); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <svg class="icon" style="width: 32px; height: 32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
                        </svg>
                        CRYPTO_TOOLS_V1.0
                    </h1>
                    <p style="font-size: 12px; color: var(--color-muted);">Educational suite for data obfuscation and analysis.</p>
                </div>
                
                <div class="card">
                    <div class="form-group">
                        <label class="form-label">Input Data</label>
                        <textarea id="tool-input" class="form-textarea" placeholder="Enter text to process..."></textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px;">
                        <button class="btn btn-primary" onclick="Pages.processTool('encrypt')">BASE64</button>
                        <button class="btn btn-primary" onclick="Pages.processTool('decrypt')">DECODE</button>
                        <button class="btn btn-primary" onclick="Pages.processTool('hash')">HASH</button>
                        <button class="btn btn-primary" onclick="Pages.processTool('binary')">BINARY</button>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Output Result</label>
                        <textarea id="tool-output" class="form-textarea" readonly placeholder="Results will appear here..."></textarea>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        safeLog('PAGE_LOADED: CRYPTO_TOOLS', 'info');
    },
    
    processTool(mode) {
        const input = document.getElementById('tool-input').value;
        const output = document.getElementById('tool-output');
        
        if (!input) {
            safeLog('TOOL_ERROR: NO_INPUT_PROVIDED', 'error');
            return;
        }
        
        let result = '';
        try {
            switch(mode) {
                case 'encrypt':
                    result = btoa(input);
                    safeLog(`ENCODING_DATA_PACKET: ${input.length} BYTES`, 'info');
                    break;
                case 'decrypt':
                    result = atob(input);
                    safeLog('DECODING_DATA_STREAM...', 'success');
                    break;
                case 'hash':
                    result = Array.from(input).reduce((hash, char) => 
                        0 | (31 * hash + char.charCodeAt(0)), 0
                    ).toString(16).toUpperCase().padStart(32, '0');
                    safeLog('GENERATING_HASH_SIGNATURE...', 'warning');
                    break;
                case 'binary':
                    result = input.split('').map(char => 
                        char.charCodeAt(0).toString(2).padStart(8, '0')
                    ).join(' ');
                    safeLog('CONVERTING_TO_BINARY_STREAM...', 'info');
                    break;
            }
            output.value = result;
            safeLog('OPERATION_COMPLETE', 'success');
        } catch (e) {
            safeLog('OPERATION_FAILED: INVALID_INPUT', 'error');
            output.value = 'ERROR: Invalid input for this operation';
        }
    },
    
    about() {
        const html = `
            <div class="container" style="max-width: 900px;">
                <div style="margin-bottom: 32px;">
                    <div style="font-size: 12px; color: var(--color-primary); margin-bottom: 16px;">
                        <span id="typing-text"></span><span style="animation: blink 1s infinite;">_</span>
                    </div>
                    
                    <div style="border-left: 2px solid var(--color-primary); padding-left: 24px; margin-bottom: 32px;">
                        <h1 style="font-size: 48px; font-weight: 900; color: var(--color-fg); margin-bottom: 16px;" class="glitch-text" data-text="ABOUT_SCXBIN">
                            ABOUT_SCXBIN
                        </h1>
                        <p style="font-size: 16px; color: var(--color-muted); line-height: 1.6;">
                            SCXBIN is a modern, security-focused platform for sharing and managing information with a sleek, professional design.
                            Built with advanced encryption, real-time collaboration features, and a powerful database system for educational and security purposes.
                        </p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px;">
                    <!-- Website Info -->
                    <div class="card">
                        <h2 style="color: var(--color-primary); margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">📱 WEBSITE_INFO</h2>
                        <div style="font-size: 13px; color: var(--color-muted); line-height: 1.8;">
                            <p><strong style="color: var(--color-fg);">Name:</strong> SCXBIN - BD Expose</p>
                            <p><strong style="color: var(--color-fg);">Purpose:</strong> Security Information Sharing Platform</p>
                            <p><strong style="color: var(--color-fg);">Launch Date:</strong> November 2025</p>
                            <p><strong style="color: var(--color-fg);">Status:</strong> <span style="color: var(--color-success);">● ACTIVE & ONLINE</span></p>
                            <p><strong style="color: var(--color-fg);">Technology:</strong> Node.js, Express, PostgreSQL, Socket.IO</p>
                        </div>
                    </div>
                    
                    <!-- Admin Info -->
                    <div class="card">
                        <h2 style="color: var(--color-primary); margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">👤 ADMIN_INFO</h2>
                        <div style="font-size: 13px; color: var(--color-muted); line-height: 1.8;">
                            <p><strong style="color: var(--color-fg);">Administrator:</strong> Admin</p>
                            <p><strong style="color: var(--color-fg);">Email:</strong> admin@scxbin.local</p>
                            <p><strong style="color: var(--color-fg);">Role:</strong> System Administrator & Content Manager</p>
                            <p><strong style="color: var(--color-fg);">Responsibilities:</strong> Post management, user oversight, system security</p>
                            <p><strong style="color: var(--color-fg);">Availability:</strong> 24/7 System Monitoring</p>
                        </div>
                    </div>
                </div>
                
                <!-- Developer Info -->
                <div class="card" style="margin-bottom: 32px;">
                    <h2 style="color: var(--color-primary); margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">👨‍💻 DEVELOPER_INFO</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div style="font-size: 13px; color: var(--color-muted); line-height: 1.8;">
                            <p><strong style="color: var(--color-fg);">Lead Developer:</strong> CEO. DAMON</p>
                            <p><strong style="color: var(--color-fg);">Title:</strong> Full Stack Developer & Architect</p>
                            <p><strong style="color: var(--color-fg);">Expertise:</strong> Backend, Frontend, Database Design, Security</p>
                            <p><strong style="color: var(--color-fg);">Website:</strong> <a href="https://damon.dev" target="_blank" style="color: var(--color-primary); text-decoration: none;">https://damon.dev</a></p>
                            <p><strong style="color: var(--color-fg);">Experience:</strong> Full-stack web development with modern frameworks</p>
                        </div>
                        <div style="font-size: 13px; color: var(--color-muted); line-height: 1.8;">
                            <p><strong style="color: var(--color-fg);">Key Contributions:</strong></p>
                            <ul style="margin-left: 16px; margin-top: 8px; list-style: none;">
                                <li>✓ System architecture & database design</li>
                                <li>✓ Real-time messaging (Socket.IO)</li>
                                <li>✓ User authentication & security</li>
                                <li>✓ Media upload & file management</li>
                                <li>✓ UI/UX design & optimization</li>
                                <li>✓ Performance tuning & deployment</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Features -->
                <div class="card">
                    <h2 style="color: var(--color-primary); margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">⚡ KEY_FEATURES</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; color: var(--color-muted);">
                        <div>
                            <p>🔐 Secure Authentication & Sessions</p>
                            <p>📸 Image & Video Upload Support</p>
                            <p>💬 Real-time Live Chat System</p>
                            <p>👁 View Counter Tracking</p>
                        </div>
                        <div>
                            <p>💭 Comment System with XSS Protection</p>
                            <p>🎨 Dark/Light Theme Toggle</p>
                            <p>📊 Admin Dashboard & Analytics</p>
                            <p>🔄 Persistent Data Storage (PostgreSQL)</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        
        const fullText = "LOADING_WEBSITE_INFORMATION... INITIALIZING_TEAM_DATA... [COMPLETE]";
        const typingEl = document.getElementById('typing-text');
        let i = 0;
        const typeInterval = setInterval(() => {
            typingEl.textContent = fullText.slice(0, i);
            i++;
            if (i > fullText.length) clearInterval(typeInterval);
        }, 50);
        
        safeLog('PAGE_LOADED: ABOUT_SCXBIN', 'info');
    },
    
    login() {
        const html = `
            <div class="container" style="padding: 40px 16px;">
                <div class="section-header" style="margin-bottom: 40px;">
                    › ACCESS_PORTAL
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 40px;">
                    <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 12px; padding: 40px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="text-align: center; margin-bottom: 36px;">
                            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">🔐</div>
                            <h1 style="font-size: 32px; font-weight: 900; color: var(--color-primary); margin-bottom: 8px; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                AUTHENTICATE
                            </h1>
                            <p style="font-size: 12px; color: var(--color-muted); letter-spacing: 1px;">
                                SECURE_ACCESS_REQUIRED
                            </p>
                        </div>
                        
                        <div style="max-width: 500px; margin: 0 auto;">
                            <form onsubmit="Pages.handleLogin(event)">
                                <div class="form-group">
                                    <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">EMAIL ADDRESS</label>
                                    <input type="email" id="login-email" class="form-input" placeholder="user@domain.com" required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">PASSWORD</label>
                                    <input type="password" id="login-password" class="form-input" placeholder="••••••••" required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                                </div>
                                
                                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px; margin-bottom: 16px;">
                                    ▶ LOGIN_NOW
                                </button>
                            </form>
                            
                            <div style="text-align: center; padding: 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 12px;">
                                <p style="font-size: 12px; color: var(--color-muted); margin: 0;">
                                    NO_ACCOUNT? 
                                    <a href="#/register" style="color: var(--color-primary); text-decoration: none; font-weight: 700; text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);">CREATE_ONE</a>
                                </p>
                            </div>
                            
                            <div style="text-align: center; padding: 12px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 8px;">
                                <p style="font-size: 12px; color: var(--color-muted); margin: 0;">
                                    FORGOT_PASSWORD? 
                                    <a href="#/forgot-password" style="color: var(--color-primary); text-decoration: none; font-weight: 700; text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);">RESET_HERE</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        safeLog('PAGE_LOADED: LOGIN_PORTAL', 'info');
    },
    
    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        safeLog('AUTHENTICATING_USER...', 'info');
        
        try {
            const { user } = await API.login(email, password);
            safeLog(`AUTH_SUCCESS: USER_${user.username.toUpperCase()}_AUTHENTICATED`, 'success');
            safeLog('SESSION_TOKEN_GENERATED', 'info');
            
            document.getElementById('user-status').textContent = user.username.toUpperCase();
            window.app.user = user;
            router.navigate('/');
        } catch (error) {
            safeLog('AUTH_ERROR: INVALID_CREDENTIALS', 'error');
            alert('Login failed: ' + error.message);
        }
    },
    
    register() {
        const html = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--color-bg); position: relative; overflow: hidden;">
                <div style="position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%); border-radius: 50%; top: -150px; right: -150px; filter: blur(40px);"></div>
                <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%); border-radius: 50%; bottom: -120px; left: -120px; filter: blur(40px);"></div>
                
                <div class="container" style="max-width: 450px; width: 100%; position: relative; z-index: 10; padding: 16px;">
                    <div style="background: var(--color-bg-secondary); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 16px; padding: 48px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">✨</div>
                            <h1 style="font-size: 36px; font-weight: 900; color: var(--color-primary); margin-bottom: 8px; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                JOIN NETWORK
                            </h1>
                            <p style="font-size: 13px; color: var(--color-muted); letter-spacing: 1px;">
                                CREATE_NEW_ACCOUNT
                            </p>
                        </div>
                        
                        <form onsubmit="Pages.handleRegister(event)">
                            <div class="form-group">
                                <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">EMAIL ADDRESS</label>
                                <input type="email" id="reg-email" class="form-input" placeholder="user@domain.com" required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">USERNAME</label>
                                <input type="text" id="reg-username" class="form-input" placeholder="Choose your handle" required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">PASSWORD (MIN 6)</label>
                                <input type="password" id="reg-password" class="form-input" placeholder="••••••••" required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                            </div>
                            
                            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px;">
                                ▶ REGISTER_ACCOUNT
                            </button>
                        </form>
                        
                        <div style="margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--color-border); text-align: center;">
                            <p style="font-size: 13px; color: var(--color-muted);">
                                ALREADY_REGISTERED? 
                                <a href="#/login" style="color: var(--color-primary); text-decoration: none; font-weight: 700; transition: all 0.2s; text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);">LOGIN_HERE</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        safeLog('PAGE_LOADED: REGISTRATION_PORTAL', 'warning');
    },
    
    async handleRegister(event) {
        event.preventDefault();
        const email = document.getElementById('reg-email').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        
        if (password.length < 6) {
            safeLog('REG_ERROR: PASSWORD_TOO_SHORT', 'error');
            alert('Password must be at least 6 characters');
            return;
        }
        
        safeLog('CREATING_NEW_USER_ACCOUNT...', 'info');
        
        try {
            const { user } = await API.register(email, username, password);
            safeLog(`REG_SUCCESS: USER_${user.username.toUpperCase()}_CREATED`, 'success');
            safeLog('SESSION_TOKEN_GENERATED', 'info');
            
            document.getElementById('user-status').textContent = user.username.toUpperCase();
            window.app.user = user;
            router.navigate('/');
        } catch (error) {
            safeLog('REG_ERROR: REGISTRATION_FAILED', 'error');
            alert('Registration failed: ' + error.message);
        }
    },
    
    async admin() {
        const appEl = document.getElementById('app');
        
        // Check if user is admin
        if (!window.app.user || !window.app.user.is_admin) {
            appEl.innerHTML = `
                <div class="container" style="text-align: center; padding: 64px 16px;">
                    <div class="card" style="padding: 64px;">
                        <svg style="width: 64px; height: 64px; color: var(--color-destructive); margin-bottom: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <h2 style="color: var(--color-fg); margin-bottom: 8px;">Access Denied</h2>
                        <p style="color: var(--color-muted); margin-bottom: 24px;">Admin privileges required to access this area</p>
                        <a href="#/" class="btn btn-primary">Go to Home</a>
                    </div>
                </div>
            `;
            safeLog('ACCESS_DENIED: ADMIN_ONLY', 'error');
            return;
        }
        
        const html = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 120px); background: var(--color-bg); position: relative; overflow: hidden;">
                <div style="position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%); border-radius: 50%; top: -150px; right: -150px; filter: blur(40px);"></div>
                <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%); border-radius: 50%; bottom: -120px; left: -120px; filter: blur(40px);"></div>
                
                <div class="container" style="max-width: 900px; width: 100%; position: relative; z-index: 10; padding: 32px 16px;">
                    <a href="#/" class="btn btn-secondary" style="margin-bottom: 32px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); color: var(--color-primary); padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; font-weight: 600;">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Home
                    </a>
                
                    <div style="margin-bottom: 40px; background: var(--color-bg-secondary); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 16px; padding: 40px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">📝</div>
                            <div>
                                <h1 style="font-size: 36px; font-weight: 900; color: var(--color-primary); margin: 0; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                    CREATE_NEW_POST
                                </h1>
                                <p style="font-size: 13px; color: var(--color-muted); margin: 8px 0 0; letter-spacing: 0.5px;">
                                    PUBLISH_CONTENT_TO_NETWORK
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 40px; background: var(--color-bg-secondary); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 16px; padding: 40px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">🔐</div>
                            <div>
                                <h1 style="font-size: 36px; font-weight: 900; color: var(--color-primary); margin: 0; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                    CHANGE_PASSWORD
                                </h1>
                                <p style="font-size: 13px; color: var(--color-muted); margin: 8px 0 0; letter-spacing: 0.5px;">
                                    UPDATE_ADMIN_CREDENTIALS
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 16px; padding: 40px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15); margin-bottom: 40px;">
                        <form onsubmit="Pages.handleChangePassword(event)">
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">CURRENT PASSWORD</label>
                            <input type="password" id="current-password" class="form-input" placeholder="Enter your current password..." required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">NEW PASSWORD</label>
                            <input type="password" id="new-password" class="form-input" placeholder="Enter new password (min 6 characters)..." required minlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">CONFIRM NEW PASSWORD</label>
                            <input type="password" id="confirm-password" class="form-input" placeholder="Confirm your new password..." required minlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                            <button type="submit" id="change-password-btn" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px;">
                                🔒 UPDATE_PASSWORD
                            </button>
                        </form>
                    </div>

                    <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 16px; padding: 40px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <form onsubmit="Pages.handleCreatePost(event)" enctype="multipart/form-data">
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">POST TITLE</label>
                            <input type="text" id="post-title" class="form-input" placeholder="Enter a compelling title..." required maxlength="200" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">CONTENT / DESCRIPTION</label>
                            <textarea id="post-content" class="form-textarea" placeholder="Write your post content here..." style="min-height: 250px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">RISK LEVEL</label>
                            <select id="post-risk" class="form-input" required style="padding: 12px 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg);">
                                <option value="" style="background: var(--color-bg-tertiary); color: var(--color-fg);">Select risk level...</option>
                                <option value="low" style="background: var(--color-bg-tertiary); color: var(--color-fg);">Low Risk</option>
                                <option value="medium" style="background: var(--color-bg-tertiary); color: var(--color-fg);">Medium Risk</option>
                                <option value="high" style="background: var(--color-bg-tertiary); color: var(--color-fg);">High Risk</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">UPLOAD MEDIA (OPTIONAL)</label>
                            <div style="border: 2px dashed var(--color-primary); border-radius: 8px; padding: 32px; text-align: center; background: var(--color-bg-tertiary); cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);" onclick="document.getElementById('post-media').click()">
                                <input type="file" id="post-media" style="display: none;" accept="image/*,video/*" onchange="Pages.handleFileSelect(event)">
                                <svg style="width: 48px; height: 48px; color: var(--color-primary); margin: 0 auto 12px; filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <p style="color: var(--color-fg); margin: 0 0 4px; font-weight: 600;">Click to upload media</p>
                                <p style="color: var(--color-muted); font-size: 12px; margin: 0;">Images (JPG, PNG, GIF) or Videos (MP4, WebM)</p>
                            </div>
                            <div id="file-preview" style="margin-top: 16px;"></div>
                        </div>
                        
                            <button type="submit" id="submit-btn" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px;">
                                ▶ PUBLISH_POST
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        appEl.innerHTML = html;
        safeLog('PAGE_LOADED: ADMIN_PANEL', 'info');
    },
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        const previewDiv = document.getElementById('file-preview');
        
        if (!file) {
            previewDiv.innerHTML = '';
            return;
        }
        
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
            alert('Please select an image or video file');
            event.target.value = '';
            previewDiv.innerHTML = '';
            return;
        }
        
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            alert('File size must be less than 100MB');
            event.target.value = '';
            previewDiv.innerHTML = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            let preview = `
                <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; background: var(--color-bg-secondary);">
                    <div style="display: flex; gap: 12px; align-items: center;">
                        ${isImage ? `<img src="${e.target.result}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;">` : `<div style="width: 80px; height: 80px; background: var(--color-bg); border-radius: 6px; display: flex; align-items: center; justify-content: center;"><svg style="width: 40px; height: 40px; color: var(--color-muted);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></div>`}
                        <div style="flex: 1; min-width: 0;">
                            <p style="margin: 0 0 4px; color: var(--color-fg); font-weight: 500; word-break: break-word;">${file.name}</p>
                            <p style="margin: 0; color: var(--color-muted); font-size: 12px;">${sizeMB} MB • ${isImage ? 'Image' : 'Video'}</p>
                        </div>
                        <button type="button" onclick="document.getElementById('post-media').value=''; document.getElementById('file-preview').innerHTML=''; return false;" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Remove</button>
                    </div>
                </div>
            `;
            previewDiv.innerHTML = preview;
        };
        reader.readAsDataURL(file);
    },
    
    async handleChangePassword(event) {
        event.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitBtn = document.getElementById('change-password-btn');
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Updating...';
        
        try {
            await API.changePassword(currentPassword, newPassword);
            safeLog('PASSWORD_CHANGED_SUCCESSFULLY', 'success');
            alert('Password changed successfully!');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Update Password';
            safeLog('PASSWORD_CHANGE_FAILED', 'error');
            alert('Password change failed: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '🔒 UPDATE_PASSWORD';
        }
    },
    
    async handleCreatePost(event) {
        event.preventDefault();
        
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const risk_level = document.getElementById('post-risk').value;
        const mediaFile = document.getElementById('post-media').files[0];
        const submitBtn = document.getElementById('submit-btn');
        
        if (!title || !content || !risk_level) {
            alert('Please fill in all required fields');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing...';
        
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('risk_level', risk_level);
            if (mediaFile) {
                formData.append('media', mediaFile);
            }
            
            await API.createPost(formData);
            safeLog('POST_CREATED_SUCCESSFULLY', 'success');
            alert('Post published successfully!');
            router.navigate('/');
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Post';
            safeLog('POST_CREATION_FAILED: ' + error.message, 'error');
            alert('Failed to create post: ' + error.message);
        }
    },
    
    async postDetail(id) {
        const appEl = document.getElementById('app');
        appEl.innerHTML = '<div class="loading">Loading post...</div>';
        
        try {
            const [{ post }, { comments }] = await Promise.all([
                API.getPost(id),
                API.getComments(id)
            ]);
            
            const currentUser = window.app?.user;
            
            const html = `
                <div class="container" style="max-width: 900px;">
                    <a href="#/" class="btn btn-secondary" style="margin-bottom: 32px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); color: var(--color-primary); padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; font-weight: 600;">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Home
                    </a>
                    
                    <div class="post-card">
                        <div class="post-header">
                            <div>
                                <h1 style="font-size: 32px; font-weight: 700; color: var(--color-fg); margin-bottom: 12px;">
                                    ${post.title}
                                </h1>
                                <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                                    <span style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--color-muted);">
                                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        ${post.uploader_name || 'Admin'}
                                    </span>
                                    <span style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--color-muted);">
                                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        ${new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                    <span class="badge ${post.risk_level}">${post.risk_level.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                        
                        ${post.video_url ? `
                            <video class="post-video" controls>
                                <source src="${post.video_url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        ` : post.image_url ? `
                            <img class="post-image" src="${post.image_url}" alt="${post.title}">
                        ` : ''}
                        
                        <div class="post-content">
                            ${post.content.split('\n').map(p => `<p>${p}</p>`).join('')}
                        </div>
                        
                        <div class="post-meta">
                            <span id="view-count-${id}">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                                ${post.views} views
                            </span>
                            <span>
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                ${post.comments || 0} comments
                            </span>
                        </div>
                        
                        <div class="share-buttons">
                            <button class="share-btn" onclick="Pages.sharePost('${post.title}', ${id})">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                </svg>
                                Share
                            </button>
                            <button class="share-btn" onclick="Pages.copyLink(${id})">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                </svg>
                                Copy Link
                            </button>
                            ${currentUser && currentUser.is_admin ? `
                                <button class="share-btn" onclick="Pages.deletePost(${id})" style="color: var(--color-destructive);">
                                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="comments-section">
                        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Comments (${comments.length})</h2>
                        
                        ${currentUser ? `
                            <div style="margin-bottom: 24px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px;">
                                <form onsubmit="Pages.handleAddComment(event, ${id})">
                                    <textarea id="comment-input-${id}" class="form-textarea" placeholder="Write a comment..." required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px; resize: vertical;"></textarea>
                                    <button type="submit" class="btn btn-primary" style="margin-top: 12px; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);">Post Comment</button>
                                </form>
                            </div>
                        ` : `
                            <div style="margin-bottom: 24px; text-align: center; padding: 32px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 12px;">
                                <p style="color: var(--color-muted); margin-bottom: 16px;">Sign in to leave a comment</p>
                                <a href="#/login" class="btn btn-primary" style="background: var(--color-primary); border: 1px solid var(--color-primary); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 700;">Sign In</a>
                            </div>
                        `}
                        
                        <div id="comments-list-${id}">
                            ${comments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <span class="comment-author">${escapeHtml(comment.username)}</span>
                                        <span class="comment-time">${new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <div class="comment-body">${escapeHtml(comment.content)}</div>
                                </div>
                            `).join('')}
                            ${comments.length === 0 ? '<p style="color: var(--color-muted); text-align: center; padding: 32px;">No comments yet. Be the first to comment!</p>' : ''}
                        </div>
                    </div>
                </div>
            `;
            
            appEl.innerHTML = html;
            
            // Start real-time view counter
            Pages.startViewCounter(id);
        } catch (error) {
            Pages.notFound();
        }
    },
    
    async handleAddComment(event, postId) {
        event.preventDefault();
        const input = document.getElementById(`comment-input-${postId}`);
        const content = input.value.trim();
        
        if (!content) return;
        
        try {
            await API.createComment(postId, content);
            input.value = '';
            router.navigate(`/post/${postId}`);
        } catch (error) {
            alert('Failed to post comment: ' + error.message);
        }
    },
    
    sharePost(title, id) {
        if (navigator.share) {
            navigator.share({
                title: title,
                url: window.location.origin + '/#/post/' + id
            }).catch(() => {});
        } else {
            Pages.copyLink(id);
        }
    },
    
    copyLink(id) {
        const url = window.location.origin + '/#/post/' + id;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy link');
        });
    },
    
    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }
        
        try {
            await API.deletePost(postId);
            safeLog('POST_DELETED_SUCCESSFULLY', 'success');
            router.navigate('/');
        } catch (error) {
            safeLog('POST_DELETE_FAILED: ' + error.message, 'error');
            alert('Failed to delete post: ' + error.message);
        }
    },
    
    async profile() {
        const appEl = document.getElementById('app');
        appEl.innerHTML = '<div class="loading">Loading profile...</div>';
        
        try {
            const { user } = await API.getCurrentUser();
            if (!user) {
                router.navigate('/login');
                return;
            }
            
            const { posts } = await API.getPosts();
            const userPosts = posts.filter(p => p.uploader_id === user.id);
            const totalComments = posts.reduce((sum, p) => sum + (p.comments || 0), 0);
            
            const html = `
                <div class="container" style="max-width: 950px; padding: 32px 16px;">
                    <a href="#/" class="btn btn-secondary" style="margin-bottom: 32px; background: var(--color-bg-secondary); border: 1px solid var(--color-border); color: var(--color-primary); padding: 10px 20px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease; font-weight: 600;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px;">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Home
                    </a>
                    
                    <div style="background: var(--color-bg-secondary); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 16px; padding: 40px; margin-bottom: 32px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="display: flex; gap: 32px; align-items: flex-start;">
                            <div style="width: 140px; height: 140px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">
                                <svg style="width: 70px; height: 70px; color: var(--color-primary);" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                    <h1 style="font-size: 36px; font-weight: 900; color: var(--color-primary); margin: 0; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                        ${escapeHtml(user.username).toUpperCase()}
                                    </h1>
                                    <div style="padding: 6px 14px; background: ${user.is_admin ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #10b981, #059669)'}; color: white; border-radius: 20px; font-size: 12px; font-weight: 700;">
                                        ${user.is_admin ? '👑 ADMIN' : '✨ USER'}
                                    </div>
                                </div>
                                <p style="font-size: 14px; color: var(--color-muted); margin-bottom: 24px; letter-spacing: 0.5px;">MEMBER_OF_SCXBIN</p>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
                                    <div style="padding: 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 12px;">
                                        <div style="font-size: 11px; color: var(--color-primary); font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Email</div>
                                        <div style="color: var(--color-fg); font-size: 13px; font-weight: 600;">${escapeHtml(user.email)}</div>
                                    </div>
                                    <div style="padding: 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 12px;">
                                        <div style="font-size: 11px; color: var(--color-primary); font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Joined</div>
                                        <div style="color: var(--color-fg); font-size: 13px; font-weight: 600;">${user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Nov 21, 2025'}</div>
                                    </div>
                                    <div style="padding: 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 12px;">
                                        <div style="font-size: 11px; color: var(--color-primary); font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Member For</div>
                                        <div style="color: var(--color-fg); font-size: 13px; font-weight: 600;">${user.created_at ? formatDuration(Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))) : formatDuration(1)}</div>
                                    </div>
                                    <div style="padding: 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 12px;">
                                        <div style="font-size: 11px; color: var(--color-primary); font-weight: 700; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Posts Created</div>
                                        <div style="color: var(--color-fg); font-size: 13px; font-weight: 600;">${userPosts.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 32px; background: var(--color-bg-secondary); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 16px; padding: 40px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">🔐</div>
                            <div>
                                <h1 style="font-size: 28px; font-weight: 900; color: var(--color-primary); margin: 0; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                    CHANGE_PASSWORD
                                </h1>
                                <p style="font-size: 13px; color: var(--color-muted); margin: 8px 0 0; letter-spacing: 0.5px;">
                                    UPDATE_YOUR_CREDENTIALS
                                </p>
                            </div>
                        </div>
                        
                        <form onsubmit="Pages.handleChangePassword(event)">
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">CURRENT PASSWORD</label>
                            <input type="password" id="current-password" class="form-input" placeholder="Enter your current password..." required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">NEW PASSWORD</label>
                            <input type="password" id="new-password" class="form-input" placeholder="Enter new password (min 6 characters)..." required minlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">CONFIRM NEW PASSWORD</label>
                            <input type="password" id="confirm-password" class="form-input" placeholder="Confirm your new password..." required minlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                        </div>
                        
                            <button type="submit" id="change-password-btn" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px;">
                                🔒 UPDATE_PASSWORD
                            </button>
                        </form>
                    </div>

                    ${user.is_admin ? `
                        <div style="margin-bottom: 32px;">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
                                    <svg style="width: 22px; height: 22px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                </div>
                                <h2 style="font-size: 20px; font-weight: 900; color: var(--color-primary); margin: 0; text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);">
                                    YOUR POSTS
                                </h2>
                            </div>
                            <div style="display: grid; gap: 16px;">
                                ${userPosts.length > 0 ? userPosts.map(post => `
                                    <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 12px; padding: 20px; transition: all 0.3s ease; box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);">
                                        <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 12px;">
                                            <h3 style="color: var(--color-primary); font-size: 15px; font-weight: 700; cursor: pointer; flex: 1; margin: 0;" onclick="router.navigate('/post/${post.id}')">${escapeHtml(post.title)}</h3>
                                            <button onclick="Pages.deletePost(${post.id})" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-destructive); color: var(--color-destructive); cursor: pointer; font-size: 13px; padding: 6px 12px; border-radius: 6px; transition: all 0.2s; font-weight: 600;">
                                                🗑 Delete
                                            </button>
                                        </div>
                                        <p style="color: var(--color-muted); font-size: 13px; margin: 0 0 12px; line-height: 1.6; cursor: pointer;" onclick="router.navigate('/post/${post.id}')">${escapeHtml(post.content.substring(0, 120))}${post.content.length > 120 ? '...' : ''}</p>
                                        <div style="display: flex; gap: 20px; font-size: 12px; color: var(--color-muted);">
                                            <span style="display: flex; align-items: center; gap: 4px;">👁 ${post.views || 0}</span>
                                            <span style="display: flex; align-items: center; gap: 4px;">💬 ${post.comments || 0}</span>
                                            <span style="display: flex; align-items: center; gap: 4px;">📅 ${new Date(post.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div style="padding: 32px; text-align: center; color: var(--color-muted); background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 12px;">
                                        <p style="margin: 0; font-size: 14px;">No posts uploaded yet. Create your first post!</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);">
                        <button onclick="window.app.logout()" style="background: var(--color-destructive); border: 1px solid var(--color-destructive); color: white; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(239, 68, 68, 0.3); letter-spacing: 0.5px;">
                            🚪 LOGOUT
                        </button>
                    </div>
                </div>
            `;
            
            appEl.innerHTML = html;
            safeLog('PAGE_LOADED: USER_PROFILE', 'success');
        } catch (error) {
            appEl.innerHTML = `
                <div class="container" style="text-align: center; padding: 64px 16px;">
                    <h2 style="color: var(--color-destructive); margin-bottom: 16px;">ERROR: PROFILE_LOAD_FAILED</h2>
                    <p style="color: var(--color-muted); margin-bottom: 32px;">${error.message}</p>
                    <a href="#/" class="btn btn-primary">Return to Index</a>
                </div>
            `;
            safeLog('ERROR: PROFILE_LOAD_FAILED', 'error');
        }
    },
    
    forgotPassword() {
        const html = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--color-bg); position: relative; overflow: hidden;">
                <div style="position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%); border-radius: 50%; top: -150px; right: -150px; filter: blur(40px);"></div>
                <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%); border-radius: 50%; bottom: -120px; left: -120px; filter: blur(40px);"></div>
                
                <div class="container" style="max-width: 450px; width: 100%; position: relative; z-index: 10; padding: 16px;">
                    <div style="background: var(--color-bg-secondary); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 16px; padding: 48px; box-shadow: 0 0 40px rgba(59, 130, 246, 0.15);">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 2px solid var(--color-primary); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);">🔑</div>
                            <h1 style="font-size: 32px; font-weight: 900; color: var(--color-primary); margin-bottom: 8px; text-shadow: 0 0 20px rgba(59, 130, 246, 0.4);">
                                RESET_PASSWORD
                            </h1>
                            <p style="font-size: 12px; color: var(--color-muted); letter-spacing: 1px;">
                                RECOVER_YOUR_ACCOUNT
                            </p>
                        </div>
                        
                        <div id="forgot-step-1" style="display: block;">
                            <form onsubmit="Pages.handleForgotPassword(event)">
                                <div class="form-group">
                                    <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">EMAIL ADDRESS</label>
                                    <input type="email" id="forgot-email" class="form-input" placeholder="user@domain.com" required style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px;">
                                    ▶ SEND_RESET_CODE
                                </button>
                            </form>
                        </div>
                        
                        <div id="forgot-step-2" style="display: none;">
                            <form onsubmit="Pages.handleResetPassword(event)">
                                <div class="form-group">
                                    <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">RESET CODE</label>
                                    <input type="text" id="reset-code" class="form-input" placeholder="6-digit code" required maxlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">NEW PASSWORD</label>
                                    <input type="password" id="reset-password" class="form-input" placeholder="••••••••" required minlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label" style="color: var(--color-primary); font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">CONFIRM PASSWORD</label>
                                    <input type="password" id="reset-password-confirm" class="form-input" placeholder="••••••••" required minlength="6" style="background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-fg); padding: 12px 16px;">
                                </div>
                                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px 16px; font-size: 14px; font-weight: 700; background: var(--color-primary); border: 1px solid var(--color-primary); color: white; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); border-radius: 8px; letter-spacing: 0.5px; margin-bottom: 12px;">
                                    ▶ RESET_PASSWORD
                                </button>
                            </form>
                            <button onclick="Pages.forgotPassword()" class="btn btn-secondary" style="width: 100%; padding: 10px 16px; font-size: 12px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); color: var(--color-primary); cursor: pointer; border-radius: 8px; font-weight: 600;">
                                ← BACK
                            </button>
                        </div>
                        
                        <div style="text-align: center; padding: 16px; background: var(--color-bg-tertiary); border: 1px solid var(--color-border); border-radius: 8px; margin-top: 20px;">
                            <p style="font-size: 12px; color: var(--color-muted); margin: 0;">
                                REMEMBER_PASSWORD? 
                                <a href="#/login" style="color: var(--color-primary); text-decoration: none; font-weight: 700; text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);">LOGIN_HERE</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        safeLog('PAGE_LOADED: FORGOT_PASSWORD_PORTAL', 'info');
    },
    
    async handleForgotPassword(event) {
        event.preventDefault();
        const email = document.getElementById('forgot-email').value;
        
        try {
            await API.requestPasswordReset(email);
            safeLog('PASSWORD_RESET_CODE_SENT', 'success');
            alert('Check your email for the reset code (displayed in the console for demo)');
            document.getElementById('forgot-step-1').style.display = 'none';
            document.getElementById('forgot-step-2').style.display = 'block';
        } catch (error) {
            safeLog('PASSWORD_RESET_FAILED', 'error');
            alert('Error: ' + error.message);
        }
    },
    
    async handleResetPassword(event) {
        event.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const code = document.getElementById('reset-code').value;
        const newPassword = document.getElementById('reset-password').value;
        const confirmPassword = document.getElementById('reset-password-confirm').value;
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            await API.resetPassword(email, code, newPassword);
            safeLog('PASSWORD_RESET_SUCCESSFUL', 'success');
            alert('Password reset successfully! Please log in with your new password.');
            router.navigate('/login');
        } catch (error) {
            safeLog('PASSWORD_RESET_FAILED', 'error');
            alert('Error: ' + error.message);
        }
    },

    startViewCounter(postId) {
        setInterval(async () => {
            try {
                const { views } = await API.getViewCount(postId);
                const viewElement = document.getElementById(`view-count-${postId}`);
                if (viewElement) {
                    viewElement.innerHTML = `
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        ${views} views
                    `;
                }
            } catch (error) {
                // Silently fail
            }
        }, 10000); // Update every 10 seconds (optimized from 5s for better performance)
    },
    
    notFound() {
        const html = `
            <div class="container" style="text-align: center; padding: 64px 16px;">
                <svg style="width: 96px; height: 96px; color: var(--color-destructive); margin-bottom: 24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h1 style="font-size: 72px; font-weight: bold; color: var(--color-destructive); margin-bottom: 16px;">404</h1>
                <p style="font-size: 18px; color: var(--color-muted); margin-bottom: 32px;">DATA_SEGMENT_NOT_FOUND</p>
                <p style="font-size: 12px; color: var(--color-muted); max-width: 500px; margin: 0 auto 32px; border-left: 2px solid var(--color-destructive); padding-left: 16px; text-align: left;">
                    The requested resource could not be located in the database. It may have been expunged or never existed.
                </p>
                <a href="#/" class="btn btn-primary">Return to Index</a>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        safeLog('ERROR_404: RESOURCE_NOT_FOUND', 'error');
    }
};
