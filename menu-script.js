document.addEventListener('DOMContentLoaded', function() {
    const clickableCards = document.querySelectorAll('.card.clickable');
    clickableCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardId = this.id;
            switch(cardId) {
                case 'card1':
                    console.log('Experiments clicked');
                    // Add action for Experiments
                    break;
                case 'card2':
                    console.log('About clicked');
                    // Add action for About
                    break;
                case 'card3':
                    console.log('Center R clicked');
                    // Add action for center R
                    break;
                case 'card4':
                    console.log('Writing clicked');
                    // Add action for Writing
                    break;
            }
        });
    });

    function handleWrongButtonClick() {
        const fadeOverlay = document.getElementById('fade-overlay');
        fadeOverlay.classList.add('active');
        
        setTimeout(() => {
            window.location.href = 'index.html'; // Replace with your home page URL
        }, 500); // Adjust this timing to match your fade duration
    }

    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', handleWrongButtonClick);
    } else {
        console.error('Close button not found');
    }
});