document.addEventListener("DOMContentLoaded", () => {
    // --- Dark Mode Toggle Functionality ---
    const darkModeToggle = document.getElementById('darkModeToggle');

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        // If you have specific images that need to be inverted in dark mode,
        // you might add logic here, or handle it purely in CSS with filters.
        // Example: document.querySelectorAll('.category-card img').forEach(img => {
        //     img.style.filter = theme === 'dark' ? 'invert(1)' : 'none';
        // });
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


    // --- Existing Recipe Display Logic (from your original index.html script) ---
    const recipes = [
        {
            title: "Mixed Tropical Fruit Salad with Superfood Boosts",
            image: "Image/fruit salad.jpg",
            tag: "Healthy",
            liked: true
        },
        {
            title: "Big and Juicy Wagyu Beef Cheeseburger",
            image: "Image/chessburger.jpg",
            tag: "Snacks",
            liked: true
        },
        {
            title: "Healthy Japanese Fried Rice with Asparagus",
            image: "Image/Japanese-Fried-Rice.jpg",
            tag: "Healthy",
            liked: true
        },
        {
            title: "Cauliflower Walnut Vegetarian Taco Meat",
            image: "Image/vegan-taco-meat-healthy.jpg",
            tag: "Eastern",
            liked: true
        },
        {
            title: "Rainbow Chicken Salad with Almond Honey Mustard Dressing",
            image: "Image/raynbow salad.jpg",
            tag: "Healthy",
            liked: true
        },
        {
            title: "Barbeque Spicy Sandwiches with Chips",
            image: "Image/Barbeque Spicy Sandwiches with Chips.jpg",
            tag: "Snack",
            liked: true
        },
        {
            title: "Firecracker Vegan Lettuce Wraps - Spicy!",
            image: "Image/Tofu-Lettuce-Wraps-Recipe.jpg",
            tag: "Seafood",
            liked: true
        },
        {
            title: "Chicken Ramen Soup with Mushroom",
            image: "Image/ramen.jpg",
            tag: "Japanese",
            liked: true
        }
    ];

    const grid = document.getElementById("recipe-grid");

    if (grid) { // Ensure the grid element exists
        recipes.forEach(recipe => {
            const card = document.createElement("div");
            card.className = "recipe-card-homepage";

            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${recipe.image}" class="card-image" alt="${recipe.title}">
                    <button class="favorite-icon-overlay">
                        <i class='bx ${recipe.liked ? "bxs-heart" : "bx-heart"}' ${recipe.liked ? "style='color:#ff0000'" : ""}></i>
                    </button>
                </div>
                <div class="card-info">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="meta-item">
                            <button class="favorite-icon-overlay">
                                <i class='bx bx-heart'></i>
                            </button>
                        </span>
                        <span class="meta-item">
                            <i class='bx bxs-fork-spoon'></i> ${recipe.tag}
                        </span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
});