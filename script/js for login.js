document.addEventListener('DOMContentLoaded', () => {
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

            // Clear previous errors
            emailError.textContent = '';
            passwordError.textContent = '';
            finalResult.textContent = ''; // Clear final result message

            let isValid = true;

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
            }

            if (isValid) {
                try {
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

                        // --- IMPORTANT: Store user data in localStorage ---
                        localStorage.setItem('userId', data.userId);
                        localStorage.setItem('userName', data.userName);
                        localStorage.setItem('userDescription', data.userDescription || ''); // Store, default to empty if null/undefined
                        localStorage.setItem('userFavoriteTags', data.userFavoriteTags || ''); // Store, default to empty if null/undefined

                        // Redirect to the profile page or home page
                        setTimeout(() => {
                            // You can choose to redirect to My profile.html directly after login,
                            // or keep it as index.html. For profile feature, profile is more direct.
                            window.location.href = '../My profile.html'; // Redirect to My profile page
                            // Or: window.location.href = '../index.html'; // Redirect to home page
                        }, 1500);
                    } else {
                        finalResult.style.color = 'red';
                        finalResult.textContent = data.message || 'Login failed. Please try again.';
                    }
                } catch (error) {
                    console.error('Error during login fetch:', error);
                    finalResult.style.color = 'red';
                    finalResult.textContent = 'Network error. Please try again later.';
                }
            }
        });
    }

    // --- Register Form Submission --- (Keep as is, no changes needed here for profile functionality)
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
            
            // Clear previous errors
            nameError.textContent = '';
            emailError.textContent = '';
            passwordError.textContent = '';
            confirmError.textContent = '';
            finalResult.textContent = ''; // Clear final result message


            let isValid = true;

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
                        // Optionally redirect to login page after successful registration
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    } else {
                        finalResult.style.color = 'red';
                        finalResult.textContent = data.message || 'Registration failed. Please try again.';
                    }
                } catch (error) {
                    console.error('Error during registration fetch:', error);
                    finalResult.style.color = 'red';
                    finalResult.textContent = 'Network error. Please try again later.';
                }
            }
        });
    }
});

// For dark mode button if it's in js.js, make sure it's not conflicting
// Example from your index.html:
function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}