var uploadedImages = [];
var corpImageList = [];
var concatenatedImage = null;
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

let minifiedImg;

async function concatImages(imageLsit) {
    const concatenatedImageContainer = document.getElementById('concatenatedImageContainer');
    const downloadLink = document.getElementById('downloadLink');
    const resContainer = document.getElementById('res');

    if (imageLsit.length === 0) {
        alert('Please upload at least one image.');
        return;
    }

    // Calculate the dimensions based on the first image
    const firstImage = new Image();
    firstImage.src = imageLsit[0];
    await new Promise((resolve) => (firstImage.onload = resolve));

    // Concatenate the original images without resizing
    const canvasConcatenated = document.createElement('canvas');
    const ctxConcatenated = canvasConcatenated.getContext('2d');

    let totalWidth = 0;
    let maxHeight = 0;

    for (const imageUrl of imageLsit) {
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => (img.onload = resolve));

        totalWidth += img.width;
        maxHeight = Math.max(maxHeight, img.height);
    }

    canvasConcatenated.width = totalWidth;
    canvasConcatenated.height = maxHeight;

    let xOffset = 0;

    for (const imageUrl of imageLsit) {
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => (img.onload = resolve));

        ctxConcatenated.drawImage(img, xOffset, 0);
        xOffset += img.width;
    }

    // Save the original concatenated image in the variable
    concatenatedImage = new Image();
    concatenatedImage.src = canvasConcatenated.toDataURL('image/png');
    concatenatedImage.style.width = '70%';

    // Display the original concatenated image
    concatenatedImage.onload = () => {
        concatenatedImageContainer.innerHTML = '';
        concatenatedImageContainer.appendChild(concatenatedImage);

        // Display the download link for the original image
        downloadLink.href = canvasConcatenated.toDataURL('image/png');
        downloadLink.style.display = 'block';

        // Display the resolution of the original images' width and height
        resContainer.textContent = `Original Images Resolution: ${totalWidth}x${maxHeight}`;
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

// JavaScript code for the "Calculate Resolutions" page
var widthMultiplier = 1;

function updateCalculatedResolution() {
    const baseWidth = 1080;
    const baseHeight = 2400;
    const calculatedWidth = baseWidth * widthMultiplier;
    const calculatedHeight = baseHeight;

    document.getElementById('calculatedResolution').textContent = `${calculatedWidth}x${calculatedHeight}`;
}

function increaseWidth() {
    widthMultiplier++;
    document.getElementById('widthMultiplier').textContent = widthMultiplier;
    updateCalculatedResolution();
}
function decreaseWidth() {
    if(widthMultiplier > 1) widthMultiplier--;
    document.getElementById('widthMultiplier').textContent = widthMultiplier;
    updateCalculatedResolution();
}

function resizeOrCropImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = function () {
            // Create a canvas element with the target dimensions
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 2400;

            // Get the 2D drawing context of the canvas
            const ctx = canvas.getContext('2d');

            // Calculate the scaling factors for resizing the image to fit the canvas
            const scaleX = canvas.width / img.width;
            const scaleY = canvas.height / img.height;

            // Choose the appropriate scaling factor to fill the entire canvas without leaving any blank spaces
            const scale = Math.max(scaleX, scaleY);

            // Calculate the new dimensions for the scaled image
            const newWidth = img.width * scale;
            const newHeight = img.height * scale;

            // Calculate the position to center the scaled image on the canvas
            const x = (canvas.width - newWidth) / 2;
            const y = (canvas.height - newHeight) / 2;

            // Clear the canvas and draw the scaled and centered image
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, newWidth, newHeight);

            // Create a new image element with the cropped or resized data URL
            const croppedOrResizedImg = new Image();
            croppedOrResizedImg.src = canvas.toDataURL();

            resolve(croppedOrResizedImg);
        };

        img.onerror = function () {
            reject(new Error(`Failed to load image: ${src}`));
        };

        img.src = src;
    });
}

async function cropImages() {
    for(const image of uploadedImages) {
        const croppedImage = await resizeOrCropImage(image);
        corpImageList.push(croppedImage.src);
    }
    console.log('corpImageList', corpImageList);
    concatImages(corpImageList);
    corpImageList = [];
}