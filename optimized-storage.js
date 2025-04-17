// Optimized storage functions for nikkeportrait

// Storage keys
const STORAGE_KEY = 'nikkePortraitData';
const TOGGLE_TABS_KEY = 'nikkeToggleTabsData';

// Cache for localStorage data to avoid repeated parsing
let cachedStorageData = null;
let isSavingData = false;

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
    console.log('Saving selection to localStorage...');
    
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
        const teamSets = [];

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

                    row.querySelectorAll('.image-slot img').forEach(img => {
                        teamImages.push(img.src);
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
        saveCurrentToggleImages();

        // Always get toggle images from the DOM to ensure we have the latest data
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (toggleImagesContainer) {
            const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
            console.log(`Found ${toggleItems.length} toggle items to include in main save from DOM`);

            // If we have toggle items in the DOM, use those
            if (toggleItems.length > 0) {
                toggleImagesData = toggleItems.map(item => {
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

        const dataToSave = {
            teamSets: teamSets,
            selectedImages: selectedGalleryImages,
            currentTeamSet: currentTeamSet,
            currentContentTab: currentContentTab,
            toggleImages: toggleImagesData, // Include toggle images directly in the root
            toggleTabs: { toggleImages: toggleImagesData }, // Also include in toggleTabs for backward compatibility
            teamSetToggleImages: window.teamSetToggleImages // Save team-specific toggle images
        };

        console.log('Data to save:', dataToSave);
        console.log('Toggle images count:', toggleImagesData.length);

        // Use the optimized storage function
        saveStorageData(dataToSave);
    } catch (error) {
        console.error('Error in saveSelectionToLocalStorage:', error);
    } finally {
        window.isSavingSelection = false;
    }
}, 300); // 300ms debounce time

// Optimized saveToggleTabsToLocalStorage function
function saveToggleTabsToLocalStorage() {
    console.log('Saving toggle tabs to localStorage...');
    
    // Use the debounced save function
    debouncedSaveToggleTabsToLocalStorage();
}

// The actual save function that will be debounced
const debouncedSaveToggleTabsToLocalStorage = debounce(() => {
    console.log('Executing debounced toggle tabs save...');
    
    try {
        const toggleTabs = {};

        // Save the current toggle images to the teamSetToggleImages object
        saveCurrentToggleImages();

        // Always get toggle images from the DOM to ensure we have the latest data
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (toggleImagesContainer) {
            const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
            console.log(`Found ${toggleItems.length} toggle items to save from DOM`);

            // If we have toggle items in the DOM, use those
            if (toggleItems.length > 0) {
                toggleTabs.toggleImages = toggleItems.map(item => {
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
            } else {
                // If no toggle items in DOM, check if we have them in localStorage
                const existingData = getStorageData();
                if (existingData) {
                    if (existingData.toggleTabs && existingData.toggleTabs.toggleImages && 
                        Array.isArray(existingData.toggleTabs.toggleImages)) {
                        console.log(`Found ${existingData.toggleTabs.toggleImages.length} toggle images in toggleTabs, using those`);
                        toggleTabs.toggleImages = existingData.toggleTabs.toggleImages;
                    } else if (existingData.toggleImages && Array.isArray(existingData.toggleImages)) {
                        console.log(`Found ${existingData.toggleImages.length} toggle images in root, using those`);
                        toggleTabs.toggleImages = existingData.toggleImages;
                    }
                }
            }
        }

        // Get existing data
        const existingData = getStorageData() || {};

        // Update with toggle tabs data
        existingData.toggleTabs = toggleTabs;

        // Also save toggleImages directly in the root for better compatibility
        if (toggleTabs.toggleImages) {
            existingData.toggleImages = toggleTabs.toggleImages;
            console.log(`Also saved ${toggleTabs.toggleImages.length} toggle images directly in root`);
        }

        // Ensure we have the current team set
        if (!existingData.currentTeamSet) {
            existingData.currentTeamSet = currentTeamSet || '1';
        }

        // Ensure we have the current content tab
        if (!existingData.currentContentTab) {
            existingData.currentContentTab = currentContentTab || 'toggleImages';
        }

        // Use the optimized storage function
        saveStorageData(existingData);
    } catch (error) {
        console.error('Error in saveToggleTabsToLocalStorage:', error);
    }
}, 300); // 300ms debounce time

// Optimized loadSelectionFromLocalStorage function
async function loadSelectionFromLocalStorage() {
    try {
        console.log('Attempting to load data from localStorage key:', STORAGE_KEY);
        
        // Use the cached data if available
        const savedData = getStorageData();
        
        if (!savedData) {
            console.log('No saved data found in localStorage');
            // Try to load default data
            const defaultData = await loadDefaultData();
            if (defaultData) {
                console.log('Using default data instead');
                return processLoadedData(defaultData);
            }
            return;
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

        // Update in toggleImages
        if (existingData.toggleImages && Array.isArray(existingData.toggleImages)) {
            existingData.toggleImages.forEach(item => {
                if (item.src === imgSrc && item.selected !== isSelected) {
                    item.selected = isSelected;
                    dataChanged = true;
                }
            });
        }

        // Update in toggleTabs.toggleImages
        if (existingData.toggleTabs && existingData.toggleTabs.toggleImages && Array.isArray(existingData.toggleTabs.toggleImages)) {
            existingData.toggleTabs.toggleImages.forEach(item => {
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

        // Only save if data actually changed
        if (dataChanged) {
            // Use the debounced save to prevent excessive saves
            debouncedSaveStorageData(existingData);
            console.log(`Updated selection state for ${imgSrc} to ${isSelected} in localStorage`);
        }
    } catch (error) {
        console.error('Error updating toggle image selection in localStorage:', error);
    }
}

// Debounced version of saveStorageData
const debouncedSaveStorageData = debounce((data) => {
    saveStorageData(data);
}, 300); // 300ms debounce time

// Export functions
window.optimizedStorage = {
    getStorageData,
    saveStorageData,
    clearStorageCache,
    saveSelectionToLocalStorage,
    saveToggleTabsToLocalStorage,
    loadSelectionFromLocalStorage,
    updateToggleImageSelectionInLocalStorage
};
