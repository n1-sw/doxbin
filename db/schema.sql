-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    uploader_id INTEGER REFERENCES users(id),
    image_url VARCHAR(1000),
    views INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, username, is_admin)
VALUES ('admin@scxbin.local', '$2b$10$rKzE.vQxV5kN5tQ5h5k5kuO5tQ5h5k5kuO5tQ5h5k5kuO5tQ5h5k5k', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;
