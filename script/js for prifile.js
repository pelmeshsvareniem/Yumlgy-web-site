document.addEventListener('DOMContentLoaded', async () => {
    // --- User Profile Data Population ---
    const userId = localStorage.getItem('userId');
    const userNameElement = document.getElementById('profileName'); // Changed to ID
    const userDescriptionElement = document.getElementById('profileDescription'); // Changed to ID
    const userFavoriteTagsElement = document.getElementById('profileFavoriteTags'); // Changed to ID
    const profileAvatarImg = document.getElementById('profileAvatar'); // Changed to ID
    const profileHeaderTitle = document.getElementById('profileHeaderTitle'); // Changed to ID
    const postsCountBubble = document.getElementById('postsCount'); // Changed to ID

    const myRecipesGrid = document.querySelector('.content-area .recipe-grid:first-of-type');
    const savedRecipesGrid = document.querySelector('.content-area .recipe-grid:last-of-type');

    // Redirect if not logged in
    if (!userId) {
        alert('You need to be logged in to view your profile.');
        window.location.href = 'login-password/login.html'; // Adjust this path if needed
        return; // Stop execution
    }

    try {
        const response = await fetch(`http://localhost:3000/profile/${userId}`);
        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            const myRecipes = data.myRecipes;
            // const savedRecipes = data.savedRecipes; // Will be empty for now

            // Populate user details
            if (profileHeaderTitle) profileHeaderTitle.textContent = user.name + "'s Profile"; // Update main profile title
            if (userNameElement) userNameElement.textContent = user.name;
            if (userDescriptionElement) userDescriptionElement.textContent = user.description || 'No description provided yet.';
            if (userFavoriteTagsElement) userFavoriteTagsElement.textContent = user.favoriteTags || 'No favorite tags set.';

            // Update avatar if you have a dynamic URL (e.g., from user.profile_image_url)
            // For now, it keeps the static image or you can set a placeholder
            // if (profileAvatarImg && user.profile_image_url) {
            //     profileAvatarImg.src = user.profile_image_url;
            // }

            // Update posts count
            if (postsCountBubble) {
                postsCountBubble.textContent = data.postsCount;
            }

            // Populate My Recipes
            if (myRecipesGrid) {
                myRecipesGrid.innerHTML = ''; // Clear existing static cards
                if (myRecipes.length === 0) {
                    myRecipesGrid.innerHTML = '<p>No recipes uploaded yet.</p>';
                } else {
                    myRecipes.forEach(recipe => {
                        const recipeCard = document.createElement('div');
                        recipeCard.classList.add('recipe-card');
                        
                        const imageUrl = recipe.image_url ? `http://localhost:3000${recipe.image_url}` : 'Image/placeholder-recipe.jpg';

                        recipeCard.innerHTML = `
                            <div class="card-image-placeholder" style="background-image: url('${imageUrl}');"></div>
                            <div class="card-content">
                                <h4>${recipe.name}</h4>
                                <div class="card-meta">
                                    <span><i class='bx bxs-timer'></i>${recipe.prep_time || 'N/A'} Minutes</span>
                                    <span><i class='bx bxs-fork-spoon'></i>${recipe.tags || 'General'}</span>
                                </div>
                            </div>
                            <button class="favorite-button" data-recipe-id="${recipe.recipe_id}"><i class='bx bxs-heart'></i></button>
                        `;
                        myRecipesGrid.appendChild(recipeCard);
                    });
                }
            }

            // Populate Saved Recipes (currently empty from backend) - keep as is for now
            if (savedRecipesGrid) {
                savedRecipesGrid.innerHTML = '<p>No saved recipes yet.</p>'; // Simplified for empty state
            }

        } else {
            console.error('Failed to fetch profile data:', data.message);
            alert('Error loading profile: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Network error fetching profile data:', error);
        alert('Network error. Could not load profile data.');
    }

    // --- Event Delegation for Favorite Buttons ---
    // This is more robust as it works for dynamically added elements
    document.querySelector('.main-content').addEventListener('click', (event) => {
        if (event.target.closest('.favorite-button')) {
            const button = event.target.closest('.favorite-button');
            const recipeId = button.dataset.recipeId; // Get recipe ID from data attribute

            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                console.log(`Recipe ${recipeId} added to favorites!`);
                // TODO: Send request to backend to save favorite
            } else {
                console.log(`Recipe ${recipeId} removed from favorites!`);
                // TODO: Send request to backend to remove favorite
            }
        }
    });

    // --- Logout Button ---
    // You'll need to add a logout button to your My profile.html with id="logoutButton"
    // For example: <button id="logoutButton">Log Out</button>
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userDescription');
            localStorage.removeItem('userFavoriteTags');
            alert('You have been logged out.');
            window.location.href = 'index.html'; // Redirect to home or login page
        });
    }
});