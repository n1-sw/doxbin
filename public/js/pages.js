// Safe terminal logger that checks if terminal exists
const safeLog = (message, type = 'info') => {
    if (typeof terminal !== 'undefined' && terminal.log) {
        safeLog(message, type);
    }
};

const Pages = {
    async home() {
        const appEl = document.getElementById('app');
        appEl.innerHTML = '<div class="loading">Loading database...</div>';
        
        try {
            const { posts } = await API.getPosts();
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
                            <div class="stat-value">8,492</div>
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
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 32px;">
                        <div class="card">
                            <h3 style="color: var(--color-primary); margin-bottom: 12px; font-size: 14px;">LATEST_ACTIVITY_LOG</h3>
                            <div style="font-size: 11px; color: var(--color-muted);">
                                <p>> User_992 accessed /database/leak_01</p>
                                <p>> Admin uploaded new_entry_02.zip</p>
                                <p>> Bot_Net_Crawler blocked from IP 88.21.x.x</p>
                            </div>
                        </div>
                        <div class="card">
                            <h3 style="color: var(--color-primary); margin-bottom: 12px; font-size: 14px;">ENCRYPTION_STANDARDS</h3>
                            <div style="font-size: 11px; color: var(--color-muted);">
                                <p>AES-256-GCM encryption enabled for all stored assets. Zero-knowledge architecture implemented for user logs.</p>
                            </div>
                        </div>
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
                        <h1 style="font-size: 48px; font-weight: 900; color: var(--color-fg); margin-bottom: 16px;" class="glitch-text" data-text="MISSION_PROTOCOL">
                            MISSION_PROTOCOL
                        </h1>
                        <p style="font-size: 16px; color: var(--color-muted); line-height: 1.6;">
                            Information wants to be free. We are the custodians of the digital truth.
                            In a world of surveillance and censorship, SCXBIN serves as the immutable archive
                            of cyber-security incidents, threat intelligence, and digital forensics.
                        </p>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div style="font-size: 14px; color: var(--color-primary); margin-bottom: 8px; font-weight: bold;">ENCRYPTION</div>
                        <div style="font-size: 18px; color: var(--color-fg);">AES-256</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 14px; color: var(--color-primary); margin-bottom: 8px; font-weight: bold;">NODES</div>
                        <div style="font-size: 18px; color: var(--color-fg);">8,492</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 14px; color: var(--color-primary); margin-bottom: 8px; font-weight: bold;">UPTIME</div>
                        <div style="font-size: 18px; color: var(--color-fg);">99.99%</div>
                    </div>
                    <div class="stat-card">
                        <div style="font-size: 14px; color: var(--color-primary); margin-bottom: 8px; font-weight: bold;">ARCHIVE</div>
                        <div style="font-size: 18px; color: var(--color-fg);">42TB</div>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 32px;">
                    <h2 style="color: var(--color-primary); margin-bottom: 16px;">CORE_VALUES</h2>
                    <ul style="font-size: 14px; color: var(--color-muted); line-height: 2;">
                        <li>> Transparency in a world of secrecy</li>
                        <li>> Zero-knowledge architecture for user privacy</li>
                        <li>> Decentralized data storage across encrypted nodes</li>
                        <li>> Educational resources for cybersecurity awareness</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        
        const fullText = "INITIATING_SYSTEM_MANIFESTO... LOADING_CORE_VALUES... [COMPLETE]";
        const typingEl = document.getElementById('typing-text');
        let i = 0;
        const typeInterval = setInterval(() => {
            typingEl.textContent = fullText.slice(0, i);
            i++;
            if (i > fullText.length) clearInterval(typeInterval);
        }, 50);
        
        safeLog('PAGE_LOADED: ABOUT_MANIFESTO', 'info');
    },
    
    login() {
        const html = `
            <div class="container" style="max-width: 500px;">
                <div class="card">
                    <h1 style="font-size: 24px; font-weight: bold; color: var(--color-primary); margin-bottom: 8px; text-align: center;">
                        SECURE_ACCESS_TERMINAL
                    </h1>
                    <p style="font-size: 11px; color: var(--color-muted); text-align: center; margin-bottom: 24px;">
                        Enter credentials to access restricted database
                    </p>
                    
                    <form onsubmit="Pages.handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label">EMAIL</label>
                            <input type="email" id="login-email" class="form-input" placeholder="user@system.net" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">PASSWORD</label>
                            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            [AUTHENTICATE]
                        </button>
                    </form>
                    
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--color-border); text-align: center;">
                        <p style="font-size: 11px; color: var(--color-muted);">
                            Don't have access? <a href="#/register" style="color: var(--color-primary);">Register here</a>
                        </p>
                    </div>
                    
                    <div style="margin-top: 16px; font-size: 10px; color: var(--color-muted); text-align: center;">
                        <p>🔒 End-to-end encryption enabled</p>
                        <p>👁‍🗨 No logs policy</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
        safeLog('PAGE_LOADED: LOGIN_PORTAL', 'warning');
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
            <div class="container" style="max-width: 500px;">
                <div class="card">
                    <h1 style="font-size: 24px; font-weight: bold; color: var(--color-primary); margin-bottom: 8px; text-align: center;">
                        NEW_USER_REGISTRATION
                    </h1>
                    <p style="font-size: 11px; color: var(--color-muted); text-align: center; margin-bottom: 24px;">
                        Create secure access credentials
                    </p>
                    
                    <form onsubmit="Pages.handleRegister(event)">
                        <div class="form-group">
                            <label class="form-label">EMAIL</label>
                            <input type="email" id="reg-email" class="form-input" placeholder="user@system.net" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">USERNAME</label>
                            <input type="text" id="reg-username" class="form-input" placeholder="username" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">PASSWORD</label>
                            <input type="password" id="reg-password" class="form-input" placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            [CREATE_ACCOUNT]
                        </button>
                    </form>
                    
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--color-border); text-align: center;">
                        <p style="font-size: 11px; color: var(--color-muted);">
                            Already have access? <a href="#/login" style="color: var(--color-primary);">Login here</a>
                        </p>
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
                <div class="container">
                    <div class="card" style="text-align: center; padding: 64px; color: var(--color-destructive);">
                        <h2>ACCESS_DENIED</h2>
                        <p style="margin-top: 16px; color: var(--color-muted);">Admin privileges required</p>
                    </div>
                </div>
            `;
            safeLog('ACCESS_DENIED: ADMIN_ONLY', 'error');
            return;
        }
        
        const html = `
            <div class="container" style="max-width: 800px;">
                <div style="margin-bottom: 32px; border-bottom: 1px solid var(--color-border); padding-bottom: 16px;">
                    <h1 style="font-size: 28px; font-weight: bold; color: var(--color-primary); margin-bottom: 8px;">
                        ADMIN_CONTROL_PANEL
                    </h1>
                    <p style="font-size: 12px; color: var(--color-muted);">Create new database entries with image uploads</p>
                </div>
                
                <div class="card">
                    <form onsubmit="Pages.handleCreatePost(event)" enctype="multipart/form-data">
                        <div class="form-group">
                            <label class="form-label">Post Title</label>
                            <input type="text" id="post-title" class="form-input" placeholder="SUBJECT / FILENAME" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Content</label>
                            <textarea id="post-content" class="form-textarea" placeholder="Full content and details..." style="min-height: 200px;" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Risk Level</label>
                            <select id="post-risk" class="form-input" required>
                                <option value="low">Low</option>
                                <option value="moderate">Moderate</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Image Upload (Optional)</label>
                            <input type="file" id="post-image" class="form-input" accept="image/jpeg,image/png,image/gif">
                            <p style="font-size: 10px; color: var(--color-muted); margin-top: 8px;">Max file size: 5MB • Supported: JPG, PNG, GIF</p>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            [UPLOAD_TO_DATABASE]
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        appEl.innerHTML = html;
        safeLog('PAGE_LOADED: ADMIN_PANEL', 'warning');
    },
    
    async handleCreatePost(event) {
        event.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const risk_level = document.getElementById('post-risk').value;
        const imageFile = document.getElementById('post-image').files[0];
        
        safeLog('UPLOADING_NEW_ENTRY...', 'info');
        
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('risk_level', risk_level);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            await API.createPost(formData);
            safeLog('UPLOAD_SUCCESS: NEW_ENTRY_ADDED', 'success');
            alert('Post created successfully!');
            router.navigate('/');
        } catch (error) {
            safeLog('UPLOAD_ERROR: FAILED_TO_CREATE_ENTRY', 'error');
            alert('Failed to create post: ' + error.message);
        }
    },
    
    async postDetail(id) {
        const appEl = document.getElementById('app');
        appEl.innerHTML = '<div class="loading">Loading entry...</div>';
        
        try {
            const { post } = await API.getPost(id);
            
            const html = `
                <div class="container" style="max-width: 900px;">
                    <a href="#/" class="btn" style="margin-bottom: 16px; display: inline-flex; align-items: center; gap: 8px;">
                        ← Back to Database
                    </a>
                    
                    <div class="card">
                        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border);">
                            <h1 style="font-size: 28px; font-weight: bold; color: var(--color-primary); margin-bottom: 12px;">
                                ${post.title}
                            </h1>
                            <div style="display: flex; gap: 16px; font-size: 11px; color: var(--color-muted); flex-wrap: wrap;">
                                <span>👤 ${post.uploader_name || 'Admin'}</span>
                                <span>📅 ${new Date(post.created_at).toISOString().split('T')[0]}</span>
                                <span>👁 ${post.views.toLocaleString()} views</span>
                                <span><span class="badge ${post.risk_level}">${post.risk_level.toUpperCase()}</span></span>
                            </div>
                        </div>
                        
                        ${post.image_url ? `
                            <div style="margin-bottom: 24px;">
                                <img src="${post.image_url}" alt="${post.title}" style="width: 100%; max-width: 800px; border: 1px solid var(--color-border);">
                            </div>
                        ` : ''}
                        
                        <div style="background-color: var(--color-bg); padding: 24px; border: 1px solid var(--color-border); margin-bottom: 24px;">
                            <pre style="font-size: 12px; color: var(--color-fg); line-height: 1.6; white-space: pre-wrap;">${post.content}</pre>
                        </div>
                        
                        <div style="font-size: 11px; color: var(--color-muted); padding: 16px; background-color: var(--color-bg); border: 1px solid var(--color-border);">
                            ⚠ DISCLAIMER: This information is provided for educational purposes only. Always verify information independently.
                        </div>
                    </div>
                </div>
            `;
            
            appEl.innerHTML = html;
            safeLog(`POST_ACCESSED: ID_${id}`, 'info');
        } catch (error) {
            Pages.notFound();
        }
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
