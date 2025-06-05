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

    // --- Dynamic "My profile" Link (if it exists on this page's header) ---
    // This targets the "My profile" link in the header of this page
    const myProfileLink = document.querySelector('header .btn-profile[href="login-password/login.html"]'); // Assuming this selector
    const currentUserIdForLink = localStorage.getItem('userId');

    if (myProfileLink) {
        if (currentUserIdForLink) {
            // If user is logged in, change the link to point to their profile page
            myProfileLink.href = 'My profile.html'; // Path relative to My profile.html
        } else {
            // If user is not logged in, ensure it points to the login page
            myProfileLink.href = 'login-password/login.html'; // Path relative to My profile.html
        }
    }
    // --- END Dynamic "My profile" Link ---


    // --- User ID Handling for Profile Access ---
    let userId = localStorage.getItem('userId');

    // If no userId is found in localStorage, redirect to login
    if (!userId) {
        alert('You need to be logged in to view this profile.');
        window.location.href = 'login-password/login.html'; // Path relative to My profile.html
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
                    profileAvatarImg.src = 'Image/pelmeshek.jpg'; // Default placeholder path relative to My profile.html
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
                        recipeCardLink.href = `uploaded_recipe.html?id=${recipe.id}`; // Path relative to My profile.html
                        recipeCardLink.classList.add('recipe-card-link');

                        const recipeCard = document.createElement('div');
                        recipeCard.classList.add('recipe-card');

                        const imageUrl = recipe.image_url ? `http://localhost:3000${recipe.image_url}` : 'Image/placeholder-recipe.jpg'; // Path relative to My profile.html

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
            window.location.href = 'login-password/login.html'; // Redirect to login on error
        }
    } catch (error) {
        console.error('Network error fetching profile data:', error);
        alert('Network error. Could not load profile data.');
        window.location.href = 'login-password/login.html'; // Redirect to login on network error
    }

    // --- Event Delegation for Favorite Buttons ---
    const mainContent = document.querySelector('.main-content');
    if (mainContent) { // Ensure .main-content exists before adding listener
        mainContent.addEventListener('click', (event) => {
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
    }

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
            window.location.href = 'index.html'; // Path relative to My profile.html
        });
    }
});