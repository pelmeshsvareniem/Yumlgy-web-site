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

    // --- Redirect if not logged in ---
    if (!userId) {
        alert('You need to be logged in to edit your profile.');
        window.location.href = 'login-password/login.html'; // Path relative to edit my profile.html
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
                        profileImageDisplay.src = 'Image/pelmeshek.jpg'; // Default placeholder path relative to edit my profile.html
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
                    // These will be read by My profile.html when it loads
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