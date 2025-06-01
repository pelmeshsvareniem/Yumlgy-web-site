document.addEventListener("DOMContentLoaded", () => {
    // --- Elements for the Recipe Creation Form ---
    const createRecipeForm = document.getElementById('createRecipeForm');
    const recipeResult = document.getElementById('recipeResult');

    // Main recipe image upload elements
    const recipeImageInput = document.getElementById('recipeImageInput');
    const imagePreview = document.getElementById('imagePreview');
    const triggerImageUploadButton = document.getElementById('triggerImageUpload');

    // Ingredient handling elements
    const addIngredientBtn = document.querySelector(".add-btn");
    const initialIngredientTextarea = document.querySelector("textarea[name='ingredients'].ingredient-textarea");
    let ingredientContainer;

    // Directions handling elements
    // Updated selector to match the new ID for clarity
    const triggerDirectionImageUploadButton = document.getElementById("triggerDirectionImageUpload");
    const directionsTextarea = document.querySelector("textarea[name='directions']");

    // Reference the hidden input for direction images from the HTML
    const directionImageInput = document.getElementById("directionImageInput");


    // --- Event Listeners ---

    // 1. Trigger Main Recipe Image Upload Input
    if (triggerImageUploadButton && recipeImageInput) {
        triggerImageUploadButton.addEventListener("click", () => {
            recipeImageInput.click(); // Programmatically click the hidden file input
        });
    }

    // 2. Main Recipe Image Preview
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

    // 3. Add More Ingredients Textarea
    if (addIngredientBtn && initialIngredientTextarea) {
        ingredientContainer = initialIngredientTextarea.parentNode;

        addIngredientBtn.addEventListener("click", () => {
            const newTextarea = initialIngredientTextarea.cloneNode(true);
            newTextarea.value = "";
            newTextarea.name = "ingredients";
            newTextarea.classList.add("ingredient-textarea");

            ingredientContainer.insertBefore(newTextarea, addIngredientBtn);
        });
    }

    // 4. Trigger Directions Image Upload Input
    // This now triggers the hidden HTML input for direction images
    if (triggerDirectionImageUploadButton && directionImageInput) {
        triggerDirectionImageUploadButton.addEventListener("click", () => {
            directionImageInput.click(); // Programmatically click the hidden file input
        });

        // Optional: You might want to add a preview or list of selected direction images here
        // For now, this just logs selection.
        directionImageInput.addEventListener("change", () => {
            if (directionImageInput.files.length > 0) {
                console.log(`${directionImageInput.files.length} direction image(s) selected for upload.`);
                // Example: You could display file names in a div here
                // let fileNames = Array.from(directionImageInput.files).map(f => f.name).join(', ');
                // SomeElementForDisplay.textContent = `Selected: ${fileNames}`;
            }
        });
    }


    // --- Recipe Form Submission Handler ---
    if (createRecipeForm) {
        createRecipeForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission (page reload)

            recipeResult.textContent = ''; // Clear any previous messages
            recipeResult.style.color = ''; // Reset message color

            const formData = new FormData(); // Create a new FormData object

            // Manually append text fields from the form
            // Filter out file inputs here, as they are handled explicitly by name below
            createRecipeForm.querySelectorAll('input[name], textarea[name]').forEach(input => {
                // Handle multiple ingredient textareas
                if (input.name === 'ingredients' && input.classList.contains('ingredient-textarea')) {
                    const allIngredients = Array.from(document.querySelectorAll('textarea[name="ingredients"].ingredient-textarea'))
                                            .map(textarea => textarea.value.trim())
                                            .filter(value => value !== '')
                                            .join('\n');
                    formData.set('ingredients', allIngredients);
                }
                // Only append non-file inputs here
                else if (input.type !== 'file') {
                    formData.append(input.name, input.value.trim());
                }
            });

            // Explicitly append the main recipe image
            if (recipeImageInput && recipeImageInput.files.length > 0) {
                formData.append('recipeImage', recipeImageInput.files[0]);
            }

            // Explicitly append direction images (multiple files are allowed)
            if (directionImageInput && directionImageInput.files.length > 0) {
                for (let i = 0; i < directionImageInput.files.length; i++) {
                    formData.append('directionImages', directionImageInput.files[i]);
                }
            }

            try {
                // Send data to your backend API endpoint
                const response = await fetch('http://localhost:3000/recipes', {
                    method: 'POST',
                    body: formData // FormData handles setting 'Content-Type: multipart/form-data' automatically
                });

                const data = await response.json(); // Parse the JSON response from the backend

                if (response.ok) { // Check if the response status is 2xx (success)
                    recipeResult.style.color = 'green';
                    recipeResult.textContent = data.message; // Display success message
                    createRecipeForm.reset(); // Clear all form fields
                    if (imagePreview) {
                        imagePreview.src = ''; // Clear main image preview
                        imagePreview.style.display = 'none'; // Hide main image preview
                    }
                    // Reset dynamically added ingredient textareas
                    Array.from(document.querySelectorAll('textarea.ingredient-textarea')).forEach((textarea, index) => {
                        if (index > 0) textarea.remove(); // Remove all but the first one
                    });
                    if (initialIngredientTextarea) initialIngredientTextarea.value = ""; // Clear the first one
                    
                    // Optional: You might want to redirect the user or update a list of recipes here
                } else { // Handle HTTP error responses (e.g., 400, 500)
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

    // --- Placeholder for any existing login/register form logic in this file ---
    // If you have existing code for login/register forms in this same js file,
    // ensure it's still here or moved appropriately.
});