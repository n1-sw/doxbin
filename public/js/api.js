// API client for backend communication
const API = {
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'same-origin'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Auth endpoints
    async login(email, password) {
        return this.request('/api/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },
    
    async register(email, username, password) {
        return this.request('/api/register', {
            method: 'POST',
            body: JSON.stringify({ email, username, password })
        });
    },
    
    async logout() {
        return this.request('/api/logout', {
            method: 'POST'
        });
    },
    
    async getCurrentUser() {
        return this.request('/api/user');
    },
    
    // Posts endpoints
    async getPosts() {
        return this.request('/api/posts');
    },
    
    async getPost(id) {
        return this.request(`/api/posts/${id}`);
    },
    
    async createPost(formData) {
        // For file upload, don't set Content-Type header
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create post');
        }
        
        return data;
    }
};
