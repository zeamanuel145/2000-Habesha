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
        this.apiEndpoint = '/chat';
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
        // Toggle button
        this.chatToggle?.addEventListener('click', () => this.openChat());

        // Close button
        this.closeChat?.addEventListener('click', () => this.closeChatWindow());

        // Send message
        this.sendButton?.addEventListener('click', () => this.handleUserMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserMessage();
        });

        // Quick reply buttons
        this.quickReplyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                this.processMessage(message);
            });
        });
    }

    setupStyles() {
        if (this.chatWindow) {
            this.chatWindow.classList.add('hidden');
        }
    }

    loadWelcomeMessage() {
        if (this.chatMessages?.children.length === 0) {
            this.addBotMessage("**Hello!** 👋 Welcome to *2000 Habesha Restaurant*. How can I help you today?");
        }
    }

    openChat() {
        this.isOpen = true;
        this.chatWindow?.classList.remove('hidden');
        this.chatInput?.focus();
        this.scrollToBottom();
    }

    closeChatWindow() {
        this.isOpen = false;
        this.chatWindow?.classList.add('hidden');
    }

    handleUserMessage() {
        const message = this.chatInput?.value.trim();
        if (message) {
            this.chatInput.value = '';
            this.processMessage(message);
        }
    }

    async processMessage(message) {
        this.addUserMessage(message);
        this.showTypingIndicator();

        try {
            const response = await this.fetchBotResponse(message);
            this.addBotMessage(response);
            this.retryCount = 0;
        } catch (error) {
            console.error('API Chat error:', error);
            const fallbackResponse = this.getFallbackResponse(message);
            this.addBotMessage(fallbackResponse);
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

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.bot_response;
    }

    getFallbackResponse(message) {
        const lower = message.toLowerCase();

        if (lower.includes('hour') || lower.includes('time')) {
            return `**Hours:** 10AM - 11PM daily.`;
        }
        if (lower.includes('menu') || lower.includes('food')) {
            return `**Menu Highlights:**\n- Kitfo\n- Doro Wat\n- Vegetarian platters`;
        }
        if (lower.includes('where') || lower.includes('location')) {
            return `**Location:** Namibia Street, Bole Atlas (near Ethiopian Skylight Hotel).`;
        }
        if (lower.includes('reserv') || lower.includes('book') || lower.includes('table')) {
            return `**Reservations:** Call us at +251 912 838 383.`;
        }

        return `❌ *Sorry! Our AI service is temporarily down.*\nFor urgent help, call **+251 912 838 383**.`;
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
        messageDiv.className = `flex items-start mb-2 ${sender === 'user' ? 'justify-end' : ''}`;

        messageDiv.innerHTML = `
            ${sender === 'bot' ? `
                <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                    <i class="fas fa-robot text-white text-xs"></i>
                </div>
            ` : ''}

            <div class="${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} 
                px-3 py-2 rounded-lg max-w-xs md:max-w-md text-sm prose prose-sm">
                ${this.renderMarkdown(message)}
            </div>

            ${sender === 'user' ? `
                <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center ml-2">
                    <i class="fas fa-user text-white text-xs"></i>
                </div>
            ` : ''}
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    renderMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')  // Bold
            .replace(/\*(.+?)\*/g, '<em>$1</em>')              // Italics
            .replace(/- (.+)/g, '<li>$1</li>')                 // Bullet lists
            .replace(/\n/g, '<br>');                           // Line breaks
    }

    showTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.classList.remove('hidden');
            this.typingIndicator.innerHTML = `
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-2">
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

if (document.readyState !== 'loading') {
    new RestaurantChatbot();
} else {
    document.addEventListener('DOMContentLoaded', () => new RestaurantChatbot());
}
