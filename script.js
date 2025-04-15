// Constants
const STORAGE_KEY = 'nikkePortraitData';

// Global variables
let currentTeamSet = '1'; // Default to team set 1
let currentContentTab = 'toggleImages'; // Default to Toggle Images tab

// Utility functions
const getCheckedValues = (values) =>
    Array.from(document.querySelectorAll(`input[type="checkbox"][value^="${values.join('"], input[type="checkbox"][value="')}"]`))
        .filter(chk => chk.checked)
        .map(chk => chk.value);

const getPhotoAttributes = (photo) => {
    // Safely get attribute with fallback to empty string if null
    const safeGetAttribute = (element, attr) => {
        const value = element.getAttribute(attr);
        return value ? value.toLowerCase() : '';
    };

    return {
        type: safeGetAttribute(photo, 'data-type'),
        position: safeGetAttribute(photo, 'data-position'),
        faction: safeGetAttribute(photo, 'data-faction'),
        rarity: safeGetAttribute(photo, 'data-rarity'),
        weapon: safeGetAttribute(photo, 'data-weapon'),
        name: safeGetAttribute(photo, 'data-name'),
    };
};

const isPhotoMatchingFilters = (attributes, selectedFilters, searchValue) => {
    // Check if the photo matches all selected filters
    const filtersMatch = Object.keys(selectedFilters).every(key => {
        // If no filters of this type are selected, it's a match
        if (selectedFilters[key].length === 0) return true;

        // If the attribute is empty and filters are selected, it's not a match
        if (!attributes[key] && selectedFilters[key].length > 0) return false;

        // Check if the attribute value is in the selected filters
        return selectedFilters[key].some(value => {
            // Skip null values
            if (value === null) return false;

            // Convert to lowercase for case-insensitive comparison
            return value.toLowerCase() === attributes[key];
        });
    });

    // Check if the photo matches the search text
    const searchMatch = searchValue === '' || (attributes.name && attributes.name.includes(searchValue));

    // Photo matches if it passes both filter and search criteria
    return filtersMatch && searchMatch;
};

// Burst filter buttons functionality
function toggleBurstFilter(button) {
    // Toggle active state for this button
    button.classList.toggle('active');
    console.log('Toggled burst filter:', button.getAttribute('data-value'), 'Active:', button.classList.contains('active'));

    // Update filters
    updateFilters();

    // Re-sort images to maintain order
    sortImages();
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

    // Filter gallery photos
    const photos = document.querySelectorAll('.photo');
    console.log('Updating filters, found', photos.length, 'gallery photos');

    let galleryVisibleCount = 0;
    photos.forEach(photo => {
        const attributes = getPhotoAttributes(photo);
        const isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);
        photo.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) galleryVisibleCount++;
    });

    console.log('Visible gallery photos after filtering:', galleryVisibleCount);

    // Filter toggle items
    const toggleItems = document.querySelectorAll('.toggle-item');
    console.log('Updating filters, found', toggleItems.length, 'toggle items');

    let toggleVisibleCount = 0;
    toggleItems.forEach(item => {
        const attributes = getPhotoAttributes(item);
        const isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);
        item.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) toggleVisibleCount++;
    });

    console.log('Visible toggle items after filtering:', toggleVisibleCount);
}

// Function to organize images
function sortImages() {
    const photosArray = Array.from(document.querySelectorAll('.photo'));

    // Sort by data-number attribute in descending order (highest first)
    photosArray.sort((a, b) => {
        return parseInt(b.getAttribute('data-number')) - parseInt(a.getAttribute('data-number'));
    });

    const gallery = document.querySelector('.gallery');

    // Save references to all selected images before clearing
    const selectedImages = document.querySelectorAll('.photo img.selected');
    const selectedSrcs = Array.from(selectedImages).map(img => img.src);

    // Clear and re-add all photos
    gallery.innerHTML = '';
    photosArray.forEach(photo => gallery.appendChild(photo));

    // Re-apply selected class and styles to images that were selected
    document.querySelectorAll('.photo img').forEach(img => {
        if (selectedSrcs.includes(img.src)) {
            img.classList.add('selected');
            img.style.border = '3px solid #00ff00';
            img.style.outline = '1px solid #ffffff';
            img.style.boxShadow = '0 0 8px #00ff00';
            img.style.zIndex = '10';
            img.style.position = 'relative';
        }
    });
}

// Image selection and team management
function toggleImageSelection(imgElement) {
    const imgSrc = imgElement.src;
    const isSelected = imgElement.classList.contains('selected');

    console.log('Toggle image selection:', imgSrc, 'isSelected:', isSelected);

    // Check if we're in gallery tab or one of the toggle tabs
    if (currentContentTab === 'gallery') {
        // Force refresh the selection state by checking if the image is in any team slot of the current team set
        const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
        const imageInTeamSlot = Array.from(currentTeamContainer.querySelectorAll('.team-images .image-slot img'))
            .some(img => img.src === imgSrc);

        console.log('Image in team slot:', imageInTeamSlot);

        if (isSelected || imageInTeamSlot) {
            removeImageFromSelection(imgElement, imgSrc);
        } else {
            addImageToSelection(imgElement, imgSrc);
        }

        updateTeamScore();
    } else {
        // We're in the Toggle Images tab - treat it just like the gallery
        if (isSelected) {
            removeImageFromSelection(imgElement, imgSrc);
        } else {
            addImageToSelection(imgElement, imgSrc);
        }

        updateTeamScore();

        // Also update the corresponding image in the gallery if it exists
        if (imgElement.dataset.original) {
            const galleryImg = document.querySelector(`.gallery .photo img[src="${imgElement.dataset.original}"]`);
            if (galleryImg) {
                // Update the gallery image to match this toggle image's state
                if (isSelected) {
                    galleryImg.classList.remove('selected');
                    galleryImg.style.border = '';
                    galleryImg.style.outline = '';
                    galleryImg.style.boxShadow = '';
                    galleryImg.style.zIndex = '';
                    galleryImg.style.position = '';
                } else {
                    galleryImg.classList.add('selected');
                    galleryImg.style.border = '3px solid #00ff00';
                    galleryImg.style.outline = '1px solid #ffffff';
                    galleryImg.style.boxShadow = '0 0 8px #00ff00';
                    galleryImg.style.zIndex = '10';
                    galleryImg.style.position = 'relative';
                }
            }
        }

        // Save toggle tabs state
        saveToggleTabsToLocalStorage();
    }

    applyProtectionToGalleryAndSelected();
    saveSelectionToLocalStorage();
}

function removeImageFromSelection(imgElement, imgSrc) {
    // Only remove from the current team set
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    currentTeamContainer.querySelectorAll('.team-images').forEach(teamRow => {
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
    // Only add to the current team set
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    const teamRows = currentTeamContainer.querySelectorAll('.team-images');

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
            // Apply green border styles
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
    // Save team data for SET1 and SET2
    const teamSets = [];

    for (let i = 1; i <= 2; i++) {
        const teams = document.querySelectorAll(`#teamSet${i} .team-images`);
        const teamsData = Array.from(teams).map(team => ({
            images: Array.from(team.querySelectorAll('.image-slot img')).map(img => ({
                src: img.src,
                score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
            }))
        }));
        teamSets.push(teamsData);
    }

    const selectedGalleryImages = Array.from(document.querySelectorAll('.photo img.selected'))
        .map(img => img.src);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        teamSets: teamSets,
        selectedImages: selectedGalleryImages,
        currentTeamSet: currentTeamSet,
        currentContentTab: currentContentTab
    }));
}

// Save toggle tabs data to localStorage
function saveToggleTabsToLocalStorage() {
    const toggleTabs = {};

    // Save Toggle Images data
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (toggleImagesContainer) {
        const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
        const toggleImagesData = toggleItems.map(item => {
            const img = item.querySelector('img');
            return {
                src: img.src,
                number: item.getAttribute('data-number'),
                name: item.getAttribute('data-name'),
                type: item.getAttribute('data-type'),
                position: item.getAttribute('data-position'),
                faction: item.getAttribute('data-faction'),
                rarity: item.getAttribute('data-rarity'),
                weapon: item.getAttribute('data-weapon'),
                selected: img.classList.contains('selected')
            };
        });
        toggleTabs['toggleImages'] = toggleImagesData;
    }

    // Get existing data
    let existingData = {};
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            existingData = JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error parsing stored data:', error);
    }

    // Update with toggle tabs data
    existingData.toggleTabs = toggleTabs;

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
}

async function loadSelectionFromLocalStorage() {
    try {
        const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!savedData) return;

        console.log('Loading selection from localStorage:', savedData);

        // Handle old format for backward compatibility
        // Convert old format to new format if needed
        const toggleTabs = savedData.toggleTabs || { toggleImages: [] };

        // Convert old format to new format if needed
        if (toggleTabs.toggleGallery && !toggleTabs.toggleImages) {
            toggleTabs.toggleImages = toggleTabs.toggleGallery;
        }

        // Handle old format with SET3
        if (savedData.teamSets && savedData.teamSets.length > 2) {
            // Keep only SET1 and SET2
            savedData.teamSets = savedData.teamSets.slice(0, 2);
        }

        // If currentTeamSet is 3, change it to 1
        if (savedData.currentTeamSet === '3') {
            savedData.currentTeamSet = '1';
        }

        // Log the data we're loading
        console.log('Loading toggle tabs:', toggleTabs);

        // Restore current tab and team set if available
        if (savedData.currentTeamSet) {
            currentTeamSet = savedData.currentTeamSet;
            switchTeamSet(currentTeamSet);
        }

        if (savedData.currentContentTab) {
            currentContentTab = savedData.currentContentTab;
            switchContentTab(currentContentTab);
        }

        // First clear all selections
        document.querySelectorAll('.photo img.selected').forEach(img => {
            img.classList.remove('selected');
        });

        // Clear all team slots in all team sets
        document.querySelectorAll('.fixed-team-container').forEach(container => {
            container.querySelectorAll('.team-images').forEach(teamRow => {
                teamRow.querySelectorAll('.image-slot').forEach(slot => {
                    slot.innerHTML = '';
                    slot.classList.add('empty');
                });
            });
        });

        // Clear all toggle tabs
        document.querySelectorAll('.toggle-images').forEach(container => {
            container.innerHTML = '';
        });

        // Load toggle tabs data
        if (toggleTabs) {
            try {
                // Load Toggle Images
                const toggleImagesContainer = document.querySelector('#toggleImages');
                if (toggleImagesContainer) {
                    // Get images from either the new format or convert from old format
                    let toggleImagesData = [];

                    // Handle different formats
                    if (Array.isArray(toggleTabs['toggleImages'])) {
                        if (toggleTabs['toggleImages'].length > 0 && typeof toggleTabs['toggleImages'][0] === 'object') {
                            // New format with full data
                            toggleImagesData = toggleTabs['toggleImages'];
                        } else if (toggleTabs['toggleImages'].length > 0 && typeof toggleTabs['toggleImages'][0] === 'string') {
                            // Old format with just image sources
                            toggleImagesData = toggleTabs['toggleImages'].map(src => ({ src }));
                        }
                    } else if (Array.isArray(toggleTabs['toggleGallery'])) {
                        // Legacy format
                        toggleImagesData = toggleTabs['toggleGallery'].map(src => ({ src }));
                    }

                    // Collect all image sources in toggle images for hiding in gallery
                    const toggleImageSources = toggleImagesData.map(item => item.src);

                    // Hide gallery images that are in toggle images
                    document.querySelectorAll('.gallery .photo').forEach(photo => {
                        const photoImg = photo.querySelector('img');
                        if (photoImg && toggleImageSources.includes(photoImg.src)) {
                            photo.style.display = 'none';
                        }
                    });

                    // Add images to toggle images container
                    toggleImagesData.forEach(itemData => {
                        const imgSrc = itemData.src;
                        if (!imgSrc) return;

                        // Create toggle item
                        const toggleItem = document.createElement('div');
                        toggleItem.className = 'toggle-item';

                        // Set data attributes if available
                        if (itemData.number) toggleItem.setAttribute('data-number', itemData.number);
                        if (itemData.name) toggleItem.setAttribute('data-name', itemData.name);
                        if (itemData.type) toggleItem.setAttribute('data-type', itemData.type);
                        if (itemData.position) toggleItem.setAttribute('data-position', itemData.position);
                        if (itemData.faction) toggleItem.setAttribute('data-faction', itemData.faction);
                        if (itemData.rarity) toggleItem.setAttribute('data-rarity', itemData.rarity);
                        if (itemData.weapon) toggleItem.setAttribute('data-weapon', itemData.weapon);

                        // Create image
                        const toggleImg = document.createElement('img');
                        toggleImg.src = imgSrc;
                        toggleImg.dataset.original = imgSrc; // Store original image source

                        // Set selected state if available
                        if (itemData.selected) {
                            toggleImg.classList.add('selected');
                            toggleImg.style.border = '3px solid #00ff00';
                            toggleImg.style.outline = '1px solid #ffffff';
                            toggleImg.style.boxShadow = '0 0 8px #00ff00';
                            toggleImg.style.zIndex = '10';
                            toggleImg.style.position = 'relative';
                        }

                        // Add click handler for direct selection
                        toggleImg.addEventListener('click', function() {
                            toggleImageSelection(this);
                        });

                        // No individual remove button anymore

                        toggleItem.appendChild(toggleImg);
                        toggleImagesContainer.appendChild(toggleItem);
                    });
                }
            } catch (innerError) {
                console.error('Error processing toggle tabs:', innerError);
            }
        }

        // Load team data
        if (savedData.teamSets) {
            try {
                // Load team data for each team set
                savedData.teamSets.forEach((teamSet, teamSetIndex) => {
                    const teamSetContainer = document.querySelector(`#teamSet${teamSetIndex + 1}`);
                    if (!teamSetContainer) return;

                    // Load each team in the team set
                    teamSet.forEach((team, teamIndex) => {
                        const teamRow = teamSetContainer.querySelectorAll('.team-images')[teamIndex];
                        if (!teamRow) return;

                        // Load images for this team
                        if (team.images && team.images.length > 0) {
                            team.images.forEach(imgData => {
                                // Find an empty slot
                                const emptySlot = teamRow.querySelector('.image-slot.empty');
                                if (!emptySlot) return;

                                // Create and add the image
                                const img = document.createElement('img');
                                img.src = imgData.src;

                                // Add click handler for removal
                                img.onclick = () => {
                                    // Find the original image in the gallery
                                    const originalImg = document.querySelector(`.gallery .photo img[src="${imgData.src}"]`);
                                    if (originalImg) {
                                        toggleImageSelection(originalImg);
                                    } else {
                                        // If original not found, just remove this item
                                        img.parentElement.classList.add('empty');
                                        img.remove();
                                        saveSelectionToLocalStorage();
                                    }
                                };

                                emptySlot.appendChild(img);
                                emptySlot.classList.remove('empty');

                                // Mark the corresponding gallery image as selected
                                const galleryImg = document.querySelector(`.gallery .photo img[src="${imgData.src}"]`);
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
                    });
                });

                // Update team scores
                updateTeamScore();

                console.log('Team data loaded successfully');
            } catch (teamError) {
                console.error('Error loading team data:', teamError);
            }
        }

        console.log('All data loaded successfully');
    } catch (error) {
        console.error('Error loading selection from localStorage:', error);
    }
}

// UI Utilities

function updateTeamScore() {
    document.querySelectorAll('.team-row').forEach(teamRow => {
        const teamScoreElement = teamRow.querySelector('.team-score');
        const totalScore = Array.from(teamRow.querySelectorAll('img'))
            .reduce((total, img) =>
                total + parseInt(img.src.split('/').pop().split('_')[0], 10) / 10, 0);
        teamScoreElement.textContent = totalScore.toFixed(1);
    });
}



// Image Protection
function applyProtectionToGalleryAndSelected() {
    document.querySelectorAll('.gallery img, #selectedContainer img').forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    });
}

// Normalize filename (convert B1/B2/B3 to b1/b2/b3)
function normalizeFilename(filename) {
    return filename.replace(/B([1-3])/g, 'b$1');
}

// Check if an image exists
async function checkImageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error checking if image exists:', error);
        return false;
    }
}

// Ensure all selected images have green borders
function ensureGreenBorders() {
    document.querySelectorAll('.photo img.selected').forEach(img => {
        img.style.border = '3px solid #00ff00';
        img.style.outline = '1px solid #ffffff';
        img.style.boxShadow = '0 0 8px #00ff00';
        img.style.zIndex = '10';
        img.style.position = 'relative';
    });
}

// Toggle filter dropdown
function toggleFilter(button) {
    const filterContent = document.getElementById('filterContent');
    const isVisible = filterContent.style.display === 'block';

    if (!isVisible) {
        // Get button position
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

// Close filter dropdown when clicking outside
function closeFilterDropdown(event) {
    const filterContent = document.getElementById('filterContent');
    const filterBtn = document.querySelector('.filter-btn');

    // Check if the click is outside the filter content and button
    if (!filterContent.contains(event.target) && !filterBtn.contains(event.target)) {
        filterContent.style.display = 'none';
        filterBtn.classList.remove('active');
        document.removeEventListener('click', closeFilterDropdown);
    }
}

// Function to clean up character names
function cleanupCharacterName(name) {
    // Remove file extension if present
    name = name.replace(/\.webp$/, '');

    // Remove any leading/trailing spaces
    return name.trim();
}

// Function to load an image
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

// Function to prevent right-click on images
function preventRightClick() {
    // Prevent right-click on all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    });

    // Add event listener to the document to catch any new images added dynamically
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Prevent drag and drop of images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    });

    // Add event listener to the document to catch any new images added dynamically
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
}

// Initialize
window.onload = async () => {
    // Initialize current tab and team set
    currentContentTab = 'toggleImages';
    currentTeamSet = '1';

    // Prevent right-click on images
    preventRightClick();
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

            // Add click handler for image selection
            img.addEventListener('click', function() {
                toggleImageSelection(this);
            });

            // Create and add the "Add to Toggle" button
            const addToToggleBtn = document.createElement('div');
            addToToggleBtn.className = 'add-to-toggle';
            addToToggleBtn.innerHTML = '+';
            addToToggleBtn.title = 'Add to Toggle Images';

            // Add click handler for the button
            addToToggleBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering the photo click
                addSingleImageToToggle(img);
            });

            // Add the button to the photo
            photo.appendChild(addToToggleBtn);
        }
    });

    // Make sure all buttons have proper event handlers
    document.querySelectorAll('.burst-btn').forEach(btn => {
        // Remove existing event listeners to prevent duplicates
        const dataValue = btn.getAttribute('data-value');
        if (dataValue) {
            // This is a burst filter button
            btn.onclick = function() {
                toggleBurstFilter(this);
            };
        }
    });

    // We'll set up the filter button in the DOMContentLoaded event

// Global variable to track filter state
let filterVisible = false;

// Function to show filter content
function showFilterContent() {
    const filterContent = document.getElementById('filterContent');
    if (!filterContent) {
        console.error('Filter content not found');
        return;
    }

    // Show the filter content
    filterContent.style.display = 'block';

    // Force a reflow
    filterContent.offsetHeight;

    // Set opacity and visibility
    filterContent.style.opacity = '1';
    filterContent.style.visibility = 'visible';

    // Update state
    filterVisible = true;

    // Log position for debugging
    const rect = filterContent.getBoundingClientRect();
    console.log('Filter content shown at position:', {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height
    });
}

// Function to hide filter content
function hideFilterContent() {
    const filterContent = document.getElementById('filterContent');
    if (!filterContent) {
        console.error('Filter content not found');
        return;
    }

    // Hide with transition
    filterContent.style.opacity = '0';
    filterContent.style.visibility = 'hidden';

    // After transition, set display to none
    setTimeout(() => {
        filterContent.style.display = 'none';
    }, 300);

    // Update state
    filterVisible = false;

    console.log('Filter content hidden');
}

// Function to handle document clicks for closing the filter
function handleDocumentClick(event) {
    const filterContent = document.getElementById('filterContent');
    const filterBtn = document.getElementById('filterBtn');

    // If filter is not visible, do nothing
    if (!filterVisible) return;

    // If click is outside filter content and filter button, hide filter
    if (filterContent && filterBtn &&
        !filterContent.contains(event.target) &&
        !filterBtn.contains(event.target)) {

        hideFilterContent();
        console.log('Filter closed by clicking outside');
    }
}

    // Add event listener to search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            updateFilters();
        });
    }

    // Set up checkbox styling
    setupCheckboxStyling();

    // Load selection from localStorage (async function)
    await loadSelectionFromLocalStorage();

    updateTeamScore();
    applyProtectionToGalleryAndSelected();
    sortImages();

    // Apply green borders after a short delay to ensure DOM is fully loaded
    setTimeout(ensureGreenBorders, 500);

    // Set up tab system
    setupTabSystem();

    // Check if Toggle Images tab is empty and prompt for import if it is
    setTimeout(checkToggleImagesEmpty, 600);

    // Initialize filter functionality
    const filterContent = document.getElementById('filterContent');
    const filterBtn = document.getElementById('filterBtn');
    const closeFilterBtn = document.getElementById('closeFilterBtn');

    if (filterContent && filterBtn) {
        // Ensure filter content is hidden initially
        filterContent.style.display = 'none';
        filterContent.style.opacity = '0';
        filterContent.style.visibility = 'hidden';

        // Add click handler to filter content to stop propagation
        filterContent.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        // Add click handler to filter button
        filterBtn.addEventListener('click', function(event) {
            event.stopPropagation();

            if (filterVisible) {
                hideFilterContent();
            } else {
                showFilterContent();
            }
        });

        // Add click handler to close button
        if (closeFilterBtn) {
            closeFilterBtn.addEventListener('click', function(event) {
                event.stopPropagation();
                hideFilterContent();
            });
        }

        // Add document click handler to close filter when clicking outside
        document.addEventListener('click', handleDocumentClick);

        console.log('Filter functionality initialized');
    }

    // Set up Clear Selected Team button
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', function() {
            clearSelectedTeam();
        });
    }

    // Set up Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportTeams();
        });
    }

    // Set up Saved Sets button
    const savedSetsBtn = document.getElementById('savedSetsBtn');
    if (savedSetsBtn) {
        savedSetsBtn.addEventListener('click', function() {
            showSavedSetsPanel();
        });
    }
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
function checkboxChangeHandler(event) {
    // Stop event propagation to prevent closing the filter content
    event.stopPropagation();

    // Update styling
    if (this.checked) {
        this.parentElement.classList.add('active');
    } else {
        this.parentElement.classList.remove('active');
    }

    // Update filters
    updateFilters();

    // Log checkbox change
    console.log('Checkbox changed:', this.value, 'checked:', this.checked);
}

// Tab System Functions
function setupTabSystem() {
    // Content tab buttons (Nikkes, Toggle Images)
    document.querySelectorAll('.tab-button[data-tab]').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchContentTab(tabName);
        });
    });

    // Team set tab buttons (SET1, SET2, SET3)
    document.querySelectorAll('.tab-button[data-team-set]').forEach(button => {
        button.addEventListener('click', function() {
            const teamSet = this.getAttribute('data-team-set');
            switchTeamSet(teamSet);
        });
    });

    // Import Nikke button
    const importToggleBtn = document.getElementById('importToggleBtn');
    if (importToggleBtn) {
        importToggleBtn.addEventListener('click', function() {
            importToggleImages();
        });
    }

    // Remove Nikke button
    const clearToggleBtn = document.getElementById('clearToggleBtn');
    if (clearToggleBtn) {
        clearToggleBtn.addEventListener('click', function() {
            clearToggleImages();
        });
    }

    // Export Toggle Data button
    const exportToggleDataBtn = document.getElementById('exportToggleDataBtn');
    if (exportToggleDataBtn) {
        exportToggleDataBtn.addEventListener('click', function() {
            exportToggleData();
        });
    }
}

// Import Nikke function
function importToggleImages() {
    // Go directly to the manual selection interface
    showImageSelectionInterface();
}

// Function to import images to toggle gallery
function importImagesToToggleGallery(imagesToImport) {
    // Switch to Toggle Images tab first
    switchContentTab('toggleImages');

    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Add each image to the toggle images container
    let importCount = 0;
    imagesToImport.forEach(img => {
        // Get the original photo element to copy its data attributes
        const originalPhoto = img.closest('.photo');
        if (!originalPhoto) return;

        // Check if this image is already in the toggle images container
        const existingImage = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
            .find(toggleImg => toggleImg.dataset.original === img.src);

        if (existingImage) {
            // Skip this image as it's already in the toggle images
            return;
        }

        // Remove the image from the gallery
        originalPhoto.style.display = 'none';

        // Create a toggle item that mimics a photo element
        const toggleItem = document.createElement('div');
        toggleItem.className = 'toggle-item';

        // Copy data attributes from the original photo
        // Safely copy attributes with null checks
        const safeSetAttribute = (element, attr, value) => {
            if (value !== null && value !== undefined) {
                element.setAttribute(attr, value);
            }
        };

        safeSetAttribute(toggleItem, 'data-number', originalPhoto.getAttribute('data-number'));
        safeSetAttribute(toggleItem, 'data-name', originalPhoto.getAttribute('data-name'));
        safeSetAttribute(toggleItem, 'data-type', originalPhoto.getAttribute('data-type'));
        safeSetAttribute(toggleItem, 'data-position', originalPhoto.getAttribute('data-position'));
        safeSetAttribute(toggleItem, 'data-faction', originalPhoto.getAttribute('data-faction'));
        safeSetAttribute(toggleItem, 'data-rarity', originalPhoto.getAttribute('data-rarity'));
        safeSetAttribute(toggleItem, 'data-weapon', originalPhoto.getAttribute('data-weapon'));

        // Create the image element
        const toggleImg = document.createElement('img');
        toggleImg.src = img.src;
        toggleImg.dataset.original = img.src; // Store original image source

        // If the original image is selected, mark this one as selected too
        if (img.classList.contains('selected')) {
            toggleImg.classList.add('selected');
            toggleImg.style.border = '3px solid #00ff00';
            toggleImg.style.outline = '1px solid #ffffff';
            toggleImg.style.boxShadow = '0 0 8px #00ff00';
            toggleImg.style.zIndex = '10';
            toggleImg.style.position = 'relative';
        }

        // Add click handler for direct selection
        toggleImg.addEventListener('click', function() {
            toggleImageSelection(this);
        });

        // No individual remove button anymore

        toggleItem.appendChild(toggleImg);
        toggleImagesContainer.appendChild(toggleItem);
        importCount++;
    });

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Show success message
    if (importCount > 0) {
        alert(`${importCount} image${importCount !== 1 ? 's' : ''} have been imported to Toggle Images!`);
    } else {
        alert('No new images were imported to Toggle Images.');
    }
}

// Function to add a single image to the Toggle Images tab and remove it from gallery
function addSingleImageToToggle(img) {
    // Get the toggle images container without switching tabs
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Get the original photo element to copy its data attributes
    const originalPhoto = img.closest('.photo');
    if (!originalPhoto) {
        console.error('Original photo element not found');
        return;
    }

    // Check if this image is already in the toggle images container
    const existingImage = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
        .find(toggleImg => toggleImg.dataset.original === img.src);

    if (existingImage) {
        // Image already exists in toggle images, show a message
        alert('This image is already in the Toggle Images tab.');
        return;
    }

    // Remove the image from the gallery
    originalPhoto.style.display = 'none';

    // Create a toggle item that mimics a photo element
    const toggleItem = document.createElement('div');
    toggleItem.className = 'toggle-item';

    // Copy data attributes from the original photo
    toggleItem.setAttribute('data-number', originalPhoto.getAttribute('data-number'));
    toggleItem.setAttribute('data-name', originalPhoto.getAttribute('data-name'));
    toggleItem.setAttribute('data-type', originalPhoto.getAttribute('data-type'));
    toggleItem.setAttribute('data-position', originalPhoto.getAttribute('data-position'));
    toggleItem.setAttribute('data-faction', originalPhoto.getAttribute('data-faction'));
    toggleItem.setAttribute('data-rarity', originalPhoto.getAttribute('data-rarity'));
    toggleItem.setAttribute('data-weapon', originalPhoto.getAttribute('data-weapon'));

    // Create the image element
    const toggleImg = document.createElement('img');
    toggleImg.src = img.src;
    toggleImg.dataset.original = img.src; // Store original image source

    // If the original image is selected, mark this one as selected too
    if (img.classList.contains('selected')) {
        toggleImg.classList.add('selected');
        toggleImg.style.border = '3px solid #00ff00';
        toggleImg.style.outline = '1px solid #ffffff';
        toggleImg.style.boxShadow = '0 0 8px #00ff00';
        toggleImg.style.zIndex = '10';
        toggleImg.style.position = 'relative';
    }

    // Add click handler for direct selection
    toggleImg.addEventListener('click', function() {
        toggleImageSelection(this);
    });

    // No individual remove button anymore

    toggleItem.appendChild(toggleImg);
    toggleImagesContainer.appendChild(toggleItem);

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();
}

// Function to clear the selected team
function clearSelectedTeam() {
    // Ask for confirmation
    if (!confirm('Are you sure you want to clear all images from the current team?')) {
        return;
    }

    // Get the current team container
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    if (!currentTeamContainer) {
        console.error('Current team container not found');
        return;
    }

    // Get all images in the current team
    const teamImages = Array.from(currentTeamContainer.querySelectorAll('.image-slot img'));

    // Remove all images from the team slots
    teamImages.forEach(img => {
        const slot = img.parentElement;
        slot.innerHTML = '';
        slot.classList.add('empty');
    });

    // Refresh the selected state of images
    refreshSelectedImages();

    // Update team score
    updateTeamScore();

    // Save the selection to localStorage
    saveSelectionToLocalStorage();

    // Success message removed
}

// Function to remove Nikke from toggle images
function clearToggleImages() {
    // Show the Nikke removal interface
    showImageRemovalInterface();
}

// Function to export toggle data to a JSON file
function exportToggleData() {
    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Get all toggle items
    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

    // Create data object
    const toggleData = {
        toggleImages: toggleItems.map(item => {
            const img = item.querySelector('img');
            return {
                src: img.src,
                number: item.getAttribute('data-number'),
                name: item.getAttribute('data-name'),
                type: item.getAttribute('data-type'),
                position: item.getAttribute('data-position'),
                faction: item.getAttribute('data-faction'),
                rarity: item.getAttribute('data-rarity'),
                weapon: item.getAttribute('data-weapon'),
                selected: img.classList.contains('selected')
            };
        }),
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(toggleData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `nikke-toggle-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

// Function to import toggle data from a JSON file
function importToggleData() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Add event listener for file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                loadToggleDataFromJson(data);
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                alert('Error parsing JSON file. Please make sure it\'s a valid toggle data file.');
            }
        };
        reader.readAsText(file);
    });

    // Trigger file selection dialog
    fileInput.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 1000);
}

// Function to load toggle data from JSON
function loadToggleDataFromJson(data) {
    // Validate data format
    if (!data.toggleImages || !Array.isArray(data.toggleImages)) {
        alert('Invalid toggle data format. Missing toggleImages array.');
        return;
    }

    // Ask for confirmation
    const confirmImport = confirm(`This will import ${data.toggleImages.length} images into your Toggle Images. Continue?`);
    if (!confirmImport) return;

    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Clear existing toggle images if requested
    const clearExisting = confirm('Do you want to clear existing toggle images before importing?');
    if (clearExisting) {
        toggleImagesContainer.innerHTML = '';

        // Show gallery images that were previously hidden
        document.querySelectorAll('.gallery .photo').forEach(photo => {
            photo.style.display = '';
        });
    }

    // Import the toggle images
    let importCount = 0;
    data.toggleImages.forEach(itemData => {
        // Skip if no source
        if (!itemData.src) return;

        // Check if this image is already in the toggle images container
        const existingImage = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
            .find(toggleImg => toggleImg.dataset.original === itemData.src || toggleImg.src === itemData.src);

        if (existingImage) {
            // Skip this image as it's already in the toggle images
            return;
        }

        // Hide the corresponding gallery image if it exists
        document.querySelectorAll('.gallery .photo img').forEach(img => {
            if (img.src === itemData.src) {
                img.closest('.photo').style.display = 'none';
            }
        });

        // Create a toggle item
        const toggleItem = document.createElement('div');
        toggleItem.className = 'toggle-item';

        // Set data attributes if available
        if (itemData.number) toggleItem.setAttribute('data-number', itemData.number);
        if (itemData.name) toggleItem.setAttribute('data-name', itemData.name);
        if (itemData.type) toggleItem.setAttribute('data-type', itemData.type);
        if (itemData.position) toggleItem.setAttribute('data-position', itemData.position);
        if (itemData.faction) toggleItem.setAttribute('data-faction', itemData.faction);
        if (itemData.rarity) toggleItem.setAttribute('data-rarity', itemData.rarity);
        if (itemData.weapon) toggleItem.setAttribute('data-weapon', itemData.weapon);

        // Create image
        const toggleImg = document.createElement('img');
        toggleImg.src = itemData.src;
        toggleImg.dataset.original = itemData.src; // Store original image source

        // Set selected state if available
        if (itemData.selected) {
            toggleImg.classList.add('selected');
            toggleImg.style.border = '3px solid #00ff00';
            toggleImg.style.outline = '1px solid #ffffff';
            toggleImg.style.boxShadow = '0 0 8px #00ff00';
            toggleImg.style.zIndex = '10';
            toggleImg.style.position = 'relative';
        }

        // Add click handler for direct selection
        toggleImg.addEventListener('click', function() {
            toggleImageSelection(this);
        });

        toggleItem.appendChild(toggleImg);
        toggleImagesContainer.appendChild(toggleItem);
        importCount++;
    });

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Show success message
    alert(`Successfully imported ${importCount} images to Toggle Images!`);

    // Switch to Toggle Images tab
    switchContentTab('toggleImages');
}

// Function to show Nikke removal interface
function showImageRemovalInterface() {
    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Get all toggle images
    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
    if (toggleItems.length === 0) {
        alert('There are no images in the Toggle Images tab to remove.');
        return;
    }

    // Create a modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'selection-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';

    // Create a header with instructions
    const header = document.createElement('div');
    header.style.color = 'white';
    header.style.marginBottom = '20px';
    header.style.fontSize = '18px';
    header.style.textAlign = 'center';
    header.innerHTML = '<h2>Select Images to Remove</h2><p>Click on images to select/deselect them, then click Remove Selected.</p>';
    overlay.appendChild(header);

    // Create a container for the images
    const imageContainer = document.createElement('div');
    imageContainer.style.display = 'flex';
    imageContainer.style.flexWrap = 'wrap';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.gap = '10px';
    imageContainer.style.maxWidth = '90%';
    imageContainer.style.maxHeight = '70vh';
    imageContainer.style.overflowY = 'auto';
    imageContainer.style.padding = '10px';
    imageContainer.style.backgroundColor = '#222';
    imageContainer.style.borderRadius = '8px';
    overlay.appendChild(imageContainer);

    // Add all toggle images to the selection interface
    const selectedForRemoval = new Set();

    toggleItems.forEach(item => {
        const img = item.querySelector('img');
        if (!img) return;

        // Create a container for each image
        const imageItem = document.createElement('div');
        imageItem.style.position = 'relative';
        imageItem.style.width = '80px';
        imageItem.style.height = '80px';
        imageItem.style.borderRadius = '6px';
        imageItem.style.overflow = 'hidden';
        imageItem.style.backgroundColor = '#333';
        imageItem.style.cursor = 'pointer';
        imageItem.style.border = '2px solid transparent';
        imageItem.style.transition = 'all 0.2s';

        // Create the image
        const selectionImg = document.createElement('img');
        selectionImg.src = img.src;
        selectionImg.style.width = '100%';
        selectionImg.style.height = '100%';
        selectionImg.style.objectFit = 'cover';
        selectionImg.dataset.original = img.dataset.original;
        imageItem.appendChild(selectionImg);

        // Add click handler for selection
        imageItem.addEventListener('click', function() {
            if (selectedForRemoval.has(img.dataset.original)) {
                selectedForRemoval.delete(img.dataset.original);
                imageItem.style.border = '2px solid transparent';
                imageItem.style.boxShadow = 'none';
            } else {
                selectedForRemoval.add(img.dataset.original);
                imageItem.style.border = '2px solid #ff3333';
                imageItem.style.boxShadow = '0 0 8px #ff3333';
            }
        });

        imageContainer.appendChild(imageItem);
    });

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginTop = '20px';
    overlay.appendChild(buttonsContainer);

    // Create remove selected button
    const removeSelectedButton = document.createElement('button');
    removeSelectedButton.textContent = 'Remove Selected';
    removeSelectedButton.style.padding = '10px 20px';
    removeSelectedButton.style.backgroundColor = '#ff3333';
    removeSelectedButton.style.color = 'white';
    removeSelectedButton.style.border = 'none';
    removeSelectedButton.style.borderRadius = '5px';
    removeSelectedButton.style.cursor = 'pointer';
    removeSelectedButton.addEventListener('click', function() {
        if (selectedForRemoval.size === 0) {
            alert('Please select at least one image to remove.');
            return;
        }

        // Remove selected images
        removeSelectedToggleImages(selectedForRemoval);

        // Close the overlay
        document.body.removeChild(overlay);
    });
    buttonsContainer.appendChild(removeSelectedButton);

    // Create remove all button
    const removeAllButton = document.createElement('button');
    removeAllButton.textContent = 'Remove All';
    removeAllButton.style.padding = '10px 20px';
    removeAllButton.style.backgroundColor = '#990000';
    removeAllButton.style.color = 'white';
    removeAllButton.style.border = 'none';
    removeAllButton.style.borderRadius = '5px';
    removeAllButton.style.cursor = 'pointer';
    removeAllButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to remove ALL images from the Toggle Images tab?')) {
            // Remove all toggle images
            removeAllToggleImages();

            // Close the overlay
            document.body.removeChild(overlay);
        }
    });
    buttonsContainer.appendChild(removeAllButton);

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#555';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    buttonsContainer.appendChild(cancelButton);

    // Add the overlay to the body
    document.body.appendChild(overlay);
}

// Function to remove selected toggle images
function removeSelectedToggleImages(selectedSources) {
    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Get all toggle items
    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

    // Track how many images were removed
    let removedCount = 0;

    // Remove selected toggle items and restore gallery images
    toggleItems.forEach(item => {
        const img = item.querySelector('img');
        if (!img || !img.dataset.original) return;

        if (selectedSources.has(img.dataset.original)) {
            // Find the original photo in the gallery and restore it
            const originalImgSrc = img.dataset.original;
            const galleryPhotos = document.querySelectorAll('.gallery .photo');
            galleryPhotos.forEach(photo => {
                const photoImg = photo.querySelector('img');
                if (photoImg && photoImg.src === originalImgSrc) {
                    // Restore the photo to the gallery
                    photo.style.display = '';
                }
            });

            // Remove the toggle item
            item.remove();
            removedCount++;
        }
    });

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Show success message
    if (removedCount > 0) {
        alert(`${removedCount} image${removedCount !== 1 ? 's' : ''} removed from Toggle Images.`);
    } else {
        alert('No images were removed.');
    }
}

// Function to remove all toggle images
function removeAllToggleImages() {
    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Get all toggle images before clearing
    const toggleImages = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'));
    const toggleImageSources = toggleImages.map(img => img.dataset.original);

    // Restore all gallery images that were in the toggle images
    document.querySelectorAll('.gallery .photo').forEach(photo => {
        const photoImg = photo.querySelector('img');
        if (photoImg && toggleImageSources.includes(photoImg.src)) {
            photo.style.display = '';
        }
    });

    // Clear the toggle images container
    toggleImagesContainer.innerHTML = '';

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Show success message
    alert('All images have been removed from the Toggle Images tab.');
}

// Function to show image selection interface
function showImageSelectionInterface() {
    // Create a modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'selection-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';

    // Create a header with instructions
    const header = document.createElement('div');
    header.style.color = 'white';
    header.style.marginBottom = '20px';
    header.style.fontSize = '18px';
    header.style.textAlign = 'center';
    header.innerHTML = '<h2>Select Images to Import</h2><p>Click on images to select/deselect them, then click Import Selected.</p>';
    overlay.appendChild(header);

    // Create a container for the images
    const imageContainer = document.createElement('div');
    imageContainer.style.display = 'flex';
    imageContainer.style.flexWrap = 'wrap';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.gap = '10px';
    imageContainer.style.maxWidth = '90%';
    imageContainer.style.maxHeight = '70vh';
    imageContainer.style.overflowY = 'auto';
    imageContainer.style.padding = '10px';
    imageContainer.style.backgroundColor = '#222';
    imageContainer.style.borderRadius = '8px';
    overlay.appendChild(imageContainer);

    // Get all gallery images and filter out those that are already in the toggle images tab
    const allImages = Array.from(document.querySelectorAll('.gallery .photo img'));
    const toggleImages = Array.from(document.querySelectorAll('.toggle-item img'));
    const toggleImageSources = toggleImages.map(img => img.dataset.original);

    // Filter out images that are already in the toggle images tab
    const availableImages = allImages.filter(img => {
        // Only include images that are not already in the toggle images tab
        return !toggleImageSources.includes(img.src);
    });

    const selectedForImport = new Set();

    // Check if there are any images available to import
    if (availableImages.length === 0) {
        const noImagesMessage = document.createElement('div');
        noImagesMessage.style.color = 'white';
        noImagesMessage.style.padding = '20px';
        noImagesMessage.style.textAlign = 'center';
        noImagesMessage.innerHTML = '<h3>No Images Available</h3><p>All gallery images have already been imported to Toggle Images.</p>';
        imageContainer.appendChild(noImagesMessage);
    } else {
        // Add available images to the selection interface
        availableImages.forEach(img => {
            const originalPhoto = img.closest('.photo');
            if (!originalPhoto) return;

            // Skip images that are hidden (already imported)
            if (originalPhoto.style.display === 'none') return;

            // Create a container for each image
            const imageItem = document.createElement('div');
            imageItem.style.position = 'relative';
            imageItem.style.width = '80px';
            imageItem.style.height = '80px';
            imageItem.style.borderRadius = '6px';
            imageItem.style.overflow = 'hidden';
            imageItem.style.backgroundColor = '#333';
            imageItem.style.cursor = 'pointer';

            // Create the image element
            const selectionImg = document.createElement('img');
            selectionImg.src = img.src;
            selectionImg.style.width = '100%';
            selectionImg.style.height = '100%';
            selectionImg.style.objectFit = 'cover';

            // Add click handler to toggle selection
            imageItem.addEventListener('click', function() {
                if (selectedForImport.has(img.src)) {
                    selectedForImport.delete(img.src);
                    imageItem.style.border = '';
                    imageItem.style.boxShadow = '';
                } else {
                    selectedForImport.add(img.src);
                    imageItem.style.border = '3px solid #00ff00';
                    imageItem.style.boxShadow = '0 0 8px #00ff00';
                }

                // Update the import button text
                importButton.textContent = `Import Selected (${selectedForImport.size})`;
            });

            imageItem.appendChild(selectionImg);
            imageContainer.appendChild(imageItem);
        });
    }

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginTop = '20px';
    overlay.appendChild(buttonsContainer);

    // Create import selected button
    const importButton = document.createElement('button');
    importButton.textContent = 'Import Selected (0)';
    importButton.style.padding = '10px 20px';
    importButton.style.backgroundColor = '#2a6e9c';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '5px';
    importButton.style.cursor = 'pointer';
    importButton.style.fontWeight = 'bold';

    // Disable the button if there are no available images
    if (availableImages.length === 0) {
        importButton.disabled = true;
        importButton.style.backgroundColor = '#555';
        importButton.style.cursor = 'not-allowed';
    }

    importButton.addEventListener('click', function() {
        if (selectedForImport.size === 0) {
            alert('Please select at least one image to import.');
            return;
        }

        // Get the selected images
        const imagesToImport = [];
        availableImages.forEach(img => {
            if (selectedForImport.has(img.src)) {
                imagesToImport.push(img);
            }
        });

        // Remove the overlay
        document.body.removeChild(overlay);

        // Import the selected images
        importImagesToToggleGallery(imagesToImport);
    });
    buttonsContainer.appendChild(importButton);

    // Create import all button
    const importAllButton = document.createElement('button');
    importAllButton.textContent = `Import All (${availableImages.length})`;
    importAllButton.style.padding = '10px 20px';
    importAllButton.style.backgroundColor = '#2a8e9c';
    importAllButton.style.color = 'white';
    importAllButton.style.border = 'none';
    importAllButton.style.borderRadius = '5px';
    importAllButton.style.cursor = 'pointer';
    importAllButton.style.fontWeight = 'bold';

    // Disable the button if there are no available images
    if (availableImages.length === 0) {
        importAllButton.disabled = true;
        importAllButton.style.backgroundColor = '#555';
        importAllButton.style.cursor = 'not-allowed';
    }

    importAllButton.addEventListener('click', function() {
        // Remove the overlay
        document.body.removeChild(overlay);

        // Import all available images
        importImagesToToggleGallery(availableImages);
    });
    buttonsContainer.appendChild(importAllButton);

    // Create load toggle data button
    const loadToggleDataButton = document.createElement('button');
    loadToggleDataButton.textContent = 'Load Toggle Data';
    loadToggleDataButton.style.padding = '10px 20px';
    loadToggleDataButton.style.backgroundColor = '#9c6e2a';
    loadToggleDataButton.style.color = 'white';
    loadToggleDataButton.style.border = 'none';
    loadToggleDataButton.style.borderRadius = '5px';
    loadToggleDataButton.style.cursor = 'pointer';
    loadToggleDataButton.style.fontWeight = 'bold';
    loadToggleDataButton.addEventListener('click', function() {
        // Remove the overlay
        document.body.removeChild(overlay);

        // Call the import toggle data function
        importToggleData();
    });
    buttonsContainer.appendChild(loadToggleDataButton);

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#555';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
    buttonsContainer.appendChild(cancelButton);

    // Add the overlay to the body
    document.body.appendChild(overlay);
}

// Switch between content tabs (Nikkes, Toggle Images)
function switchContentTab(tabName) {
    // Update active button
    document.querySelectorAll('.tab-button[data-tab]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');

    // Hide all content containers
    document.querySelector('.gallery-container').classList.add('hidden');
    document.querySelectorAll('.toggle-container').forEach(container => {
        container.classList.add('hidden');
    });

    // Show the selected content
    if (tabName === 'gallery') {
        document.querySelector('.gallery-container').classList.remove('hidden');
    } else {
        document.querySelector(`#${tabName}Container`).classList.remove('hidden');
    }

    // Update current tab
    currentContentTab = tabName;

    // Refresh selected images to ensure toggle gallery is properly updated
    refreshSelectedImages();

    // Make sure the filter button is visible for both Nikkes and Toggle Images tabs
    const searchFilterContainer = document.querySelector('.search-filter-container');
    if (searchFilterContainer) {
        if (tabName === 'gallery' || tabName === 'toggleImages') {
            searchFilterContainer.style.display = 'flex';
        } else {
            searchFilterContainer.style.display = 'none';
        }
    }
}

// Switch between team sets (SET1, SET2)
function switchTeamSet(teamSet) {
    // Validate team set (only 1 or 2 allowed)
    if (teamSet !== '1' && teamSet !== '2') {
        console.warn(`Invalid team set: ${teamSet}. Defaulting to SET1.`);
        teamSet = '1';
    }

    // Update active button
    document.querySelectorAll('.tab-button[data-team-set]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-button[data-team-set="${teamSet}"]`).classList.add('active');

    // Hide all team containers
    document.querySelectorAll('.fixed-team-container').forEach(container => {
        container.classList.add('hidden');
    });

    // Show the selected team set
    document.querySelector(`#teamSet${teamSet}`).classList.remove('hidden');

    // Update the current team set for toggle image functionality
    currentTeamSet = teamSet;

    // Refresh the selected state of images based on the current team set
    refreshSelectedImages();
}

// Function to check if Toggle Images tab is empty and prompt for import
function checkToggleImagesEmpty() {
    // Get the toggle images container
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle Images container not found');
        return;
    }

    // Check if there are any images in the container
    const toggleImages = toggleImagesContainer.querySelectorAll('.toggle-item');
    if (toggleImages.length === 0) {
        // No images found, show a message and prompt for import
        const importConfirm = confirm('Welcome! Your Toggle Images tab is empty. Would you like to import some images now?');
        if (importConfirm) {
            // User confirmed, call the import function
            importToggleImages();
        }
    }
}

// Function to export teams as an image
function exportTeams() {
    // Create a container for all team sets
    const exportContainer = document.createElement('div');
    exportContainer.className = 'export-container';
    exportContainer.style.position = 'fixed';
    exportContainer.style.top = '0';
    exportContainer.style.left = '0';
    exportContainer.style.width = '100%';
    exportContainer.style.height = '100%';
    exportContainer.style.backgroundColor = '#111';
    exportContainer.style.zIndex = '9999';
    exportContainer.style.padding = '20px';
    exportContainer.style.boxSizing = 'border-box';
    exportContainer.style.display = 'flex';
    exportContainer.style.flexDirection = 'column';
    exportContainer.style.alignItems = 'center';
    exportContainer.style.justifyContent = 'center';
    exportContainer.style.overflow = 'auto';

    // Create a header
    const header = document.createElement('div');
    header.innerHTML = '<h2>Team Export</h2><p>Screenshot this page to save your teams</p>';
    header.style.color = 'white';
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    exportContainer.appendChild(header);

    // Create a content container for the teams
    const contentContainer = document.createElement('div');
    contentContainer.style.backgroundColor = '#222';
    contentContainer.style.borderRadius = '10px';
    contentContainer.style.padding = '20px';
    contentContainer.style.width = 'fit-content';
    contentContainer.style.maxWidth = '100%';
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'row'; // Changed to row for side-by-side layout
    contentContainer.style.flexWrap = 'wrap'; // Allow wrapping on smaller screens
    contentContainer.style.gap = '20px';
    contentContainer.style.justifyContent = 'center'; // Center the sets
    exportContainer.appendChild(contentContainer);

    // Only clone SET1 and SET2
    const teamSet1 = document.querySelector('#teamSet1');
    const teamSet2 = document.querySelector('#teamSet2');

    if (teamSet1) {
        const clone1 = teamSet1.cloneNode(true);
        clone1.style.position = 'relative';
        clone1.style.left = 'auto';
        clone1.style.top = 'auto';
        clone1.style.right = 'auto';
        clone1.style.bottom = 'auto';
        clone1.style.width = '48%'; // Slightly less than 50% to account for gap
        clone1.style.minWidth = '400px'; // Minimum width to ensure readability
        clone1.style.height = 'auto';
        clone1.style.display = 'block';
        clone1.style.flex = '1'; // Allow flex growing
        clone1.classList.remove('hidden');
        contentContainer.appendChild(clone1);
    }

    if (teamSet2) {
        const clone2 = teamSet2.cloneNode(true);
        clone2.style.position = 'relative';
        clone2.style.left = 'auto';
        clone2.style.top = 'auto';
        clone2.style.right = 'auto';
        clone2.style.bottom = 'auto';
        clone2.style.width = '48%'; // Slightly less than 50% to account for gap
        clone2.style.minWidth = '400px'; // Minimum width to ensure readability
        clone2.style.height = 'auto';
        clone2.style.display = 'block';
        clone2.style.flex = '1'; // Allow flex growing
        clone2.classList.remove('hidden');
        contentContainer.appendChild(clone2);
    }

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexWrap = 'wrap';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.gap = '10px';
    buttonsContainer.style.marginTop = '20px';
    exportContainer.appendChild(buttonsContainer);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#2a6e9c';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(exportContainer);
    });
    buttonsContainer.appendChild(closeButton);

    // Save button removed as requested

    // Create saved sets button
    const savedSetsButton = document.createElement('button');
    savedSetsButton.textContent = 'Saved Sets';
    savedSetsButton.style.padding = '10px 20px';
    savedSetsButton.style.backgroundColor = '#9c6e2a';
    savedSetsButton.style.color = 'white';
    savedSetsButton.style.border = 'none';
    savedSetsButton.style.borderRadius = '5px';
    savedSetsButton.style.cursor = 'pointer';
    savedSetsButton.style.fontWeight = 'bold';
    savedSetsButton.addEventListener('click', function() {
        showSavedSetsPanel();
    });
    buttonsContainer.appendChild(savedSetsButton);

    // Add the container to the body
    document.body.appendChild(exportContainer);
}

// Refresh selected images based on current team set
function refreshSelectedImages() {
    // Clear all selected states first
    document.querySelectorAll('.gallery img, .toggle-item img').forEach(img => {
        img.classList.remove('selected');
        img.style.border = '';
        img.style.outline = '';
        img.style.boxShadow = '';
        img.style.zIndex = '';
        img.style.position = '';
    });

    // Get all images in the current team set
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    const teamImages = Array.from(currentTeamContainer.querySelectorAll('.image-slot img'));

    // Mark corresponding gallery images as selected
    teamImages.forEach(teamImg => {
        // Update gallery images
        const galleryImg = document.querySelector(`.photo img[src="${teamImg.src}"]`);
        if (galleryImg) {
            galleryImg.classList.add('selected');
            galleryImg.style.border = '3px solid #00ff00';
            galleryImg.style.outline = '1px solid #ffffff';
            galleryImg.style.boxShadow = '0 0 8px #00ff00';
            galleryImg.style.zIndex = '10';
            galleryImg.style.position = 'relative';
        }

        // Update toggle gallery images
        const toggleGalleryImgs = document.querySelectorAll(`.toggle-item img[data-original="${teamImg.src}"]`);
        toggleGalleryImgs.forEach(toggleImg => {
            toggleImg.classList.add('selected');
        });
    });
}
