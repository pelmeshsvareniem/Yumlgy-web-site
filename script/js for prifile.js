document.addEventListener('DOMContentLoaded', async () => {
    // --- User Profile Data Population ---
    const userNameElement = document.getElementById('profileName');
    const userDescriptionElement = document.getElementById('profileDescription');
    const userFavoriteTagsElement = document.getElementById('profileFavoriteTags');
    const profileAvatarImg = document.getElementById('profileAvatar');
    const profileHeaderTitle = document.getElementById('profileHeaderTitle');
    const postsCountBubble = document.getElementById('postsCount');

    const myRecipesGrid = document.querySelector('.content-area .recipe-grid:first-of-type');
    const savedRecipesGrid = document.querySelector('.content-area .recipe-grid:last-of-type');

    // --- Dark Mode Toggle Functionality (already in place) ---
    const darkModeToggle = document.getElementById('darkModeToggle');

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        if (darkModeToggle) {
            darkModeToggle.textContent = savedTheme === 'dark' ? 'Light mode' : 'Dark mode';
        }
    } else {
        applyTheme('light');
        if (darkModeToggle) {
            darkModeToggle.textContent = 'Dark mode';
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            darkModeToggle.textContent = newTheme === 'dark' ? 'Light mode' : 'Dark mode';
        });
    }
    // --- END Dark Mode Toggle Functionality ---


    // --- User ID Handling for Profile Access ---
    let userId = localStorage.getItem('userId');

    // If no userId is found in localStorage, use a default for development convenience
    // IMPORTANT: Make sure a user with this ID exists in your database!
    const defaultUserId = '1'; // You can change this to any existing user ID for testing

    if (!userId) {
        console.warn(`No userId found in localStorage. Using defaultUserId: ${defaultUserId} for development.`);
        userId = defaultUserId;
        // Optionally, you could store this default ID in localStorage for future visits
        // localStorage.setItem('userId', defaultUserId);
    }

    // If, for some reason, userId is still null/undefined (e.g., defaultUserId is also not set)
    if (!userId) {
        alert('User ID not available. Please log in.');
        window.location.href = 'login-password/login.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/profile/${userId}`);
        const data = await response.json();

        if (response.ok && data.user) {
            const user = data.user;
            const myRecipes = data.myRecipes;

            // Populate user details
            if (profileHeaderTitle) profileHeaderTitle.textContent = user.name + "'s Profile";
            if (userNameElement) userNameElement.textContent = user.name || '';
            if (userDescriptionElement) userDescriptionElement.textContent = user.description || 'No description provided yet.';
            if (userFavoriteTagsElement) userFavoriteTagsElement.textContent = user.favoriteTags || 'No favorite tags set.';

            if (profileAvatarImg) {
                if (user.profileImageUrl) {
                    profileAvatarImg.src = `http://localhost:3000${user.profileImageUrl}`;
                } else {
                    profileAvatarImg.src = 'Image/pelmeshek.jpg'; // Default placeholder
                }
            }

            // Update posts count
            if (postsCountBubble) {
                postsCountBubble.textContent = data.postsCount || '0';
            }

            // Populate My Recipes
            if (myRecipesGrid) {
                myRecipesGrid.innerHTML = ''; // Clear static content
                if (myRecipes && myRecipes.length > 0) {
                    myRecipes.forEach(recipe => {
                        const recipeCardLink = document.createElement('a');
                        recipeCardLink.href = `uploaded_recipe.html?id=${recipe.id}`;
                        recipeCardLink.classList.add('recipe-card-link');

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
                            <button class="favorite-button" data-recipe-id="${recipe.id}"><i class='bx bxs-heart'></i></button>
                        `;
                        recipeCardLink.appendChild(recipeCard);
                        myRecipesGrid.appendChild(recipeCardLink);
                    });
                } else {
                    myRecipesGrid.innerHTML = '<p>No recipes uploaded yet.</p>';
                }
            }

            // Populate Saved Recipes (currently empty from backend)
            if (savedRecipesGrid) {
                savedRecipesGrid.innerHTML = '<p>No saved recipes yet.</p>';
            }

        } else {
            console.error('Failed to fetch profile data:', data.message || 'Unknown error');
            alert('Error loading profile: ' + (data.message || 'Unknown error'));
            // If the defaultUserId doesn't exist, you might still want to redirect to login
            window.location.href = 'login-password/login.html';
        }
    } catch (error) {
        console.error('Network error fetching profile data:', error);
        alert('Network error. Could not load profile data.');
        window.location.href = 'login-password/login.html';
    }

    // --- Event Delegation for Favorite Buttons ---
    document.querySelector('.main-content').addEventListener('click', (event) => {
        if (event.target.closest('.favorite-button')) {
            const button = event.target.closest('.favorite-button');
            const recipeId = button.dataset.recipeId;

            button.classList.toggle('active');

            const heartIcon = button.querySelector('.bx.bxs-heart');
            if (button.classList.contains('active')) {
                console.log(`Recipe ${recipeId} added to favorites!`);
                if (heartIcon) heartIcon.style.color = '#ff0000';
            } else {
                console.log(`Recipe ${recipeId} removed from favorites!`);
                if (heartIcon) heartIcon.style.color = '';
            }
        }
    });

    // --- Logout Button ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userDescription');
            localStorage.removeItem('userFavoriteTags');
            localStorage.removeItem('userProfileImageUrl');

            alert('You have been logged out.');
            window.location.href = 'index.html';
        });
    }
});
