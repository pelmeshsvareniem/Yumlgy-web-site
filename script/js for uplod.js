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
    // Select the initial ingredient textarea by its name and class
    const initialIngredientTextarea = document.querySelector("textarea[name='ingredients'].ingredient-textarea");
    let ingredientContainer; // This will be the parent of ingredient textareas

    // Directions handling elements
    const addImgBtn = document.querySelector(".add-img-btn");
    const directionsTextarea = document.querySelector("textarea[name='directions']");

    // --- Dynamic File Input for Directions Image (if needed) ---
    // This input is for images *within* directions, not the main recipe image
    const directionImgInput = document.createElement("input");
    directionImgInput.type = "file";
    directionImgInput.accept = "image/*";
    directionImgInput.style.display = "none";
    document.body.appendChild(directionImgInput);


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
            const file = this.files[0]; // Get the selected file
            if (file) {
                const reader = new FileReader(); // FileReader to read file content
                reader.onload = (e) => {
                    imagePreview.src = e.target.result; // Set the image source
                    imagePreview.style.display = 'block'; // Make the image visible
                };
                reader.readAsDataURL(file); // Read the file as a Data URL (base64 string)
            } else {
                imagePreview.src = ''; // Clear image if no file selected
                imagePreview.style.display = 'none'; // Hide the image
            }
        });
    }

    // 3. Add More Ingredients Textarea
    if (addIngredientBtn && initialIngredientTextarea) {
        // Find the parent container for ingredients (e.g., the div holding the first textarea and the add button)
        // This helps insert new textareas in the correct place relative to the button
        ingredientContainer = initialIngredientTextarea.parentNode;

        addIngredientBtn.addEventListener("click", () => {
            // Clone the initial textarea to maintain its styling and attributes
            const newTextarea = initialIngredientTextarea.cloneNode(true); // true for deep clone (copies attributes)
            newTextarea.value = ""; // Clear its value
            // Ensure it has the same name attribute so FormData can pick it up
            newTextarea.name = "ingredients"; // Explicitly set name if cloning doesn't always copy it
            newTextarea.classList.add("ingredient-textarea"); // Ensure class is present for selection

            // Insert the new textarea before the "Add" button
            ingredientContainer.insertBefore(newTextarea, addIngredientBtn);
        });
    }

    // 4. Add Image to Directions Textarea (Markdown format)
    if (addImgBtn && directionsTextarea && directionImgInput) {
        addImgBtn.addEventListener("click", () => {
            directionImgInput.click(); // Trigger the hidden file input for directions image
        });

        directionImgInput.addEventListener("change", () => {
            const file = directionImgInput.files[0];
            if (file) {
                // This creates a fake path for markdown. The actual image is NOT uploaded via this input.
                // It's assumed the main recipe image input handles the actual file upload to the server.
                // If you need multiple images for directions, you'd need a more complex backend setup
                // (e.g., multiple file uploads, or a rich text editor that handles image embeds).
                const fakePath = `images/${file.name}`; // This path is for display/markdown only
                const imageMarkdown = `\n\n![Step image](${fakePath})\n`;
                directionsTextarea.value += imageMarkdown; // Append markdown to directions
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
            // Get all input fields with 'name' attributes
            createRecipeForm.querySelectorAll('input[name], textarea[name]').forEach(input => {
                // Handle multiple ingredient textareas
                if (input.name === 'ingredients' && input.classList.contains('ingredient-textarea')) {
                    // Collect all ingredient textareas and join their values
                    const allIngredients = Array.from(document.querySelectorAll('textarea[name="ingredients"].ingredient-textarea'))
                                                .map(textarea => textarea.value.trim())
                                                .filter(value => value !== '') // Filter out empty ones
                                                .join('\n'); // Join with newlines
                    formData.set('ingredients', allIngredients); // Set the combined value for 'ingredients'
                } else if (input.type === 'file') {
                    // Handle file input separately
                    if (input.files.length > 0) {
                        formData.append(input.name, input.files[0]);
                    }
                } else {
                    formData.append(input.name, input.value.trim());
                }
            });

            // Ensure the main recipe image is appended
            if (recipeImageInput && recipeImageInput.files.length > 0) {
                formData.append('recipeImage', recipeImageInput.files[0]);
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
                        imagePreview.src = '#'; // Clear image preview
                        imagePreview.style.display = 'none'; // Hide image preview
                    }
                    // Hide dynamically added ingredient textareas, or reset them
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
    // Example:
    // const loginForm = document.getElementById('loginForm');
    // if (loginForm) {
    //     loginForm.addEventListener('submit', async (event) => { /* ... login logic ... */ });
    // }
});
