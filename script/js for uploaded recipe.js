document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Elements for Recipe Data ---
    const recipeTitleElement = document.getElementById('recipeTitle');
    const recipeDateElement = document.getElementById('recipeDate');
    const recipePrepTimeElement = document.getElementById('recipePrepTime');
    const recipeCookTimeElement = document.getElementById('recipeCookTime');
    const recipeTagsElement = document.getElementById('recipeTags');
    const mainRecipeImageElement = document.getElementById('mainRecipeImage');
    const nutritionCaloriesElement = document.getElementById('nutritionCalories');
    const nutritionProteinElement = document.getElementById('nutritionProtein');
    const nutritionTotalFatElement = document.getElementById('nutritionTotalFat');
    const nutritionCarbohydrateElement = document.getElementById('nutritionCarbohydrate');
    const nutritionCholesterolElement = document.getElementById('nutritionCholesterol');
    const nutritionDescriptionElement = document.getElementById('nutritionDescription');
    const recipeDescriptionElement = document.getElementById('recipeDescription');
    const ingredientsListElement = document.getElementById('ingredientsList');
    const directionsListElement = document.getElementById('directionsList');
    const deleteRecipeButton = document.getElementById('deleteRecipeButton');

    // --- Elements for existing interactions (from your provided code) ---
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
    const playButton = document.querySelector('.play-button'); // Assuming you might add this HTML later

    // --- User ID for Authorization ---
    const userId = localStorage.getItem('userId');

    // --- Get Recipe ID from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        alert('Recipe ID not found in URL. Redirecting to home.');
        window.location.href = 'index.html'; // Redirect if no recipe ID
        return;
    }

    // --- Function to fetch and display recipe details ---
    async function fetchRecipeDetails() {
        try {
            const response = await fetch(`http://localhost:3000/recipes/${recipeId}`);
            const data = await response.json();

            if (response.ok && data.recipe) {
                const recipe = data.recipe;

                // Populate header info
                if (recipeTitleElement) recipeTitleElement.innerHTML = `<i class="fas fa-leaf"></i> ${recipe.name}`;
                if (recipeDateElement) {
                    const createdAtDate = new Date(recipe.created_at);
                    recipeDateElement.textContent = createdAtDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                }
                if (recipePrepTimeElement) recipePrepTimeElement.textContent = `${recipe.prep_time || 'N/A'} min`;
                if (recipeCookTimeElement) recipeCookTimeElement.textContent = `${recipe.cooking_time || 'N/A'} min`;
                if (recipeTagsElement) recipeTagsElement.textContent = recipe.tags || 'General';

                // Populate main image
                if (mainRecipeImageElement) {
                    mainRecipeImageElement.src = recipe.image_url ? `http://localhost:3000${recipe.image_url}` : 'Image/placeholder-recipe.jpg';
                    mainRecipeImageElement.alt = recipe.name;
                }

                // Populate nutrition info
                if (nutritionCaloriesElement) nutritionCaloriesElement.textContent = `${recipe.calories || 'N/A'} kcal`;
                if (nutritionProteinElement) nutritionProteinElement.textContent = `${recipe.protein || 'N/A'} g`;
                if (nutritionTotalFatElement) nutritionTotalFatElement.textContent = `${recipe.total_fat || 'N/A'} g`;
                if (nutritionCarbohydrateElement) nutritionCarbohydrateElement.textContent = `${recipe.carbohydrate || 'N/A'} g`;
                if (nutritionCholesterolElement) nutritionCholesterolElement.textContent = `${recipe.cholesterol || 'N/A'} mg`;
                if (nutritionDescriptionElement) nutritionDescriptionElement.textContent = recipe.allergens || 'No allergen info provided.'; // Using allergens for this text

                // Populate main description
                if (recipeDescriptionElement) recipeDescriptionElement.textContent = recipe.description || 'No description provided.';

                // Populate ingredients
                if (ingredientsListElement) {
                    ingredientsListElement.innerHTML = '<h2>Ingredients</h2>'; // Clear existing static content
                    if (recipe.ingredients) {
                        const ingredientsArray = recipe.ingredients.split('\n').filter(line => line.trim() !== '');
                        const ul = document.createElement('ul');
                        ingredientsArray.forEach(ingredient => {
                            const li = document.createElement('li');
                            li.innerHTML = `<label class="checkbox-container"><input type="checkbox"><span class="checkmark"></span>${ingredient}</label>`;
                            ul.appendChild(li);
                        });
                        ingredientsListElement.appendChild(ul);
                        // Re-attach checkbox listeners after dynamic content is added
                        attachCheckboxListeners();
                    } else {
                        ingredientsListElement.innerHTML += '<p>No ingredients listed.</p>';
                    }
                }

                // Populate directions
                if (directionsListElement) {
                    directionsListElement.innerHTML = '<h2>Directions</h2>'; // Clear existing static content
                    if (recipe.directions) {
                        const directionsArray = recipe.directions.split('\n').filter(line => line.trim() !== '');
                        directionsArray.forEach((direction, index) => {
                            const div = document.createElement('div');
                            div.classList.add('direction-step');
                            div.innerHTML = `<h3>${index + 1}. ${direction}</h3>`;
                            // If you stored direction images, you'd add logic here to display them
                            directionsListElement.appendChild(div);
                        });
                    } else {
                        directionsListElement.innerHTML += '<p>No directions listed.</p>';
                    }
                }

                // Show/hide delete button based on ownership
                if (deleteRecipeButton) {
                    if (userId && parseInt(userId) === recipe.user_id) {
                        deleteRecipeButton.style.display = 'block'; // Show delete button
                        deleteRecipeButton.addEventListener('click', handleDeleteRecipe);
                    } else {
                        deleteRecipeButton.style.display = 'none'; // Hide delete button
                    }
                }

            } else {
                alert('Recipe not found or an error occurred: ' + (data.message || 'Unknown error.'));
                window.location.href = 'index.html'; // Redirect if recipe not found
            }
        } catch (error) {
            console.error('Network error fetching recipe details:', error);
            alert('Network error. Could not load recipe details.');
            window.location.href = 'index.html'; // Redirect on network error
        }
    }

    // --- Function to handle recipe deletion ---
    async function handleDeleteRecipe() {
        if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            return; // User cancelled
        }

        try {
            const response = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: userId }) // Send userId for authorization
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = 'My profile.html'; // Redirect to profile after deletion
            } else {
                alert('Failed to delete recipe: ' + (data.message || 'Unknown error.'));
                console.error('Delete error:', data);
            }
        } catch (error) {
            console.error('Network error during recipe deletion:', error);
            alert('Network error. Could not delete recipe.');
        }
    }

    // --- Existing Checkbox Logic (re-attached after dynamic content loads) ---
    function attachCheckboxListeners() {
        const currentCheckboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');
        currentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                if (event.target.checked) {
                    console.log(`Ingredient "${event.target.parentNode.textContent.trim()}" checked.`);
                    // Add any visual feedback for checked items if needed
                } else {
                    console.log(`Ingredient "${event.target.parentNode.textContent.trim()}" unchecked.`);
                    // Remove any visual feedback for unchecked items if needed
                }
            });
        });
    }

    // --- Existing Play Button Interaction (placeholder) ---
    if (playButton) {
        playButton.addEventListener('click', () => {
            alert('Play video functionality would go here!');
            // In a real application, you'd replace the image with a video player
        });
    }

    // --- Initial Call to Fetch Recipe Details ---
    fetchRecipeDetails();
});