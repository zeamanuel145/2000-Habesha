// ========================
// Chatbot Functionality
// ========================
class RestaurantChatbot {
    constructor() {
        this.chatWindow = document.getElementById('chatWindow');
        this.chatToggle = document.getElementById('chatToggle');
        this.closeChat = document.getElementById('closeChat');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.quickReplyButtons = document.querySelectorAll('.quick-reply');

        this.isOpen = false;
        this.chatHistory = [];
        this.apiEndpoint = '/chat'; // Using relative path for production
        this.retryCount = 0;
        this.maxRetries = 2;

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupStyles();
        this.loadWelcomeMessage();
    }

    setupEventListeners() {
        // Toggle chat window
        this.chatToggle?.addEventListener('click', () => this.toggleChat());
        this.closeChat?.addEventListener('click', () => this.toggleChat());

        // Message sending
        this.sendButton?.addEventListener('click', () => this.handleUserMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        // Quick replies
        this.quickReplyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                this.processMessage(message);
            });
        });
    }

    setupStyles() {
        // Ensure chat window is initially hidden
        if (this.chatWindow) {
            this.chatWindow.classList.add('hidden');
        }
    }

    loadWelcomeMessage() {
        if (this.chatMessages?.children.length === 0) {
            this.addBotMessage("Hello! Welcome to 2000 Habesha Restaurant. How can I help you today?");
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.chatWindow) {
            this.chatWindow.classList.toggle('hidden', !this.isOpen);
            if (this.isOpen) {
                this.chatInput?.focus();
                this.scrollToBottom();
            }
        }
    }

    handleUserMessage() {
        const message = this.chatInput?.value.trim();
        if (message) {
            this.processMessage(message);
            this.chatInput.value = '';
        }
    }

    async processMessage(message) {
        this.addUserMessage(message);
        this.showTypingIndicator();

        try {
            const response = await this.fetchBotResponse(message);
            this.addBotMessage(response);
            this.retryCount = 0; // Reset retry counter on success
        } catch (error) {
            console.error('Chat error:', error);
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                setTimeout(() => this.processMessage(message), 1000);
            } else {
                this.handleErrorState(message);
            }
        } finally {
            this.hideTypingIndicator();
        }
    }

    async fetchBotResponse(message) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                user_message: message,
                chat_history: this.chatHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.bot_response;
    }

    handleErrorState(userMessage) {
        const fallbackResponse = this.getFallbackResponse(userMessage.toLowerCase());
        this.addBotMessage(fallbackResponse || "Sorry! Our chatbot is currently unavailable. Please call us at +251 912 838 383.");
    }

    getFallbackResponse(message) {
        const fallbacks = {
            "hours": "We're open daily from 10AM to 11PM, with live cultural shows on weekends!",
            "menu": "Our menu features authentic Ethiopian dishes like Kitfo, Doro Wat, and vegetarian platters.",
            "reservation": "Call +251 912 838 383 or visit our website to reserve a table.",
            "location": "We're located on Namibia Street in Bole Atlas, near the Ethiopian Skylight Hotel."
        };

        if (message.includes('hour') || message.includes('time')) return fallbacks.hours;
        if (message.includes('menu') || message.includes('food')) return fallbacks.menu;
        if (message.includes('reserv') || message.includes('book')) return fallbacks.reservation;
        if (message.includes('where') || message.includes('location')) return fallbacks.location;
        
        return null;
    }

    addUserMessage(message) {
        this.chatHistory.push({ sender: 'user', message });
        this.appendMessage('user', message);
    }

    addBotMessage(message) {
        this.chatHistory.push({ sender: 'bot', message });
        this.appendMessage('bot', message);
    }

    appendMessage(sender, message) {
        if (!this.chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `flex items-start mb-4 ${sender === 'user' ? 'justify-end' : ''}`;
        
        messageDiv.innerHTML = `
            ${sender === 'bot' ? `
                <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                    <i class="fas fa-robot text-white text-xs"></i>
                </div>
            ` : ''}
            
            <div class="${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} 
                px-4 py-2 rounded-lg max-w-xs md:max-w-md text-sm">
                ${message}
            </div>
            
            ${sender === 'user' ? `
                <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <i class="fas fa-user text-white text-xs"></i>
                </div>
            ` : ''}
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        if (!this.typingIndicator) return;

        this.typingIndicator.classList.remove('hidden');
        this.typingIndicator.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                    <i class="fas fa-robot text-white text-xs"></i>
                </div>
                <div class="typing-dots flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        `;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator?.classList.add('hidden');
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
}

// Initialize chatbot when DOM is loaded
if (document.readyState !== 'loading') {
    new RestaurantChatbot();
} else {
    document.addEventListener('DOMContentLoaded', () => new RestaurantChatbot());
}