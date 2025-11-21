const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// File upload configuration
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

// Simple session store (in production use proper session management)
const sessions = new Map();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    const sessionId = req.cookies.session_id;
    const session = sessions.get(sessionId);
    
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    req.user = session;
    next();
};

// Middleware to check admin
const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};

// API Routes
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Generate UUID for id
        const result = await pool.query(
            'INSERT INTO users (id, email, username, password, is_admin) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING id, email, username, is_admin',
            [email, username, passwordHash, false]
        );
        
        const user = result.rows[0];
        
        // Create session
        const sessionId = Math.random().toString(36).substring(2);
        sessions.set(sessionId, user);
        
        res.cookie('session_id', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true, user: { email: user.email, username: user.username, is_admin: user.is_admin } });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') { // Unique violation
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const result = await pool.query(
            'SELECT id, email, username, password, is_admin FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create session
        const sessionId = Math.random().toString(36).substring(2);
        const sessionData = {
            id: user.id,
            email: user.email,
            username: user.username,
            is_admin: user.is_admin
        };
        sessions.set(sessionId, sessionData);
        
        res.cookie('session_id', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true, user: sessionData });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    const sessionId = req.cookies.session_id;
    sessions.delete(sessionId);
    res.clearCookie('session_id');
    res.json({ success: true });
});

// Get current user
app.get('/api/user', (req, res) => {
    const sessionId = req.cookies.session_id;
    const session = sessions.get(sessionId);
    
    if (!session) {
        return res.json({ user: null });
    }
    
    res.json({ user: session });
});

// Get all posts
app.get('/api/posts', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.username as uploader_name 
             FROM posts p 
             LEFT JOIN users u ON p.uploader_id = u.id 
             ORDER BY p.created_at DESC`
        );
        res.json({ posts: result.rows });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT p.*, u.username as uploader_name 
             FROM posts p 
             LEFT JOIN users u ON p.uploader_id = u.id 
             WHERE p.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Increment view count
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [id]);
        
        res.json({ post: result.rows[0] });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// Create post (admin only)
app.post('/api/posts', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, content, risk_level } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        if (!title || !content || !risk_level) {
            return res.status(400).json({ error: 'Title, content, and risk level are required' });
        }
        
        const result = await pool.query(
            'INSERT INTO posts (title, content, risk_level, uploader_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, content, risk_level, req.user.id, image_url]
        );
        
        res.json({ success: true, post: result.rows[0] });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
