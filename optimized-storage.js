// Optimized storage functions for nikkeportrait

// Use storage keys from storage.js
// STORAGE_KEY and TOGGLE_TABS_KEY are already defined in storage.js

// Cache for localStorage data to avoid repeated parsing
// Note: cachedStorageData is already declared in storage.js
// let cachedStorageData = null;
// Note: isSavingData is already declared in storage.js
// let isSavingData = false;

// Debounce function to prevent excessive save operations
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Get data from localStorage with caching
function getStorageData() {
    // Return cached data if available
    if (cachedStorageData !== null) {
        return cachedStorageData;
    }

    try {
        const dataString = localStorage.getItem(STORAGE_KEY);
        if (!dataString) return null;

        // Parse and cache the data
        cachedStorageData = JSON.parse(dataString);
        return cachedStorageData;
    } catch (error) {
        console.error('Error getting data from localStorage:', error);
        return null;
    }
}

// Save data to localStorage with cache update
function saveStorageData(data) {
    // Prevent saving if already in progress
    if (isSavingData) return false;

    isSavingData = true;
    try {
        // Update the cache
        cachedStorageData = data;

        // Save to localStorage
        const jsonString = JSON.stringify(data);
        localStorage.setItem(STORAGE_KEY, jsonString);

        console.log('Successfully saved data to localStorage, size:', jsonString.length, 'bytes');
        return true;
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
        return false;
    } finally {
        isSavingData = false;
    }
}

// Clear the storage data cache
function clearStorageCache() {
    cachedStorageData = null;
}

// Optimized saveSelectionToLocalStorage function
function saveSelectionToLocalStorage() {
    // Use the debounced save function to prevent excessive saves
    debouncedSaveSelectionToLocalStorage();
}

// The actual save function that will be debounced
const debouncedSaveSelectionToLocalStorage = debounce(() => {
    console.log('Executing debounced save...');

    // Avoid infinite recursion
    if (window.isSavingSelection) {
        console.log('Already saving selection, skipping to avoid recursion');
        return;
    }

    window.isSavingSelection = true;

    try {
        // Get team data from the DOM
        let teamSets = [];

        // Check if we have team data in the DOM
        let hasTeamDataInDOM = false;

        // Process each team set
        for (let setIndex = 1; setIndex <= 2; setIndex++) {
            const teamSet = [];
            const teamSetContainer = document.querySelector(`#teamSet${setIndex}`);

            if (teamSetContainer) {
                const teamRows = teamSetContainer.querySelectorAll('.team-row');
                teamRows.forEach(row => {
                    const teamNumber = row.getAttribute('data-team');
                    const teamImages = [];

                    row.querySelectorAll('.image-slot img').forEach((img, slotIndex) => {
                        // Store enhanced image data including styles and data attributes
                        teamImages.push({
                            src: img.src,
                            slotIndex: slotIndex,
                            // Save styles that affect appearance
                            styles: {
                                border: img.style.border || '',
                                outline: img.style.outline || '',
                                boxShadow: img.style.boxShadow || '',
                                filter: img.style.filter || '',
                                transform: img.style.transform || '',
                                opacity: img.style.opacity || '',
                                zIndex: img.style.zIndex || ''
                            },
                            // Save data attributes
                            data: {
                                number: img.dataset.number || '',
                                name: img.dataset.name || '',
                                type: img.dataset.type || '',
                                position: img.dataset.position || '',
                                faction: img.dataset.faction || '',
                                rarity: img.dataset.rarity || '',
                                weapon: img.dataset.weapon || '',
                                element: img.dataset.element || ''
                            },
                            // Save class information
                            classes: Array.from(img.classList)
                        });
                        hasTeamDataInDOM = true; // We found at least one image in a team
                    });

                    teamSet.push({
                        team: teamNumber,
                        images: teamImages
                    });
                });
            }

            teamSets.push(teamSet);
        }

        // If no team data in DOM, check localStorage
        if (!hasTeamDataInDOM) {
            console.log('No team data found in DOM, checking localStorage');
            const existingData = getStorageData();
            if (existingData && existingData.teamSets && Array.isArray(existingData.teamSets)) {
                // Check if there's actual data in the team sets
                let hasTeamData = false;
                existingData.teamSets.forEach(teamSet => {
                    teamSet.forEach(team => {
                        if (team.images && team.images.length > 0) {
                            hasTeamData = true;
                        }
                    });
                });

                if (hasTeamData) {
                    console.log('Using team data from localStorage');
                    teamSets = existingData.teamSets;
                }
            }
        }

        const selectedGalleryImages = Array.from(document.querySelectorAll('.photo img.selected'))
            .map(img => img.src);

        // Get toggle images data from the DOM
        let toggleImagesData = [];

        // Save the current toggle images to the teamSetToggleImages object
        if (typeof saveCurrentToggleImages === 'function') {
            saveCurrentToggleImages();
        }

        // Always get toggle images from the DOM to ensure we have the latest data
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (toggleImagesContainer) {
            const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
            console.log(`Found ${toggleItems.length} toggle items to include in main save from DOM`);

            // If we have toggle items in the DOM, use those
            if (toggleItems.length > 0) {
                toggleImagesData = toggleItems.map(item => {
                    const img = item.querySelector('img');
                    if (!img) {
                        console.warn('Toggle item has no image element:', item);
                        return null;
                    }

                    return {
                        src: img.src,
                        number: item.getAttribute('data-number'),
                        name: item.getAttribute('data-name'),
                        type: item.getAttribute('data-type'),
                        position: item.getAttribute('data-position'),
                        faction: item.getAttribute('data-faction'),
                        rarity: item.getAttribute('data-rarity'),
                        weapon: item.getAttribute('data-weapon'),
                        element: item.getAttribute('data-element'),
                        selected: img.classList.contains('selected'),
                        // Save styles that affect appearance
                        styles: {
                            border: img.style.border || '',
                            outline: img.style.outline || '',
                            boxShadow: img.style.boxShadow || '',
                            filter: img.style.filter || '',
                            transform: img.style.transform || '',
                            opacity: img.style.opacity || '',
                            zIndex: img.style.zIndex || '',
                            position: img.style.position || ''
                        },
                        // Save additional data attributes
                        data: {
                            originalPosition: item.getAttribute('data-original-position') || '',
                            order: item.getAttribute('data-order') || '',
                            galleryPhotoId: item.getAttribute('data-gallery-photo-id') || ''
                        },
                        // Save class information
                        classes: Array.from(img.classList)
                    };
                }).filter(item => item !== null); // Filter out any null items
            } else {
                // If no toggle items in DOM, check if we have them in localStorage
                const existingData = getStorageData();
                if (existingData) {
                    if (existingData.toggleImages && Array.isArray(existingData.toggleImages)) {
                        console.log(`Found ${existingData.toggleImages.length} toggle images in localStorage, using those`);
                        toggleImagesData = existingData.toggleImages;
                    } else if (existingData.toggleTabs && existingData.toggleTabs.toggleImages &&
                              Array.isArray(existingData.toggleTabs.toggleImages)) {
                        console.log(`Found ${existingData.toggleTabs.toggleImages.length} toggle images in toggleTabs, using those`);
                        toggleImagesData = existingData.toggleTabs.toggleImages;
                    }
                }
            }
        }

        // If we still don't have any toggle images but we have team set toggle images, use those
        if (toggleImagesData.length === 0 && window.teamSetToggleImages) {
            // Combine all team set toggle images into one array
            const allTeamSetImages = [];
            for (const setId in window.teamSetToggleImages) {
                if (window.teamSetToggleImages[setId] && Array.isArray(window.teamSetToggleImages[setId])) {
                    allTeamSetImages.push(...window.teamSetToggleImages[setId]);
                }
            }

            // Remove duplicates by src
            const uniqueImages = [];
            const seenSrcs = new Set();
            allTeamSetImages.forEach(img => {
                if (img && img.src && !seenSrcs.has(img.src)) {
                    seenSrcs.add(img.src);
                    uniqueImages.push(img);
                }
            });

            if (uniqueImages.length > 0) {
                console.log(`Using ${uniqueImages.length} unique images from teamSetToggleImages`);
                toggleImagesData = uniqueImages;
            }
        }

        // Create a unified storage structure
        const dataToSave = {
            // Core application state
            currentTeamSet: currentTeamSet,
            currentContentTab: currentContentTab,

            // Team data
            teamSets: teamSets,

            // Gallery selection data
            selectedImages: selectedGalleryImages,

            // My Nikkes List data (new format)
            myNikkesList: toggleImagesData,

            // Toggle images data - store in a single location (for backward compatibility)
            toggleImages: toggleImagesData,

            // Team-specific toggle images
            teamSetToggleImages: window.teamSetToggleImages
        };

        // For backward compatibility only - will be removed in future versions
        dataToSave.toggleTabs = { toggleImages: toggleImagesData };

        console.log('Data to save:', dataToSave);
        console.log('Toggle images count:', toggleImagesData.length);

        // Use the optimized storage function
        saveStorageData(dataToSave);
    } catch (error) {
        console.error('Error in saveSelectionToLocalStorage:', error);
    } finally {
        window.isSavingSelection = false;
    }
}, 1000); // 1000ms (1 second) debounce time

// Optimized saveToggleTabsToLocalStorage function
function saveToggleTabsToLocalStorage() {
    // Use the debounced save function
    debouncedSaveToggleTabsToLocalStorage();
}

// The actual save function that will be debounced
const debouncedSaveToggleTabsToLocalStorage = debounce(() => {
    try {
        // Save the current toggle images to the teamSetToggleImages object
        if (typeof saveCurrentToggleImages === 'function') {
            saveCurrentToggleImages();
        }

        // Get toggle images from the DOM to ensure we have the latest data
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (!toggleImagesContainer) {
            return; // No toggle images container found
        }

        const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

        // If we have toggle items in the DOM, extract their data
        let toggleImagesData = [];
        if (toggleItems.length > 0) {
            toggleImagesData = toggleItems.map(item => {
                const img = item.querySelector('img');
                if (!img) return null;

                return {
                    src: img.src,
                    number: item.getAttribute('data-number'),
                    name: item.getAttribute('data-name'),
                    type: item.getAttribute('data-type'),
                    position: item.getAttribute('data-position'),
                    faction: item.getAttribute('data-faction'),
                    rarity: item.getAttribute('data-rarity'),
                    weapon: item.getAttribute('data-weapon'),
                    element: item.getAttribute('data-element'),
                    selected: img.classList.contains('selected'),
                    // Save styles that affect appearance
                    styles: {
                        border: img.style.border || '',
                        outline: img.style.outline || '',
                        boxShadow: img.style.boxShadow || '',
                        filter: img.style.filter || '',
                        transform: img.style.transform || '',
                        opacity: img.style.opacity || '',
                        zIndex: img.style.zIndex || '',
                        position: img.style.position || ''
                    },
                    // Save additional data attributes
                    data: {
                        originalPosition: item.getAttribute('data-original-position') || '',
                        order: item.getAttribute('data-order') || '',
                        galleryPhotoId: item.getAttribute('data-gallery-photo-id') || ''
                    },
                    // Save class information
                    classes: Array.from(img.classList)
                };
            }).filter(item => item !== null); // Filter out any null items
        }

        // Get existing data
        const existingData = getStorageData() || {};

        // Update the My Nikkes List data (new format)
        existingData.myNikkesList = toggleImagesData;

        // Update the toggle images data (for backward compatibility)
        existingData.toggleImages = toggleImagesData;

        // For backward compatibility
        existingData.toggleTabs = { toggleImages: toggleImagesData };

        // Ensure we have the current team set
        if (!existingData.currentTeamSet) {
            existingData.currentTeamSet = currentTeamSet || '1';
        }

        // Ensure we have the current content tab
        if (!existingData.currentContentTab) {
            existingData.currentContentTab = currentContentTab || 'toggleImages';
        }

        // Make sure teamSetToggleImages is included
        if (window.teamSetToggleImages) {
            existingData.teamSetToggleImages = window.teamSetToggleImages;
        }

        // Use the optimized storage function
        saveStorageData(existingData);
    } catch (error) {
        console.error('Error in saveToggleTabsToLocalStorage:', error);
    }
}, 1000); // 1000ms (1 second) debounce time

// Optimized loadSelectionFromLocalStorage function
async function loadSelectionFromLocalStorage() {
    try {
        console.log('Attempting to load data from localStorage key:', STORAGE_KEY);

        // Use the cached data if available
        const savedData = getStorageData();

        if (!savedData) {
            console.log('No saved data found in localStorage');
            // Create empty data structure instead of loading default data
            const emptyData = createEmptyDataStructure();
            console.log('Using empty data structure');
            return processLoadedData(emptyData);
        }

        return processLoadedData(savedData);
    } catch (error) {
        console.error('Error loading selection from localStorage:', error);
        // Clear the cache in case of error
        clearStorageCache();
    }
}

// Optimized updateToggleImageSelectionInLocalStorage function
function updateToggleImageSelectionInLocalStorage(imgSrc, isSelected) {
    try {
        // Get existing data
        const existingData = getStorageData();
        if (!existingData) return;

        let dataChanged = false;

        // Update in myNikkesList (primary storage location)
        if (existingData.myNikkesList && Array.isArray(existingData.myNikkesList)) {
            existingData.myNikkesList.forEach(item => {
                if (item.src === imgSrc && item.selected !== isSelected) {
                    item.selected = isSelected;
                    dataChanged = true;
                }
            });
        }

        // Update in toggleImages (for backward compatibility)
        if (existingData.toggleImages && Array.isArray(existingData.toggleImages)) {
            existingData.toggleImages.forEach(item => {
                if (item.src === imgSrc && item.selected !== isSelected) {
                    item.selected = isSelected;
                    dataChanged = true;
                }
            });
        }

        // Update in teamSetToggleImages
        if (existingData.teamSetToggleImages) {
            for (const setId in existingData.teamSetToggleImages) {
                if (existingData.teamSetToggleImages[setId] && Array.isArray(existingData.teamSetToggleImages[setId])) {
                    existingData.teamSetToggleImages[setId].forEach(item => {
                        if (item.src === imgSrc && item.selected !== isSelected) {
                            item.selected = isSelected;
                            dataChanged = true;
                        }
                    });
                }
            }
        }

        // For backward compatibility, also update toggleTabs.toggleImages
        if (existingData.toggleTabs && existingData.toggleTabs.toggleImages && Array.isArray(existingData.toggleTabs.toggleImages)) {
            existingData.toggleTabs.toggleImages = [...existingData.toggleImages];
        }

        // Only save if data actually changed
        if (dataChanged) {
            // Use the debounced save to prevent excessive saves
            window.debouncedSaveStorageData(existingData);
        }
    } catch (error) {
        console.error('Error updating toggle image selection in localStorage:', error);
    }
}

// Debounced version of saveStorageData
// Check if debouncedSaveStorageData is already defined in the global scope
if (typeof window.debouncedSaveStorageData === 'undefined') {
    window.debouncedSaveStorageData = debounce((data) => {
        saveStorageData(data);
    }, 1000); // 1000ms (1 second) debounce time
}

// Function to save My Nikkes List to localStorage
function saveMyNikkesList() {
    // Use the debounced save function to prevent excessive saves
    debouncedSaveMyNikkesList();
}

// The actual save function that will be debounced
const debouncedSaveMyNikkesList = debounce(() => {
    try {
        // Get toggle images from the DOM to ensure we have the latest data
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (!toggleImagesContainer) {
            return; // No toggle images container found
        }

        const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

        // If we have toggle items in the DOM, extract their data
        let myNikkesList = [];
        if (toggleItems.length > 0) {
            myNikkesList = toggleItems.map(item => {
                const img = item.querySelector('img');
                if (!img) {
                    console.warn('Toggle item has no image, skipping');
                    return null;
                }

                return {
                    src: img.src,
                    number: item.getAttribute('data-number') || '',
                    name: item.getAttribute('data-name') || '',
                    type: item.getAttribute('data-type') || '',
                    position: item.getAttribute('data-position') || '',
                    faction: item.getAttribute('data-faction') || '',
                    rarity: item.getAttribute('data-rarity') || '',
                    weapon: item.getAttribute('data-weapon') || '',
                    selected: img.classList.contains('selected'),
                    // Save order for drag-and-drop positioning
                    order: item.dataset.position || '0',
                    // Save gallery photo ID for restoration
                    galleryPhotoId: item.dataset.galleryPhotoId || ''
                };
            }).filter(item => item !== null); // Filter out any null items
        }

        // Get existing data
        const existingData = getStorageData() || {};

        // Update the My Nikkes List data
        existingData.myNikkesList = myNikkesList;

        // For backward compatibility, also update toggleImages and toggleTabs
        existingData.toggleImages = myNikkesList;
        existingData.toggleTabs = { toggleImages: myNikkesList };

        // Use the optimized storage function
        saveStorageData(existingData);
    } catch (error) {
        console.error('Error in saveMyNikkesList:', error);
    }
}, 1000); // 1000ms (1 second) debounce time

// Function to load My Nikkes List from localStorage
async function loadMyNikkesList() {
    try {
        // Get data from localStorage
        const savedData = getStorageData();
        if (!savedData) {
            return false;
        }

        // Check if we have My Nikkes List data
        let myNikkesList = [];

        // First try to get from myNikkesList (new format)
        if (savedData.myNikkesList && Array.isArray(savedData.myNikkesList)) {
            myNikkesList = savedData.myNikkesList;
        }
        // Then try toggleImages (current format)
        else if (savedData.toggleImages && Array.isArray(savedData.toggleImages)) {
            myNikkesList = savedData.toggleImages;
        }
        // Finally try toggleTabs.toggleImages (old format)
        else if (savedData.toggleTabs && savedData.toggleTabs.toggleImages &&
                 Array.isArray(savedData.toggleTabs.toggleImages)) {
            myNikkesList = savedData.toggleTabs.toggleImages;
        }

        // If we have My Nikkes List data, import it to the toggle gallery
        if (myNikkesList.length > 0) {

            // Clear existing toggle items first to prevent duplicates
            const toggleImagesContainer = document.querySelector('#toggleImages');
            if (toggleImagesContainer) {
                // Check if there are already items in the container
                const existingItems = toggleImagesContainer.querySelectorAll('.toggle-item');
                if (existingItems.length > 0) {
                    toggleImagesContainer.innerHTML = '';
                }
            }

            // Import the images to the toggle gallery
            try {
                // Make sure we're passing the full objects, not just the src
                importImagesToToggleGallery(myNikkesList);

                // Double-check that the toggle items were actually added to the DOM
                setTimeout(() => {
                    const toggleItems = document.querySelectorAll('#toggleImages .toggle-item');
                    if (toggleItems.length === 0 && myNikkesList.length > 0) {
                        // Try direct DOM manipulation as a fallback
                        const toggleImagesContainer = document.querySelector('#toggleImages');
                        if (toggleImagesContainer) {
                            myNikkesList.forEach(item => {
                                try {
                                    // Create toggle item
                                    const toggleItem = document.createElement('div');
                                    toggleItem.className = 'toggle-item';

                                    // Add data attributes
                                    if (item.number) toggleItem.dataset.number = item.number;
                                    if (item.name) toggleItem.dataset.name = item.name;
                                    if (item.type) toggleItem.dataset.type = item.type;
                                    if (item.position) toggleItem.dataset.position = item.position;
                                    if (item.faction) toggleItem.dataset.faction = item.faction;
                                    if (item.rarity) toggleItem.dataset.rarity = item.rarity;
                                    if (item.weapon) toggleItem.dataset.weapon = item.weapon;
                                    if (item.galleryPhotoId) toggleItem.dataset.galleryPhotoId = item.galleryPhotoId;

                                    // Create image
                                    const img = document.createElement('img');
                                    img.src = item.src;
                                    img.crossOrigin = 'anonymous';

                                    // Add click handler
                                    img.addEventListener('click', function() {
                                        if (typeof toggleImageSelection === 'function') {
                                            toggleImageSelection(this);
                                        }
                                    });

                                    // Add to DOM
                                    toggleItem.appendChild(img);
                                    toggleImagesContainer.appendChild(toggleItem);
                                } catch (itemError) {
                                    console.error('Error adding individual toggle item:', itemError);
                                }
                            });
                        }
                    }
                }, 100);
            } catch (importError) {
                console.error('Error importing images to toggle gallery:', importError);
            }

            // Save the My Nikkes List to ensure it's properly stored
            setTimeout(() => {
                saveMyNikkesList();
            }, 500);

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error in loadMyNikkesList:', error);
        return false;
    }
}

// Function to add a Nikke to My Nikkes List
function addToMyNikkesList(nikkeData) {
    try {
        // Get toggle images container
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (!toggleImagesContainer) return false;

        // Check if the Nikke is already in the list
        const existingItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
            .filter(img => img.src === nikkeData.src);

        if (existingItems.length > 0) {
            // Nikke already exists in the list
            return false;
        }

        // Add the Nikke to the toggle gallery
        importImagesToToggleGallery([nikkeData]);

        // Save the updated list
        saveMyNikkesList();

        return true;
    } catch (error) {
        console.error('Error in addToMyNikkesList:', error);
        return false;
    }
}

// Function to remove a Nikke from My Nikkes List
function removeFromMyNikkesList(nikkeData) {
    try {
        // Get toggle images container
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (!toggleImagesContainer) return false;

        // Find the Nikke in the list
        const toggleItem = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'))
            .find(item => {
                const img = item.querySelector('img');
                return img && img.src === nikkeData.src;
            });

        if (!toggleItem) {
            // Nikke not found in the list
            return false;
        }

        // If the Nikke has a gallery photo ID, restore it to the gallery
        if (toggleItem.dataset.galleryPhotoId) {
            const galleryPhoto = document.getElementById(toggleItem.dataset.galleryPhotoId);
            if (galleryPhoto) {
                galleryPhoto.style.display = '';
            }
        }

        // Remove the Nikke from the toggle gallery
        toggleImagesContainer.removeChild(toggleItem);

        // Save the updated list
        saveMyNikkesList();

        return true;
    } catch (error) {
        console.error('Error in removeFromMyNikkesList:', error);
        return false;
    }
}

// Export functions
window.optimizedStorage = {
    getStorageData,
    saveStorageData,
    clearStorageCache,
    saveSelectionToLocalStorage,
    saveToggleTabsToLocalStorage,
    loadSelectionFromLocalStorage,
    updateToggleImageSelectionInLocalStorage,
    saveMyNikkesList,
    loadMyNikkesList,
    addToMyNikkesList,
    removeFromMyNikkesList
};
