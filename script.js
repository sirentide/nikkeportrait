// Constants
const STORAGE_KEY = 'nikkePortraitData';

// Utility functions
const getCheckedValues = (values) =>
    Array.from(document.querySelectorAll(`input[type="checkbox"][value^="${values.join('"], input[type="checkbox"][value="')}"]`))
        .filter(chk => chk.checked)
        .map(chk => chk.value);

const getPhotoAttributes = (photo) => ({
    type: photo.getAttribute('data-type').toLowerCase(),
    position: photo.getAttribute('data-position').toLowerCase(),
    faction: photo.getAttribute('data-faction').toLowerCase(),
    rarity: photo.getAttribute('data-rarity').toLowerCase(),
    weapon: photo.getAttribute('data-weapon').toLowerCase(),
    name: photo.getAttribute('data-name').toLowerCase(),
});

const isPhotoMatchingFilters = (attributes, selectedFilters, searchValue) =>
    Object.keys(selectedFilters).every(key =>
        selectedFilters[key].length === 0 || selectedFilters[key].includes(attributes[key])
    ) && (searchValue === '' || attributes.name.includes(searchValue));

// Filter functionality
function updateFilters() {
    const photos = document.querySelectorAll('.photo');
    const selectedFilters = {
        type: getCheckedValues(['b1', 'b2', 'b3', 'B1', 'B2', 'B3', 'a', 'A']),
        position: getCheckedValues(['def', 'sp', 'atk', 'DEF', 'SP', 'ATK']),
        faction: getCheckedValues(['elysion', 'missilis', 'tetra', 'abnormal', 'pilgrim', 'ELYSION', 'MISSILIS', 'TETRA', 'ABNORMAL', 'PILGRIM']),
        rarity: getCheckedValues(['ssr', 'sr', 'r', 'SSR', 'SR', 'R']),
        weapon: getCheckedValues(['smg', 'ar', 'snr', 'rl', 'sg', 'mg', 'SMG', 'AR', 'SNR', 'RL', 'SG', 'MG']),
    };

    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    photos.forEach(photo => {
        const attributes = getPhotoAttributes(photo);
        const isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);
        photo.style.display = isMatch ? 'flex' : 'none';
    });
}

// Sort functionality
let currentSortCriteria = 'number';
let currentSortOrder = 'desc';

function toggleSortCriteria() {
    currentSortCriteria = currentSortCriteria === 'name' ? 'number' : 'name';
    document.getElementById('sortToggle').innerText =
        currentSortCriteria === 'name' ? 'Sort by Burst Gen' : 'Sort by Name';
    sortImages();
}

function toggleSortOrder() {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    document.getElementById('orderToggle').innerText =
        currentSortOrder === 'asc' ? 'Highest' : 'Lowest';
    sortImages();
}

function sortImages() {
    const photosArray = Array.from(document.querySelectorAll('.photo'));
    photosArray.sort((a, b) => {
        const comparison = currentSortCriteria === 'name'
            ? a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'))
            : parseInt(a.getAttribute('data-number')) - parseInt(b.getAttribute('data-number'));
        return currentSortOrder === 'asc' ? comparison : -comparison;
    });

    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';
    photosArray.forEach(photo => gallery.appendChild(photo));
}

// Image selection and team management
function toggleImageSelection(imgElement) {
    const imgSrc = imgElement.src;
    const isSelected = imgElement.classList.contains('selected');

    console.log('Toggle image selection:', imgSrc, 'isSelected:', isSelected);

    // Force refresh the selection state by checking if the image is in any team slot
    const imageInTeamSlot = Array.from(document.querySelectorAll('.team-images .image-slot img'))
        .some(img => img.src === imgSrc);

    console.log('Image in team slot:', imageInTeamSlot);

    if (isSelected || imageInTeamSlot) {
        removeImageFromSelection(imgElement, imgSrc);
    } else {
        addImageToSelection(imgElement, imgSrc);
    }

    updateTeamScore();
    applyProtectionToGalleryAndSelected();
    saveSelectionToLocalStorage();
}

function removeImageFromSelection(imgElement, imgSrc) {
    document.querySelectorAll('.team-images').forEach(teamRow => {
        teamRow.querySelectorAll('.image-slot img').forEach(img => {
            if (img.src === imgSrc) {
                img.parentElement.classList.add('empty');
                img.remove();
            }
        });
    });
    imgElement.classList.remove('selected');
    // Clear all green border styles
    imgElement.style.border = '';
    imgElement.style.outline = '';
    imgElement.style.boxShadow = '';
    imgElement.style.zIndex = '';
    imgElement.style.position = '';
}

function addImageToSelection(imgElement, imgSrc) {
    const teamRows = document.querySelectorAll('.team-images');
    for (const teamRow of teamRows) {
        const emptySlot = teamRow.querySelector('.image-slot.empty');
        if (emptySlot) {
            const selectedImg = document.createElement('img');
            selectedImg.src = imgSrc;

            // Add click handler for removal
            selectedImg.onclick = () => {
                toggleImageSelection(imgElement);
            };

            emptySlot.appendChild(selectedImg);
            emptySlot.classList.remove('empty');
            imgElement.classList.add('selected');
            // Force style update with enhanced green border
            imgElement.style.border = '3px solid #00ff00';
            imgElement.style.outline = '1px solid #ffffff';
            imgElement.style.boxShadow = '0 0 8px #00ff00';
            imgElement.style.zIndex = '10';
            imgElement.style.position = 'relative';
            break;
        }
    }
}

// Local Storage Management
function saveSelectionToLocalStorage() {
    const teams = document.querySelectorAll('.team-images');
    const teamsData = Array.from(teams).map(team => ({
        images: Array.from(team.querySelectorAll('.image-slot img')).map(img => ({
            src: img.src,
            score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
        }))
    }));

    const selectedGalleryImages = Array.from(document.querySelectorAll('.photo img.selected'))
        .map(img => img.src);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        teams: teamsData,
        selectedImages: selectedGalleryImages
    }));
}

function loadSelectionFromLocalStorage() {
    try {
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!savedData) return;

        console.log('Loading selection from localStorage:', savedData);

        const { teams, selectedImages } = savedData;

        // First clear all selections
        document.querySelectorAll('.photo img.selected').forEach(img => {
            img.classList.remove('selected');
        });

        // Clear all team slots
        document.querySelectorAll('.team-images').forEach(teamRow => {
            teamRow.querySelectorAll('.image-slot').forEach(slot => {
                slot.innerHTML = '';
                slot.classList.add('empty');
            });
        });

        // Mark all gallery images from selectedImages as selected
        selectedImages.forEach(imgSrc => {
            // Extract the filename from the src
            const savedFilename = imgSrc.split('/').pop();

            // Try to find the image with exact match first
            let galleryImg = document.querySelector(`.photo img[src="${imgSrc}"]`);

            // If not found, try case-insensitive match
            if (!galleryImg) {
                console.log('Image not found with exact match, trying case-insensitive match:', savedFilename);

                // Get all gallery images
                const allGalleryImages = document.querySelectorAll('.photo img');

                // Find one with a matching filename (case-insensitive)
                for (const img of allGalleryImages) {
                    const currentFilename = img.src.split('/').pop();

                    // Compare filenames ignoring case
                    if (currentFilename.toLowerCase() === savedFilename.toLowerCase()) {
                        galleryImg = img;
                        console.log('Found case-insensitive match:', currentFilename);
                        break;
                    }
                }
            }

            if (galleryImg) {
                console.log('Marking gallery image as selected:', galleryImg.src);
                galleryImg.classList.add('selected');
                // Force style update
                galleryImg.style.border = '3px solid #00ff00';
                galleryImg.style.outline = '1px solid #ffffff';
                galleryImg.style.boxShadow = '0 0 8px #00ff00';
                galleryImg.style.zIndex = '10';
                galleryImg.style.position = 'relative';
            } else {
                console.warn('Gallery image not found:', savedFilename);
            }
        });

        // Load images into team slots
        const teamContainers = document.querySelectorAll('.team-images');
        teams.forEach((teamData, teamIndex) => {
            if (teamContainers[teamIndex]) {
                const slots = teamContainers[teamIndex].querySelectorAll('.image-slot');

                // Add images to slots
                teamData.images.forEach((imgData, slotIndex) => {
                    if (slots[slotIndex]) {
                        const selectedImg = document.createElement('img');
                        selectedImg.src = imgData.src;

                        // Extract the filename from the src
                        const savedFilename = imgData.src.split('/').pop();

                        // Try to find the image with exact match first
                        let galleryImg = document.querySelector(`.photo img[src="${imgData.src}"]`);

                        // If not found, try case-insensitive match
                        if (!galleryImg) {
                            console.log('Image not found with exact match, trying case-insensitive match (from team):', savedFilename);

                            // Get all gallery images
                            const allGalleryImages = document.querySelectorAll('.photo img');

                            // Find one with a matching filename (case-insensitive)
                            for (const img of allGalleryImages) {
                                const currentFilename = img.src.split('/').pop();

                                // Compare filenames ignoring case
                                if (currentFilename.toLowerCase() === savedFilename.toLowerCase()) {
                                    galleryImg = img;
                                    console.log('Found case-insensitive match (from team):', currentFilename);

                                    // Update the src to use the actual filename with correct case
                                    selectedImg.src = img.src;
                                    break;
                                }
                            }
                        }

                        if (galleryImg) {
                            console.log('Marking gallery image as selected (from team):', galleryImg.src);
                            galleryImg.classList.add('selected');
                            // Force style update
                            galleryImg.style.border = '3px solid #00ff00';
                            galleryImg.style.outline = '1px solid #ffffff';
                            galleryImg.style.boxShadow = '0 0 8px #00ff00';
                            galleryImg.style.zIndex = '10';
                            galleryImg.style.position = 'relative';
                        } else {
                            console.warn('Gallery image not found (from team):', savedFilename);
                        }

                        // Add click handler for removal
                        selectedImg.onclick = () => {
                            // Use the updated src from the selectedImg
                            const currentSrc = selectedImg.src;
                            const filename = currentSrc.split('/').pop();

                            // Try to find the image with exact match first
                            let galleryImg = document.querySelector(`.photo img[src="${currentSrc}"]`);

                            // If not found, try case-insensitive match
                            if (!galleryImg) {
                                console.log('Image not found with exact match for removal, trying case-insensitive match:', filename);

                                // Get all gallery images
                                const allGalleryImages = document.querySelectorAll('.photo img');

                                // Find one with a matching filename (case-insensitive)
                                for (const img of allGalleryImages) {
                                    const currentFilename = img.src.split('/').pop();

                                    // Compare filenames ignoring case
                                    if (currentFilename.toLowerCase() === filename.toLowerCase()) {
                                        galleryImg = img;
                                        console.log('Found case-insensitive match for removal:', currentFilename);
                                        break;
                                    }
                                }
                            }

                            if (galleryImg) {
                                console.log('Team image clicked, toggling gallery image:', galleryImg.src);
                                toggleImageSelection(galleryImg);
                            } else {
                                // If gallery image not found, still remove from slot
                                console.log('Gallery image not found, removing from slot:', filename);

                                // Find all gallery images with the same source and remove selected class and styles
                                document.querySelectorAll('.photo img').forEach(img => {
                                    if (img.src === imgData.src) {
                                        console.log('Removing selected class from gallery image:', img.src);
                                        img.classList.remove('selected');
                                        // Clear all green border styles
                                        img.style.border = '';
                                        img.style.outline = '';
                                        img.style.boxShadow = '';
                                        img.style.zIndex = '';
                                        img.style.position = '';
                                    }
                                });

                                selectedImg.parentElement.classList.add('empty');
                                selectedImg.remove();
                                updateTeamScore();
                                saveSelectionToLocalStorage();
                            }
                        };

                        slots[slotIndex].appendChild(selectedImg);
                        slots[slotIndex].classList.remove('empty');
                    }
                });
            }
        });

        // Update team scores
        updateTeamScore();

        // Apply protection to gallery and selected images
        applyProtectionToGalleryAndSelected();

        // Apply green borders to selected images
        ensureGreenBorders();

        // Verify all selected images have the selected class and fix any that don't
        document.querySelectorAll('.photo img').forEach(img => {
            // Check if this image is in any team slot
            const isInTeamSlot = Array.from(document.querySelectorAll('.team-images .image-slot img'))
                .some(teamImg => teamImg.src === img.src);

            // Check if this image is in the selectedImages array
            const isInSelectedImages = selectedImages.includes(img.src);

            console.log('Image status:', img.src,
                'In team slot:', isInTeamSlot,
                'In selectedImages:', isInSelectedImages,
                'Has selected class:', img.classList.contains('selected'));

            // If the image should be selected but doesn't have the class, fix it
            if ((isInTeamSlot || isInSelectedImages) && !img.classList.contains('selected')) {
                console.log('Fixing missing selected class for:', img.src);
                img.classList.add('selected');
                img.style.border = '3px solid #00ff00';
                img.style.outline = '1px solid #ffffff';
                img.style.boxShadow = '0 0 8px #00ff00';
                img.style.zIndex = '10';
                img.style.position = 'relative';
            }

            // If the image has the class but shouldn't be selected, fix that too
            if (!isInTeamSlot && !isInSelectedImages && img.classList.contains('selected')) {
                console.log('Removing incorrect selected class from:', img.src);
                img.classList.remove('selected');
                img.style.border = '';
            }
        });
    } catch (error) {
        console.error('Error loading selection from localStorage:', error);
    }
}

// UI Utilities
function adjustImageSize(imgElement) {
    const width = window.innerWidth <= 768 ? 50 : 100;
    imgElement.style.width = `${width}px`;
    imgElement.style.height = `${width}px`;
}

function updateTeamScore() {
    document.querySelectorAll('.team-row').forEach(teamRow => {
        const teamScoreElement = teamRow.querySelector('.team-score');
        const totalScore = Array.from(teamRow.querySelectorAll('img'))
            .reduce((total, img) =>
                total + parseInt(img.src.split('/').pop().split('_')[0], 10) / 10, 0);
        teamScoreElement.textContent = totalScore.toFixed(1);
    });
}

function clearSelection() {
    // Remove selected class and styles from all gallery images
    document.querySelectorAll('.photo img.selected').forEach(img => {
        img.classList.remove('selected');
        // Clear all green border styles
        img.style.border = '';
        img.style.outline = '';
        img.style.boxShadow = '';
        img.style.zIndex = '';
        img.style.position = '';
    });

    // Clear all team slots
    document.querySelectorAll('.team-images').forEach(team => {
        team.innerHTML = '';
    });

    // Reset all image slots to empty state
    document.querySelectorAll('.image-slot').forEach(slot => {
        slot.classList.add('empty');
    });

    localStorage.removeItem(STORAGE_KEY);
    updateTeamScore();
}

// Image Protection
function applyProtectionToGalleryAndSelected() {
    document.querySelectorAll('.gallery img, #selectedContainer img').forEach(img => {
        img.addEventListener('contextmenu', (event) => event.preventDefault());
        img.setAttribute('draggable', 'false');
    });
}

// Clear selected team functionality
document.getElementById('clearSelectionBtn').addEventListener('click', function() {
    // Reset all image slots to empty state
    document.querySelectorAll('.image-slot').forEach(slot => {
        // Remove any existing images
        const existingImg = slot.querySelector('img');
        if (existingImg) {
            existingImg.remove();
        }
        // Reset the slot state
        slot.classList.add('empty');
    });

    // Remove selected class and styles from all gallery images
    document.querySelectorAll('.gallery img.selected').forEach(img => {
        img.classList.remove('selected');
        // Clear all green border styles
        img.style.border = '';
        img.style.outline = '';
        img.style.boxShadow = '';
        img.style.zIndex = '';
        img.style.position = '';
    });

    // Reset all team scores
    document.querySelectorAll('.team-score').forEach(score => {
        score.textContent = '0.0';
    });

    // Reset filters if they exist
    const filterContent = document.querySelector('.filter-content');
    if (filterContent) {
        filterContent.style.display = "none";
        const filterButton = document.querySelector('.filter-toggle');
        if (filterButton) {
            filterButton.innerHTML = "Filters ►";
        }
    }

    // Reset sort to default if needed
    currentSortCriteria = 'number';
    currentSortOrder = 'desc';

    // Update UI elements for sort
    const sortToggle = document.getElementById('sortToggle');
    const orderToggle = document.getElementById('orderToggle');
    if (sortToggle) sortToggle.innerText = 'Sort by Name';
    if (orderToggle) orderToggle.innerText = 'Highest';

    // Clear local storage
    localStorage.removeItem(STORAGE_KEY);

    // Re-sort images to default state
    sortImages();
});

// Filter toggle functionality
function toggleFilter(button) {
    const content = button.nextElementSibling;
    if (content.style.display === "none" || !content.style.display) {
        content.style.display = "grid";
        button.innerHTML = "Filters ▼";
    } else {
        content.style.display = "none";
        button.innerHTML = "Filters ►";
    }
}

// Initialize filter visibility
document.addEventListener('DOMContentLoaded', function() {
    const filterContent = document.querySelector('.filter-content');
    if (filterContent) {
        filterContent.style.display = "none";
    }
});

// Function to ensure selected images have green borders
function ensureGreenBorders() {
    // Apply green borders to all selected images
    document.querySelectorAll('.photo img.selected').forEach(img => {
        img.style.border = '3px solid #00ff00';
        img.style.outline = '1px solid #ffffff';
        img.style.boxShadow = '0 0 8px #00ff00';
        img.style.zIndex = '10';
        img.style.position = 'relative';
    });

    // Also check team slots and ensure corresponding gallery images are marked
    document.querySelectorAll('.team-images .image-slot img').forEach(teamImg => {
        const galleryImg = document.querySelector(`.photo img[src="${teamImg.src}"]`);
        if (galleryImg) {
            galleryImg.classList.add('selected');
            galleryImg.style.border = '3px solid #00ff00';
            galleryImg.style.outline = '1px solid #ffffff';
            galleryImg.style.boxShadow = '0 0 8px #00ff00';
            galleryImg.style.zIndex = '10';
            galleryImg.style.position = 'relative';
        }
    });
}

// Function to clean up duplicate character names in filenames
function cleanupCharacterName(name) {
    // Find repeated words
    const words = name.split(' ');
    const uniqueWords = [];

    for (let i = 0; i < words.length; i++) {
        // Skip if this word is a repeat of the previous word
        if (i > 0 && words[i].toLowerCase() === words[i-1].toLowerCase()) {
            continue;
        }
        uniqueWords.push(words[i]);
    }

    return uniqueWords.join(' ');
}

// Initialize
window.onload = () => {
    loadSelectionFromLocalStorage();
    updateTeamScore();
    applyProtectionToGalleryAndSelected();
    sortImages();

    // Clean up duplicate character names in filenames
    document.querySelectorAll('.photo').forEach(photo => {
        const img = photo.querySelector('img');
        if (img) {
            const src = img.src;
            const filename = src.split('/').pop();
            const parts = filename.split('_');

            if (parts.length > 5) {
                // Get the character name parts
                let nameParts = parts.slice(5);

                // Remove file extension
                let lastPart = nameParts[nameParts.length - 1].replace('.webp', '');
                nameParts[nameParts.length - 1] = lastPart;

                // Clean up the name
                const name = cleanupCharacterName(nameParts.join(' '));

                // Set the data-name attribute
                photo.setAttribute('data-name', name);
            }
        }
    });

    // Apply green borders after a short delay to ensure DOM is fully loaded
    setTimeout(ensureGreenBorders, 500);
};
