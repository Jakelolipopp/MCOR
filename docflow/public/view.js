document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');
    const file = urlParams.get('file');
    const imageContainer = document.getElementById('imageContainer');

    const response = await fetch(`/images?user=${user}&file=${file}`);
    if (response.ok) {
        const images = await response.json();
        images.forEach(image => {
            const img = document.createElement('img');
            img.src = image;
            img.className = 'pdf-image';
            imageContainer.appendChild(img);
        });
    } else {
        imageContainer.textContent = 'Failed to load images.';
    }
});
