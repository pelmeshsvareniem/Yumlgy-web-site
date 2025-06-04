document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Load saved preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    if (darkModeToggle) { // Ensure the button exists before adding listener
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            // Save preference to localStorage
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
            // Update icon
            updateDarkModeIcon();
        });
    }

    // Function to update the dark mode icon based on current theme
    function updateDarkModeIcon() {
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }

    updateDarkModeIcon();

    const dropdownButton = document.querySelector('.dropdown-button');
    if (dropdownButton) {
        dropdownButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const dropdownMenu = dropdownButton.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!dropdownButton.contains(e.target) && !dropdownButton.nextElementSibling.contains(e.target)) {
                const dropdownMenu = dropdownButton.nextElementSibling;
                if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                    dropdownMenu.style.display = 'none';
                }
            }
        });
    }

});