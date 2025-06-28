// Star Rating Functionality
let currentRating = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize star rating
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

    // Initialize form event listeners - MOVED INSIDE DOMContentLoaded
    initializeFormListeners();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
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

// Initialize form listeners - NEW FUNCTION
function initializeFormListeners() {
    // Reservation form
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Reservation form submitted'); // Debug log
            closeReservationModal();
            document.getElementById('successMessage').textContent = 'Thank you! Your reservation has been confirmed!';
            document.getElementById('successModal').classList.remove('hidden');
        });
    } else {
        console.error('Reservation form not found');
    }

    // Feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Feedback form submitted'); // Debug log
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
    } else {
        console.error('Feedback form not found');
    }
}

// Initialize smooth scrolling - NEW FUNCTION
function initializeSmoothScrolling() {
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
    console.log('Opening reservation modal'); // Debug log
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('Reservation modal not found');
    }
}

function closeReservationModal() {
    console.log('Closing reservation modal'); // Debug log
    const modal = document.getElementById('reservationModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function closeSuccessModal() {
    console.log('Closing success modal'); // Debug log
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Test function to check if elements exist
function debugElements() {
    console.log('Reservation form:', document.getElementById('reservationForm'));
    console.log('Feedback form:', document.getElementById('feedbackForm'));
    console.log('Reservation modal:', document.getElementById('reservationModal'));
    console.log('Success modal:', document.getElementById('successModal'));
}

// Call debug function after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(debugElements, 1000); // Wait 1 second then check
});