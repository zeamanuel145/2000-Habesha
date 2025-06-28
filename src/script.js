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