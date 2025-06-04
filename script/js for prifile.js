document.addEventListener('DOMContentLoaded', async () => {
    // --- User Profile Data Population ---
    const userId = localStorage.getItem('userId');
    const userNameElement = document.getElementById('profileName');
    const userDescriptionElement = document.getElementById('profileDescription');
    const userFavoriteTagsElement = document.getElementById('profileFavoriteTags');
    const profileAvatarImg = document.getElementById('profileAvatar');
    const profileHeaderTitle = document.getElementById('profileHeaderTitle');
    const postsCountBubble = document.getElementById('postsCount');

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

        if (response.ok && data.user) { // Ensure response is OK and user data exists
            const user = data.user;
            const myRecipes = data.myRecipes;
            // const savedRecipes = data.savedRecipes; // Will be empty for now from backend

            // Populate user details
            if (profileHeaderTitle) profileHeaderTitle.textContent = user.name + "'s Profile";
            if (userNameElement) userNameElement.textContent = user.name || '';
            if (userDescriptionElement) userDescriptionElement.textContent = user.description || 'No description provided yet.';
            if (userFavoriteTagsElement) userFavoriteTagsElement.textContent = user.favoriteTags || 'No favorite tags set.';

            // --- CORRECTED PROFILE IMAGE DISPLAY LOGIC ---
            if (profileAvatarImg) {
                if (user.profileImageUrl) {
                    // Prepend the base URL for the image
                    profileAvatarImg.src = `http://localhost:3000${user.profileImageUrl}`;
                } else {
                    // Fallback to default if no profile image URL is present
                    profileAvatarImg.src = 'Image/pelmeshek.jpg';
                }
            }
            // --- END OF CORRECTED PROFILE IMAGE DISPLAY LOGIC ---

            // Update posts count
            if (postsCountBubble) {
                postsCountBubble.textContent = data.postsCount || '0'; // Default to '0' if no count
            }

            // Populate My Recipes
            if (myRecipesGrid) {
                myRecipesGrid.innerHTML = ''; // Clear existing static cards
                if (myRecipes && myRecipes.length > 0) { // Check if myRecipes array exists and has items
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
                } else {
                    myRecipesGrid.innerHTML = '<p>No recipes uploaded yet.</p>';
                }
            }

            // Populate Saved Recipes (currently empty from backend)
            if (savedRecipesGrid) {
                // Assuming savedRecipes is an array from your backend, even if empty
                // if (data.savedRecipes && data.savedRecipes.length > 0) {
                //     savedRecipesGrid.innerHTML = ''; // Clear existing static cards
                //     data.savedRecipes.forEach(recipe => {
                //         // Add logic to create saved recipe cards similar to myRecipes
                //     });
                // } else {
                    savedRecipesGrid.innerHTML = '<p>No saved recipes yet.</p>';
                // }
            }

        } else {
            console.error('Failed to fetch profile data:', data.message || 'Unknown error');
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

            // Toggle favorite state (visual feedback)
            button.classList.toggle('active'); // You might need CSS for .active class

            // Example: Change heart icon fill based on active state
            const heartIcon = button.querySelector('.bx.bxs-heart');
            if (button.classList.contains('active')) {
                console.log(`Recipe ${recipeId} added to favorites!`);
                if (heartIcon) heartIcon.style.color = '#ff0000'; // Red heart
                // TODO: Send request to backend to save favorite (e.g., fetch POST)
            } else {
                console.log(`Recipe ${recipeId} removed from favorites!`);
                if (heartIcon) heartIcon.style.color = ''; // Reset to default color
                // TODO: Send request to backend to remove favorite (e.g., fetch DELETE)
            }
        }
    });

    // --- Logout Button ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // Clear all relevant localStorage items
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userDescription');
            localStorage.removeItem('userFavoriteTags');
            localStorage.removeItem('userProfileImageUrl'); // Clear image URL on logout too

            alert('You have been logged out.');
            window.location.href = 'index.html'; // Redirect to home or login page
        });
    }

    // You also have an "Edit profile" button in the sidebar (a href to edit my profile.html)
    // and another one in the bottom profile-actions. Make sure they point to the correct file.
    // The current HTML links are correct:
    // <a href="edit my profile.html"><button class="see-more-button">Edit profile</button></a>
    // <button class="see-more-button"><a href="edit_profile.html" id="editProfileButton">Edit Profile</a></button>
    // Note: The second one should likely be <a href="edit_profile.html" class="see-more-button" id="editProfileButton">Edit Profile</a> to make the whole button clickable.
});



function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
  }