document.addEventListener("DOMContentLoaded", () => {
    // --- Dark Mode Toggle Functionality ---
    const darkModeToggle = document.getElementById('darkModeToggle');

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        // Add any other elements that need dark mode styling toggled here
    }

    // Load saved theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        if (darkModeToggle) {
            darkModeToggle.textContent = savedTheme === 'dark' ? 'Light mode' : 'Dark mode';
        }
    } else {
        // Default to light mode if no preference saved
        applyTheme('light');
        if (darkModeToggle) {
            darkModeToggle.textContent = 'Dark mode';
        }
    }

    // Add event listener for the toggle button
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme); // Save preference
            darkModeToggle.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
        });
    }
    // --- END Dark Mode Toggle Functionality ---


    const createRecipeForm = document.getElementById('createRecipeForm');
    const recipeResult = document.getElementById('recipeResult');

    const recipeImageInput = document.getElementById('recipeImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const triggerImageUploadButton = document.getElementById('triggerImageUpload');

    const addIngredientBtn = document.querySelector(".add-btn");
    const initialIngredientTextarea = document.querySelector("textarea[name='ingredients'].ingredient-textarea");
    let ingredientContainer;

    const triggerDirectionImageUploadButton = document.getElementById("triggerDirectionImageUpload");
    const directionsTextarea = document.querySelector("textarea[name='directions']");
    const directionImageInput = document.getElementById("directionImageInput");

    // --- Event Listeners for Image Upload Buttons ---
    if (triggerImageUploadButton && recipeImageInput) {
        triggerImageUploadButton.addEventListener("click", () => {
            recipeImageInput.click();
        });
    }

    if (recipeImageInput && imagePreview) {
        recipeImageInput.addEventListener("change", function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
            }
        });
    }
 // --- Dynamic "My profile" Link ---
    const myProfileLink = document.querySelector('header .btn-profile[href="login-password/login.html"]');
    const userId = localStorage.getItem('userId');

    if (myProfileLink) {
        if (userId) {
            // If user is logged in, change the link to point to their profile page
            myProfileLink.href = 'My profile.html';
        } else {
            // If user is not logged in, ensure it points to the login page
            myProfileLink.href = 'login-password/login.html';
        }
    }
    // --- END Dynamic "My profile" Link ---
    // --- Add Ingredient Button ---
    if (addIngredientBtn && initialIngredientTextarea) {
        ingredientContainer = initialIngredientTextarea.parentNode;

        addIngredientBtn.addEventListener("click", () => {
            const newTextarea = initialIngredientTextarea.cloneNode(true);
            newTextarea.value = "";
            newTextarea.name = "ingredients"; // Ensure the name is 'ingredients'
            newTextarea.classList.add("ingredient-textarea");

            ingredientContainer.insertBefore(newTextarea, addIngredientBtn);
        });
    }

    // --- Direction Image Upload ---
    if (triggerDirectionImageUploadButton && directionImageInput) {
        triggerDirectionImageUploadButton.addEventListener("click", () => {
            directionImageInput.click();
        });

        directionImageInput.addEventListener("change", () => {
            if (directionImageInput.files.length > 0) {
                console.log(`${directionImageInput.files.length} direction image(s) selected for upload.`);
            }
        });
    }

    // --- Recipe Form Submission ---
    if (createRecipeForm) {
        createRecipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            recipeResult.textContent = '';
            recipeResult.style.color = '';

            const userId = localStorage.getItem('userId');

            if (!userId) {
                recipeResult.style.color = 'red';
                recipeResult.textContent = 'Error: You must be logged in to upload a recipe.';
                alert('You must be logged in to upload a recipe. Redirecting to login...');
                window.location.href = 'login-password/login.html';
                return;
            }

            const formData = new FormData();
            formData.append('userId', userId);

            createRecipeForm.querySelectorAll('input[name], textarea[name]').forEach(input => {
                if (input.name === 'ingredients' && input.classList.contains('ingredient-textarea')) {
                    const allIngredients = Array.from(document.querySelectorAll('textarea[name="ingredients"].ingredient-textarea'))
                        .map(textarea => textarea.value.trim())
                        .filter(value => value !== '')
                        .join('\n');
                    formData.set('ingredients', allIngredients);
                } else if (input.type !== 'file') {
                    formData.append(input.name, input.value.trim());
                }
            });

            if (recipeImageInput && recipeImageInput.files.length > 0) {
                formData.append('recipeImage', recipeImageInput.files[0]);
            }

            if (directionImageInput && directionImageInput.files.length > 0) {
                for (let i = 0; i < directionImageInput.files.length; i++) {
                    formData.append('directionImages', directionImageInput.files[i]);
                }
            }

            try {
                const response = await fetch('http://localhost:3000/recipes', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    recipeResult.style.color = 'green';
                    recipeResult.textContent = data.message;
                    createRecipeForm.reset();
                    if (imagePreview) {
                        imagePreview.src = '';
                        imagePreview.style.display = 'none';
                    }
                    Array.from(document.querySelectorAll('textarea.ingredient-textarea')).forEach((textarea, index) => {
                        if (index > 0) textarea.remove();
                    });
                    if (initialIngredientTextarea) initialIngredientTextarea.value = "";

                } else {
                    recipeResult.style.color = 'red';
                    recipeResult.textContent = data.message || 'Failed to create recipe. Please check your inputs.';
                    console.error('Backend error:', data.message);
                }
            } catch (error) {
                console.error('Network error submitting recipe:', error);
                recipeResult.style.color = 'red';
                recipeResult.textContent = 'Network error. Could not connect to the server.';
            }
        });
    }
});