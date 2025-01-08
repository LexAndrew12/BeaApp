document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Switch between login and register forms
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

        if (password !== passwordConfirm) {
            showError('A jelszavak nem egyeznek!');
            return;
        }

        // Store user data
        const userData = {
            name,
            email,
            password: hashPassword(password), // In real app, use proper encryption
            data: {} // Initial empty data
        };

        try {
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[email]) {
                showError('Ez az email cím már regisztrálva van!');
                return;
            }

            users[email] = userData;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Auto login after registration
            loginUser(email);
        } catch (error) {
            showError('Hiba történt a regisztráció során!');
        }
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const users = JSON.parse(localStorage.getItem('users')) || {};
            const user = users[email];

            if (!user || user.password !== hashPassword(password)) {
                showError('Hibás email cím vagy jelszó!');
                return;
            }

            loginUser(email);
        } catch (error) {
            showError('Hiba történt a bejelentkezés során!');
        }
    });

    // Helper functions
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const form = document.querySelector('form:not(.hidden)');
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => errorDiv.remove(), 3000);
    }

    function hashPassword(password) {
        // In a real app, use proper encryption
        return btoa(password);
    }

    function loginUser(email) {
        sessionStorage.setItem('currentUser', email);
        window.location.href = 'index.html';
    }

    // Check if user is already logged in
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'index.html';
    }
}); 