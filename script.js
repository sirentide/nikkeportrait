// Constants, global variables, and shared utility functions are now defined in storage.js

// Device orientation detection
function detectOrientation() {
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    // We can determine landscape from portrait, no need for a separate variable
    const isPhone = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

    console.log(`Device orientation: ${isPortrait ? 'Portrait' : 'Landscape'}`);
    console.log(`Device type: ${isPhone ? 'Phone' : isTablet ? 'Tablet/iPad' : 'Desktop'}`);
    console.log(`Screen dimensions: ${window.innerWidth}x${window.innerHeight}`);

    // Add classes to body for easier CSS targeting
    document.body.classList.remove('portrait', 'landscape', 'phone', 'tablet', 'desktop');
    document.body.classList.add(isPortrait ? 'portrait' : 'landscape');
    document.body.classList.add(isPhone ? 'phone' : isTablet ? 'tablet' : 'desktop');
}

// Listen for orientation changes
window.addEventListener('resize', detectOrientation);
window.addEventListener('orientationchange', detectOrientation);

// Call on page load
window.addEventListener('DOMContentLoaded', detectOrientation);

// Burst filter buttons functionality
function toggleBurstFilter(button) {
    // Toggle active state for this button
    button.classList.toggle('active');
    const isActive = button.classList.contains('active');
    const filterValue = button.getAttribute('data-value');

    console.log(`Toggled burst filter: ${filterValue}, Active: ${isActive}`);

    // Log all active burst filters for debugging
    const allActiveButtons = document.querySelectorAll('.burst-btn.active:not(.filter-btn)');
    console.log('All active burst filters:', Array.from(allActiveButtons).map(btn => btn.getAttribute('data-value')));

    // Update filters
    updateFilters();

    // Re-sort images to maintain order
    sortImages();
}

// Get active burst filters
function getActiveBurstFilters() {
    // Only select burst buttons that are active and don't have the filter-btn class
    const activeButtons = document.querySelectorAll('.burst-btn.active:not(.filter-btn)');
    const activeFilters = Array.from(activeButtons)
        .map(btn => {
            const value = btn.getAttribute('data-value');
            console.log(`Active burst button: ${value}`);
            return value;
        })
        .filter(value => value !== null); // Filter out null values

    console.log('Active burst filters after processing:', activeFilters);
    return activeFilters;
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

    // Combine burst filters and checkbox filters for type
    // This ensures both filtering methods work together
    const combinedTypeFilters = [...new Set([...burstFilters, ...typeValues])];

    const selectedFilters = {
        type: combinedTypeFilters,
        position: positionValues,
        faction: factionValues,
        rarity: rarityValues,
        weapon: weaponValues,
    };

    console.log('Combined filters:', selectedFilters);

    // Get search value from the tab navigation search input for all tabs
    let searchValue = '';
    const navSearchInput = document.getElementById('myNikkesSearchInput');

    // Use the tab navigation search input as the primary search
    if (navSearchInput) {
        searchValue = navSearchInput.value.toLowerCase();
    }

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

        // Update the team-specific toggle images
        saveCurrentToggleImages();
    }

    applyProtectionToGalleryAndSelected();

    // Check if all toggle images have been removed
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (toggleImagesContainer) {
        const remainingToggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
        if (remainingToggleItems.length === 0) {
            // Set flag to indicate user intentionally cleared selection
            localStorage.setItem('userClearedSelection', 'true');
            console.log('All images removed through toggle, setting userClearedSelection flag');
        }
    }

    // Only update the selection state in localStorage for the specific image
    // This prevents automatic toggling of existing images
    updateToggleImageSelectionInLocalStorage(imgSrc, !isSelected);

    // Save to localStorage
    saveSelectionToLocalStorage();
    saveToggleTabsToLocalStorage();
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

    // Update team score
    updateTeamScore();

    // Check if all toggle images have been removed
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (toggleImagesContainer) {
        const remainingToggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');

        // Only update the selection state in localStorage for the specific image
        // This prevents automatic toggling of existing images
        updateToggleImageSelectionInLocalStorage(imgSrc, false);

        if (remainingToggleItems.length === 0) {
            // Set flag to indicate user intentionally cleared selection
            localStorage.setItem('userClearedSelection', 'true');
            console.log('All images removed, setting userClearedSelection flag');

            // Save to localStorage to ensure the flag is respected on refresh
            saveSelectionToLocalStorage();
            saveToggleTabsToLocalStorage();
        }
    }
}

function addImageToSelection(imgElement, imgSrc) {
    // Only add to the current team set
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    const teamRows = currentTeamContainer.querySelectorAll('.team-images');

    for (const teamRow of teamRows) {
        const emptySlot = teamRow.querySelector('.image-slot.empty');
        if (emptySlot) {
            const selectedImg = document.createElement('img');
            selectedImg.crossOrigin = 'anonymous'; // Add crossOrigin for canvas compatibility

            // Get the original src attribute if it's an element, otherwise use the imgSrc directly
            const originalSrc = imgElement.getAttribute ? imgElement.getAttribute('src') : imgSrc;
            selectedImg.src = getGitHubUrl(originalSrc); // Use GitHub URL
            console.log(`Adding image to selection: ${originalSrc} -> ${selectedImg.src}`);

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

            // No longer automatically add gallery images to My Nikkes
            // The user must explicitly add images to My Nikkes using the + button

            break;
        }
    }

    // Update team score
    updateTeamScore();

    // If we're adding an image, clear the userClearedSelection flag
    localStorage.removeItem('userClearedSelection');
    console.log('Added image, clearing userClearedSelection flag');
}

// Local Storage Management
function saveSelectionToLocalStorage() {
    console.log('Saving selection to localStorage...');

    // Avoid infinite recursion
    if (window.isSavingSelection) {
        console.log('Already saving selection, skipping to avoid recursion');
        return;
    }

    window.isSavingSelection = true;
    // Save team data for SET1 and SET2
    let teamSets = [];

    // First try to get team data from the DOM
    let hasTeamDataInDOM = false;
    for (let i = 1; i <= 2; i++) {
        const teams = document.querySelectorAll(`#teamSet${i} .team-images`);
        const teamsData = Array.from(teams).map(team => {
            const images = Array.from(team.querySelectorAll('.image-slot img')).map(img => ({
                src: img.src,
                score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
            }));
            if (images.length > 0) {
                hasTeamDataInDOM = true;
            }
            return { images };
        });
        teamSets.push(teamsData);
    }

    // If no team data in DOM, check localStorage
    if (!hasTeamDataInDOM) {
        console.log('No team data found in DOM, checking localStorage');
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.teamSets && Array.isArray(parsedData.teamSets) && parsedData.teamSets.length > 0) {
                    console.log(`Found team sets in localStorage: ${parsedData.teamSets.length} sets`);

                    // Check if there's actual data in the team sets
                    let hasTeamData = false;
                    parsedData.teamSets.forEach(teamSet => {
                        teamSet.forEach(team => {
                            if (team.images && team.images.length > 0) {
                                hasTeamData = true;
                            }
                        });
                    });

                    if (hasTeamData) {
                        console.log('Using team data from localStorage');
                        teamSets = parsedData.teamSets;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking localStorage for team data:', error);
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
            try {
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);

                    // Check for toggle images in different possible locations
                    if (parsedData.toggleTabs && parsedData.toggleTabs.toggleImages &&
                        parsedData.toggleTabs.toggleImages.length > 0) {
                        console.log(`No toggle items in DOM, but found ${parsedData.toggleTabs.toggleImages.length} in localStorage toggleTabs`);
                        toggleImagesData = parsedData.toggleTabs.toggleImages;
                    } else if (parsedData.toggleImages && parsedData.toggleImages.length > 0) {
                        console.log(`No toggle items in DOM, but found ${parsedData.toggleImages.length} in localStorage root`);
                        toggleImagesData = parsedData.toggleImages;
                    }
                }
            } catch (error) {
                console.error('Error checking localStorage for toggle images:', error);
            }
        }
    }

    // Note: We already saved the current toggle images above

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
    console.log('Toggle images data sample:', toggleImagesData.length > 0 ? toggleImagesData[0] : 'none');

    try {
        const jsonString = JSON.stringify(dataToSave);
        localStorage.setItem(STORAGE_KEY, jsonString);
        console.log('Successfully saved data to localStorage, size:', jsonString.length, 'bytes');

        // Verify the data was saved correctly
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData === jsonString) {
            console.log('Verification successful: Data saved correctly');
        } else {
            console.error('Verification failed: Saved data does not match original data');
        }
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    } finally {
        // Reset the flag
        window.isSavingSelection = false;
    }
}

// Save toggle tabs data to localStorage
function saveToggleTabsToLocalStorage() {
    console.log('Saving toggle tabs to localStorage...');
    const toggleTabs = {};

    // Save Toggle Images data
    // First, save the current toggle images to the teamSetToggleImages object
    saveCurrentToggleImages();

    // Always get toggle images from the DOM to ensure we have the latest data
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (toggleImagesContainer) {
        const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
        console.log(`Found ${toggleItems.length} toggle items to save from DOM`);

        const toggleImagesData = toggleItems.map((item, index) => {
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
                selected: img.classList.contains('selected'),
                order: item.dataset.position || index.toString() // Save position for drag-and-drop ordering
            };
        });
        toggleTabs['toggleImages'] = toggleImagesData;
    } else {
        console.warn('Toggle images container not found');
    }

    // Get existing data
    let existingData = {};
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            existingData = JSON.parse(storedData);
            console.log('Found existing data in localStorage');
        } else {
            console.log('No existing data found in localStorage');
        }
    } catch (error) {
        console.error('Error parsing stored data:', error);
    }

    // Update with toggle tabs data
    existingData.toggleTabs = toggleTabs;

    // Also save toggleImages directly in the root for better compatibility
    if (toggleTabs.toggleImages) {
        existingData.toggleImages = toggleTabs.toggleImages;
        console.log(`Also saved ${toggleTabs.toggleImages.length} toggle images directly in root`);
    }

    // Also ensure we save the team sets data
    if (!existingData.teamSets) {
        console.log('No team sets found in existing data, creating new team sets');
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

        existingData.teamSets = teamSets;
    }

    // Make sure currentTeamSet and currentContentTab are set
    if (!existingData.currentTeamSet) {
        existingData.currentTeamSet = currentTeamSet || '1';
    }
    if (!existingData.currentContentTab) {
        existingData.currentContentTab = currentContentTab || 'toggleImages';
    }

    // Save back to localStorage
    try {
        const jsonString = JSON.stringify(existingData);
        localStorage.setItem(STORAGE_KEY, jsonString);
        console.log('Successfully saved toggle tabs and team data to localStorage, size:', jsonString.length, 'bytes');

        // Verify the data was saved correctly
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData === jsonString) {
            console.log('Verification successful: Toggle tabs data saved correctly');
        } else {
            console.error('Verification failed: Saved toggle tabs data does not match original data');
        }

        // Also call saveSelectionToLocalStorage to ensure both are in sync
        // But avoid infinite recursion by using a flag
        if (!window.isSavingSelection) {
            window.isSavingSelection = true;
            saveSelectionToLocalStorage();
            window.isSavingSelection = false;
        }
    } catch (error) {
        console.error('Error saving toggle tabs to localStorage:', error);
    }
}

// Function to load default data from default_mynikke.json
async function loadDefaultData() {
    try {
        console.log('Loading default data from default_mynikke.json');
        const response = await fetch('default_mynikke.json');
        if (!response.ok) {
            throw new Error(`Failed to load default data: ${response.status} ${response.statusText}`);
        }

        const defaultData = await response.json();
        console.log('Default data loaded successfully:', defaultData);

        if (defaultData && defaultData.toggleImages && defaultData.toggleImages.length > 0) {
            // Create a data structure similar to what we'd get from localStorage
            const dataToSave = {
                teamSets: [[], []],  // Empty team sets
                selectedImages: [],  // No selected images
                currentTeamSet: '1', // Default to team set 1
                currentContentTab: 'toggleImages', // Default to My Nikkes tab
                toggleImages: defaultData.toggleImages,
                toggleTabs: { toggleImages: defaultData.toggleImages },
                teamSetToggleImages: { '1': [], '2': [] }
            };

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            console.log('Default data saved to localStorage');

            // Load the data we just saved
            return dataToSave;
        } else {
            console.error('Invalid default data format');
            return null;
        }
    } catch (error) {
        console.error('Error loading default data:', error);
        return null;
    }
}

async function loadSelectionFromLocalStorage() {
    try {
        console.log('Attempting to load data from localStorage key:', STORAGE_KEY);
        const savedDataString = localStorage.getItem(STORAGE_KEY);
        console.log('Raw data from localStorage:', savedDataString);

        if (!savedDataString) {
            console.log('No saved data found in localStorage');
            // Try to load default data
            const defaultData = await loadDefaultData();
            if (defaultData) {
                console.log('Using default data instead');
                return processLoadedData(defaultData);
            }
            return;
        }

        const savedData = JSON.parse(savedDataString);
        if (!savedData) {
            console.log('Failed to parse saved data from localStorage');
            return;
        }

        return processLoadedData(savedData);
    } catch (error) {
        console.error('Error loading selection from localStorage:', error);
    }
}

// Process the loaded data (either from localStorage or default data)
async function processLoadedData(savedData) {
    try {
        // Check if user has intentionally cleared their selection
        const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';
        if (userClearedSelection) {
            console.log('User intentionally cleared selection, not loading saved data');
            // Clear all data structures
            savedData.toggleImages = [];
            savedData.toggleTabs = { toggleImages: [] };
            savedData.teamSetToggleImages = { '1': [], '2': [] };

            // Clear team images from teamSets
            if (savedData.teamSets && Array.isArray(savedData.teamSets)) {
                savedData.teamSets.forEach(teamSet => {
                    if (Array.isArray(teamSet)) {
                        teamSet.forEach(team => {
                            if (team && team.images) {
                                team.images = [];
                            }
                        });
                    }
                });
            }
        }

        console.log('Processing loaded data:', savedData);
        console.log('Raw saved data keys:', Object.keys(savedData));

        // Check for toggleImages directly in savedData
        if (savedData.toggleImages) {
            console.log('Found toggleImages directly in savedData:',
                      Array.isArray(savedData.toggleImages) ? savedData.toggleImages.length : 'not an array');
            if (Array.isArray(savedData.toggleImages) && savedData.toggleImages.length > 0) {
                console.log('Sample toggle image:', savedData.toggleImages[0]);
            }
        } else {
            console.log('No toggleImages found directly in savedData');
        }

        // Check for toggleTabs in savedData
        if (savedData.toggleTabs) {
            console.log('Found toggleTabs in savedData:', savedData.toggleTabs);
            if (savedData.toggleTabs.toggleImages) {
                console.log('Found toggleImages in toggleTabs:',
                          Array.isArray(savedData.toggleTabs.toggleImages) ?
                          savedData.toggleTabs.toggleImages.length : 'not an array');
            }
        } else {
            console.log('No toggleTabs found in savedData');
        }

        // Handle old format for backward compatibility
        // Convert old format to new format if needed
        let toggleTabs = savedData.toggleTabs || { toggleImages: [] };
        console.log('Toggle tabs from saved data:', toggleTabs);

        // Convert old format to new format if needed
        if (toggleTabs.toggleGallery && !toggleTabs.toggleImages) {
            toggleTabs.toggleImages = toggleTabs.toggleGallery;
            console.log('Converted old toggleGallery format to toggleImages');
        }

        // If toggleTabs is empty but we have a toggleImages property directly in savedData
        if ((!toggleTabs.toggleImages || toggleTabs.toggleImages.length === 0) &&
            savedData.toggleImages && Array.isArray(savedData.toggleImages) && savedData.toggleImages.length > 0) {
            console.log('Found toggleImages directly in savedData, using that instead');
            toggleTabs = { toggleImages: savedData.toggleImages };
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

        // Load team-specific toggle images if available
        if (savedData.teamSetToggleImages) {
            console.log('Found team-specific toggle images in saved data');
            window.teamSetToggleImages = savedData.teamSetToggleImages;
        }

        // Restore current tab and team set if available
        if (savedData.currentTeamSet) {
            currentTeamSet = savedData.currentTeamSet;
            // Don't call switchTeamSet here to avoid overwriting the loaded toggle images
            // Just update the UI
            document.querySelectorAll('.tab-button.team-tab').forEach(tab => {
                if (tab.getAttribute('data-set') === currentTeamSet) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            document.querySelectorAll('.fixed-team-container').forEach(container => {
                if (container.id === `teamSet${currentTeamSet}`) {
                    container.style.display = 'flex';
                    container.classList.remove('hidden');
                } else {
                    container.style.display = 'none';
                    container.classList.add('hidden');
                }
            });
        }

        // Always default to toggleImages tab, regardless of saved state
        currentContentTab = 'toggleImages';
        switchContentTab('toggleImages');

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

        // Debug: Check if we have toggle images data
        if (toggleTabs.toggleImages && toggleTabs.toggleImages.length > 0) {
            console.log(`Found ${toggleTabs.toggleImages.length} toggle images to load from toggleTabs`);
        } else if (savedData.toggleImages && savedData.toggleImages.length > 0) {
            console.log(`Found ${savedData.toggleImages.length} toggle images to load directly from root`);
            toggleTabs.toggleImages = savedData.toggleImages;
        } else {
            console.log('No toggle images found in saved data');
        }

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

                    // Sort toggle images by order if available
                    if (toggleImagesData.length > 0 && toggleImagesData[0].order !== undefined) {
                        toggleImagesData.sort((a, b) => {
                            const orderA = parseInt(a.order || '0', 10);
                            const orderB = parseInt(b.order || '0', 10);
                            return orderA - orderB;
                        });
                        console.log('Sorted toggle images by saved order');
                    }

                    // Add images to toggle images container
                    toggleImagesData.forEach((itemData, index) => {
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

                        // Set position attribute for drag and drop ordering
                        toggleItem.dataset.position = itemData.order || index.toString();

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

                        // Make the toggle item draggable
                        toggleItem.setAttribute('draggable', 'true');
                        toggleItem.addEventListener('dragstart', handleDragStart);
                        toggleItem.addEventListener('dragover', handleDragOver);
                        toggleItem.addEventListener('dragenter', handleDragEnter);
                        toggleItem.addEventListener('dragleave', handleDragLeave);
                        toggleItem.addEventListener('drop', handleDrop);
                        toggleItem.addEventListener('dragend', handleDragEnd);

                        // Hide the corresponding gallery photo if it exists
                        const galleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
                            .find(photo => {
                                const img = photo.querySelector('img');
                                return img && img.src === imgSrc;
                            });

                        if (galleryPhoto) {
                            galleryPhoto.style.display = 'none';
                        }
                    });

                    // Save the toggle tabs state to ensure it's preserved
                    // But don't do it immediately to avoid race conditions
                    setTimeout(() => {
                        saveToggleTabsToLocalStorage();
                    }, 500);
                }
            } catch (innerError) {
                console.error('Error processing toggle tabs:', innerError);
            }
        }

        // Load team data
        if (savedData.teamSets) {
            try {
                // Check if there's actual data in the team sets
                let hasTeamData = false;
                savedData.teamSets.forEach(teamSet => {
                    teamSet.forEach(team => {
                        if (team.images && team.images.length > 0) {
                            hasTeamData = true;
                        }
                    });
                });

                if (!hasTeamData) {
                    console.log('No actual team data found in saved team sets');
                    // Save the empty team sets to avoid losing other data
                    setTimeout(() => {
                        saveSelectionToLocalStorage();
                    }, 500);
                    return;
                }

                // Check if user has intentionally cleared their selection
                const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';
                if (userClearedSelection) {
                    console.log('User intentionally cleared selection, not loading team data');
                    return;
                }

                // Collect all team image sources for later use
                const allTeamImageSources = [];

                // Load team data for each team set
                savedData.teamSets.forEach((teamSet, teamSetIndex) => {
                    const teamSetContainer = document.querySelector(`#teamSet${teamSetIndex + 1}`);
                    if (!teamSetContainer) {
                        console.warn(`Team set container #teamSet${teamSetIndex + 1} not found`);
                        return;
                    }

                    // Load each team in the team set
                    teamSet.forEach((team, teamIndex) => {
                        const teamRow = teamSetContainer.querySelectorAll('.team-images')[teamIndex];
                        if (!teamRow) {
                            console.warn(`Team row ${teamIndex} not found in team set ${teamSetIndex + 1}`);
                            return;
                        }

                        // Load images for this team
                        if (team.images && team.images.length > 0) {
                            console.log(`Loading ${team.images.length} images for team ${teamIndex + 1} in set ${teamSetIndex + 1}`);
                            team.images.forEach(imgData => {
                                if (!imgData.src) {
                                    console.warn('Image data missing src property:', imgData);
                                    return;
                                }

                                // Find an empty slot
                                const emptySlot = teamRow.querySelector('.image-slot.empty');
                                if (!emptySlot) {
                                    console.warn('No empty slots available for team', teamIndex + 1, 'in set', teamSetIndex + 1);
                                    return;
                                }

                                // Create and add the image
                                const img = document.createElement('img');
                                img.src = imgData.src;

                                // Add to the list of team image sources
                                allTeamImageSources.push(imgData.src);

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

                                        // Update the toggle image selection state
                                        const toggleImg = document.querySelector(`#toggleImages .toggle-item img[src="${imgData.src}"]`);
                                        if (toggleImg) {
                                            toggleImg.classList.remove('selected');
                                            toggleImg.style.border = '';
                                            toggleImg.style.outline = '';
                                            toggleImg.style.boxShadow = '';
                                            toggleImg.style.zIndex = '';
                                            toggleImg.style.position = '';

                                            // Update the selection state in localStorage
                                            updateToggleImageSelectionInLocalStorage(imgData.src, false);
                                        }

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

                // No longer automatically add team images to toggle container
                // The user must explicitly add images to My Nikkes using the + button
                console.log('No longer automatically adding team images to My Nikkes');

                console.log('Team data loaded successfully');

                // Save the team data to ensure it's preserved
                // But don't do it immediately to avoid race conditions
                setTimeout(() => {
                    saveSelectionToLocalStorage();
                }, 1000);
            } catch (teamError) {
                console.error('Error loading team data:', teamError);
            }
        } else {
            console.log('No team sets found in saved data');
        }

        console.log('All data loaded successfully');

        // Final check to ensure toggle images are loaded correctly
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (toggleImagesContainer) {
            const toggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
            console.log(`Final check: ${toggleItems.length} toggle images loaded`);

            // Ensure green borders are applied to images in team slots
            setTimeout(() => {
                updateToggleImageSelectionState(currentTeamSet);
                console.log('Updated green borders for loaded images');
            }, 500);

            // Load all toggle images and then update the selection state
            const allToggleImages = [];

            // First, try to get toggle images from toggleTabs in savedData
            if (savedData.toggleTabs && savedData.toggleTabs.toggleImages && savedData.toggleTabs.toggleImages.length > 0) {
                console.log(`Found ${savedData.toggleTabs.toggleImages.length} toggle images in toggleTabs`);
                savedData.toggleTabs.toggleImages.forEach(item => {
                    // Check if this image is already in the allToggleImages array
                    const exists = allToggleImages.some(existingItem => existingItem.src === item.src);
                    if (!exists) {
                        allToggleImages.push(item);
                    }
                });
            }
            // Then, try to get toggle images from toggleImages in savedData
            else if (savedData.toggleImages && savedData.toggleImages.length > 0) {
                console.log(`Found ${savedData.toggleImages.length} toggle images in root`);
                savedData.toggleImages.forEach(item => {
                    // Check if this image is already in the allToggleImages array
                    const exists = allToggleImages.some(existingItem => existingItem.src === item.src);
                    if (!exists) {
                        allToggleImages.push(item);
                    }
                });
            }
            // Finally, try to get toggle images from teamSetToggleImages
            else if (window.teamSetToggleImages) {
                console.log('Using teamSetToggleImages as fallback');
                for (const setId in window.teamSetToggleImages) {
                    if (window.teamSetToggleImages[setId] && window.teamSetToggleImages[setId].length > 0) {
                        window.teamSetToggleImages[setId].forEach(item => {
                            // Check if this image is already in the allToggleImages array
                            const exists = allToggleImages.some(existingItem => existingItem.src === item.src);
                            if (!exists) {
                                allToggleImages.push(item);
                            }
                        });
                    }
                }
            }

            // If we have toggle images, load them all
            if (allToggleImages.length > 0) {
                console.log(`Loading ${allToggleImages.length} total toggle images from all team sets`);

                // Clear the toggle images container
                const toggleImagesContainer = document.querySelector('#toggleImages');
                if (toggleImagesContainer) {
                    toggleImagesContainer.innerHTML = '';

                    // Add each toggle image to the container
                    allToggleImages.forEach(itemData => {
                        // Create a toggle item
                        const toggleItem = document.createElement('div');
                        toggleItem.className = 'toggle-item';

                        // Set data attributes
                        toggleItem.setAttribute('data-number', itemData.number || '');
                        toggleItem.setAttribute('data-name', itemData.name || '');
                        toggleItem.setAttribute('data-type', itemData.type || '');
                        toggleItem.setAttribute('data-position', itemData.position || '');
                        toggleItem.setAttribute('data-faction', itemData.faction || '');
                        toggleItem.setAttribute('data-rarity', itemData.rarity || '');
                        toggleItem.setAttribute('data-weapon', itemData.weapon || '');

                        // Create the image element
                        const toggleImg = document.createElement('img');
                        toggleImg.crossOrigin = 'anonymous'; // Add crossOrigin for canvas compatibility
                        toggleImg.src = getGitHubUrl(itemData.src); // Use GitHub URL
                        toggleImg.dataset.original = itemData.src;

                        // Apply selection state if it exists in the data
                        if (itemData.selected) {
                            toggleImg.classList.add('selected');
                            toggleImg.style.border = '3px solid #00ff00';
                            toggleImg.style.outline = '1px solid #ffffff';
                            toggleImg.style.boxShadow = '0 0 8px #00ff00';
                            toggleImg.style.zIndex = '10';
                            toggleImg.style.position = 'relative';
                            console.log('Applied selection state to toggle image:', itemData.src);
                        }

                        // Add click handler for selection
                        toggleImg.addEventListener('click', function() {
                            toggleImageSelection(this);
                        });

                        // Add to toggle container
                        toggleItem.appendChild(toggleImg);
                        toggleImagesContainer.appendChild(toggleItem);

                        // Hide the corresponding gallery photo if it exists
                        const galleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
                            .find(photo => {
                                const img = photo.querySelector('img');
                                return img && img.src === itemData.src;
                            });

                        if (galleryPhoto) {
                            galleryPhoto.style.display = 'none';
                        }
                    });

                    // Update the selection state for the current team set
                    if (currentTeamSet) {
                        updateToggleImageSelectionState(currentTeamSet);
                    }
                }
            }

            // If we have team images but no toggle images, something went wrong
            // Let's try to fix it by ensuring team images are in the toggle container
            if (toggleItems.length === 0 && savedData.teamSets) {
                console.log('No toggle images found but team data exists, attempting to recover...');

                // Collect all team image sources
                const allTeamImageSources = [];
                savedData.teamSets.forEach(teamSet => {
                    teamSet.forEach(team => {
                        if (team.images && team.images.length > 0) {
                            team.images.forEach(imgData => {
                                if (imgData.src) {
                                    allTeamImageSources.push(imgData.src);
                                }
                            });
                        }
                    });
                });

                // No longer automatically add team images to toggle container
                // The user must explicitly add images to My Nikkes using the + button
                console.log('No longer automatically adding team images to My Nikkes');
            }
        }

        return true; // Successfully processed data
    } catch (error) {
        console.error('Error processing loaded data:', error);
        return false;
    }
}

// Function to ensure all team images are also in the toggle images container
function ensureTeamImagesInToggleContainer(teamImageSources) {
    // Check if user has intentionally cleared their selection
    const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';
    if (userClearedSelection) {
        console.log('User intentionally cleared selection, not ensuring team images in toggle container');
        return;
    }

    if (!teamImageSources || teamImageSources.length === 0) return;

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle images container not found');
        return;
    }

    // Get all current toggle image sources
    const currentToggleImageSources = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
        .map(img => img.src);

    // Find team images that are not in the toggle container
    const missingImages = teamImageSources.filter(src => !currentToggleImageSources.includes(src));

    if (missingImages.length === 0) {
        console.log('No missing team images to add to toggle container');
        return;
    }

    console.log(`Adding ${missingImages.length} team images to My Nikkes tab`);

    // Add each missing image to the toggle container
    missingImages.forEach(imgSrc => {
        // Find the original photo in the gallery
        const galleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
            .find(photo => {
                const img = photo.querySelector('img');
                return img && img.src === imgSrc;
            });

        // Create a toggle item
        const toggleItem = document.createElement('div');
        toggleItem.className = 'toggle-item';

        if (galleryPhoto) {
            // Hide the gallery photo
            galleryPhoto.style.display = 'none';

            // Copy data attributes from the original photo
            toggleItem.setAttribute('data-number', galleryPhoto.getAttribute('data-number') || '');
            toggleItem.setAttribute('data-name', galleryPhoto.getAttribute('data-name') || '');
            toggleItem.setAttribute('data-type', galleryPhoto.getAttribute('data-type') || '');
            toggleItem.setAttribute('data-position', galleryPhoto.getAttribute('data-position') || '');
            toggleItem.setAttribute('data-faction', galleryPhoto.getAttribute('data-faction') || '');
            toggleItem.setAttribute('data-rarity', galleryPhoto.getAttribute('data-rarity') || '');
            toggleItem.setAttribute('data-weapon', galleryPhoto.getAttribute('data-weapon') || '');
        } else {
            // If the gallery photo is not found, we're probably loading from a JSON file
            // Extract data from the image source URL if possible
            console.log('Gallery photo not found for team image:', imgSrc);

            // Try to extract data from the URL
            try {
                const filename = imgSrc.split('/').pop();
                const parts = filename.split('_');

                if (parts.length >= 5) {
                    // Format is typically: score_type_position_faction_rarity_weapon_name.webp
                    toggleItem.setAttribute('data-number', parts[0] || '');
                    toggleItem.setAttribute('data-type', parts[1] || '');
                    toggleItem.setAttribute('data-position', parts[2] || '');
                    toggleItem.setAttribute('data-faction', parts[3] || '');
                    toggleItem.setAttribute('data-rarity', parts[4] || '');
                    toggleItem.setAttribute('data-weapon', parts[5] || '');

                    // Get the character name parts
                    if (parts.length > 5) {
                        let nameParts = parts.slice(5);
                        // Remove file extension
                        let lastPart = nameParts[nameParts.length - 1].replace('.webp', '');
                        nameParts[nameParts.length - 1] = lastPart;
                        // Clean up the name
                        const name = cleanupCharacterName(nameParts.join(' '));
                        toggleItem.setAttribute('data-name', name);
                    }
                }
            } catch (error) {
                console.error('Error extracting data from image URL:', error);
            }
        }

        // Create the image element
        const toggleImg = document.createElement('img');
        toggleImg.crossOrigin = 'anonymous'; // Add crossOrigin for canvas compatibility
        toggleImg.src = getGitHubUrl(imgSrc); // Use GitHub URL
        toggleImg.dataset.original = imgSrc;

        // Add click handler for selection
        toggleImg.addEventListener('click', function() {
            toggleImageSelection(this);
        });

        // Add to toggle container
        toggleItem.appendChild(toggleImg);
        toggleImagesContainer.appendChild(toggleItem);
    });

    // Save the updated toggle tabs state
    saveToggleTabsToLocalStorage();
}

// UI Utilities
function updateTeamScore() {
    // Calculate and update team scores for each team
    document.querySelectorAll('.fixed-team-container').forEach(teamContainer => {
        // Process each team row within the team container
        teamContainer.querySelectorAll('.team-row').forEach(teamRow => {
            const scoreElement = teamRow.querySelector('.team-score');
            if (!scoreElement) return;

            const teamImages = teamRow.querySelectorAll('.image-slot img');
            let totalScore = 0;

            teamImages.forEach(img => {
                // Extract score from image filename
                try {
                    const filename = img.src.split('/').pop();
                    const scoreStr = filename.split('_')[0];
                    const score = parseInt(scoreStr, 10) / 10;
                    if (!isNaN(score)) {
                        totalScore += score;
                    }
                } catch (error) {
                    console.error('Error calculating score for image:', img.src, error);
                }
            });

            // Update the score display with RL level
            let rlLevel = '';
            if (totalScore >= 150) rlLevel = ' (2RL)';
            else if (totalScore >= 100) rlLevel = ' (3RL)';
            else if (totalScore >= 80) rlLevel = ' (4RL)';
            else if (totalScore >= 60) rlLevel = ' (5RL)';

            scoreElement.textContent = totalScore.toFixed(1) + rlLevel;

            // Update color based on score
            if (totalScore >= 150) {
                scoreElement.style.color = '#00aaff'; // Blue for 2RL (150+)
            } else if (totalScore >= 100) {
                scoreElement.style.color = '#00ff00'; // Green for 3RL (100+)
            } else if (totalScore >= 80 && totalScore < 100) {
                scoreElement.style.color = '#ffff00'; // Yellow for 4RL (80-99)
            } else if (totalScore >= 60 && totalScore < 80) {
                scoreElement.style.color = '#ff0000'; // Red for 5RL (60-79)
            } else {
                scoreElement.style.color = '#cc00ff'; // Purple for <60
            }
        });
    });

    console.log('Team scores updated');
}

// Apply protection to gallery and selected images
function applyProtectionToGalleryAndSelected() {
    // Prevent right-click on all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });

        // Prevent drag and drop
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    });
}

// Initialize drag and drop for toggle images
function initToggleImagesDragDrop() {
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    console.log('Initializing drag and drop for toggle images');

    // Create drop indicator elements if they don't exist
    if (!document.querySelector('.drop-indicator')) {
        const dropIndicator = document.createElement('div');
        dropIndicator.className = 'drop-indicator vertical';
        dropIndicator.style.display = 'none';
        document.body.appendChild(dropIndicator);
    }

    if (!document.querySelector('.drop-placeholder')) {
        const dropPlaceholder = document.createElement('div');
        dropPlaceholder.className = 'drop-placeholder';
        dropPlaceholder.style.display = 'none';
        document.body.appendChild(dropPlaceholder);
    }

    // Add event listeners to toggle items
    const toggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
    toggleItems.forEach(item => {
        item.setAttribute('draggable', 'true');

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Add event listeners to the container
    toggleImagesContainer.addEventListener('dragover', handleDragOver);
    toggleImagesContainer.addEventListener('drop', handleDrop);
}

// Drag and drop event handlers
function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.dataset.position || '0');
    e.dataTransfer.effectAllowed = 'move';

    // Set drag image to be the actual image for better visual feedback
    const img = this.querySelector('img');
    if (img) {
        // Create a clone of the image for the drag ghost
        const dragImage = img.cloneNode(true);
        dragImage.style.width = '60px';
        dragImage.style.height = '60px';
        dragImage.style.opacity = '0.7';

        // Add the clone to the document temporarily
        document.body.appendChild(dragImage);
        e.dataTransfer.setDragImage(dragImage, 30, 30);

        // Remove the clone after a short delay
        setTimeout(() => {
            document.body.removeChild(dragImage);
        }, 0);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return false;

    // Get the dragged item
    const draggedItem = document.querySelector('.toggle-item.dragging');
    if (!draggedItem) return false;

    // Get drop indicator elements
    const dropIndicator = document.querySelector('.drop-indicator');
    const dropPlaceholder = document.querySelector('.drop-placeholder');

    if (!dropIndicator || !dropPlaceholder) return false;

    // Get mouse position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Get all items except the one being dragged
    const items = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item:not(.dragging)'));

    // If there are no other items, show placeholder at the end
    if (items.length === 0) {
        // Position placeholder at the beginning of the container
        const containerRect = toggleImagesContainer.getBoundingClientRect();
        dropPlaceholder.style.display = 'block';
        dropPlaceholder.style.position = 'absolute';
        dropPlaceholder.style.top = `${containerRect.top + 10}px`;
        dropPlaceholder.style.left = `${containerRect.left + 10}px`;

        // Hide the indicator
        dropIndicator.style.display = 'none';
        return false;
    }

    // Find the closest item to the mouse position
    let closestItem = null;
    let closestDistance = Infinity;
    let closestRect = null;

    items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from mouse to center of item
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) +
            Math.pow(mouseY - centerY, 2)
        );

        if (distance < closestDistance) {
            closestDistance = distance;
            closestItem = item;
            closestRect = rect;
        }
    });

    // If we found a closest item
    if (closestItem && closestRect) {
        // Determine if we should insert before or after based on mouse position
        const insertBefore = mouseX < closestRect.left + closestRect.width / 2;

        // Show the drop indicator
        dropIndicator.style.display = 'block';
        dropIndicator.style.height = `${closestRect.height}px`;

        if (insertBefore) {
            // Position indicator at the left edge of the closest item
            dropIndicator.style.left = `${closestRect.left - 2}px`;
            dropIndicator.style.top = `${closestRect.top}px`;

            // Add a pulsing animation to make it more visible
            dropIndicator.style.animation = 'pulse 1s infinite';
            dropIndicator.style.boxShadow = '0 0 10px 2px rgba(0, 170, 255, 0.8)';
        } else {
            // Position indicator at the right edge of the closest item
            dropIndicator.style.left = `${closestRect.right - 2}px`;
            dropIndicator.style.top = `${closestRect.top}px`;

            // Add a pulsing animation to make it more visible
            dropIndicator.style.animation = 'pulse 1s infinite';
            dropIndicator.style.boxShadow = '0 0 10px 2px rgba(0, 170, 255, 0.8)';
        }

        // Hide the placeholder
        dropPlaceholder.style.display = 'none';
    }

    return false;
}

function handleDragEnter() {
    this.classList.add('drag-over');
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();

    // Remove drag-over class from all items
    document.querySelectorAll('.toggle-item').forEach(item => {
        item.classList.remove('drag-over');
    });

    // Hide drop indicators
    const dropIndicator = document.querySelector('.drop-indicator');
    const dropPlaceholder = document.querySelector('.drop-placeholder');
    if (dropIndicator) dropIndicator.style.display = 'none';
    if (dropPlaceholder) dropPlaceholder.style.display = 'none';

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    // Get the dragged item
    const draggedItem = document.querySelector('.toggle-item.dragging');
    if (!draggedItem) return;

    // Get mouse position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Get all items except the one being dragged
    const items = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item:not(.dragging)'));

    // If there are no other items, just append the dragged item
    if (items.length === 0) {
        toggleImagesContainer.appendChild(draggedItem);
        updateToggleImagesPositions();
        return false;
    }

    // Find the item we're hovering over based on mouse position
    let closestItem = null;
    let closestDistance = Infinity;

    items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from mouse to center of item
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) +
            Math.pow(mouseY - centerY, 2)
        );

        if (distance < closestDistance) {
            closestDistance = distance;
            closestItem = item;
        }
    });

    // If we found a closest item
    if (closestItem) {
        const rect = closestItem.getBoundingClientRect();

        // Determine if we should insert before or after based on mouse position
        if (mouseX < rect.left + rect.width / 2) {
            // Insert before
            toggleImagesContainer.insertBefore(draggedItem, closestItem);
        } else {
            // Insert after
            toggleImagesContainer.insertBefore(draggedItem, closestItem.nextSibling);
        }
    } else {
        // If no close item found or we're at the end, append to the end
        toggleImagesContainer.appendChild(draggedItem);
    }

    // Update positions in the data model
    updateToggleImagesPositions();

    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');

    // Hide drop indicators
    const dropIndicator = document.querySelector('.drop-indicator');
    const dropPlaceholder = document.querySelector('.drop-placeholder');
    if (dropIndicator) dropIndicator.style.display = 'none';
    if (dropPlaceholder) dropPlaceholder.style.display = 'none';

    // Save the new order to localStorage
    saveToggleTabsToLocalStorage();
    saveSelectionToLocalStorage();
}

// Update positions of toggle images in the data model
function updateToggleImagesPositions() {
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    // Get all toggle items in their current order
    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

    // Update position attribute for each item
    toggleItems.forEach((item, index) => {
        item.dataset.position = index.toString();
    });

    console.log('Updated toggle images positions');
}

// Initialize
window.onload = async () => {
    // Global variables are already initialized in storage.js

    // Update all image sources to use GitHub URLs
    document.querySelectorAll('img').forEach(img => {
        if (!img.src.startsWith('https://raw.githubusercontent.com/')) {
            img.crossOrigin = 'anonymous';
            const originalSrc = img.getAttribute('src');
            // Use the original src attribute value instead of the resolved img.src
            img.src = getGitHubUrl(originalSrc);
            console.log(`Updated image source from ${originalSrc} to ${img.src}`);
        }
    });

    // Also update all image sources in the gallery
    document.querySelectorAll('.photo').forEach(photo => {
        const img = photo.querySelector('img');
        if (img && !img.src.startsWith('https://raw.githubusercontent.com/')) {
            img.crossOrigin = 'anonymous';
            const originalSrc = img.getAttribute('src');
            img.src = getGitHubUrl(originalSrc);
        }
    });

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
                // If in gallery tab, toggle the selection (add/remove) in current team set
                if (currentContentTab === 'gallery') {
                    // Check if the image is already in any team slot of the current team set
                    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
                    const imageInTeamSlot = Array.from(currentTeamContainer.querySelectorAll('.team-images .image-slot img'))
                        .some(slotImg => slotImg.src === this.src);

                    if (imageInTeamSlot) {
                        // If already in a team slot, remove it
                        removeImageFromSelection(this, this.src);
                    } else {
                        // If not in a team slot, add it
                        addImageToSelection(this, this.src);
                    }
                } else {
                    // If not in gallery tab, use the original behavior
                    toggleImageSelection(this);
                }
            });

            // Create and add the "Add to Toggle" button
            const addToToggleBtn = document.createElement('div');
            addToToggleBtn.className = 'add-to-toggle';
            addToToggleBtn.innerHTML = '+';
            addToToggleBtn.title = 'Add to My Nikkes';

            // Add click handler for the button
            addToToggleBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent triggering the photo click

                // Add to My Nikkes collection only
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

    // Add event listener to search input
    const myNikkesSearchInput = document.getElementById('myNikkesSearchInput');
    if (myNikkesSearchInput) {
        myNikkesSearchInput.addEventListener('input', function() {
            // This search input works for all tabs
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
    // Using a timeout to ensure everything is loaded first
    setTimeout(checkToggleImagesEmpty, 600);

    // Initialize drag and drop for toggle images
    setTimeout(initToggleImagesDragDrop, 700);
};

// Prevent right-click on images
function preventRightClick() {
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
}

// Clean up character name
function cleanupCharacterName(name) {
    // Remove duplicate character names
    const parts = name.split(' ');
    const uniqueParts = [];
    const seen = new Set();

    for (const part of parts) {
        const lowerPart = part.toLowerCase();
        if (!seen.has(lowerPart)) {
            seen.add(lowerPart);
            uniqueParts.push(part);
        }
    }

    return uniqueParts.join(' ');
}

// Add a single image to toggle images
function addSingleImageToToggle(imgElement) {
    const imgSrc = imgElement.src;
    const photoElement = imgElement.closest('.photo');

    // Check if this image is already in the toggle images
    const toggleImagesContainer = document.querySelector('#toggleImages');
    const existingToggleImage = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
        .find(img => img.src === imgSrc);

    if (existingToggleImage) {
        // Image already exists in toggle images, just return
        return;
    }

    // Hide the gallery photo
    photoElement.style.display = 'none';

    // Create a toggle item
    const toggleItem = document.createElement('div');
    toggleItem.className = 'toggle-item';

    // Copy data attributes from the original photo
    toggleItem.setAttribute('data-number', photoElement.getAttribute('data-number') || '');
    toggleItem.setAttribute('data-name', photoElement.getAttribute('data-name') || '');
    toggleItem.setAttribute('data-type', photoElement.getAttribute('data-type') || '');
    toggleItem.setAttribute('data-position', photoElement.getAttribute('data-position') || '');
    toggleItem.setAttribute('data-faction', photoElement.getAttribute('data-faction') || '');
    toggleItem.setAttribute('data-rarity', photoElement.getAttribute('data-rarity') || '');
    toggleItem.setAttribute('data-weapon', photoElement.getAttribute('data-weapon') || '');

    // Store the gallery photo reference for later restoration if needed
    toggleItem.dataset.galleryPhotoId = photoElement.id || '';

    // Create the image element
    const toggleImg = document.createElement('img');
    toggleImg.crossOrigin = 'anonymous'; // Add crossOrigin for canvas compatibility
    toggleImg.src = imgSrc;
    toggleImg.dataset.original = imgSrc;

    // Add click handler for selection
    toggleImg.addEventListener('click', function() {
        toggleImageSelection(this);
    });

    // Add to toggle container
    toggleItem.appendChild(toggleImg);
    toggleImagesContainer.appendChild(toggleItem);

    // Make the toggle item draggable
    toggleItem.setAttribute('draggable', 'true');
    toggleItem.addEventListener('dragstart', handleDragStart);
    toggleItem.addEventListener('dragover', handleDragOver);
    toggleItem.addEventListener('dragenter', handleDragEnter);
    toggleItem.addEventListener('dragleave', handleDragLeave);
    toggleItem.addEventListener('drop', handleDrop);
    toggleItem.addEventListener('dragend', handleDragEnd);

    // Set position attribute for drag and drop ordering
    toggleItem.dataset.position = (toggleImagesContainer.children.length - 1).toString();

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Also save to main storage to ensure it's updated
    saveSelectionToLocalStorage();

    // Update the team-specific toggle images
    saveCurrentToggleImages();

    // If we're adding an image, clear the userClearedSelection flag
    localStorage.removeItem('userClearedSelection');
    console.log('Added image to toggle, clearing userClearedSelection flag');
}

// Set up checkbox styling
function setupCheckboxStyling() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateFilters();
        });
    });
}

// Ensure green borders are applied to selected images
function ensureGreenBorders() {
    // Check if user has intentionally cleared their selection
    const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';
    if (userClearedSelection) {
        console.log('User intentionally cleared selection, not applying green borders');
        return;
    }

    // First, get all images in team slots
    const teamImageSources = Array.from(document.querySelectorAll('.team-images .image-slot img'))
        .map(img => img.src);

    console.log(`Found ${teamImageSources.length} images in team slots to apply green borders`);

    // If there are no images in team slots, don't apply any green borders
    if (teamImageSources.length === 0) {
        console.log('No images in team slots, not applying green borders');
        return;
    }

    // Apply green borders to all selected images and images in team slots
    document.querySelectorAll('.photo img, .toggle-item img').forEach(img => {
        const isSelected = img.classList.contains('selected');
        const isInTeamSlot = teamImageSources.includes(img.src);

        if (isSelected || isInTeamSlot) {
            // Add selected class if not already present
            if (!isSelected && isInTeamSlot) {
                img.classList.add('selected');
            }

            // Apply green border styling
            img.style.border = '3px solid #00ff00';
            img.style.outline = '1px solid #ffffff';
            img.style.boxShadow = '0 0 8px #00ff00';
            img.style.zIndex = '10';
            img.style.position = 'relative';
        }
    });

    // Update selection state in localStorage
    updateToggleImageSelectionState(currentTeamSet);
}

// Set up tab system
function setupTabSystem() {
    // Set up content tab switching
    document.querySelectorAll('.tab-button[data-tab]').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tabId = this.getAttribute('data-tab');
            switchContentTab(tabId);
        });
    });

    // Set up team set switching
    document.querySelectorAll('.tab-button.team-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const setId = this.getAttribute('data-set');
            if (setId) {
                console.log(`Clicked team set tab: ${setId}`);
                switchTeamSet(setId);
            } else {
                console.error('Team set tab missing data-set attribute:', this);
            }
        });
    });

    // Set up special buttons
    const importToggleBtn = document.getElementById('importToggleBtn');
    if (importToggleBtn) {
        importToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            importToggleImages();
        });
    }

    const clearToggleBtn = document.getElementById('clearToggleBtn');
    if (clearToggleBtn) {
        clearToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            removeSelectedToggleImages();
        });
    }

    const exportToggleDataBtn = document.getElementById('exportToggleDataBtn');
    if (exportToggleDataBtn) {
        exportToggleDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            exportToggleImageData();
        });
    }

    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            resetLocalStorage();
        });
    }

    // Set up export and clear selection buttons
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Export functionality
            exportTeamSetsAsJpeg();
        });
    }

    // Set up saved sets button
    const savedSetsBtn = document.getElementById('savedSetsBtn');
    if (savedSetsBtn) {
        savedSetsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Show saved sets panel
            showSavedSetsPanel();
        });
    }

    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    if (clearSelectionBtn) {
        clearSelectionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Ask for confirmation before clearing
            const shouldClear = confirm('Are you sure you want to clear the selected team?');
            if (!shouldClear) return; // If user clicks 'Cancel', do nothing

            // Clear selected team
            const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
            if (currentTeamContainer) {
                // Get all image sources in the current team before clearing
                const teamImageSources = Array.from(currentTeamContainer.querySelectorAll('.team-images .image-slot img'))
                    .map(img => img.src);

                // Clear the team slots
                currentTeamContainer.querySelectorAll('.team-images').forEach(teamRow => {
                    teamRow.querySelectorAll('.image-slot').forEach(slot => {
                        if (slot.querySelector('img')) {
                            slot.innerHTML = '';
                            slot.classList.add('empty');
                        }
                    });
                });

                // Also clear the green borders in the toggle images
                if (currentContentTab === 'toggleImages') {
                    const toggleImagesContainer = document.querySelector('#toggleImages');
                    if (toggleImagesContainer) {
                        toggleImagesContainer.querySelectorAll('.toggle-item img').forEach(img => {
                            if (teamImageSources.includes(img.src)) {
                                // Remove selected class and styles
                                img.classList.remove('selected');
                                img.style.border = '';
                                img.style.outline = '';
                                img.style.boxShadow = '';
                                img.style.zIndex = '';
                                img.style.position = '';

                                // Update the selection state in localStorage
                                updateToggleImageSelectionInLocalStorage(img.src, false);
                            }
                        });
                    }
                }

                // Also clear the green borders in the gallery
                const galleryContainer = document.querySelector('.gallery');
                if (galleryContainer) {
                    galleryContainer.querySelectorAll('.photo img').forEach(img => {
                        if (teamImageSources.includes(img.src)) {
                            // Remove selected class and styles
                            img.classList.remove('selected');
                            img.style.border = '';
                            img.style.outline = '';
                            img.style.boxShadow = '';
                            img.style.zIndex = '';
                            img.style.position = '';
                        }
                    });
                }

                // Update team score
                updateTeamScore();

                // Don't set userClearedSelection flag when clearing a team
                // This prevents My Nikkes images from being cleared
                console.log('Team cleared, but keeping My Nikkes images');

                // Update the team-specific toggle images
                saveCurrentToggleImages();

                // Save to localStorage
                saveSelectionToLocalStorage();

                // No alert message after clearing - removed as requested
            }
        });
    }
}

// Switch content tab
function switchContentTab(tabId) {
    // Update current tab
    currentContentTab = tabId;

    // Update tab buttons
    document.querySelectorAll('.tab-button[data-tab]').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update content visibility
    if (tabId === 'gallery') {
        // Show gallery container
        const galleryContainer = document.querySelector('.gallery-container');
        if (galleryContainer) {
            galleryContainer.style.display = 'flex';
            galleryContainer.classList.remove('hidden');
            console.log('Showing gallery container');
        } else {
            console.error('Gallery container not found');
        }
        // Hide toggle container
        const toggleContainer = document.querySelector('.toggle-tabs-container');
        if (toggleContainer) {
            toggleContainer.style.display = 'none';
            toggleContainer.classList.add('hidden');
        }

        // No need to sync search inputs anymore as we've removed the redundant search input
    } else if (tabId === 'toggleImages') {
        // Hide gallery container
        const galleryContainer = document.querySelector('.gallery-container');
        if (galleryContainer) {
            galleryContainer.style.display = 'none';
            galleryContainer.classList.add('hidden');
        }
        // Show toggle container
        const toggleContainer = document.querySelector('.toggle-tabs-container');
        if (toggleContainer) {
            toggleContainer.style.display = 'flex';
            toggleContainer.classList.remove('hidden');
        }
    }

    // Apply filters after switching tabs to ensure everything is properly filtered
    updateFilters();

    // Save the current tab to localStorage
    saveSelectionToLocalStorage();

    console.log(`Switched to tab: ${tabId}`);
}

// Initialize teamSetToggleImages if it doesn't exist yet
if (typeof teamSetToggleImages === 'undefined') {
    window.teamSetToggleImages = {
        '1': [],
        '2': []
    };
}

// Switch team set
function switchTeamSet(setId) {
    // Save current toggle images before switching
    saveCurrentToggleImages();

    // Update current team set
    currentTeamSet = setId;

    // Update team set tabs
    document.querySelectorAll('.tab-button.team-tab').forEach(tab => {
        if (tab.getAttribute('data-set') === setId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update team set visibility
    document.querySelectorAll('.fixed-team-container').forEach(container => {
        if (container.id === `teamSet${setId}`) {
            container.style.display = 'flex';
            container.classList.remove('hidden');
        } else {
            container.style.display = 'none';
            container.classList.add('hidden');
        }
    });

    // Update the green border lines for the current team set
    updateToggleImageSelectionState(setId);

    // Save the current team set to localStorage
    saveSelectionToLocalStorage();

    console.log(`Switched to team set: ${setId}`);
}

// Update the selection state (green border lines) of toggle images based on the current team set
function updateToggleImageSelectionState(setId) {
    // Check if user has intentionally cleared their selection
    const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';
    if (userClearedSelection) {
        console.log('User intentionally cleared selection, not updating toggle image selection state');
        return;
    }

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    // Get the current team container to check which images should be selected
    const teamContainer = document.querySelector(`#teamSet${setId}`);
    if (!teamContainer) {
        console.error(`Team set container #teamSet${setId} not found`);
        return;
    }

    // Get all image sources in the current team set
    const teamImageSources = Array.from(teamContainer.querySelectorAll('.image-slot img'))
        .map(img => img.src);

    console.log(`Found ${teamImageSources.length} images in team set ${setId}`);

    // If there are no images in the team set, don't apply any selection
    if (teamImageSources.length === 0) {
        console.log('No images in team set, clearing all selections');
        // Clear all selections
        const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'));
        toggleItems.forEach(img => {
            img.classList.remove('selected');
            img.style.border = '';
            img.style.outline = '';
            img.style.boxShadow = '';
            img.style.zIndex = '';
            img.style.position = '';

            // Update the selection state in localStorage
            updateToggleImageSelectionInLocalStorage(img.src, false);
        });
        return;
    }

    // Update the selection state of each toggle image
    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'));
    toggleItems.forEach(img => {
        // Check if this image is in the current team set
        const isInTeam = teamImageSources.includes(img.src);

        // Update the visual selection state
        if (isInTeam) {
            img.classList.add('selected');
            img.style.border = '3px solid #00ff00';
            img.style.outline = '1px solid #ffffff';
            img.style.boxShadow = '0 0 8px #00ff00';
            img.style.zIndex = '10';
            img.style.position = 'relative';
        } else {
            img.classList.remove('selected');
            img.style.border = '';
            img.style.outline = '';
            img.style.boxShadow = '';
            img.style.zIndex = '';
            img.style.position = '';
        }

        // Update the selection state in localStorage
        updateToggleImageSelectionInLocalStorage(img.src, isInTeam);
    });
}

// Update the selection state of a toggle image in localStorage
function updateToggleImageSelectionInLocalStorage(imgSrc, isSelected) {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const existingData = JSON.parse(storedData);

            // Update in toggleImages
            if (existingData.toggleImages && Array.isArray(existingData.toggleImages)) {
                existingData.toggleImages.forEach(item => {
                    if (item.src === imgSrc) {
                        item.selected = isSelected;
                    }
                });
            }

            // Update in toggleTabs.toggleImages
            if (existingData.toggleTabs && existingData.toggleTabs.toggleImages && Array.isArray(existingData.toggleTabs.toggleImages)) {
                existingData.toggleTabs.toggleImages.forEach(item => {
                    if (item.src === imgSrc) {
                        item.selected = isSelected;
                    }
                });
            }

            // Update in teamSetToggleImages
            if (existingData.teamSetToggleImages) {
                for (const setId in existingData.teamSetToggleImages) {
                    if (existingData.teamSetToggleImages[setId] && Array.isArray(existingData.teamSetToggleImages[setId])) {
                        existingData.teamSetToggleImages[setId].forEach(item => {
                            if (item.src === imgSrc) {
                                item.selected = isSelected;
                            }
                        });
                    }
                }
            }

            // Save back to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
            console.log(`Updated selection state for ${imgSrc} to ${isSelected} in localStorage`);
        }
    } catch (error) {
        console.error('Error updating toggle image selection in localStorage:', error);
    }
}

// Save current toggle images to the teamSetToggleImages object
function saveCurrentToggleImages() {
    const previousTeamSet = currentTeamSet;
    if (!previousTeamSet) return;

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    // Get the current team container to check which images should be selected
    const teamContainer = document.querySelector(`#teamSet${previousTeamSet}`);
    if (!teamContainer) {
        console.error(`Team set container #teamSet${previousTeamSet} not found`);
        return;
    }

    // Get all image sources in the current team set
    const teamImageSources = Array.from(teamContainer.querySelectorAll('.image-slot img'))
        .map(img => img.src);

    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

    // Save the toggle items data
    window.teamSetToggleImages[previousTeamSet] = toggleItems.map(item => {
        const img = item.querySelector('img');

        // Check if this image is in the current team set
        const isInTeam = teamImageSources.includes(img.src);

        // Only update the selection state in localStorage if the image is in the team
        // This prevents clearing selection state when a team is cleared
        if (isInTeam) {
            updateToggleImageSelectionInLocalStorage(img.src, isInTeam);
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
            selected: isInTeam // Use isInTeam for team-specific selection state
        };
    });

    console.log(`Saved ${window.teamSetToggleImages[previousTeamSet].length} toggle images for team set ${previousTeamSet}`);
}

// This function is no longer used - we now use updateToggleImageSelectionState instead
function loadToggleImagesForTeamSet(setId) {
    console.log(`loadToggleImagesForTeamSet is deprecated, use updateToggleImageSelectionState instead`);
    // Just call updateToggleImageSelectionState for backward compatibility
    updateToggleImageSelectionState(setId);
}

// Check if Toggle Images tab is empty and prompt for import
function checkToggleImagesEmpty() {
    if (importPromptShown) return;

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    const toggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
    if (toggleItems.length === 0) {
        console.log('Toggle Images tab is empty, checking localStorage for saved data');

        // Check if we have toggle images data in localStorage
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);

                // Check for toggle images in different possible locations
                const hasToggleImages =
                    (parsedData.toggleTabs && parsedData.toggleTabs.toggleImages && parsedData.toggleTabs.toggleImages.length > 0) ||
                    (parsedData.toggleImages && parsedData.toggleImages.length > 0);

                if (hasToggleImages) {
                    console.log('Found saved toggle images in localStorage, loading them automatically');
                    // Reload the page to trigger the loadSelectionFromLocalStorage function
                    window.location.reload();
                    return;
                } else {
                    console.log('No saved toggle images found in localStorage');
                }
            }
        } catch (error) {
            console.error('Error checking localStorage for toggle images:', error);
        }

        // Toggle Images tab is empty and no saved data, load default data
        console.log('No saved data found, loading default data...');
        // importPromptShown flag is still needed to prevent multiple attempts
        importPromptShown = true;

        // Load default_mynikke.json from GitHub
        loadJsonFromGitHub('default_mynikke.json', function(data) {
            if (data && data.toggleImages && Array.isArray(data.toggleImages)) {
                console.log(`Found ${data.toggleImages.length} toggle images in default data`);

                // Process the toggle images data
                const imageSources = data.toggleImages.map(item => {
                    if (typeof item === 'string') {
                        return item; // Old format: just the URL
                    } else if (item && item.src) {
                        return item.src; // New format: object with src property
                    } else {
                        console.warn('Invalid toggle image item:', item);
                        return null;
                    }
                }).filter(src => src !== null);

                console.log(`Processed ${imageSources.length} valid image sources from default data`);

                // Import the toggle images from the default data
                if (imageSources.length > 0) {
                    // Clear the userClearedSelection flag since we're loading data
                    localStorage.removeItem('userClearedSelection');
                    console.log('Loading default data, clearing userClearedSelection flag');

                    importImagesToToggleGallery(imageSources);
                }
            } else {
                console.error('Invalid default data format:', data);
                // If default data loading fails, show the import dialog
                importToggleImages();
            }
        });
    }
}

// Import Toggle Images
function importToggleImages() {
    // Create a modal for image selection
    const modal = document.createElement('div');
    modal.className = 'import-modal';
    modal.innerHTML = `
        <div class="import-modal-content">
            <h2>Import Images to My Nikkes</h2>
            <p>Select images to import to your Nikkes selection:</p>
            <div class="import-gallery"></div>
            <div class="import-controls">
                <button id="importSelectedBtn">Import Selected</button>
                <button id="importAllBtn">Import All</button>
                <button id="loadToggleDataBtn">Load from File</button>
                <button id="cancelImportBtn">Cancel</button>
            </div>
            <div id="noImagesMessage" class="no-images-message"></div>
        </div>
    `;

    // Add the modal to the body
    document.body.appendChild(modal);

    // Get all gallery images that aren't already in toggle images
    const toggleImagesContainer = document.querySelector('#toggleImages');
    const toggleImageSources = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
        .map(img => img.src);

    // Get all gallery photos that aren't in toggle images and are currently visible
    const galleryPhotos = Array.from(document.querySelectorAll('.gallery .photo'))
        .filter(photo => {
            const img = photo.querySelector('img');
            const isVisible = window.getComputedStyle(photo).display !== 'none';
            return img && !toggleImageSources.includes(img.src) && isVisible;
        });

    // Create the import gallery
    const importGallery = modal.querySelector('.import-gallery');

    // Check if there are any images to import
    if (galleryPhotos.length === 0) {
        const noImagesMessage = modal.querySelector('#noImagesMessage');
        noImagesMessage.innerHTML = '<h3>No Images Available</h3><p>All gallery images have already been imported to your Nikkes selection.</p>';
        noImagesMessage.style.display = 'block';
    } else {
        // Add each gallery photo to the import gallery
        galleryPhotos.forEach(photo => {
            const importItem = document.createElement('div');
            importItem.className = 'import-item';

            // Clone the image
            const img = photo.querySelector('img').cloneNode(true);

            // Ensure the image is not draggable and has pointer-events set to auto
            img.draggable = false;
            img.style.pointerEvents = 'auto';

            // Remove any green border styling
            img.classList.remove('selected');
            img.style.border = '';
            img.style.outline = '';
            img.style.boxShadow = '';
            img.style.zIndex = '';
            img.style.position = '';

            importItem.appendChild(img);

            // Add click handler for selection
            importItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.toggle('selected');
                return false;
            });

            // Add touch handler for mobile devices
            importItem.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.toggle('selected');
                return false;
            }, { passive: false });

            importGallery.appendChild(importItem);
        });
    }

    // Add event handlers for buttons
    const importSelectedBtn = modal.querySelector('#importSelectedBtn');
    if (importSelectedBtn) {
        importSelectedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const selectedItems = modal.querySelectorAll('.import-item.selected');
            if (selectedItems.length === 0) {
                alert('No images selected. Please select at least one image to import.');
                return;
            }

            // Import selected images
            const selectedSources = Array.from(selectedItems).map(item => item.querySelector('img').src);
            importImagesToToggleGallery(selectedSources);

            // Close the modal
            modal.remove();
        });
    }

    const importAllBtn = modal.querySelector('#importAllBtn');
    if (importAllBtn) {
        importAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Import all images
            const allSources = Array.from(importGallery.querySelectorAll('.import-item img')).map(img => img.src);
            importImagesToToggleGallery(allSources);

            // Close the modal
            modal.remove();
        });
    }

    const loadToggleDataBtn = modal.querySelector('#loadToggleDataBtn');
    if (loadToggleDataBtn) {
        loadToggleDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Show file input dialog
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;

                console.log('Selected file from import modal:', file.name, 'size:', file.size, 'bytes');

                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        console.log('File loaded in import modal, parsing JSON...');
                        const jsonContent = e.target.result;
                        console.log('JSON content length:', jsonContent.length);

                        const data = JSON.parse(jsonContent);
                        console.log('Parsed data in import modal:', data);

                        if (data && data.toggleImages && Array.isArray(data.toggleImages)) {
                            console.log(`Found ${data.toggleImages.length} toggle images in the file`);

                            // Clear existing toggle images
                            toggleImagesContainer.innerHTML = '';
                            console.log('Cleared existing toggle images');

                            // Process the toggle images data
                            const imageSources = data.toggleImages.map(item => {
                                if (typeof item === 'string') {
                                    return item; // Old format: just the URL
                                } else if (item && item.src) {
                                    return item.src; // New format: object with src property
                                } else {
                                    console.warn('Invalid toggle image item:', item);
                                    return null;
                                }
                            }).filter(src => src !== null);

                            console.log(`Processed ${imageSources.length} valid image sources`);

                            // Import the toggle images from the file
                            if (imageSources.length > 0) {
                                // Clear the userClearedSelection flag since we're loading data
                                localStorage.removeItem('userClearedSelection');
                                console.log('Loading toggle data from file, clearing userClearedSelection flag');

                                importImagesToToggleGallery(imageSources);

                                // After importing, ensure green borders are applied to images in team slots
                                setTimeout(() => {
                                    updateToggleImageSelectionState(currentTeamSet);
                                    console.log('Updated green borders for loaded images');
                                }, 500);

                                // Close the modal
                                modal.remove();
                            } else {
                                alert('No valid image sources found in the file.');
                            }
                        } else {
                            console.error('Invalid data format in import modal:', data);
                            alert('Invalid data format. Please select a valid My Nikkes file.');
                        }
                    } catch (error) {
                        console.error('Error parsing toggle data file in import modal:', error);
                        alert(`Error loading file: ${error.message}\n\nPlease make sure it is a valid My Nikkes file.`);
                    }
                };

                reader.onerror = function(e) {
                    console.error('Error reading file in import modal:', e);
                    alert('Error reading file. Please try again.');
                };

                reader.readAsText(file);
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }

    const cancelImportBtn = modal.querySelector('#cancelImportBtn');
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close the modal
            modal.remove();
        });
    }

    // Prevent default behavior for all clicks within the modal
    modal.addEventListener('click', function(e) {
        // Only prevent default if clicking directly on the modal background (not on content)
        if (e.target === modal) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}

// Import images to toggle gallery
function importImagesToToggleGallery(imageSources) {
    console.log('Importing images to toggle gallery:', imageSources);
    if (!imageSources || imageSources.length === 0) {
        console.warn('No image sources provided');
        return;
    }

    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) {
        console.error('Toggle images container not found');
        return;
    }

    // Get existing toggle image sources
    const existingToggleImageSources = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
        .map(img => img.src);
    console.log(`Found ${existingToggleImageSources.length} existing toggle images`);

    // Filter out images that are already in toggle images
    const newImageSources = imageSources.filter(src => !existingToggleImageSources.includes(src));
    console.log(`Found ${newImageSources.length} new images to import`);

    // Import count for success message
    let importCount = 0;
    let notFoundCount = 0;

    // Add each new image to toggle images
    newImageSources.forEach(imgSrc => {
        // Find the original photo in the gallery
        const galleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
            .find(photo => {
                const img = photo.querySelector('img');
                return img && img.src === imgSrc;
            });

        // Create a toggle item
        const toggleItem = document.createElement('div');
        toggleItem.className = 'toggle-item';

        if (galleryPhoto) {
            // Hide the gallery photo - this is the key change to remove from gallery
            galleryPhoto.style.display = 'none';

            // Copy data attributes from the original photo
            toggleItem.setAttribute('data-number', galleryPhoto.getAttribute('data-number') || '');
            toggleItem.setAttribute('data-name', galleryPhoto.getAttribute('data-name') || '');
            toggleItem.setAttribute('data-type', galleryPhoto.getAttribute('data-type') || '');
            toggleItem.setAttribute('data-position', galleryPhoto.getAttribute('data-position') || '');
            toggleItem.setAttribute('data-faction', galleryPhoto.getAttribute('data-faction') || '');
            toggleItem.setAttribute('data-rarity', galleryPhoto.getAttribute('data-rarity') || '');
            toggleItem.setAttribute('data-weapon', galleryPhoto.getAttribute('data-weapon') || '');

            // Store the gallery photo reference for later restoration if needed
            toggleItem.dataset.galleryPhotoId = galleryPhoto.id || '';
        } else {
            // If the gallery photo is not found, we're probably loading from a JSON file
            // Extract data from the image source URL if possible
            console.log('Gallery photo not found for:', imgSrc);
            notFoundCount++;

            // Try to extract data from the URL
            try {
                const filename = imgSrc.split('/').pop();
                const parts = filename.split('_');

                if (parts.length >= 5) {
                    // Format is typically: score_type_position_faction_rarity_weapon_name.webp
                    toggleItem.setAttribute('data-number', parts[0] || '');
                    toggleItem.setAttribute('data-type', parts[1] || '');
                    toggleItem.setAttribute('data-position', parts[2] || '');
                    toggleItem.setAttribute('data-faction', parts[3] || '');
                    toggleItem.setAttribute('data-rarity', parts[4] || '');
                    toggleItem.setAttribute('data-weapon', parts[5] || '');

                    // Get the character name parts
                    if (parts.length > 5) {
                        let nameParts = parts.slice(5);
                        // Remove file extension
                        let lastPart = nameParts[nameParts.length - 1].replace('.webp', '');
                        nameParts[nameParts.length - 1] = lastPart;
                        // Clean up the name
                        const name = cleanupCharacterName(nameParts.join(' '));
                        toggleItem.setAttribute('data-name', name);
                    }
                }

                // After extracting data, check if we can find a matching gallery photo by filename
                const matchingGalleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
                    .find(photo => {
                        const img = photo.querySelector('img');
                        if (img) {
                            const photoFilename = img.src.split('/').pop();
                            return photoFilename === filename;
                        }
                        return false;
                    });

                if (matchingGalleryPhoto) {
                    // Hide the matching gallery photo
                    matchingGalleryPhoto.style.display = 'none';
                    toggleItem.dataset.galleryPhotoId = matchingGalleryPhoto.id || '';
                    notFoundCount--; // Decrement not found count since we found a match
                }
            } catch (error) {
                console.error('Error extracting data from image URL:', error);
            }
        }

        // Create the image element
        const toggleImg = document.createElement('img');
        toggleImg.crossOrigin = 'anonymous'; // Add crossOrigin for canvas compatibility
        toggleImg.src = getGitHubUrl(imgSrc); // Use GitHub URL
        toggleImg.dataset.original = imgSrc;

        // Check if this image is in any team slot and apply green border if it is
        const isInTeamSlot = Array.from(document.querySelectorAll('.team-images .image-slot img'))
            .some(img => img.src === toggleImg.src);

        if (isInTeamSlot) {
            toggleImg.classList.add('selected');
            toggleImg.style.border = '3px solid #00ff00';
            toggleImg.style.outline = '1px solid #ffffff';
            toggleImg.style.boxShadow = '0 0 8px #00ff00';
            toggleImg.style.zIndex = '10';
            toggleImg.style.position = 'relative';
            console.log('Applied green border to image in team slot:', imgSrc);
        }

        // Add click handler for selection
        toggleImg.addEventListener('click', function() {
            toggleImageSelection(this);
        });

        // Add to toggle container
        toggleItem.appendChild(toggleImg);
        toggleImagesContainer.appendChild(toggleItem);

        // Make the toggle item draggable
        toggleItem.setAttribute('draggable', 'true');
        toggleItem.addEventListener('dragstart', handleDragStart);
        toggleItem.addEventListener('dragover', handleDragOver);
        toggleItem.addEventListener('dragenter', handleDragEnter);
        toggleItem.addEventListener('dragleave', handleDragLeave);
        toggleItem.addEventListener('drop', handleDrop);
        toggleItem.addEventListener('dragend', handleDragEnd);

        // Set position attribute for drag and drop ordering
        toggleItem.dataset.position = (toggleImagesContainer.children.length - 1).toString();

        importCount++;
    });

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Save the imported images to the current team set
    saveCurrentToggleImages();

    // If we're importing images, clear the userClearedSelection flag
    localStorage.removeItem('userClearedSelection');
    console.log('Imported images, clearing userClearedSelection flag');

    // Show success message
    if (importCount > 0) {
        let message = `${importCount} image${importCount !== 1 ? 's' : ''} have been imported to your Nikkes selection!`;
        if (notFoundCount > 0) {
            message += `\n\nNote: ${notFoundCount} image${notFoundCount !== 1 ? 's' : ''} could not be found in the gallery. These may be from a different device or browser.`;
        }
        alert(message);
    } else {
        alert('No new images were imported to your Nikkes selection.');
    }

    // Switch to toggle images tab
    switchContentTab('toggleImages');
}

// Export Toggle Image Data
function exportToggleImageData() {
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));
    if (toggleItems.length === 0) {
        alert('No images to export. Please add images to your Nikkes selection first.');
        return;
    }

    // Create data object
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

    const exportData = {
        toggleImages: toggleImagesData
    };

    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_nikkes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export Team Sets as JPEG
function exportTeamSetsAsJpeg() {
    // Create a container for the export view with improved design
    const exportContainer = document.createElement('div');
    exportContainer.className = 'export-container';
    exportContainer.style.position = 'fixed';
    exportContainer.style.top = '0';
    exportContainer.style.left = '0';
    exportContainer.style.width = '100%';
    exportContainer.style.height = '100%';
    exportContainer.style.backgroundColor = '#0a0a0a'; // Darker background for better contrast
    exportContainer.style.zIndex = '9999';
    exportContainer.style.display = 'flex';
    exportContainer.style.flexDirection = 'column';
    exportContainer.style.alignItems = 'center';
    exportContainer.style.justifyContent = 'center';
    exportContainer.style.padding = '10px';
    exportContainer.style.overflow = 'auto';

    // Create a container for both team sets with improved design
    const teamSetsContainer = document.createElement('div');
    teamSetsContainer.className = 'team-sets-container';
    teamSetsContainer.style.display = 'flex';
    teamSetsContainer.style.flexDirection = 'row'; // Side by side
    teamSetsContainer.style.gap = '20px'; // Better spacing between sets
    teamSetsContainer.style.width = '100%';
    teamSetsContainer.style.minWidth = '800px'; // Ensure minimum width for high resolution
    teamSetsContainer.style.maxWidth = '1000px'; // Increased maximum width for higher resolution
    teamSetsContainer.style.backgroundColor = '#151515'; // Slightly lighter background
    teamSetsContainer.style.padding = '20px'; // Increased padding
    teamSetsContainer.style.borderRadius = '8px';
    teamSetsContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'; // Add shadow for depth
    teamSetsContainer.style.boxSizing = 'border-box';

    // Make it responsive
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
        teamSetsContainer.style.flexDirection = 'column';
        teamSetsContainer.style.gap = '12px'; // Increased gap for vertical layout
    }

    // Create a header container for the title with improved design
    const headerContainer = document.createElement('div');
    headerContainer.style.width = '100%';
    headerContainer.style.textAlign = 'center';
    headerContainer.style.marginBottom = '10px';

    // Add title with improved design
    const title = document.createElement('h2');
    title.textContent = 'My Nikkes Teams';
    title.style.color = '#fff';
    title.style.margin = '0';
    title.style.fontSize = '22px'; // Increased font size
    title.style.fontWeight = '600'; // Semi-bold
    title.style.padding = '8px 0'; // Increased padding
    title.style.letterSpacing = '0.5px'; // Slight letter spacing for better readability
    title.style.marginBottom = '10px'; // Added margin
    headerContainer.appendChild(title);

    // Add the header before the team sets container
    exportContainer.appendChild(headerContainer);

    // Clone both team sets
    const teamSet1 = document.querySelector('#teamSet1').cloneNode(true);
    const teamSet2 = document.querySelector('#teamSet2').cloneNode(true);

    // Remove any existing search or filter elements from the cloned team sets
    [teamSet1, teamSet2].forEach(teamSet => {
        // Remove search wrapper if it exists
        const searchWrapper = teamSet.querySelector('.search-wrapper');
        if (searchWrapper) {
            searchWrapper.remove();
        }

        // Remove filter section if it exists
        const filterSection = teamSet.querySelector('.filter-section');
        if (filterSection) {
            filterSection.remove();
        }

        // Remove any other control elements
        const controlsContainer = teamSet.querySelector('.controls-container');
        if (controlsContainer) {
            controlsContainer.remove();
        }
    });

    // Make both team sets visible
    teamSet1.style.display = 'block';
    teamSet2.style.display = 'block';
    teamSet1.classList.remove('hidden');
    teamSet2.classList.remove('hidden');

    // Redesign team sets with better proportions
    [teamSet1, teamSet2].forEach((teamSet, index) => {
        // Set width and flex properties for side-by-side layout
        teamSet.style.width = '49%';
        teamSet.style.flex = '1';
        teamSet.style.padding = '15px'; // Increased padding
        teamSet.style.paddingTop = '25px'; // Extra padding at top for SET label
        teamSet.style.margin = '0';
        teamSet.style.boxSizing = 'border-box';
        teamSet.style.backgroundColor = '#1e1e1e'; // Better background color
        teamSet.style.borderRadius = '8px'; // Better rounding
        teamSet.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'; // Enhanced shadow
        teamSet.style.minWidth = '380px'; // Minimum width for team set
        teamSet.style.maxWidth = '480px'; // Maximum width for team set

        // Add set label - more prominent since we removed the titles
        const setLabel = document.createElement('div');
        setLabel.textContent = index === 0 ? 'Defender' : 'Attacker';
        setLabel.style.position = 'absolute';
        setLabel.style.top = '0';
        setLabel.style.left = '50%'; // Center horizontally
        setLabel.style.transform = 'translateX(-50%)'; // Center horizontally
        setLabel.style.fontSize = '16px'; // Increased font size
        setLabel.style.fontWeight = '600'; // Semi-bold
        setLabel.style.color = '#fff'; // Brighter color
        setLabel.style.backgroundColor = 'rgba(42, 110, 209, 0.8)'; // Blue background
        setLabel.style.padding = '5px 15px'; // Increased padding
        setLabel.style.borderRadius = '0 0 8px 8px'; // Rounded bottom corners
        setLabel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'; // Enhanced shadow
        teamSet.style.position = 'relative'; // For absolute positioning of the label
        teamSet.appendChild(setLabel);

        // Make responsive
        if (mediaQuery.matches) {
            teamSet.style.width = '100%';
            teamSet.style.minWidth = '300px'; // Smaller minimum width on mobile
            teamSet.style.maxWidth = '100%'; // Allow full width on mobile
        }

        // Redesign team rows with better proportions
        const teamRows = teamSet.querySelectorAll('.team-row');
        teamRows.forEach(row => {
            row.style.height = '50px'; // Increased height for higher resolution
            row.style.marginBottom = '8px'; // Increased margin
            row.style.padding = '5px 8px'; // Increased padding
            row.style.backgroundColor = '#252525'; // Better background
            row.style.borderRadius = '6px'; // Better rounding
            row.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)'; // Enhanced shadow
            row.style.maxWidth = '440px'; // Adjusted width to match team set
            row.style.display = 'flex'; // Ensure flex display
            row.style.alignItems = 'center'; // Center items vertically

            // Redesign image slots with better proportions
            const imageSlots = row.querySelectorAll('.image-slot');
            imageSlots.forEach(slot => {
                slot.style.width = '42px'; // Increased size for higher resolution
                slot.style.height = '42px'; // Increased size for higher resolution
                slot.style.margin = '0 2px'; // Increased horizontal margin
                slot.style.border = '1px solid #444'; // Better border
                slot.style.borderRadius = '4px'; // Rounded corners
                slot.style.overflow = 'hidden'; // Hide overflow

                // Style images inside slots
                const img = slot.querySelector('img');
                if (img) {
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover'; // Better image fitting
                }
            });

            // Redesign team images container with better proportions
            const teamImages = row.querySelector('.team-images');
            if (teamImages) {
                teamImages.style.height = '42px'; // Match image slot height
                teamImages.style.gap = '3px'; // Increased spacing
                teamImages.style.marginLeft = '6px'; // Increased margin
                teamImages.style.marginRight = '6px'; // Increased margin
                teamImages.style.display = 'flex'; // Ensure flex display
                teamImages.style.alignItems = 'center'; // Center items vertically
                teamImages.style.flex = '1'; // Take available space
            }

            // Redesign team label with better proportions
            const teamLabel = row.querySelector('.team-label');
            if (teamLabel) {
                teamLabel.style.width = '32px'; // Increased width
                teamLabel.style.height = '32px'; // Square shape
                teamLabel.style.fontSize = '14px'; // Increased font size
                teamLabel.style.fontWeight = '600'; // Semi-bold
                teamLabel.style.padding = '0'; // No padding
                teamLabel.style.display = 'flex';
                teamLabel.style.alignItems = 'center';
                teamLabel.style.justifyContent = 'center';
                teamLabel.style.marginRight = '8px'; // Increased margin
                teamLabel.style.backgroundColor = '#333'; // Background color
                teamLabel.style.borderRadius = '4px'; // Rounded corners
                teamLabel.style.color = '#fff'; // Text color
            }

            // Redesign team score with better proportions
            const teamScore = row.querySelector('.team-score');
            if (teamScore) {
                teamScore.style.width = '80px'; // Increased width
                teamScore.style.fontSize = '14px'; // Increased font size
                teamScore.style.fontWeight = '500'; // Medium weight
                teamScore.style.padding = '0 6px'; // Increased padding
                teamScore.style.display = 'flex';
                teamScore.style.alignItems = 'center';
                teamScore.style.justifyContent = 'flex-end'; // Right align
                teamScore.style.marginLeft = 'auto'; // Push to the right
                teamScore.style.borderRadius = '3px'; // Rounded corners

                // Keep the color but add a subtle background
                const currentColor = teamScore.style.color;
                if (currentColor) {
                    const bgColor = currentColor.replace('rgb', 'rgba').replace(')', ', 0.1)');
                    teamScore.style.backgroundColor = bgColor;
                    teamScore.style.padding = '2px 4px';
                }
            }
        });

        // Remove the redundant team title since we have SET labels in the top right
        const title = teamSet.querySelector('.team-title');
        if (title) {
            title.style.display = 'none'; // Hide the title
        }
    });

    // Add team sets to the container
    teamSetsContainer.appendChild(teamSet1);
    teamSetsContainer.appendChild(teamSet2);

    // Add buttons container with improved design
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.gap = '10px'; // Better spacing
    buttonsContainer.style.marginTop = '12px'; // Better margin

    // Add export button with improved design
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export as JPEG';
    exportButton.style.padding = '8px 16px'; // Better padding
    exportButton.style.backgroundColor = '#2a6ed1'; // Blue color
    exportButton.style.color = '#fff';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    exportButton.style.fontSize = '13px'; // Better font size
    exportButton.style.fontWeight = '500'; // Medium weight
    exportButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Subtle shadow
    exportButton.style.transition = 'background-color 0.2s'; // Smooth hover transition
    // Add hover effect
    exportButton.onmouseover = function() { this.style.backgroundColor = '#3a7ee1'; };
    exportButton.onmouseout = function() { this.style.backgroundColor = '#2a6ed1'; };
    buttonsContainer.appendChild(exportButton);

    // Add close button with improved design
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '8px 16px'; // Better padding
    closeButton.style.backgroundColor = '#444'; // Gray color
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '13px'; // Better font size
    closeButton.style.fontWeight = '500'; // Medium weight
    closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Subtle shadow
    closeButton.style.transition = 'background-color 0.2s'; // Smooth hover transition
    // Add hover effect
    closeButton.onmouseover = function() { this.style.backgroundColor = '#555'; };
    closeButton.onmouseout = function() { this.style.backgroundColor = '#444'; };
    buttonsContainer.appendChild(closeButton);

    // Add the team sets container to the export container
    exportContainer.appendChild(teamSetsContainer);

    // Add buttons to the export container
    exportContainer.appendChild(buttonsContainer);

    // Add a footer with copyright/info
    const footerText = document.createElement('div');
    footerText.textContent = 'Nikkes Portrait • Team Builder';
    footerText.style.color = '#666';
    footerText.style.fontSize = '10px';
    footerText.style.marginTop = '8px';
    footerText.style.textAlign = 'center';
    exportContainer.appendChild(footerText);

    // Add the export container to the body
    document.body.appendChild(exportContainer);

    // Add event listener to export button
    exportButton.addEventListener('click', function() {
        // Show loading indicator
        const loadingOverlay = document.createElement('div');
        loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.zIndex = '10000';

        const loadingText = document.createElement('div');
        loadingText.textContent = 'Generating image...';
        loadingText.style.color = '#fff';
        loadingText.style.fontSize = '16px';
        loadingText.style.fontWeight = '500';
        loadingOverlay.appendChild(loadingText);

        exportContainer.appendChild(loadingOverlay);

        // Temporarily hide the buttons for the screenshot
        buttonsContainer.style.display = 'none';
        footerText.style.display = 'none';

        // Pre-process images to ensure they're loaded with crossOrigin
        const images = teamSetsContainer.querySelectorAll('img');
        let loadedImages = 0;
        const totalImages = images.length;

        // Update loading text to show progress
        loadingText.textContent = `Preparing images (0/${totalImages})...`;

        // Preload all images with crossOrigin set to anonymous
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                const newImg = new Image();
                newImg.crossOrigin = 'anonymous';
                newImg.onload = () => {
                    // Replace the original image with the cross-origin enabled one
                    img.src = newImg.src;
                    loadedImages++;
                    loadingText.textContent = `Preparing images (${loadedImages}/${totalImages})...`;
                    resolve();
                };
                newImg.onerror = (err) => {
                    console.error('Error loading image:', err);
                    loadedImages++;
                    loadingText.textContent = `Preparing images (${loadedImages}/${totalImages})...`;
                    resolve(); // Resolve anyway to continue with other images
                };
                newImg.src = img.src;
            });
        });

        // Wait for all images to be processed before proceeding
        Promise.all(imagePromises).then(() => {
            // All images loaded, proceed with html2canvas
            loadingText.textContent = 'Generating image...';

            // Use html2canvas to capture the team sets container
            html2canvas(teamSetsContainer, {
                backgroundColor: '#151515', // Match the container background
                useCORS: true,
                allowTaint: true,
                scale: 4, // Higher scale for much better quality and resolution
                logging: true, // Enable logging for debugging
                letterRendering: true,
                imageTimeout: 0, // No timeout for images
                foreignObjectRendering: false, // Disable foreignObject rendering which can cause issues
                removeContainer: true, // Remove the container after rendering
                ignoreElements: (element) => {
                    // Ignore any problematic elements
                    return element.classList && element.classList.contains('ignore-export');
                }
            }).then(canvas => {
                // Show the buttons again
                buttonsContainer.style.display = 'flex';
                footerText.style.display = 'block';
                exportContainer.removeChild(loadingOverlay);

                // Convert canvas to JPEG with maximum quality
                const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

                // Create a timestamp for the filename
                const now = new Date();
                const timestamp = now.getFullYear() +
                                 ('0' + (now.getMonth() + 1)).slice(-2) +
                                 ('0' + now.getDate()).slice(-2) + '_' +
                                 ('0' + now.getHours()).slice(-2) +
                                 ('0' + now.getMinutes()).slice(-2);

                // Create a download link
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `my_nikkes_teams_${timestamp}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Show success message
                const successMessage = document.createElement('div');
                successMessage.textContent = 'Image saved successfully!';
                successMessage.style.position = 'absolute';
                successMessage.style.bottom = '20px';
                successMessage.style.left = '50%';
                successMessage.style.transform = 'translateX(-50%)';
                successMessage.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
                successMessage.style.color = '#fff';
                successMessage.style.padding = '8px 16px';
                successMessage.style.borderRadius = '4px';
                successMessage.style.fontSize = '14px';
                successMessage.style.zIndex = '10000';
                exportContainer.appendChild(successMessage);

                // Remove success message after 3 seconds
                setTimeout(() => {
                    if (exportContainer.contains(successMessage)) {
                        exportContainer.removeChild(successMessage);
                    }
                }, 3000);
            }).catch(error => {
                console.error('Error exporting teams:', error);

                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.textContent = 'Error: ' + error.message;
                errorMessage.style.position = 'absolute';
                errorMessage.style.bottom = '20px';
                errorMessage.style.left = '50%';
                errorMessage.style.transform = 'translateX(-50%)';
                errorMessage.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
                errorMessage.style.color = '#fff';
                errorMessage.style.padding = '8px 16px';
                errorMessage.style.borderRadius = '4px';
                errorMessage.style.fontSize = '14px';
                errorMessage.style.zIndex = '10000';
                exportContainer.appendChild(errorMessage);

                // Show the buttons again in case of error
                buttonsContainer.style.display = 'flex';
                footerText.style.display = 'block';
                exportContainer.removeChild(loadingOverlay);

                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (exportContainer.contains(errorMessage)) {
                        exportContainer.removeChild(errorMessage);
                    }
                }, 5000);
            });
        });
    });

    // Add event listener to close button
    closeButton.addEventListener('click', function() {
        // Add fade-out animation
        exportContainer.style.transition = 'opacity 0.3s';
        exportContainer.style.opacity = '0';

        // Remove after animation completes
        setTimeout(() => {
            document.body.removeChild(exportContainer);
        }, 300);
    });
}

// Import Toggle Image Data
function importToggleImageData() {
    // Confirm with the user
    const shouldImport = confirm('Loading from file will replace your current Nikkes selection. Continue?');
    if (!shouldImport) return;

    // Show file input dialog
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        console.log('Selected file:', file.name, 'size:', file.size, 'bytes');

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                console.log('File loaded, parsing JSON...');
                const jsonContent = e.target.result;
                console.log('JSON content length:', jsonContent.length);

                const data = JSON.parse(jsonContent);
                console.log('Parsed data:', data);

                if (data && data.toggleImages && Array.isArray(data.toggleImages)) {
                    console.log(`Found ${data.toggleImages.length} toggle images in the file`);

                    // Clear existing toggle images
                    const toggleImagesContainer = document.querySelector('#toggleImages');
                    if (toggleImagesContainer) {
                        toggleImagesContainer.innerHTML = '';
                        console.log('Cleared existing toggle images');
                    } else {
                        console.error('Toggle images container not found');
                    }

                    // Show all gallery images - this ensures all images are visible before importing
                    document.querySelectorAll('.gallery .photo').forEach(photo => {
                        photo.style.display = 'flex';
                    });
                    console.log('Reset gallery photo visibility');

                    // Process the toggle images data
                    const imageSources = data.toggleImages.map(item => {
                        if (typeof item === 'string') {
                            return item; // Old format: just the URL
                        } else if (item && item.src) {
                            return item.src; // New format: object with src property
                        } else {
                            console.warn('Invalid toggle image item:', item);
                            return null;
                        }
                    }).filter(src => src !== null);

                    console.log(`Processed ${imageSources.length} valid image sources`);

                    // Import the toggle images from the file
                    if (imageSources.length > 0) {
                        importImagesToToggleGallery(imageSources);

                        // After importing, ensure green borders are applied to images in team slots
                        setTimeout(() => {
                            updateToggleImageSelectionState(currentTeamSet);
                            console.log('Updated green borders for loaded images');
                        }, 500);
                    } else {
                        alert('No valid image sources found in the file.');
                    }
                } else {
                    console.error('Invalid data format:', data);
                    alert('Invalid data format. Please select a valid My Nikkes file.');
                }
            } catch (error) {
                console.error('Error parsing toggle data file:', error);
                alert(`Error loading file: ${error.message}\n\nPlease make sure it is a valid My Nikkes file.`);
            }
        };

        reader.onerror = function(e) {
            console.error('Error reading file:', e);
            alert('Error reading file. Please try again.');
        };

        reader.readAsText(file);
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
}

// Clear all toggle images
function clearAllToggleImages() {
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    const toggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
    if (toggleItems.length === 0) {
        alert('No images to remove. Your Nikkes selection is already empty.');
        return;
    }

    // Confirm with the user
    const shouldClear = confirm('Are you sure you want to remove all images from your Nikkes selection?');
    if (!shouldClear) return;

    // Show all gallery images
    document.querySelectorAll('.gallery .photo').forEach(photo => {
        photo.style.display = 'flex';
    });
    console.log('Reset all gallery photo visibility');

    // Clear toggle images
    toggleImagesContainer.innerHTML = '';

    // Also clear all team slots
    for (let i = 1; i <= 2; i++) {
        const teamContainer = document.querySelector(`#teamSet${i}`);
        if (teamContainer) {
            teamContainer.querySelectorAll('.team-images .image-slot').forEach(slot => {
                if (slot.querySelector('img')) {
                    slot.innerHTML = '';
                    slot.classList.add('empty');
                }
            });
        }
    }

    // Update team score
    updateTeamScore();

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Update the team-specific toggle images
    saveCurrentToggleImages();

    // Also save to main storage to ensure it's updated
    saveSelectionToLocalStorage();

    // Show success message
    alert('All images have been removed from your Nikkes selection.');
}

// Reset localStorage data (for debugging)
// Check if Toggle Images tab is empty and load default data if it is
function checkToggleImagesEmpty() {
    const toggleImagesContainer = document.querySelector('#toggleImages');
    if (!toggleImagesContainer) return;

    const toggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
    if (toggleItems.length === 0) {
        // Check if user has intentionally cleared their selection
        const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';

        if (!userClearedSelection) {
            console.log('Toggle Images tab is empty and not intentionally cleared, loading default data...');
            loadDefaultData().then(defaultData => {
                if (defaultData) {
                    console.log('Default data loaded successfully, processing...');
                    processLoadedData(defaultData).then(success => {
                        if (success) {
                            console.log('Default data processed successfully');
                            // Switch to the toggleImages tab
                            switchContentTab('toggleImages');
                        }
                    });
                }
            });
        } else {
            console.log('User intentionally cleared selection, not loading default data');
        }
    } else {
        // If there are toggle items, reset the flag
        localStorage.removeItem('userClearedSelection');
    }
}

function resetLocalStorage() {
    // Confirm with the user
    const shouldReset = confirm('This will completely reset all saved data. Are you sure you want to continue?');
    if (!shouldReset) return;

    try {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOGGLE_TABS_KEY);

        // Reset the teamSetToggleImages object
        window.teamSetToggleImages = {
            '1': [],
            '2': []
        };

        // Set flag to indicate user intentionally cleared selection
        localStorage.setItem('userClearedSelection', 'true');
        console.log('localStorage data cleared successfully');

        // Reload the page
        alert('Data has been reset. The page will now reload.');
        window.location.reload();
    } catch (error) {
        console.error('Error resetting localStorage:', error);
        alert('Error resetting data: ' + error.message);
    }
}

// Remove selected toggle images
function removeSelectedToggleImages() {
    // Create a modal for image selection
    const modal = document.createElement('div');
    modal.className = 'import-modal';
    modal.innerHTML = `
        <div class="import-modal-content">
            <h2>Remove Images from My Nikkes</h2>
            <p>Select images to remove from your Nikkes selection:</p>
            <div class="import-gallery"></div>
            <div class="import-controls">
                <button id="removeSelectedBtn">Remove Selected</button>
                <button id="removeAllBtn">Remove All</button>
                <button id="cancelRemoveBtn">Cancel</button>
            </div>
            <div id="noImagesMessage" class="no-images-message"></div>
        </div>
    `;

    // Add the modal to the body
    document.body.appendChild(modal);

    // Get all toggle images
    const toggleImagesContainer = document.querySelector('#toggleImages');
    const toggleItems = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'));

    // Create the remove gallery
    const removeGallery = modal.querySelector('.import-gallery');

    // Check if there are any images to remove
    if (toggleItems.length === 0) {
        const noImagesMessage = modal.querySelector('#noImagesMessage');
        noImagesMessage.innerHTML = '<h3>No Images Available</h3><p>Your Nikkes selection is empty.</p>';
        noImagesMessage.style.display = 'block';
    } else {
        // Add each toggle image to the remove gallery
        toggleItems.forEach(item => {
            const removeItem = document.createElement('div');
            removeItem.className = 'import-item';

            // Clone the image
            const img = item.querySelector('img').cloneNode(true);

            // Ensure the image is not draggable and has pointer-events set to auto
            img.draggable = false;
            img.style.pointerEvents = 'auto';

            // Remove any green border styling
            img.classList.remove('selected');
            img.style.border = '';
            img.style.outline = '';
            img.style.boxShadow = '';
            img.style.zIndex = '';
            img.style.position = '';

            removeItem.appendChild(img);

            // Add click handler for selection
            removeItem.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.toggle('selected');
                return false;
            });

            // Add touch handler for mobile devices
            removeItem.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.classList.toggle('selected');
                return false;
            }, { passive: false });

            removeGallery.appendChild(removeItem);
        });
    }

    // Add event handlers for buttons
    const removeSelectedBtn = modal.querySelector('#removeSelectedBtn');
    if (removeSelectedBtn) {
        removeSelectedBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const selectedItems = modal.querySelectorAll('.import-item.selected');
            if (selectedItems.length === 0) {
                alert('No images selected. Please select at least one image to remove.');
                return;
            }

            // Get selected image sources
            const selectedSources = Array.from(selectedItems).map(item => item.querySelector('img').src);

            // Remove selected images from toggle images
            selectedSources.forEach(src => {
                // Find the toggle item with this image
                const toggleItem = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item'))
                    .find(item => {
                        const img = item.querySelector('img');
                        return img && img.src === src;
                    });

                if (toggleItem) {
                    // Show the corresponding gallery photo
                    const galleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
                        .find(photo => {
                            const img = photo.querySelector('img');
                            return img && img.src === src;
                        });

                    if (galleryPhoto) {
                        galleryPhoto.style.display = 'flex';
                    } else if (toggleItem.dataset.galleryPhotoId) {
                        // Try to find the gallery photo by ID if we stored it
                        const galleryPhotoById = document.getElementById(toggleItem.dataset.galleryPhotoId);
                        if (galleryPhotoById) {
                            galleryPhotoById.style.display = 'flex';
                        }
                    } else {
                        // Try to find by filename as a last resort
                        const filename = src.split('/').pop();
                        const matchingGalleryPhoto = Array.from(document.querySelectorAll('.gallery .photo'))
                            .find(photo => {
                                const img = photo.querySelector('img');
                                if (img) {
                                    const photoFilename = img.src.split('/').pop();
                                    return photoFilename === filename;
                                }
                                return false;
                            });

                        if (matchingGalleryPhoto) {
                            matchingGalleryPhoto.style.display = 'flex';
                        }
                    }

                    // Also remove the image from any team slots
                    for (let i = 1; i <= 2; i++) {
                        const teamContainer = document.querySelector(`#teamSet${i}`);
                        if (teamContainer) {
                            teamContainer.querySelectorAll('.team-images .image-slot img').forEach(img => {
                                if (img.src === src) {
                                    // Remove the image from the slot
                                    const slot = img.parentElement;
                                    slot.innerHTML = '';
                                    slot.classList.add('empty');
                                }
                            });
                        }
                    }

                    // Remove the toggle item
                    toggleItem.remove();
                }
            });

            // Update team score
            updateTeamScore();

            // Save the toggle tabs state
            saveToggleTabsToLocalStorage();

            // Update the team-specific toggle images
            saveCurrentToggleImages();

            // Also update the teamSets data in localStorage to reflect the removed images
            const savedDataString = localStorage.getItem(STORAGE_KEY);
            if (savedDataString) {
                try {
                    const savedData = JSON.parse(savedDataString);

                    // Update teamSets to remove the selected images
                    if (savedData.teamSets && Array.isArray(savedData.teamSets)) {
                        savedData.teamSets.forEach(teamSet => {
                            if (Array.isArray(teamSet)) {
                                teamSet.forEach(team => {
                                    if (team && team.images && Array.isArray(team.images)) {
                                        // Filter out the removed images
                                        team.images = team.images.filter(img => !selectedSources.includes(img.src));
                                    }
                                });
                            }
                        });
                    }

                    // Save the updated data back to localStorage
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                    console.log('Updated teamSets data in localStorage to reflect removed images');
                } catch (error) {
                    console.error('Error updating teamSets data in localStorage:', error);
                }
            }

            // If all toggle images are now removed, set the userClearedSelection flag
            const remainingToggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
            if (remainingToggleItems.length === 0) {
                // Set flag to indicate user intentionally cleared selection
                localStorage.setItem('userClearedSelection', 'true');
                console.log('All images removed, setting userClearedSelection flag');
            }

            // Show success message
            alert(`${selectedSources.length} image${selectedSources.length !== 1 ? 's' : ''} have been removed from your Nikkes selection.`);

            // Close the modal
            modal.remove();
        });
    }

    const removeAllBtn = modal.querySelector('#removeAllBtn');
    if (removeAllBtn) {
        removeAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Confirm with the user
            const shouldRemoveAll = confirm('Are you sure you want to remove all images from your Nikkes selection?');
            if (!shouldRemoveAll) return;

            // Show all gallery images
            document.querySelectorAll('.gallery .photo').forEach(photo => {
                photo.style.display = 'flex';
            });
            console.log('Reset all gallery photo visibility');

            // Clear toggle images
            toggleImagesContainer.innerHTML = '';

            // Also clear all team slots
            for (let i = 1; i <= 2; i++) {
                const teamContainer = document.querySelector(`#teamSet${i}`);
                if (teamContainer) {
                    teamContainer.querySelectorAll('.team-images .image-slot').forEach(slot => {
                        if (slot.querySelector('img')) {
                            slot.innerHTML = '';
                            slot.classList.add('empty');
                        }
                    });
                }
            }

            // Update team score
            updateTeamScore();

            // Clear the teamSetToggleImages object
            window.teamSetToggleImages = {
                '1': [],
                '2': []
            };

            // Save the toggle tabs state with empty arrays
            const toggleTabsData = {
                toggleImages: []
            };
            localStorage.setItem(TOGGLE_TABS_KEY, JSON.stringify(toggleTabsData));
            console.log('Cleared toggle tabs data in localStorage');

            // Also clear the main data storage
            const savedDataString = localStorage.getItem(STORAGE_KEY);
            if (savedDataString) {
                try {
                    const savedData = JSON.parse(savedDataString);
                    savedData.toggleImages = [];
                    savedData.toggleTabs = { toggleImages: [] };
                    savedData.teamSetToggleImages = { '1': [], '2': [] };

                    // Also clear team images from teamSets
                    if (savedData.teamSets && Array.isArray(savedData.teamSets)) {
                        savedData.teamSets.forEach(teamSet => {
                            if (Array.isArray(teamSet)) {
                                teamSet.forEach(team => {
                                    if (team && team.images) {
                                        team.images = [];
                                    }
                                });
                            }
                        });
                    }

                    // Save the updated data back to localStorage
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                    console.log('Cleared all toggle images from localStorage');
                } catch (error) {
                    console.error('Error updating localStorage:', error);
                }
            }

            // Set flag to indicate user intentionally cleared selection
            localStorage.setItem('userClearedSelection', 'true');

            // Show success message
            alert('All images have been removed from your Nikkes selection.');

            // Close the modal
            modal.remove();
        });
    }

    const cancelRemoveBtn = modal.querySelector('#cancelRemoveBtn');
    if (cancelRemoveBtn) {
        cancelRemoveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close the modal
            modal.remove();
        });
    }

    // Prevent default behavior for all clicks within the modal
    modal.addEventListener('click', function(e) {
        // Only prevent default if clicking directly on the modal background (not on content)
        if (e.target === modal) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
}
