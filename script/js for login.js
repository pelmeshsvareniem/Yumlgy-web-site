document.addEventListener('DOMContentLoaded', () => {
    // --- Dark Mode Persistence Functionality (No Button) ---

    /**
     * Applies the specified theme to the document body.
     * @param {string} theme - The theme to apply ('dark' or 'light').
     */
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        // This is where you would add logic for specific images or elements
        // that need their styles inverted or changed based on dark mode,
        // if not handled purely by CSS variables and filters.
    }

    // Load saved theme preference from localStorage on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        // Apply the saved theme immediately
        applyTheme(savedTheme);
    } else {
        // If no theme is saved, default to light mode
        applyTheme('light');
    }
    // --- END Dark Mode Persistence Functionality ---


    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const finalResult = document.getElementById('finalResult');

    // --- Login Form Submission ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');

            // Clear previous errors and result message
            emailError.textContent = '';
            passwordError.textContent = '';
            finalResult.textContent = '';

            let isValid = true;

            // Basic client-side validation for email
            if (!email) {
                emailError.textContent = 'Email is required.';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                emailError.textContent = 'Invalid email format.';
                isValid = false;
            }

            // Basic client-side validation for password
            if (!password) {
                passwordError.textContent = 'Password is required.';
                isValid = false;
            }

            if (isValid) {
                try {
                    // Send login request to the backend
                    const response = await fetch('http://localhost:3000/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        finalResult.style.color = 'green';
                        finalResult.textContent = data.message;

                        // Store user data in localStorage upon successful login
                        localStorage.setItem('userId', data.userId);
                        localStorage.setItem('userName', data.userName);
                        localStorage.setItem('userDescription', data.userDescription || ''); // Default to empty if null/undefined
                        localStorage.setItem('userFavoriteTags', data.userFavoriteTags || ''); // Default to empty if null/undefined
                        localStorage.setItem('userProfileImageUrl', data.userProfileImageUrl || ''); // Store profile image URL

                        // Redirect to the profile page after a short delay
                        setTimeout(() => {
                            window.location.href = '../My profile.html'; // Adjust path if needed
                        }, 1500);
                    } else {
                        // Display error message from the backend
                        finalResult.style.color = 'red';
                        finalResult.textContent = data.message || 'Login failed. Please try again.';
                    }
                } catch (error) {
                    // Handle network errors (e.g., server not running, no internet connection)
                    console.error('Error during login fetch:', error);
                    finalResult.style.color = 'red';
                    finalResult.textContent = 'Network error. Please try again later.';
                }
            }
        });
    }

    // --- Register Form Submission ---
    // This block assumes this same JS file is used for register.html.
    // It will only execute if an element with registerForm ID is found.
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirmPassword');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            const nameError = document.getElementById('nameError');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            const confirmError = document.getElementById('confirmError');

            // Clear previous errors and result message
            nameError.textContent = '';
            emailError.textContent = '';
            passwordError.textContent = '';
            confirmError.textContent = '';
            finalResult.textContent = '';

            let isValid = true;

            // Client-side validation for registration fields
            if (!name) {
                nameError.textContent = 'Name is required.';
                isValid = false;
            }

            if (!email) {
                emailError.textContent = 'Email is required.';
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(email)) {
                emailError.textContent = 'Invalid email format.';
                isValid = false;
            }

            if (!password) {
                passwordError.textContent = 'Password is required.';
                isValid = false;
            } else if (password.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters.';
                isValid = false;
            }

            if (!confirmPassword) {
                confirmError.textContent = 'Confirm password is required.';
                isValid = false;
            } else if (password !== confirmPassword) {
                confirmError.textContent = 'Passwords do not match.';
                isValid = false;
            }

            if (isValid) {
                try {
                    // Send registration request to the backend
                    const response = await fetch('http://localhost:3000/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name, email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        finalResult.style.color = 'green';
                        finalResult.textContent = data.message;
                        // Redirect to login page after successful registration
                        setTimeout(() => {
                            window.location.href = 'login.html'; // Adjust path if needed
                        }, 2000);
                    } else {
                        // Display error message from the backend
                        finalResult.style.color = 'red';
                        finalResult.textContent = data.message || 'Registration failed. Please try again.';
                    }
                } catch (error) {
                    // Handle network errors
                    console.error('Error during registration fetch:', error);
                    finalResult.style.color = 'red';
                    finalResult.textContent = 'Network error. Please try again later.';
                }
            }
        });
    }
});
