document.addEventListener('DOMContentLoaded', () => {
    const editPhotoButton = document.querySelector('.edit-photo-button');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const profileImageDisplay = document.getElementById('profile-image-display');

    if (profileImageDisplay && (!profileImageDisplay.src || profileImageDisplay.src === window.location.href + '#')) {
        profileImageDisplay.src = "#";
    }
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
                    console.log('Imagine încărcată și afișată:', file.name);
                };

                reader.readAsDataURL(file);
            }
        });
    }

    const submitButton = document.querySelector('.submit-button');
    const nameInput = document.getElementById('name');
    const surnameInput = document.getElementById('surname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const descriptionTextarea = document.getElementById('description');
    const tagCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');

    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault(); 

            const profileData = {
                name: nameInput ? nameInput.value : '', 
                surname: surnameInput ? surnameInput.value : '',
                email: emailInput ? emailInput.value : '',
                password: passwordInput ? passwordInput.value : '',
                description: descriptionTextarea ? descriptionTextarea.value : '',
                favoriteTags: []
            };

            if (tagCheckboxes) {
                tagCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        profileData.favoriteTags.push(checkbox.value);
                    }
                });
            }

            // Obține fișierul imagine selectat, dacă există
            const imageFile = profileImageUpload && profileImageUpload.files && profileImageUpload.files[0] ? profileImageUpload.files[0] : null;

            if (imageFile) {
                console.log('Imaginea selectată pentru încărcare:', imageFile.name);
                // În acest punct, dacă ai trimite la server, ai folosi FormData:
                // const formData = new FormData();
                // formData.append('profilePicture', imageFile);
                // formData.append('name', profileData.name);
                // ... alte câmpuri ...
                // fetch('/api/uploadProfile', { method: 'POST', body: formData });
            }

            console.log('Datele profilului pentru trimitere:', profileData);

            // Simulează trimiterea datelor (în loc de un apel real către server)
            alert('Datele profilului (și imaginea selectată, dacă există) au fost logate în consolă. Într-o aplicație reală, acestea ar fi trimise către un server.');
        });
    }
});