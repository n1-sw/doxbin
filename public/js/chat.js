// Live chat system using Socket.IO - Only for logged-in users
const Chat = {
    socket: null,
    isOpen: false,
    userId: null,
    username: null,
    isConnected: false,
    isAdmin: false,
    
    init(userId, username, isAdmin = false) {
        // Only initialize for logged-in users
        if (!userId || !username) {
            return;
        }
        
        if (typeof io === 'undefined') {
            return;
        }
        
        this.userId = userId;
        this.username = username;
        this.isAdmin = isAdmin;
        
        try {
            // Initialize Socket.IO connection
            this.socket = io();
        
            this.socket.on('connect', () => {
                this.isConnected = true;
                this.loadMessages();
            });
            
            this.socket.on('connect_error', (error) => {
                this.isConnected = false;
            });
            
            this.socket.on('disconnect', () => {
                this.isConnected = false;
            });
            
            this.socket.on('messages_loaded', (messages) => {
                this.displayMessages(messages);
            });
            
            this.socket.on('new_message', (message) => {
                this.addMessageToList(message);
            });
            
            this.socket.on('error', (error) => {
            });
            
            this.socket.on('chat_cleared', () => {
                this.displayMessages([]);
            });
            
            this.setupChatUI();
        } catch (error) {
            this.isConnected = false;
        }
    },
    
    setupChatUI() {
        // Setup chat toggle button with immediate binding
        const chatBtn = document.getElementById('chat-toggle-btn');
        if (chatBtn) {
            const self = this;
            chatBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.toggleChat();
            };
        }
        
        // Setup chat close button
        const closeBtn = document.getElementById('chat-close-btn');
        if (closeBtn) {
            const self = this;
            closeBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.toggleChat();
            };
        }
        
        // Setup admin clear button (only for admins)
        const clearBtn = document.getElementById('chat-clear-btn');
        if (clearBtn && this.isAdmin) {
            clearBtn.style.display = 'flex';
            const self = this;
            clearBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (confirm('Are you sure you want to clear all chat messages? This cannot be undone.')) {
                    self.clearChat();
                }
            };
        }
        
        // Setup send message form
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            const self = this;
            chatForm.onsubmit = function(e) {
                e.preventDefault();
                self.handleSendMessage(e);
            };
        }
    },
    
    clearChat() {
        if (!this.socket || !this.isAdmin) {
            return;
        }
        
        this.socket.emit('clear_chat', { userId: this.userId });
    },
    
    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;
        
        this.isOpen = !this.isOpen;
        chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            // Load messages when opening chat
            this.loadMessages();
            const input = document.getElementById('chat-input');
            if (input) input.focus();
            setTimeout(() => this.scrollToBottom(), 100);
        }
    },
    
    loadMessages() {
        if (this.socket) {
            this.socket.emit('load_messages');
        }
    },
    
    displayMessages(messages) {
        const messageList = document.getElementById('chat-messages');
        if (!messageList) return;
        
        // Clear existing messages
        messageList.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            messageList.innerHTML = '<div class="chat-no-messages">No messages yet. Start a conversation!</div>';
            return;
        }
        
        // Simple direct rendering without fragments
        messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = msg.user_id === this.userId ? 'chat-message own-message' : 'chat-message other-message';
            
            const time = new Date(msg.created_at).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            
            messageEl.innerHTML = `
                <div class="chat-message-info">
                    <span class="chat-username">${this.escapeHtml(msg.username)}</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-message-content">${this.escapeHtml(msg.content)}</div>
            `;
            
            messageList.appendChild(messageEl);
        });
        
        this.scrollToBottom();
    },
    
    addMessageToList(message) {
        const messageList = document.getElementById('chat-messages');
        if (!messageList) return;
        
        // Remove "no messages" placeholder if it exists
        const noMessagesEl = messageList.querySelector('.chat-no-messages');
        if (noMessagesEl) {
            noMessagesEl.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = message.user_id === this.userId ? 'chat-message own-message' : 'chat-message other-message';
        
        const time = new Date(message.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        messageEl.innerHTML = `
            <div class="chat-message-info">
                <span class="chat-username">${this.escapeHtml(message.username)}</span>
                <span class="chat-time">${time}</span>
            </div>
            <div class="chat-message-content">${this.escapeHtml(message.content)}</div>
        `;
        
        messageList.appendChild(messageEl);
        this.scrollToBottom();
    },
    
    createMessageElement(message) {
        const time = new Date(message.created_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const isOwnMessage = message.user_id === this.userId;
        
        return `
            <div class="chat-message ${isOwnMessage ? 'own-message' : 'other-message'}">
                <div class="chat-message-info">
                    <span class="chat-username">${this.escapeHtml(message.username)}</span>
                    <span class="chat-time">${time}</span>
                </div>
                <div class="chat-message-content">${this.escapeHtml(message.content)}</div>
            </div>
        `;
    },
    
    handleSendMessage(e) {
        e.preventDefault();
        
        // Only send if user is logged in and socket is connected
        if (!this.userId || !this.username || !this.isConnected) {
            alert('Please login to send messages');
            return;
        }
        
        const input = document.getElementById('chat-input');
        if (!input) return;
        
        const content = input.value.trim();
        if (!content) return;
        
        if (this.socket) {
            this.socket.emit('send_message', {
                userId: this.userId,
                username: this.username,
                content: content
            });
        }
        
        input.value = '';
        input.focus();
    },
    
    scrollToBottom() {
        const messageList = document.getElementById('chat-messages');
        if (messageList) {
            messageList.scrollTop = messageList.scrollHeight;
        }
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
