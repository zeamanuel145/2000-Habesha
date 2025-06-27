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
        this.sendMessage = document.getElementById('sendMessage');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.quickReplyButtons = document.querySelectorAll('.quick-reply');

        this.isOpen = false;
        this.isTyping = false;
        this.apiEndpoint = 'http://127.0.0.1:8000/chat'; // Local FastAPI endpoint

        this.initializeEventListeners();
        this.hideTypingIndicator();
    }

    initializeEventListeners() {
        this.chatToggle?.addEventListener('click', () => this.toggleChat());
        this.closeChat?.addEventListener('click', () => this.toggleChat());

        this.sendMessage?.addEventListener('click', () => this.handleSendMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });

        this.quickReplyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                this.sendUserMessage(message);
                this.handleBotResponse(message);
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.remove('hidden');
            this.chatInput.focus();
            // Send welcome message when chat opens
            if (this.chatMessages.children.length === 0) {
                this.sendBotMessage("Hello! Welcome to 2000 Habesha Restaurant. How can I help you today?");
            }
        } else {
            this.chatWindow.classList.add('hidden');
        }
    }

    handleSendMessage() {
        const message = this.chatInput.value.trim();
        if (message) {
            this.sendUserMessage(message);
            this.chatInput.value = '';
            this.handleBotResponse(message);
        }
    }

    sendUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'flex items-start space-x-2 justify-end';
        messageElement.innerHTML = `
            <div class="bg-amber-100 text-gray-800 px-3 py-2 rounded-lg max-w-xs text-sm">
                ${message}
            </div>
            <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-user text-white text-xs"></i>
            </div>
        `;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    async handleBotResponse(userMessage) {
        this.showTypingIndicator();
        
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ user_message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.hideTypingIndicator();
            this.sendBotMessage(data.bot_response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.sendBotMessage("Sorry! Our chatbot is currently unavailable. Please call us at +251 912 838 383.");
            console.error('Chatbot Error:', error);
            
            // Fallback to default responses for common questions
            const fallbackResponse = this.getFallbackResponse(userMessage.toLowerCase());
            if (fallbackResponse) {
                setTimeout(() => {
                    this.sendBotMessage(fallbackResponse);
                }, 1000);
            }
        }
    }

    getFallbackResponse(message) {
        const fallbacks = {
            "hours": "We're open daily from 10AM to 11PM, with live cultural shows in the evenings!",
            "menu": "Our menu features authentic Ethiopian dishes like Kitfo, Doro Wat, and vegetarian options. Would you like recommendations?",
            "reservation": "You can reserve a table by calling +251 912 838 383 or visiting our website.",
            "location": "We're located on Namibia Street in Bole Atlas, near the Ethiopian Skylight Hotel."
        };

        if (message.includes('hour') || message.includes('time')) return fallbacks.hours;
        if (message.includes('menu')) return fallbacks.menu;
        if (message.includes('reserv') || message.includes('book')) return fallbacks.reservation;
        if (message.includes('where') || message.includes('location')) return fallbacks.location;
        
        return null;
    }

    sendBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'flex items-start space-x-2';
        messageElement.innerHTML = `
            <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="bg-amber-100 text-gray-800 px-3 py-2 rounded-lg max-w-xs text-sm">
                ${message}
            </div>
        `;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.classList.remove('hidden');
            this.typingIndicator.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-robot text-white text-xs"></i>
                    </div>
                    <div class="typing-dots flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            `;
            this.isTyping = true;
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        this.typingIndicator?.classList.add('hidden');
        this.isTyping = false;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new RestaurantChatbot();
});