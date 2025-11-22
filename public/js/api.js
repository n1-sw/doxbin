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
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
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
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create post');
        }
        
        return data;
    },
    
    // Comments endpoints
    async getComments(postId) {
        return this.request(`/api/posts/${postId}/comments`);
    },
    
    async createComment(postId, content) {
        return this.request(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    },
    
    // View count endpoint
    async getViewCount(postId) {
        return this.request(`/api/posts/${postId}/views`);
    },
    
    // Delete post (admin only)
    async deletePost(postId) {
        return this.request(`/api/posts/${postId}`, {
            method: 'DELETE'
        });
    },
    
    // Stats endpoints
    async getStats() {
        return this.request('/api/stats');
    },
    
};
