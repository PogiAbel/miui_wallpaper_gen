let uploadedImages = [];

// Function to display uploaded images as thumbnails with minimized size
function displayUploadedImages() {
    const uploadedImagesContainer = document.getElementById('uploadedImagesContainer');
    uploadedImagesContainer.innerHTML = '';

    uploadedImages.forEach((imgDataUrl, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imgDataUrl;
        thumbnail.alt = `Uploaded Image ${index + 1}`;
        thumbnail.classList.add('thumbnail');
        // Display the thumbnails in a minimized format
        thumbnail.style.maxWidth = '100px';
        thumbnail.style.maxHeight = '100px';
        uploadedImagesContainer.appendChild(thumbnail);
    });
}

// Event listener to add uploaded images to the array and display thumbnails
const imageInput = document.getElementById('imageInput');
imageInput.addEventListener('change', () => {
    const files = imageInput.files;
    if (files.length === 0) {
        alert('Please upload at least one image.');
        return;
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = new Image();
        img.src = URL.createObjectURL(file);

        // Store the original image
        uploadedImages.push(img.src);

        // Display the uploaded images as thumbnails
        displayUploadedImages();
    }

    // Clear the file input after processing
    imageInput.value = '';
});

async function concatImages() {
    const concatenatedImageContainer = document.getElementById('concatenatedImageContainer');
    const downloadLink = document.getElementById('downloadLink');
    const imageDimensionsContainer = document.getElementById('imageDimensionsContainer');

    if (uploadedImages.length === 0) {
        alert('Please upload at least one image.');
        return;
    }

    // Check if the "Same Width/Height" checkbox is checked
    const sameSizeCheckbox = document.getElementById('sameSizeCheckbox');
    const shouldEnforceSameSize = sameSizeCheckbox.checked;

    // Calculate the dimensions based on the first image
    const firstImage = new Image();
    firstImage.src = uploadedImages[0];
    await new Promise((resolve) => (firstImage.onload = resolve));
    const imageWidth = firstImage.width;
    const imageHeight = firstImage.height;

    // Concatenate the original images
    const canvasConcatenated = document.createElement('canvas');
    const ctxConcatenated = canvasConcatenated.getContext('2d');

    let totalWidth = 0;
    let maxHeight = 0;
    let scaleRatio = 1; // Initialize scaleRatio

    for (const imageUrl of uploadedImages) {
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => (img.onload = resolve));

        totalWidth += img.width;
        maxHeight = Math.max(maxHeight, img.height);
    }

    // Calculate the maximum width to fit within the window
    const maxWidth = window.innerWidth - 20; // Subtract some margin for better display

    // Scale the concatenated image if it exceeds the maximum width
    if (totalWidth > maxWidth) {
        scaleRatio = maxWidth / totalWidth; // Update scaleRatio
        totalWidth = maxWidth;
        maxHeight *= scaleRatio;
    }

    canvasConcatenated.width = totalWidth;
    canvasConcatenated.height = maxHeight;

    let xOffset = 0;

    for (const imageUrl of uploadedImages) {
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => (img.onload = resolve));

        ctxConcatenated.drawImage(img, xOffset, 0, img.width * scaleRatio, img.height * scaleRatio);
        xOffset += img.width * scaleRatio;
    }

    // Display the minified version of the concatenated image
    const minifiedImageUrl = canvasConcatenated.toDataURL('image/png');

    const concatenatedImage = new Image();
    concatenatedImage.src = minifiedImageUrl;
    concatenatedImage.alt = 'Concatenated Image';

    concatenatedImage.onload = () => {
        concatenatedImage.style.maxWidth = '100%'; // Ensure it doesn't exceed the window width
        concatenatedImage.style.height = 'auto';
        concatenatedImageContainer.innerHTML = '';
        concatenatedImageContainer.appendChild(concatenatedImage);

        // Provide a download link for the original-sized image in PNG format
        downloadLink.href = canvasConcatenated.toDataURL('image/png');
        downloadLink.download = 'concatenated.png';
        downloadLink.style.display = 'block';
    };

    concatenatedImage.onload = () => {
        concatenatedImage.style.maxWidth = '100%';
        concatenatedImage.style.height = 'auto';
        concatenatedImageContainer.innerHTML = '';
        concatenatedImageContainer.appendChild(concatenatedImage);

        // Display the download link
        downloadLink.href = canvasConcatenated.toDataURL('image/png');
        downloadLink.style.display = 'block';

        // Display image names with dimensions and error style if necessary
        if (shouldEnforceSameSize) {
            const imageInfo = uploadedImages.map((imageUrl, index) => {
                const img = new Image();
                img.src = imageUrl;
                const width = img.width;
                const height = img.height;
                const isSameSize = width === imageWidth && height === imageHeight;

                // Define a CSS class for the error style
                const errorClass = isSameSize ? '' : 'error';

                return {
                    name: `Image ${index + 1}`,
                    width,
                    height,
                    errorClass, // Include the error class
                };
            });

            imageDimensionsContainer.style.display = 'block';

            // Generate HTML for image names with error styles
            const imageInfoHTML = imageInfo.map(
                (info) =>
                    `<div class="image-info ${info.errorClass}">${info.name}: ${info.width}x${info.height}</div>`
            ).join('');

            imageDimensionsContainer.innerHTML = imageInfoHTML;
        } else {
            imageDimensionsContainer.style.display = 'none';
        }
    };
}


// Clear uploaded images
function clearImages() {
    uploadedImages = [];
    const uploadedImagesContainer = document.getElementById('uploadedImagesContainer');
    uploadedImagesContainer.innerHTML = '';
    const concatenatedImageContainer = document.getElementById('concatenatedImageContainer');
    concatenatedImageContainer.innerHTML = '';
    downloadLink.style.display = 'none';
}
