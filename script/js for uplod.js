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
    const directionsTextarea = document.querySelector("textarea[name='directions']");

    const directionImageInput = document.getElementById("directionImageInput");

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


    if (createRecipeForm) {
        createRecipeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            recipeResult.textContent = '';
            recipeResult.style.color = '';

            const formData = new FormData(); 

            createRecipeForm.querySelectorAll('input[name], textarea[name]').forEach(input => {

                if (input.name === 'ingredients' && input.classList.contains('ingredient-textarea')) {
                    const allIngredients = Array.from(document.querySelectorAll('textarea[name="ingredients"].ingredient-textarea'))
                                            .map(textarea => textarea.value.trim())
                                            .filter(value => value !== '')
                                            .join('\n');
                    formData.set('ingredients', allIngredients);
                }
                else if (input.type !== 'file') {
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
                // Handle network errors (e.g., server not running, no internet connection)
                console.error('Network error submitting recipe:', error);
                recipeResult.style.color = 'red';
                recipeResult.textContent = 'Network error. Could not connect to the server.';
            }
        });
    } });
