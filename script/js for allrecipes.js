document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const allRecipesGrid = document.getElementById('allRecipesGrid');
    const darkModeToggle = document.getElementById('darkModeToggle'); // Dark mode button

    // --- Dark Mode Toggle Functionality ---
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        // You might need to adjust other elements' classes/styles based on dark mode
        // For example, if your header/footer/cards have specific dark mode styles.
        // This example assumes 'dark-mode' class on body is sufficient for global styling.
    }

    // Load saved theme preference
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

    // Toggle theme on button click
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            darkModeToggle.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
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

    // --- Function to fetch and display recipes ---
    async function fetchAndDisplayRecipes(searchTerm = '') {
        allRecipesGrid.innerHTML = '<p>Loading recipes...</p>'; // Show loading message

        let url = 'http://localhost:3000/recipes';
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok && data.recipes) {
                allRecipesGrid.innerHTML = ''; // Clear loading message

                if (data.recipes.length === 0) {
                    allRecipesGrid.innerHTML = '<p>No recipes found matching your criteria.</p>';
                } else {
                    data.recipes.forEach(recipe => {
                        const recipeCardLink = document.createElement('a'); // Create a link for the whole card
                        recipeCardLink.href = `uploaded_recipe.html?id=${recipe.id}`; // Link to individual recipe page
                        recipeCardLink.classList.add('recipe-card-link'); // Add class for styling

                        const recipeCard = document.createElement('div');
                        recipeCard.classList.add('recipe-card');

                        // Ensure image URL is correctly prefixed
                        const imageUrl = recipe.image_url
    ? `http://localhost:3000${recipe.image_url}`
    : 'Image/placeholder-recipe.jpg';

recipeCard.innerHTML = `
    <div class="card-image" style="background-image: url('${imageUrl}');"></div>
    <div class="card-content">
        <h3 class="recipe-name">${recipe.name}</h3>
        <p class="recipe-description">${recipe.description || 'No description provided.'}</p>
        <div class="recipe-tags">
            ${recipe.tags ? recipe.tags.split(',').map(tag => `<span class="tag">#${tag.trim()}</span>`).join('') : ''}
        </div>
        <div class="recipe-meta">
            <span><i class='bx bxs-timer'></i> ${recipe.prep_time || 'N/A'} min</span>
            <span><i class='bx bxs-bowl-hot'></i> ${recipe.cooking_time || 'N/A'} min</span>
            <span>By ${recipe.author_name || 'Unknown'}</span>
        </div>
    </div>
`;

                        recipeCardLink.appendChild(recipeCard);
                        allRecipesGrid.appendChild(recipeCardLink);
                    });
                }
            } else {
                allRecipesGrid.innerHTML = `<p style="color: red;">Error loading recipes: ${data.message || 'Unknown error'}</p>`;
                console.error('Failed to fetch recipes:', data.message);
            }
        } catch (error) {
            allRecipesGrid.innerHTML = `<p style="color: red;">Network error. Could not connect to the server.</p>`;
            console.error('Network error fetching recipes:', error);
        }
    }

    // --- Event Listeners for Search ---
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.trim();
            fetchAndDisplayRecipes(searchTerm);
        });

        // Optional: Search on Enter key press in the input field
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchButton.click(); // Trigger the search button click
            }
        });
    }

    // --- Initial Load ---
    fetchAndDisplayRecipes(); // Load all recipes when the page first loads
});