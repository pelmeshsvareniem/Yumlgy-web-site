document.addEventListener('DOMContentLoaded', async () => {
    const editPhotoButton = document.querySelector('.edit-photo-button');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const profileImageDisplay = document.getElementById('profile-image-display');

    const editProfileForm = document.getElementById('editProfileForm'); // The form element
    const nameInput = document.getElementById('name');
    // Removed surnameInput as it's not in DB
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password'); // For new password
    const descriptionTextarea = document.getElementById('description');
    const tagCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const feedbackMessage = document.getElementById('feedbackMessage'); // For displaying messages

    const userId = localStorage.getItem('userId');

    // --- Redirect if not logged in ---
    if (!userId) {
        alert('You need to be logged in to edit your profile.');
        window.location.href = 'login-password/login.html'; // Adjust path if necessary
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
                // Password field is intentionally left empty for security, it's for new password only
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
                    // If no favorite tags, ensure all are unchecked
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

    fetchProfileData(); // Call this function to load data when the page loads

    // --- Image Upload Preview Logic ---
    if (editPhotoButton && profileImageUpload && profileImageDisplay) {
        editPhotoButton.addEventListener('click', () => {
            profileImageUpload.click(); // Trigger the hidden file input
        });

        profileImageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    profileImageDisplay.src = e.target.result; // Display the selected image
                    console.log('Image selected for preview:', file.name);
                };

                reader.readAsDataURL(file);
            }
        });
    }

    // --- Form Submission Logic ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            feedbackMessage.textContent = 'Updating profile...';
            feedbackMessage.style.color = 'orange';

            const formData = new FormData();
            formData.append('name', nameInput.value.trim());
            formData.append('email', emailInput.value.trim()); // Email sent as is (read-only for now)
            formData.append('description', descriptionTextarea.value.trim());

            const selectedTags = Array.from(tagCheckboxes)
                                    .filter(checkbox => checkbox.checked)
                                    .map(checkbox => checkbox.value)
                                    .join(',');
            formData.append('favoriteTags', selectedTags);

            // Append password only if it's not empty
            if (passwordInput.value.trim() !== '') {
                formData.append('password', passwordInput.value.trim());
            }

            // Append the selected profile image file
            const imageFile = profileImageUpload.files[0];
            if (imageFile) {
                formData.append('profilePicture', imageFile);
            }

            try {
                const response = await fetch(`http://localhost:3000/profile/${userId}`, {
                    method: 'PUT',
                    // When using FormData, Content-Type header is automatically set to multipart/form-data
                    // Do NOT manually set 'Content-Type': 'application/json'
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    feedbackMessage.textContent = data.message || 'Profile updated successfully!';
                    feedbackMessage.style.color = 'green';

                    // Update localStorage with new user data for My profile.html
                    localStorage.setItem('userName', data.user.name);
                    localStorage.setItem('userDescription', data.user.description);
                    localStorage.setItem('userFavoriteTags', data.user.favoriteTags);
                    localStorage.setItem('userProfileImageUrl', data.user.profileImageUrl);

                    // Redirect back to My profile.html after a short delay
                    setTimeout(() => {
                        window.location.href = 'My profile.html';
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