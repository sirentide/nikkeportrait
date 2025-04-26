// gallery-manager.js - Functions for managing the gallery display

// Set hideGalleryImages to true by default if not already set
if (localStorage.getItem('hideGalleryImages') === null) {
    localStorage.setItem('hideGalleryImages', 'true');
}

// Function to hide gallery images that are already in the My Nikke List
function hideGalleryImagesInMyNikkesList() {
    // Get all toggle images from My Nikke List
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.warn('Toggle images container not found, cannot hide gallery images');
        return;
    }

    // Get all toggle image sources
    const toggleImageSources = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
        .map(img => img.src);

    // If there are no toggle images, nothing to hide
    if (toggleImageSources.length === 0) {
        console.log('No toggle images found, all gallery images will remain visible');
        return;
    }

    console.log(`Found ${toggleImageSources.length} toggle images to check against gallery`);

    // Get all gallery photos
    const galleryPhotos = document.querySelectorAll('.gallery .photo');
    let hiddenCount = 0;

    // Check each gallery photo
    galleryPhotos.forEach(photo => {
        const img = photo.querySelector('img');
        if (!img) return;

        // Check if this image is in the toggle images
        if (toggleImageSources.includes(img.src)) {
            // Hide the gallery photo
            photo.style.display = 'none';
            hiddenCount++;
        } else {
            // Make sure the photo is visible
            photo.style.display = 'flex';

            // Also check by ID if available
            const photoId = photo.getAttribute('data-id');
            if (photoId) {
                // Check if any toggle image has this ID in its filename
                const matchingToggleImage = toggleImageSources.find(src => {
                    const filename = src.split('/').pop();
                    const idPart = filename.split('_')[0];
                    return idPart === photoId;
                });

                if (matchingToggleImage) {
                    // Hide the gallery photo
                    photo.style.display = 'none';
                    hiddenCount++;
                }
            }
        }
    });

    console.log(`Hidden ${hiddenCount} gallery photos that are already in My Nikke List`);
}

// Function to show all gallery images
function showAllGalleryImages() {
    // Get all gallery photos
    const galleryPhotos = document.querySelectorAll('.gallery .photo');

    // Make all photos visible
    galleryPhotos.forEach(photo => {
        photo.style.display = 'flex';
    });

    console.log('All gallery photos are now visible');
}

// Function to toggle visibility of gallery images that are in My Nikke List
function toggleGalleryImagesVisibility() {
    // Get the current state from localStorage
    const hideGalleryImages = localStorage.getItem('hideGalleryImages') === 'true';

    // Toggle the state
    const newState = !hideGalleryImages;
    localStorage.setItem('hideGalleryImages', newState);

    // Apply the new state
    if (newState) {
        hideGalleryImagesInMyNikkesList();
    } else {
        showAllGalleryImages();
    }

    // Update the button text if it exists
    const toggleBtn = document.getElementById('toggleGalleryVisibilityBtn');
    if (toggleBtn) {
        toggleBtn.textContent = newState ? 'Show All Nikkes' : 'Hide Owned Nikkes';
    }

    return newState;
}

// Function to search gallery and My Nikke List
function searchNikkes(searchTerm) {
    if (!searchTerm) {
        // If search term is empty, show all items (respecting the hide owned setting)
        const hideGalleryImages = localStorage.getItem('hideGalleryImages') === 'true';

        // Reset toggle items visibility
        document.querySelectorAll('#toggleImages .toggle-item').forEach(item => {
            item.style.display = 'flex';
        });

        // Reset gallery items visibility based on hide owned setting
        if (hideGalleryImages) {
            hideGalleryImagesInMyNikkesList();
        } else {
            showAllGalleryImages();
        }

        return;
    }

    // Convert search term to lowercase for case-insensitive comparison
    const term = searchTerm.toLowerCase();

    // Search in gallery
    const galleryPhotos = document.querySelectorAll('.gallery .photo');
    galleryPhotos.forEach(photo => {
        // Get all data attributes for searching
        const name = (photo.getAttribute('data-name') || '').toLowerCase();
        const faction = (photo.getAttribute('data-faction') || '').toLowerCase();
        const rarity = (photo.getAttribute('data-rarity') || '').toLowerCase();
        const type = (photo.getAttribute('data-type') || '').toLowerCase();
        const position = (photo.getAttribute('data-position') || '').toLowerCase();
        const weapon = (photo.getAttribute('data-weapon') || '').toLowerCase();
        const id = (photo.getAttribute('data-id') || '').toLowerCase();
        const number = (photo.getAttribute('data-number') || '').toLowerCase();
        const element = (photo.getAttribute('data-element') || '').toLowerCase();

        // Combine all searchable text
        const searchableText = `${name} ${faction} ${rarity} ${type} ${position} ${weapon} ${id} ${number} ${element}`;

        // Show/hide based on search match
        if (searchableText.includes(term)) {
            // Only show if it's not hidden by the hide owned setting
            const hideGalleryImages = localStorage.getItem('hideGalleryImages') === 'true';
            if (hideGalleryImages) {
                // Check if this photo is in My Nikke List
                const toggleImagesContainer = document.querySelector('#toggleImages');
                if (toggleImagesContainer) {
                    const toggleImageSources = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
                        .map(img => img.src);

                    const img = photo.querySelector('img');
                    if (img && toggleImageSources.includes(img.src)) {
                        // This photo is in My Nikke List, keep it hidden
                        photo.style.display = 'none';
                    } else {
                        // This photo matches search and is not in My Nikke List, show it
                        photo.style.display = 'flex';
                    }
                } else {
                    // No toggle images container, just show the photo
                    photo.style.display = 'flex';
                }
            } else {
                // Hide owned is off, show all matching photos
                photo.style.display = 'flex';
            }
        } else {
            // Doesn't match search, hide it
            photo.style.display = 'none';
        }
    });

    // Search in My Nikke List
    const toggleItems = document.querySelectorAll('#toggleImages .toggle-item');
    toggleItems.forEach(item => {
        // Get all data attributes for searching
        const name = (item.getAttribute('data-name') || '').toLowerCase();
        const faction = (item.getAttribute('data-faction') || '').toLowerCase();
        const rarity = (item.getAttribute('data-rarity') || '').toLowerCase();
        const type = (item.getAttribute('data-type') || '').toLowerCase();
        const position = (item.getAttribute('data-position') || '').toLowerCase();
        const weapon = (item.getAttribute('data-weapon') || '').toLowerCase();
        const number = (item.getAttribute('data-number') || '').toLowerCase();
        const element = (item.getAttribute('data-element') || '').toLowerCase();

        // Get image src for additional search
        const img = item.querySelector('img');
        const src = img ? img.src.toLowerCase() : '';
        const filename = src.split('/').pop() || '';

        // Combine all searchable text
        const searchableText = `${name} ${faction} ${rarity} ${type} ${position} ${weapon} ${number} ${element} ${filename}`;

        // Show/hide based on search match
        if (searchableText.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Initialize search input event listeners
function initializeSearch() {
    // Gallery search input
    const gallerySearchInput = document.getElementById('myNikkesSearchInput');
    if (gallerySearchInput) {
        gallerySearchInput.addEventListener('input', function() {
            searchNikkes(this.value.trim());

            // Sync the toggle search input
            const toggleSearchInput = document.getElementById('toggleNikkesSearchInput');
            if (toggleSearchInput) {
                toggleSearchInput.value = this.value;
            }
        });
    }

    // Toggle Nikkes search input
    const toggleSearchInput = document.getElementById('toggleNikkesSearchInput');
    if (toggleSearchInput) {
        toggleSearchInput.addEventListener('input', function() {
            searchNikkes(this.value.trim());

            // Sync the gallery search input
            if (gallerySearchInput) {
                gallerySearchInput.value = this.value;
            }
        });
    }

    // Clear search when switching tabs
    document.querySelectorAll('.tab-button[data-tab]').forEach(tab => {
        tab.addEventListener('click', function() {
            if (gallerySearchInput) {
                gallerySearchInput.value = '';
            }
            if (toggleSearchInput) {
                toggleSearchInput.value = '';
            }
            searchNikkes('');
        });
    });
}

// Export functions
window.galleryManager = {
    hideGalleryImagesInMyNikkesList,
    showAllGalleryImages,
    toggleGalleryImagesVisibility,
    searchNikkes,
    initializeSearch
};
