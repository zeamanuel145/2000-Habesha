// Star Rating Functionality
        let currentRating = 0;
        
        document.addEventListener('DOMContentLoaded', function() {
            const stars = document.querySelectorAll('#userRating .fa-star');
            
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    currentRating = parseInt(this.getAttribute('data-rating'));
                    updateStars(currentRating);
                });
                
                star.addEventListener('mouseover', function() {
                    const rating = parseInt(this.getAttribute('data-rating'));
                    updateStars(rating);
                });
            });
            
            document.getElementById('userRating').addEventListener('mouseleave', function() {
                updateStars(currentRating);
            });
        });
        
        function updateStars(rating) {
            const stars = document.querySelectorAll('#userRating .fa-star');
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.remove('text-gray-300');
                    star.classList.add('text-yellow-400');
                } else {
                    star.classList.remove('text-yellow-400');
                    star.classList.add('text-gray-300');
                }
            });
        }

        // Menu Filtering Functionality
        function showMenu(menuType) {
            // Hide all menus
            document.getElementById('featuredMenu').classList.add('hidden');
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('drinksMenu').classList.add('hidden');
            
            // Reset all button styles
            document.getElementById('featuredBtn').className = 'bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors';
            document.getElementById('mainBtn').className = 'bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors';
            document.getElementById('drinksBtn').className = 'bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors';
            
            // Show selected menu and update button style
            if (menuType === 'featured') {
                document.getElementById('featuredMenu').classList.remove('hidden');
                document.getElementById('featuredBtn').className = 'bg-amber-800 text-white px-6 py-2 rounded-lg transition-colors';
                document.getElementById('menuTitle').textContent = 'Featured Dishes';
            } else if (menuType === 'main') {
                document.getElementById('mainMenu').classList.remove('hidden');
                document.getElementById('mainBtn').className = 'bg-amber-800 text-white px-6 py-2 rounded-lg transition-colors';
                document.getElementById('menuTitle').textContent = 'Main Dishes';
            } else if (menuType === 'drinks') {
                document.getElementById('drinksMenu').classList.remove('hidden');
                document.getElementById('drinksBtn').className = 'bg-amber-800 text-white px-6 py-2 rounded-lg transition-colors';
                document.getElementById('menuTitle').textContent = 'Drinks';
            }
        }

        // Modal Functions
        function openReservationModal() {
            document.getElementById('reservationModal').classList.remove('hidden');
        }

        function closeReservationModal() {
            document.getElementById('reservationModal').classList.add('hidden');
        }

        function closeSuccessModal() {
            document.getElementById('successModal').classList.add('hidden');
        }

        // Form Submissions
        document.getElementById('reservationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            closeReservationModal();
            document.getElementById('successMessage').textContent = 'Thank you! Your reservation has been confirmed!';
            document.getElementById('successModal').classList.remove('hidden');
        });

        document.getElementById('feedbackForm').addEventListener('submit', function(e) {
            e.preventDefault();
            if (currentRating === 0) {
                alert('Please select a rating before submitting your feedback.');
                return;
            }
            document.getElementById('successMessage').textContent = 'Thank you! Your feedback has been received.';
            document.getElementById('successModal').classList.remove('hidden');
            this.reset();
            currentRating = 0;
            updateStars(0);
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

// Chatbot functionality
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

        this.initializeEventListeners();
        this.hideTypingIndicator();
    }

    initializeEventListeners() {
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.closeChat.addEventListener('click', () => this.toggleChat());

        this.sendMessage.addEventListener('click', () => this.handleSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
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

    handleBotResponse(userMessage) {
        this.showTypingIndicator();

        fetch('https://two000-habesha.onrender.com', {  
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_message: userMessage })
        })
        .then(response => response.json())
        .then(data => {
            this.hideTypingIndicator();
            this.sendBotMessage(data.bot_response);
        })
        .catch(error => {
            this.hideTypingIndicator();
            this.sendBotMessage("Sorry! Something went wrong. Please try again later.");
            console.error('Error:', error);
        });
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
        this.typingIndicator.classList.remove('hidden');
        this.isTyping = true;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
        this.isTyping = false;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize chatbot
function initializeChatbot() {
    new RestaurantChatbot();
}
