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
const cloudinary = require('cloudinary').v2;

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

// ============================================
// INITIALIZE DATABASE FIRST (SYNCHRONOUSLY)
// ============================================
const initDatabaseSync = () => {
    return new Promise(async (resolve) => {
        try {
            console.log('Testing database connection...');
            await pool.query('SELECT NOW()');
            console.log('Database connection successful');
            
            // Create session table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS "session" (
                    "sid" varchar NOT NULL COLLATE "default",
                    "sess" json NOT NULL,
                    "expire" timestamp(6) NOT NULL,
                    PRIMARY KEY ("sid")
                ) WITH (OIDS=FALSE);
                CREATE INDEX IF NOT EXISTS "IDX_session_expire" on "session" ("expire");
            `);
            
            // Create other tables
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
            
            // Create default admin
            const adminResult = await pool.query('SELECT id FROM users WHERE email = $1', [adminConfig.DEFAULT_ADMIN.email]);
            if (adminResult.rows.length === 0) {
                const hashedPassword = await bcrypt.hash(adminConfig.DEFAULT_ADMIN.password, 10);
                await pool.query(
                    'INSERT INTO users (email, username, password, is_admin) VALUES ($1, $2, $3, true)',
                    [adminConfig.DEFAULT_ADMIN.email, adminConfig.DEFAULT_ADMIN.username, hashedPassword]
                );
                console.log('Default admin user created');
            }
            
            console.log('All database tables initialized');
            resolve(true);
        } catch (error) {
            console.error('Database initialization error:', error.message);
            resolve(false);
        }
    });
};

// ============================================
// SETUP MIDDLEWARE (BEFORE ROUTES)
// ============================================

// JSON and URL parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Cache control
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Session middleware (MUST be before routes)
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
        secure: process.env.ENVIRONMENT === 'production',
        sameSite: 'lax'
    }
}));

// ============================================
// CLOUDINARY & FILE UPLOAD SETUP
// ============================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Local file storage for multer (temporary or fallback)
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
    limits: { fileSize: 100 * 1024 * 1024 },
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

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'scxbin-uploads',
            resource_type: 'auto',
            timeout: 60000
        });
        // Delete local file after upload
        fs.unlinkSync(filePath);
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error.message);
        // If Cloudinary fails, return local URL
        return `/uploads/${path.basename(filePath)}`;
    }
};

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

// ============================================
// API ROUTES
// ============================================

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
        console.error('Registration error:', error.message);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email or username exists' });
        }
        res.status(500).json({ error: error.message || 'Registration failed' });
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
        console.error('Login error:', error.message);
        res.status(500).json({ error: error.message || 'Login failed' });
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
            // Upload to Cloudinary if credentials are available
            const hasCloudinaryCredentials = process.env.CLOUDINARY_CLOUD_NAME && 
                                           process.env.CLOUDINARY_API_KEY && 
                                           process.env.CLOUDINARY_API_SECRET;
            
            if (hasCloudinaryCredentials) {
                mediaUrl = await uploadToCloudinary(req.file.path);
            } else {
                mediaUrl = `/uploads/${req.file.filename}`;
            }
            mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        }
        
        const result = await pool.query(
            'INSERT INTO posts (id, title, content, risk_level, uploader_id, image_url, media_type, views, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 0, NOW()) RETURNING *',
            [title, content, riskLevel || 'MEDIUM', req.user.id, mediaUrl, mediaType]
        );
        res.json({ success: true, post: result.rows[0] });
    } catch (error) {
        console.error('Post creation error:', error.message);
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

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
    const dbInitialized = await initDatabaseSync();
    
    if (!dbInitialized) {
        console.error('Failed to initialize database');
        process.exit(1);
    }
    
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Database initialized successfully`);
        console.log(`Server running at http://0.0.0.0:${PORT}/`);
    });
};

startServer();
