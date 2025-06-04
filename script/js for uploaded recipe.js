// This file can be used for any interactive elements,
// like handling checkbox clicks, video playback, etc.
// For now, it's mostly a placeholder as the image doesn't
// suggest complex JS interactions.

document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                console.log(`Ingredient "${event.target.parentNode.textContent.trim()}" checked.`);
                // Add any visual feedback for checked items if needed
            } else {
                console.log(`Ingredient "${event.target.parentNode.textContent.trim()}" unchecked.`);
                // Remove any visual feedback for unchecked items if needed
            }
        });
    });

    // Example of a play button interaction (placeholder)
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', () => {
            alert('Play video functionality would go here!');
            // In a real application, you'd replace the image with a video player
        });
    }
});