document.addEventListener("DOMContentLoaded", () => {
    const createRecipeForm = document.getElementById('createRecipeForm');
    const recipeResult = document.getElementById('recipeResult');

    const recipeImageInput = document.getElementById('recipeImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const triggerImageUploadButton = document.getElementById('triggerImageUpload');

    const addIngredientBtn = document.querySelector(".add-btn");
    const initialIngredientTextarea = document.querySelector("textarea[name='ingredients'].ingredient-textarea");
    let ingredientContainer;

    const triggerDirectionImageUploadButton = document.getElementById("triggerDirectionImageUpload");
    const directionsTextarea = document.querySelector("textarea[name='directions']"); // Not directly used in the submit, but good to have
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

            // --- IMPORTANT: Get userId from localStorage ---
            const userId = localStorage.getItem('userId');

            if (!userId) {
                recipeResult.style.color = 'red';
                recipeResult.textContent = 'Error: You must be logged in to upload a recipe.';
                alert('You must be logged in to upload a recipe. Redirecting to login...');
                window.location.href = 'login-password/login.html'; // Redirect to login page
                return; // Stop execution
            }

            const formData = new FormData();

            // Append userId to formData
            formData.append('userId', userId); // This is the crucial line!

            // Iterate over all relevant form elements and append them
            createRecipeForm.querySelectorAll('input[name], textarea[name]').forEach(input => {
                // Special handling for multiple ingredient textareas
                if (input.name === 'ingredients' && input.classList.contains('ingredient-textarea')) {
                    const allIngredients = Array.from(document.querySelectorAll('textarea[name="ingredients"].ingredient-textarea'))
                        .map(textarea => textarea.value.trim())
                        .filter(value => value !== '')
                        .join('\n'); // Join all ingredients with a newline character
                    formData.set('ingredients', allIngredients); // Use set to ensure only one 'ingredients' field
                }
                // Handle regular text inputs and textareas (but exclude file inputs, handled separately)
                else if (input.type !== 'file') {
                    formData.append(input.name, input.value.trim());
                }
                // Note: The `userId` handling for `formData.append('userId', userId)` is already done outside this loop.
            });

            // Append recipe main image
            if (recipeImageInput && recipeImageInput.files.length > 0) {
                formData.append('recipeImage', recipeImageInput.files[0]);
            }

            // Append direction images
            if (directionImageInput && directionImageInput.files.length > 0) {
                for (let i = 0; i < directionImageInput.files.length; i++) {
                    formData.append('directionImages', directionImageInput.files[i]);
                }
            }

            try {
                const response = await fetch('http://localhost:3000/recipes', {
                    method: 'POST',
                    body: formData // FormData automatically sets 'Content-Type': 'multipart/form-data'
                });

                const data = await response.json();

                if (response.ok) {
                    recipeResult.style.color = 'green';
                    recipeResult.textContent = data.message;
                    // Reset the form and previews after successful submission
                    createRecipeForm.reset();
                    if (imagePreview) {
                        imagePreview.src = '';
                        imagePreview.style.display = 'none';
                    }
                    // Remove dynamically added ingredient textareas and clear the initial one
                    Array.from(document.querySelectorAll('textarea.ingredient-textarea')).forEach((textarea, index) => {
                        if (index > 0) textarea.remove();
                    });
                    if (initialIngredientTextarea) initialIngredientTextarea.value = "";

                    // Optional: Redirect to profile page after successful upload
                    // window.location.href = 'My profile.html';

                } else {
                    recipeResult.style.color = 'red';
                    recipeResult.textContent = data.message || 'Failed to create recipe. Please check your inputs.';
                    console.error('Backend error:', data.message);
                }
            } catch (error) {
                // Handle network errors (e.g., server not running, no internet connection)
                console.error('Network error submitting recipe:', error);
                recipeResult.style.color = 'red';
                recipeResult.textContent = 'Network error. Could not connect to the server.';
            }
        });
    }
});