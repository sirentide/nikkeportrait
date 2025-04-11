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

const isPhotoMatchingFilters = (attributes, selectedFilters, searchValue) => {
    // Check if the photo matches all selected filters
    const filtersMatch = Object.keys(selectedFilters).every(key => {
        // If no filters of this type are selected, it's a match
        if (selectedFilters[key].length === 0) return true;

        // Check if the attribute value is in the selected filters
        // For case-insensitive comparison
        return selectedFilters[key].some(value => {
            // Skip null values
            if (value === null) return false;

            // Convert to lowercase for case-insensitive comparison
            return value.toLowerCase() === attributes[key].toLowerCase();
        });
    });

    // Check if the photo matches the search text
    const searchMatch = searchValue === '' || attributes.name.includes(searchValue);

    // Photo matches if it passes both filter and search criteria
    return filtersMatch && searchMatch;
};

// Burst filter buttons functionality
function toggleBurstFilter(button) {
    // Toggle active state for this button
    button.classList.toggle('active');

    // Update filters
    updateFilters();
}

// Get active burst filters
function getActiveBurstFilters() {
    // Only select burst buttons that are active and don't have the filter-btn class
    const activeButtons = document.querySelectorAll('.burst-btn.active:not(.filter-btn)');
    return Array.from(activeButtons)
        .map(btn => btn.getAttribute('data-value'))
        .filter(value => value !== null); // Filter out null values
}

// Filter functionality
function updateFilters() {
    const photos = document.querySelectorAll('.photo');
    console.log('Updating filters, found', photos.length, 'photos');

    // Get burst filters from the modern buttons
    const burstFilters = getActiveBurstFilters();
    console.log('Active burst filters:', burstFilters);

    // Get checked values for each filter type
    const typeValues = getCheckedValues(['b1', 'b2', 'b3', 'B1', 'B2', 'B3', 'a', 'A']);
    const positionValues = getCheckedValues(['def', 'sp', 'atk', 'DEF', 'SP', 'ATK']);
    const factionValues = getCheckedValues(['elysion', 'missilis', 'tetra', 'abnormal', 'pilgrim', 'ELYSION', 'MISSILIS', 'TETRA', 'ABNORMAL', 'PILGRIM']);
    const rarityValues = getCheckedValues(['ssr', 'sr', 'r', 'SSR', 'SR', 'R']);
    const weaponValues = getCheckedValues(['smg', 'ar', 'snr', 'rl', 'sg', 'mg', 'SMG', 'AR', 'SNR', 'RL', 'SG', 'MG']);

    console.log('Checked filters:', {
        type: typeValues,
        position: positionValues,
        faction: factionValues,
        rarity: rarityValues,
        weapon: weaponValues
    });

    const selectedFilters = {
        type: burstFilters.length > 0 ? burstFilters : typeValues,
        position: positionValues,
        faction: factionValues,
        rarity: rarityValues,
        weapon: weaponValues,
    };

    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    console.log('Search value:', searchValue);

    let visibleCount = 0;
    photos.forEach(photo => {
        const attributes = getPhotoAttributes(photo);
        const isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);
        photo.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) visibleCount++;
    });

    console.log('Visible photos after filtering:', visibleCount);
}

// Function to organize images
function sortImages() {
    const photosArray = Array.from(document.querySelectorAll('.photo'));

    // Sort by data-number attribute in descending order (highest first)
    photosArray.sort((a, b) => {
        return parseInt(b.getAttribute('data-number')) - parseInt(a.getAttribute('data-number'));
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

async function loadSelectionFromLocalStorage() {
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
        for (const imgSrc of selectedImages) {
            // Extract the filename from the src
            const savedFilename = imgSrc.split('/').pop();

            // Try normalized version of the filename (lowercase b2/b3)
            const normalizedFilename = normalizeFilename(savedFilename);
            const normalizedSrc = imgSrc.replace(savedFilename, normalizedFilename);

            // Check if the normalized image exists
            const imageExists = await checkImageExists(normalizedSrc);

            // Try to find the image with exact match first
            let galleryImg = document.querySelector(`.photo img[src="${imgSrc}"]`);

            // If not found and normalized version exists, try that
            if (!galleryImg && imageExists) {
                galleryImg = document.querySelector(`.photo img[src="${normalizedSrc}"]`);
                console.log('Using normalized filename:', normalizedFilename);
            }

            // If still not found, try case-insensitive match
            if (!galleryImg) {
                console.log('Image not found with exact match, trying case-insensitive match:', savedFilename);

                // Get all gallery images
                const allGalleryImages = document.querySelectorAll('.photo img');

                // Find one with a matching filename (case-insensitive)
                for (const img of allGalleryImages) {
                    const currentFilename = img.src.split('/').pop();

                    // Compare filenames ignoring case
                    if (currentFilename.toLowerCase() === savedFilename.toLowerCase() ||
                        currentFilename.toLowerCase() === normalizedFilename.toLowerCase()) {
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
        }

        // Load images into team slots
        const teamContainers = document.querySelectorAll('.team-images');
        for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
            const teamData = teams[teamIndex];
            if (teamContainers[teamIndex]) {
                const slots = teamContainers[teamIndex].querySelectorAll('.image-slot');

                // Add images to slots
                for (let slotIndex = 0; slotIndex < teamData.images.length; slotIndex++) {
                    const imgData = teamData.images[slotIndex];
                    if (slots[slotIndex]) {
                        const selectedImg = document.createElement('img');

                        // Extract the filename from the src
                        const savedFilename = imgData.src.split('/').pop();

                        // Try normalized version of the filename (lowercase b2/b3)
                        const normalizedFilename = normalizeFilename(savedFilename);
                        const normalizedSrc = imgData.src.replace(savedFilename, normalizedFilename);

                        // Check if the normalized image exists
                        const imageExists = await checkImageExists(normalizedSrc);

                        // Use normalized src if it exists
                        if (imageExists) {
                            selectedImg.src = normalizedSrc;
                            console.log('Using normalized filename for team image:', normalizedFilename);
                        } else {
                            selectedImg.src = imgData.src;
                        }

                        // Try to find the image with exact match first
                        let galleryImg = document.querySelector(`.photo img[src="${imgData.src}"]`);

                        // If not found and normalized version exists, try that
                        if (!galleryImg && imageExists) {
                            galleryImg = document.querySelector(`.photo img[src="${normalizedSrc}"]`);
                            console.log('Using normalized filename (from team):', normalizedFilename);
                        }

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
                }
            }
        }

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

    // Clear local storage
    localStorage.removeItem(STORAGE_KEY);

    // Re-organize images
    sortImages();
});

// Filter toggle functionality
function toggleFilter(button) {
    // Get the filter content by ID since it's now outside the button's parent
    const filterContent = document.getElementById('filterContent');

    if (filterContent.style.display === "none" || !filterContent.style.display) {
        // Get button position for positioning the dropdown
        const buttonRect = button.getBoundingClientRect();

        // First display the content to get its dimensions
        filterContent.style.opacity = '0';
        filterContent.style.display = 'block';

        // Get dimensions after display
        const contentHeight = filterContent.offsetHeight;

        // Check if there's enough space above
        const spaceAbove = buttonRect.top;

        // Position the filter content relative to the button
        if (window.innerWidth <= 768) {
            // Mobile positioning
            if (spaceAbove >= contentHeight + 10) {
                // Position above
                filterContent.style.top = (buttonRect.top - 10 - contentHeight) + 'px';
            } else {
                // Not enough space above, position below
                filterContent.style.top = (buttonRect.bottom + 10) + 'px';
            }
            filterContent.style.right = '10px';
            filterContent.style.left = 'auto';
        } else {
            // Desktop positioning - to the left
            if (spaceAbove >= contentHeight + 10) {
                // Position above
                filterContent.style.top = (buttonRect.top - 10 - contentHeight) + 'px';
            } else {
                // Not enough space above, position below
                filterContent.style.top = (buttonRect.bottom + 10) + 'px';
            }
            filterContent.style.left = 'auto';
            filterContent.style.right = (window.innerWidth - buttonRect.left + 10) + 'px';
        }

        // Show the filter content with animation
        filterContent.style.opacity = '1';
        button.classList.add('active');

        // Add click outside listener to close dropdown
        setTimeout(() => {
            document.addEventListener('click', closeFilterDropdown);
        }, 10);
    } else {
        // Hide the filter content
        filterContent.style.display = "none";
        button.classList.remove('active');

        // Remove click outside listener
        document.removeEventListener('click', closeFilterDropdown);
    }
}

// Function to close filter dropdown when clicking outside
function closeFilterDropdown(event) {
    const filterContent = document.getElementById('filterContent');
    const filterBtn = document.querySelector('.filter-btn');

    // If click is outside filter content and filter button
    if (!filterContent.contains(event.target) && !filterBtn.contains(event.target)) {
        // Fade out
        filterContent.style.opacity = '0';
        filterBtn.classList.remove('active');

        // Hide after transition
        setTimeout(() => {
            filterContent.style.display = 'none';
        }, 200);

        // Remove this event listener
        document.removeEventListener('click', closeFilterDropdown);
    }
}

// Initialize filter visibility and setup checkbox handlers
document.addEventListener('DOMContentLoaded', function() {
    const filterContent = document.getElementById('filterContent');
    if (filterContent) {
        filterContent.style.display = "none";
    }

    // Setup checkbox styling and event handlers
    setupCheckboxStyling();

    // Prevent clicks on the filter content from closing it
    filterContent.addEventListener('click', function(event) {
        event.stopPropagation();
    });
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

// Function to normalize filename case (convert B2/B3 to b2/b3)
function normalizeFilename(filename) {
    // Replace uppercase B2 and B3 with lowercase
    return filename
        .replace('_B2_', '_b2_')
        .replace('_B3_', '_b3_')
        .replace('_A_', '_a_');
}

// Function to check if an image exists
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Initialize
window.onload = async () => {
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

    // Set up checkbox styling
    setupCheckboxStyling();

    // Load selection from localStorage (async function)
    await loadSelectionFromLocalStorage();

    updateTeamScore();
    applyProtectionToGalleryAndSelected();
    sortImages();

    // Apply green borders after a short delay to ensure DOM is fully loaded
    setTimeout(ensureGreenBorders, 500);
};

// Function to set up checkbox styling
function setupCheckboxStyling() {
    // Add active class to checkboxes when checked
    document.querySelectorAll('.checkbox-label input').forEach(checkbox => {
        // Initial state
        if (checkbox.checked) {
            checkbox.parentElement.classList.add('active');
        }

        // Remove existing event listeners to prevent duplicates
        checkbox.removeEventListener('change', checkboxChangeHandler);

        // Add new event listener
        checkbox.addEventListener('change', checkboxChangeHandler);
    });
}

// Handler for checkbox changes
function checkboxChangeHandler() {
    // Update styling
    if (this.checked) {
        this.parentElement.classList.add('active');
    } else {
        this.parentElement.classList.remove('active');
    }

    // Update filters
    updateFilters();
}
