import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors());

// Database helper - uses D1 bindings from wrangler.toml
const queryDB = async (env, sql, params = []) => {
    const db = env.DB;
    const stmt = db.prepare(sql);
    return params.length ? stmt.bind(...params) : stmt;
};

// Middleware for authentication (using sessions via D1)
const requireAuth = async (c, next) => {
    const sessionId = c.req.header('X-Session-ID');
    if (!sessionId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    // Store session ID for later use
    c.set('sessionId', sessionId);
    await next();
};

// Registration endpoint
app.post('/api/register', async (c) => {
    try {
        const { email, username, password } = await c.req.json();
        
        if (!email || !username || !password) {
            return c.json({ error: 'Email, username, and password are required' }, 400);
        }
        
        // Hash password (note: bcrypt not available in Workers, use simple hashing for demo)
        const hashedPassword = btoa(password); // This is NOT production-ready, use crypto.subtle
        
        const env = c.env;
        const db = env.DB;
        
        try {
            const result = await db.prepare(
                'INSERT INTO users (email, username, password, is_admin) VALUES (?, ?, ?, ?)'
            ).bind(email, username, hashedPassword, false).run();
            
            return c.json({ success: true, user: { email, username } });
        } catch (dbError) {
            if (dbError.message.includes('UNIQUE constraint failed')) {
                return c.json({ error: 'Email or username already exists' }, 400);
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Registration error:', error);
        return c.json({ error: 'Registration failed' }, 500);
    }
});

// Login endpoint
app.post('/api/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        
        if (!email || !password) {
            return c.json({ error: 'Email and password are required' }, 400);
        }
        
        const env = c.env;
        const db = env.DB;
        
        const user = await db.prepare(
            'SELECT id, email, username, password, is_admin FROM users WHERE email = ?'
        ).bind(email).first();
        
        if (!user || user.password !== btoa(password)) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }
        
        // Create session token (simplified - use proper JWT in production)
        const sessionToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));
        
        return c.json({ 
            success: true, 
            user: { 
                id: user.id, 
                email: user.email, 
                username: user.username, 
                is_admin: user.is_admin 
            },
            sessionToken 
        });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
    }
});

// Get all posts
app.get('/api/posts', async (c) => {
    try {
        const env = c.env;
        const db = env.DB;
        
        const posts = await db.prepare(
            `SELECT p.*, u.username as uploader_name 
             FROM posts p 
             LEFT JOIN users u ON p.uploader_id = u.id 
             ORDER BY p.created_at DESC`
        ).all();
        
        return c.json({ posts: posts.results || [] });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return c.json({ error: 'Failed to fetch posts' }, 500);
    }
});

// Get single post
app.get('/api/posts/:id', async (c) => {
    try {
        const { id } = c.req.param();
        const env = c.env;
        const db = env.DB;
        
        const post = await db.prepare(
            `SELECT p.*, u.username as uploader_name 
             FROM posts p 
             LEFT JOIN users u ON p.uploader_id = u.id 
             WHERE p.id = ?`
        ).bind(id).first();
        
        if (!post) {
            return c.json({ error: 'Post not found' }, 404);
        }
        
        // Increment view count
        await db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').bind(id).run();
        
        return c.json({ post });
    } catch (error) {
        console.error('Error fetching post:', error);
        return c.json({ error: 'Failed to fetch post' }, 500);
    }
});

// Get comments for a post
app.get('/api/posts/:id/comments', async (c) => {
    try {
        const { id } = c.req.param();
        const env = c.env;
        const db = env.DB;
        
        const comments = await db.prepare(
            `SELECT c.*, u.username 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.post_id = ? 
             ORDER BY c.created_at DESC`
        ).bind(id).all();
        
        return c.json({ comments: comments.results || [] });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return c.json({ error: 'Failed to fetch comments' }, 500);
    }
});

// Create comment
app.post('/api/posts/:id/comments', requireAuth, async (c) => {
    try {
        const { id } = c.req.param();
        const { content } = await c.req.json();
        const sessionId = c.get('sessionId');
        
        if (!content || content.trim() === '') {
            return c.json({ error: 'Comment content is required' }, 400);
        }
        
        // Sanitize content
        let sanitized = content.trim()
            .replace(/<[^>]*>/g, '')
            .substring(0, 1000);
        
        if (sanitized === '') {
            return c.json({ error: 'Comment content is invalid' }, 400);
        }
        
        const env = c.env;
        const db = env.DB;
        
        // In production, decode sessionId to get userId
        const userId = 1; // Placeholder - extract from session
        
        const result = await db.prepare(
            'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
        ).bind(id, userId, sanitized).run();
        
        // Update comment count
        await db.prepare('UPDATE posts SET comments = comments + 1 WHERE id = ?').bind(id).run();
        
        return c.json({ success: true });
    } catch (error) {
        console.error('Error creating comment:', error);
        return c.json({ error: 'Failed to create comment' }, 500);
    }
});

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Default export for Cloudflare Workers
export default app;
