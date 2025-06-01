document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('.favorite-button');

    favoriteButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                console.log('Reteta a fost adăugata la favorite!');
            } else {
                console.log('Reteta a fost eliminata din favorite!');
            }
        });
    });
});