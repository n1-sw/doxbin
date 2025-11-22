const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const adminConfig = require('./config/admin');
const { connectMongoDB } = require('./db/mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketIO(server, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling']
});

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'production'
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache control
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// File upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and videos allowed'));
    }
});

// Auth middleware
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = req.session.user;
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (id, email, username, password, is_admin) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id, email, username, is_admin',
            [email, username, passwordHash, false]
        );
        const user = result.rows[0];
        req.session.user = { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin };
        res.json({ success: true, user });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email or username exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.user = { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin };
        res.json({ success: true, user: { id: user.id, email: user.email, username: user.username, is_admin: user.is_admin } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/user', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});

app.post('/api/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both passwords required' });
        }
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPasswordHash, req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Password change failed' });
    }
});

app.post('/api/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }
        const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.json({ success: true });
        }
        const userId = userResult.rows[0].id;
        const resetCode = Math.random().toString().substring(2, 8);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query(
            'INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (gen_random_uuid(), $1, $2, $3)',
            [userId, resetCode, expiresAt]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Reset failed' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const result = await pool.query(
            'SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired code' });
        }
        const userId = result.rows[0].user_id;
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPasswordHash, userId]);
        await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Reset failed' });
    }
});

app.get('/api/posts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
        res.json({ posts: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const post = result.rows[0];
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [req.params.id]);
        post.views += 1;
        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

app.post('/api/posts', requireAuth, requireAdmin, upload.single('media'), async (req, res) => {
    try {
        const { title, content, riskLevel } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content required' });
        }
        let mediaUrl = null;
        let mediaType = null;
        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        }
        const result = await pool.query(
            'INSERT INTO posts (id, title, content, risk_level, uploader_id, image_url, media_type, views, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 0, NOW()) RETURNING *',
            [title, content, riskLevel || 'MEDIUM', req.user.id, mediaUrl, mediaType]
        );
        res.json({ success: true, post: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at DESC',
            [req.params.id]
        );
        res.json({ comments: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.length > 1000) {
            return res.status(400).json({ error: 'Invalid comment' });
        }
        const sanitized = content.replace(/<[^>]*>/g, '');
        const result = await pool.query(
            'INSERT INTO comments (id, post_id, user_id, content, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING *',
            [req.params.id, req.user.id, sanitized]
        );
        res.json({ success: true, comment: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

app.get('/api/posts/:id/views', async (req, res) => {
    try {
        const result = await pool.query('SELECT views FROM posts WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ views: result.rows[0].views });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch views' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM users');
        res.json({ totalUsers: parseInt(result.rows[0].count) });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Socket.IO Chat
io.on('connection', (socket) => {
    socket.on('load_messages', async () => {
        try {
            const result = await pool.query('SELECT * FROM messages ORDER BY created_at ASC LIMIT 100');
            socket.emit('messages', result.rows);
        } catch (error) {
            socket.emit('error', 'Failed to load messages');
        }
    });
    
    socket.on('send_message', async (data) => {
        try {
            const { userId, username, message } = data;
            const result = await pool.query(
                'INSERT INTO messages (id, user_id, username, content, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW()) RETURNING *',
                [userId, username, message]
            );
            io.emit('new_message', result.rows[0]);
        } catch (error) {
            socket.emit('error', 'Failed to send message');
        }
    });
    
    socket.on('disconnect', () => {
        io.emit('user_disconnected', { message: 'User left' });
    });
});

// Database init
const initDatabase = async () => {
    try {
        await pool.query('SELECT NOW()');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                risk_level VARCHAR(50),
                uploader_id UUID REFERENCES users(id),
                image_url VARCHAR(255),
                video_url VARCHAR(255),
                media_url VARCHAR(255),
                media_type VARCHAR(50),
                views INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id UUID REFERENCES posts(id),
                user_id UUID REFERENCES users(id),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id),
                username VARCHAR(100),
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id),
                token VARCHAR(10) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', [adminConfig.DEFAULT_ADMIN.email]);
        if (adminResult.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(adminConfig.DEFAULT_ADMIN.password, 10);
            await pool.query(
                'INSERT INTO users (email, username, password, is_admin) VALUES ($1, $2, $3, true)',
                [adminConfig.DEFAULT_ADMIN.email, adminConfig.DEFAULT_ADMIN.username, hashedPassword]
            );
        }
        
        return true;
    } catch (error) {
        console.error('Database Error:', error.message);
        return false;
    }
};

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start
const startServer = async () => {
    const dbInitialized = await initDatabase();
    if (dbInitialized) {
        if (process.env.MONGODB_URL) {
            connectMongoDB();
        }
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Database initialized successfully`);
            console.log(`Server running at http://0.0.0.0:${PORT}/`);
        });
    } else {
        console.error('Failed to initialize database');
        process.exit(1);
    }
};

startServer();
