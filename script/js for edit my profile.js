document.addEventListener('DOMContentLoaded', async () => {
    const editPhotoButton = document.querySelector('.edit-photo-button');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const profileImageDisplay = document.getElementById('profile-image-display');

    const editProfileForm = document.getElementById('editProfileForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const descriptionTextarea = document.getElementById('description');
    const tagCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const feedbackMessage = document.getElementById('feedbackMessage');

    const userId = localStorage.getItem('userId');

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

    // --- Dynamic "My profile" Link ---
    // This targets the "My profile" link in the header of this page
    const myProfileLink = document.querySelector('header .btn-profile[href="login-password/login.html"]');
    // Re-fetch userId here to ensure it's the most up-to-date value after any potential login/logout
    const currentUserId = localStorage.getItem('userId');

    if (myProfileLink) {
        if (currentUserId) {
            // If user is logged in, change the link to point to their profile page
            myProfileLink.href = 'My profile.html'; // Assuming My profile.html is in the parent directory
        } else {
            // If user is not logged in, ensure it points to the login page
            myProfileLink.href = 'login-password/login.html'; // Assuming login.html is in login-password/
        }
    }
    // --- END Dynamic "My profile" Link ---

    // --- Redirect if not logged in ---
    // This check is crucial for the edit profile page itself
    if (!userId) {
        alert('You need to be logged in to edit your profile.');
        window.location.href = 'login-password/login.html';
        return;
    }

    // --- Fetch and Populate Existing Profile Data ---
    async function fetchProfileData() {
        try {
            const response = await fetch(`http://localhost:3000/profile/${userId}`);
            const data = await response.json();

            if (response.ok && data.user) {
                const user = data.user;
                if (nameInput) nameInput.value = user.name || '';
                if (emailInput) emailInput.value = user.email || '';
                if (descriptionTextarea) descriptionTextarea.value = user.description || '';

                // Set profile image
                if (profileImageDisplay) {
                    if (user.profileImageUrl) {
                        profileImageDisplay.src = `http://localhost:3000${user.profileImageUrl}`;
                    } else {
                        profileImageDisplay.src = 'Image/pelmeshek.jpg'; // Default placeholder
                    }
                }

                // Populate favorite tags checkboxes
                if (user.favoriteTags) {
                    const favoriteTagsArray = user.favoriteTags.split(',').map(tag => tag.trim());
                    tagCheckboxes.forEach(checkbox => {
                        if (favoriteTagsArray.includes(checkbox.value)) {
                            checkbox.checked = true;
                        } else {
                            checkbox.checked = false; // Uncheck if not in favorites
                        }
                    });
                } else {
                    tagCheckboxes.forEach(checkbox => {
                        checkbox.checked = false;
                    });
                }

            } else {
                console.error('Failed to fetch profile data:', data.message);
                feedbackMessage.textContent = 'Error loading profile data.';
                feedbackMessage.style.color = 'red';
            }
        } catch (error) {
            console.error('Network error fetching profile data:', error);
            feedbackMessage.textContent = 'Network error. Could not load profile data.';
            feedbackMessage.style.color = 'red';
        }
    }

    fetchProfileData();

    // --- Image Upload Preview Logic ---
    if (editPhotoButton && profileImageUpload && profileImageDisplay) {
        editPhotoButton.addEventListener('click', () => {
            profileImageUpload.click();
        });

        profileImageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImageDisplay.src = e.target.result;
                    console.log('Image selected for preview:', file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Form Submission Logic ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            feedbackMessage.textContent = 'Updating profile...';
            feedbackMessage.style.color = 'orange';

            const formData = new FormData();
            formData.append('name', nameInput.value.trim());
            formData.append('email', emailInput.value.trim());
            formData.append('description', descriptionTextarea.value.trim());

            const selectedTags = Array.from(tagCheckboxes)
                                    .filter(checkbox => checkbox.checked)
                                    .map(checkbox => checkbox.value)
                                    .join(',');
            formData.append('favoriteTags', selectedTags);

            if (passwordInput.value.trim() !== '') {
                formData.append('password', passwordInput.value.trim());
            }

            const imageFile = profileImageUpload.files[0];
            if (imageFile) {
                formData.append('profilePicture', imageFile);
            }

            try {
                const response = await fetch(`http://localhost:3000/profile/${userId}`, {
                    method: 'PUT',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    feedbackMessage.textContent = data.message || 'Profile updated successfully!';
                    feedbackMessage.style.color = 'green';

                    // Update localStorage with potentially new user data
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('userDescription', data.user.description);
                    localStorage.setItem('userFavoriteTags', data.user.favoriteTags);
                    localStorage.setItem('userProfileImageUrl', data.user.profileImageUrl);

                    setTimeout(() => {
                        window.location.href = 'My profile.html'; // Redirect to My profile after update
                    }, 1500);

                } else {
                    feedbackMessage.textContent = data.message || 'Failed to update profile. Please try again.';
                    feedbackMessage.style.color = 'red';
                    console.error('Error updating profile:', data);
                }
            } catch (error) {
                console.error('Network error during profile update:', error);
                feedbackMessage.textContent = 'Network error. Could not connect to the server.';
                feedbackMessage.style.color = 'red';
            }
        });
    }
});