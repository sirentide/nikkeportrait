// GitHub assets configuration
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/sirentide/public-host/refs/heads/master/image-id/';

// Function to convert local image path to GitHub URL
function getGitHubUrl(localPath) {
    // Handle object with src property
    if (localPath && typeof localPath === 'object' && localPath.src && typeof localPath.src === 'string') {
        console.log('Converting object with src to GitHub URL:', localPath.src);
        return getGitHubUrl(localPath.src);
    }

    // Check if localPath is a valid string
    if (!localPath || typeof localPath !== 'string') {
        console.warn('Invalid path provided to getGitHubUrl:', localPath);
        // Return a default image or empty string instead of the invalid path
        return '';
    }

    // If it's already a GitHub URL, return it as is
    if (localPath.startsWith('https://raw.githubusercontent.com/')) {
        return localPath;
    }

    // Handle file:// URLs by extracting just the filename
    if (localPath.startsWith('file:')) {
        // Extract just the filename from the path
        const filename = localPath.split('/').pop().split('\\').pop();
        return GITHUB_BASE_URL + filename;
    }

    // Remove any leading slashes
    let path = localPath;
    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    // Extract just the filename if it contains a full path
    if (path.includes(':\\') || path.includes(':/')) {
        path = path.split('/').pop().split('\\').pop();
    }

    // Don't add any path prefix since the base URL already includes image-id/
    if (path.includes('image/')) {
        path = path.replace('image/', '');
    }

    // Return the full GitHub URL
    return GITHUB_BASE_URL + path;
}

// Function to create an image with crossOrigin set
function createCrossOriginImage(src, onloadCallback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    if (onloadCallback) {
        img.onload = () => onloadCallback(img);
    }

    // Convert to GitHub URL if it's a local path
    img.src = getGitHubUrl(src);

    return img;
}

// Function to preload images for better performance
function preloadImages(imagePaths, progressCallback, completedCallback) {
    let loaded = 0;
    const total = imagePaths.length;
    const images = [];

    imagePaths.forEach((path, index) => {
        const img = createCrossOriginImage(path, () => {
            loaded++;
            images[index] = img;

            if (progressCallback) {
                progressCallback(loaded, total);
            }

            if (loaded === total && completedCallback) {
                completedCallback(images);
            }
        });
    });
}

// Function to load JSON data from GitHub
function loadJsonFromGitHub(filename, callback) {
    const url = getGitHubUrl(filename);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (callback) callback(data);
            return data;
        })
        .catch(error => {
            console.error('Error loading JSON from GitHub:', error);
            if (callback) callback(null);
        });
}
