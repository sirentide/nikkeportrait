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

    // If we're in the toggleImages or gallery tab, also check the corresponding checkbox in the filter panel
    if (currentContentTab === 'toggleImages' || currentContentTab === 'gallery') {
        // Find the corresponding checkbox in the filter panel
        const checkbox = document.querySelector(`input[type="checkbox"][value="${filterValue}"]`);
        if (checkbox) {
            // Set the checkbox state to match the button state
            checkbox.checked = isActive;
            console.log(`Set checkbox for ${filterValue} to ${isActive}`);
        } else {
            console.log(`Could not find checkbox for ${filterValue}`);
        }
    }

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

// Helper function to determine filter type from context
function getFilterTypeFromContext(checkbox) {
    // Try to infer filter type from parent elements
    const parent = checkbox.closest('.filter-box');
    if (parent) {
        const heading = parent.querySelector('h4');
        if (heading) {
            const headingText = heading.textContent.toLowerCase();

            // Map heading text to filter type
            if (headingText.includes('class')) return 'position';
            if (headingText.includes('rarity')) return 'rarity';
            if (headingText.includes('industry')) return 'faction';
            if (headingText.includes('weapon')) return 'weapon';
            if (headingText.includes('burst')) return 'type';
        }
    }

    // Try to infer from the checkbox value
    const value = checkbox.value.toLowerCase();

    // Position/class values
    if (['def', 'sp', 'atk', 'defender', 'supporter', 'attacker'].includes(value)) {
        return 'position';
    }

    // Rarity values
    if (['ssr', 'sr', 'r'].includes(value)) {
        return 'rarity';
    }

    // Faction/industry values
    if (['elysion', 'missilis', 'tetra', 'abnormal', 'pilgrim'].includes(value)) {
        return 'faction';
    }

    // Weapon values
    if (['smg', 'ar', 'snr', 'rl', 'sg', 'mg'].includes(value)) {
        return 'weapon';
    }

    // Burst/type values
    if (['b1', 'b2', 'b3', 'a'].includes(value)) {
        return 'type';
    }

    // Default to null if we can't determine the type
    return null;
}

// Filter functionality
function updateFilters() {
    // Get burst filters from the modern buttons
    const burstFilters = getActiveBurstFilters();
    console.log('Active burst filters:', burstFilters);

    // Get checked values for each filter type
    const typeValues = getCheckedValues(['b1', 'b2', 'b3', 'a']);
    const positionValues = getCheckedValues(['def', 'sp', 'atk']);
    const factionValues = getCheckedValues(['elysion', 'missilis', 'tetra', 'abnormal', 'pilgrim']);
    const rarityValues = getCheckedValues(['ssr', 'sr', 'r']);
    const weaponValues = getCheckedValues(['smg', 'ar', 'snr', 'rl', 'sg', 'mg']);

    console.log('Position filter values:', positionValues);

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

    // Determine which tab we're in
    const isToggleTab = currentContentTab === 'toggleImages';
    const isGalleryTab = currentContentTab === 'gallery';
    console.log('Current tab:', currentContentTab, 'Is toggle tab:', isToggleTab, 'Is gallery tab:', isGalleryTab);

    // Filter gallery photos
    const photos = document.querySelectorAll('.photo');
    console.log('Updating filters, found', photos.length, 'gallery photos');

    let galleryVisibleCount = 0;
    photos.forEach(photo => {
        const attributes = getPhotoAttributes(photo);

        // Debug log to check attributes
        if (localStorage.getItem('filterDebugMode') === 'true') {
            console.log('Gallery photo attributes:', attributes);
        }

        // Check if the photo matches the filters
        let isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);

        // If we're in the gallery tab and there are burst filters active, ensure they're applied correctly
        if (isGalleryTab && combinedTypeFilters.length > 0) {
            // Make sure the type attribute is properly set
            if (!attributes.type && photo.getAttribute('data-type')) {
                attributes.type = photo.getAttribute('data-type').toLowerCase();
                console.log('Updated type attribute for gallery photo:', attributes.type);
            }

            // Double-check the type match
            const typeMatch = combinedTypeFilters.some(type => {
                return attributes.type && attributes.type.includes(type.toLowerCase());
            });

            if (!typeMatch) {
                isMatch = false;
                console.log('Gallery photo failed type filter check:', attributes.type, 'not in', combinedTypeFilters);
            }
        }

        photo.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) galleryVisibleCount++;
    });

    console.log('Visible gallery photos after filtering:', galleryVisibleCount);

    // Filter toggle items
    const toggleItems = document.querySelectorAll('.toggle-item');
    console.log('Updating filters, found', toggleItems.length, 'toggle items');

    // Special handling for toggle items based on which tab we're in
    let toggleVisibleCount = 0;
    toggleItems.forEach(item => {
        // Get attributes from the toggle item
        const attributes = getPhotoAttributes(item);

        // Debug log to check attributes
        if (localStorage.getItem('filterDebugMode') === 'true') {
            console.log('Toggle item attributes:', attributes);
        }

        // Check if the item matches the filters
        let isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);

        // If we're in the toggle tab and there are burst filters active, ensure they're applied correctly
        if (isToggleTab && combinedTypeFilters.length > 0) {
            // Make sure the type attribute is properly set
            if (!attributes.type && item.getAttribute('data-type')) {
                attributes.type = item.getAttribute('data-type').toLowerCase();
                console.log('Updated type attribute for toggle item:', attributes.type);
            }

            // Double-check the type match
            const typeMatch = combinedTypeFilters.some(type => {
                return attributes.type && attributes.type.includes(type.toLowerCase());
            });

            if (!typeMatch) {
                isMatch = false;
                console.log('Toggle item failed type filter check:', attributes.type, 'not in', combinedTypeFilters);
            }
        }

        // Update visibility
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
        }
    }

    // Save to localStorage to ensure the changes are preserved
    saveSelectionToLocalStorage();
    console.log('Saved team sets to localStorage after removing image');
    saveToggleTabsToLocalStorage();
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

    // Save the updated team sets to localStorage
    saveSelectionToLocalStorage();
    console.log('Saved team sets to localStorage after adding image');
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

    // Get team data from the DOM
    const teamSets = [];

    // Check if we have team data in the DOM
    let hasTeamDataInDOM = false;

    // Process each team set
    for (let setIndex = 1; setIndex <= 2; setIndex++) {
        const teamSet = [];
        const teamSetContainer = document.querySelector(`#teamSet${setIndex}`);

        if (teamSetContainer) {
            console.log(`Processing team set ${setIndex}`);
            const teamRows = teamSetContainer.querySelectorAll('.team-images');
            console.log(`Found ${teamRows.length} team rows in set ${setIndex}`);

            teamRows.forEach((row, rowIndex) => {
                const teamImages = Array.from(row.querySelectorAll('.image-slot img')).map(img => ({
                    src: img.src,
                    score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
                }));

                console.log(`Team set ${setIndex}, row ${rowIndex}: Found ${teamImages.length} images`);

                if (teamImages.length > 0) {
                    hasTeamDataInDOM = true; // We found at least one image in a team
                }

                teamSet.push({ images: teamImages });
            });
        }

        teamSets.push(teamSet);
    }

    console.log('Final team sets data to save:', JSON.stringify(teamSets));

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
                    if (parsedData.toggleImages && Array.isArray(parsedData.toggleImages) && parsedData.toggleImages.length > 0) {
                        console.log(`Found ${parsedData.toggleImages.length} toggle images in localStorage, using those`);
                        toggleImagesData = parsedData.toggleImages;
                    } else if (parsedData.toggleTabs && parsedData.toggleTabs.toggleImages &&
                              Array.isArray(parsedData.toggleTabs.toggleImages) && parsedData.toggleTabs.toggleImages.length > 0) {
                        console.log(`Found ${parsedData.toggleTabs.toggleImages.length} toggle images in toggleTabs, using those`);
                        toggleImagesData = parsedData.toggleTabs.toggleImages;
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
    console.log('Team sets to save:', JSON.stringify(teamSets));
    console.log('Current team set:', currentTeamSet);
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

        // Ensure we have the currentTeamSet property
        if (!savedData.currentTeamSet) {
            console.log('No currentTeamSet found in saved data, defaulting to 1');
            savedData.currentTeamSet = '1';
        }

        // Ensure we have the teamSets property
        if (!savedData.teamSets || !Array.isArray(savedData.teamSets)) {
            console.log('No valid teamSets found in saved data, creating empty team sets');
            savedData.teamSets = [[], []];
        }

        // Ensure we have the correct number of team sets
        if (savedData.teamSets.length < 2) {
            console.log('Not enough team sets found, adding empty ones');
            while (savedData.teamSets.length < 2) {
                savedData.teamSets.push([]);
            }
        }

        console.log('Processed saved data:', savedData);
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
            console.log('User intentionally cleared selection, not loading saved toggle images');
            // Clear toggle images but preserve team sets
            savedData.toggleImages = [];
            savedData.toggleTabs = { toggleImages: [] };
            savedData.teamSetToggleImages = { '1': [], '2': [] };

            // Check if there are any team sets with images before clearing them
            let hasTeamSets = false;
            if (savedData.teamSets && Array.isArray(savedData.teamSets)) {
                savedData.teamSets.forEach(teamSet => {
                    if (Array.isArray(teamSet)) {
                        teamSet.forEach(team => {
                            if (team && team.images && team.images.length > 0) {
                                hasTeamSets = true;
                                console.log('Found team images in saved data, preserving team sets');
                            }
                        });
                    }
                });
            }

            // Only clear team images if there are no team sets with images
            if (!hasTeamSets) {
                console.log('No team images found in saved data, clearing team sets');
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
            } else {
                console.log('Preserving team sets even when toggle images are cleared');
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
                console.log('Found team sets in saved data:', JSON.stringify(savedData.teamSets));

                // Check if there's actual data in the team sets
                let hasTeamData = false;
                savedData.teamSets.forEach((teamSet, index) => {
                    console.log(`Checking team set ${index + 1}:`, JSON.stringify(teamSet));
                    teamSet.forEach((team, teamIndex) => {
                        if (team.images && team.images.length > 0) {
                            console.log(`Team set ${index + 1}, team ${teamIndex + 1} has ${team.images.length} images`);
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

                console.log('Team data found in saved team sets, proceeding with loading');

                // Check if user has intentionally cleared their selection
                const userClearedSelection = localStorage.getItem('userClearedSelection') === 'true';
                if (userClearedSelection) {
                    // We now want to load team data even if user cleared selection
                    console.log('User intentionally cleared selection, but still loading team data to preserve team sets');
                    // Continue with loading team data instead of returning
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

                    // First, clear all team slots in this team set
                    teamSetContainer.querySelectorAll('.team-images').forEach(teamRow => {
                        teamRow.querySelectorAll('.image-slot').forEach(slot => {
                            slot.innerHTML = '';
                            slot.classList.add('empty');
                        });
                    });

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
                                img.crossOrigin = 'anonymous'; // Add crossOrigin for canvas compatibility

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

                // Save the team data immediately to ensure it's preserved
                // Don't use setTimeout or debounced functions to avoid race conditions
                try {
                    // Get the current data from localStorage
                    const savedDataString = localStorage.getItem(STORAGE_KEY);
                    if (savedDataString) {
                        const currentData = JSON.parse(savedDataString);

                        // Update only the teamSets property
                        currentData.teamSets = savedData.teamSets;

                        // Save immediately without debouncing
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
                        console.log('Immediately saved team sets to localStorage to ensure preservation');
                    } else {
                        // If no existing data, save everything immediately
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                        console.log('Saved all data to localStorage');
                    }
                } catch (error) {
                    console.error('Error saving team data immediately:', error);
                    // Fall back to the regular save method
                    saveSelectionToLocalStorage();
                }
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

                        // Set data attributes - ensure all attributes are lowercase for consistency
                        toggleItem.setAttribute('data-number', itemData.number || '');
                        toggleItem.setAttribute('data-name', itemData.name || '');
                        toggleItem.setAttribute('data-type', (itemData.type || '').toLowerCase());
                        toggleItem.setAttribute('data-position', (itemData.position || '').toLowerCase());
                        toggleItem.setAttribute('data-faction', (itemData.faction || '').toLowerCase());
                        toggleItem.setAttribute('data-rarity', (itemData.rarity || '').toLowerCase());
                        toggleItem.setAttribute('data-weapon', (itemData.weapon || '').toLowerCase());

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

    // Get the container's bounding rect to determine edges
    const containerRect = toggleImagesContainer.getBoundingClientRect();

    // Check if we're near the left edge of the container
    const isNearLeftEdge = mouseX < containerRect.left + 40; // 40px threshold

    // Check if we're near the right edge of the container
    const isNearRightEdge = mouseX > containerRect.right - 40; // 40px threshold

    // Get all items except the one being dragged
    const items = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item:not(.dragging)'));

    // If there are no other items, show placeholder at the beginning
    if (items.length === 0) {
        // Position placeholder at the beginning of the container
        dropPlaceholder.style.display = 'block';
        dropPlaceholder.style.position = 'absolute';
        dropPlaceholder.style.top = `${containerRect.top + 10}px`;
        dropPlaceholder.style.left = `${containerRect.left + 10}px`;

        // Hide the indicator
        dropIndicator.style.display = 'none';
        return false;
    }

    // Special handling for edges
    if (isNearLeftEdge) {
        // Show indicator at the left edge of the first item
        const firstItem = items[0];
        const firstRect = firstItem.getBoundingClientRect();

        dropIndicator.style.display = 'block';
        dropIndicator.style.height = `${firstRect.height}px`;
        dropIndicator.style.left = `${firstRect.left - 2}px`;
        dropIndicator.style.top = `${firstRect.top}px`;
        dropIndicator.style.animation = 'pulse 1s infinite';
        dropIndicator.style.boxShadow = '0 0 10px 2px rgba(0, 170, 255, 0.8)';

        // Hide the placeholder
        dropPlaceholder.style.display = 'none';
        return false;
    }

    if (isNearRightEdge) {
        // Show indicator at the right edge of the last item
        const lastItem = items[items.length - 1];
        const lastRect = lastItem.getBoundingClientRect();

        dropIndicator.style.display = 'block';
        dropIndicator.style.height = `${lastRect.height}px`;
        dropIndicator.style.left = `${lastRect.right - 2}px`;
        dropIndicator.style.top = `${lastRect.top}px`;
        dropIndicator.style.animation = 'pulse 1s infinite';
        dropIndicator.style.boxShadow = '0 0 10px 2px rgba(0, 170, 255, 0.8)';

        // Hide the placeholder
        dropPlaceholder.style.display = 'none';
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
        // Get the row this item is in (for multi-row layouts)
        const itemRow = Math.floor((closestRect.top - containerRect.top) / closestRect.height);

        // Get all items in the same row
        const itemsInSameRow = items.filter(item => {
            const itemRect = item.getBoundingClientRect();
            const row = Math.floor((itemRect.top - containerRect.top) / itemRect.height);
            return row === itemRow;
        });

        // Sort items in this row by their x position
        itemsInSameRow.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            return rectA.left - rectB.left;
        });

        // Find where in this row the mouse is positioned
        const mousePositionInRow = itemsInSameRow.findIndex(item => {
            const rect = item.getBoundingClientRect();
            return mouseX < rect.left + rect.width / 2;
        });

        // Show the drop indicator
        dropIndicator.style.display = 'block';
        dropIndicator.style.height = `${closestRect.height}px`;
        dropIndicator.style.animation = 'pulse 1s infinite';
        dropIndicator.style.boxShadow = '0 0 10px 2px rgba(0, 170, 255, 0.8)';

        if (mousePositionInRow === -1) {
            // Mouse is after the last item in this row
            const lastItemInRow = itemsInSameRow[itemsInSameRow.length - 1];
            const lastRect = lastItemInRow.getBoundingClientRect();
            dropIndicator.style.left = `${lastRect.right - 2}px`;
            dropIndicator.style.top = `${lastRect.top}px`;
        } else {
            // Mouse is before or at an item in this row
            const targetItem = itemsInSameRow[mousePositionInRow];
            const targetRect = targetItem.getBoundingClientRect();
            dropIndicator.style.left = `${targetRect.left - 2}px`;
            dropIndicator.style.top = `${targetRect.top}px`;
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

    // Get the container's bounding rect to determine edges
    const containerRect = toggleImagesContainer.getBoundingClientRect();

    // Check if we're near the left edge of the container
    const isNearLeftEdge = mouseX < containerRect.left + 40; // 40px threshold

    // Check if we're near the right edge of the container
    const isNearRightEdge = mouseX > containerRect.right - 40; // 40px threshold

    // If we're near the left edge, insert at the beginning
    if (isNearLeftEdge) {
        console.log('Near left edge, inserting at beginning');
        const firstItem = items[0];
        if (firstItem) {
            toggleImagesContainer.insertBefore(draggedItem, firstItem);
        } else {
            toggleImagesContainer.appendChild(draggedItem);
        }
        updateToggleImagesPositions();
        return false;
    }

    // If we're near the right edge, append to the end
    if (isNearRightEdge) {
        console.log('Near right edge, appending to end');
        toggleImagesContainer.appendChild(draggedItem);
        updateToggleImagesPositions();
        return false;
    }

    // For positions not near edges, find the closest item
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
        // Get the row this item is in (for multi-row layouts)
        const itemRow = Math.floor((closestRect.top - containerRect.top) / closestRect.height);

        // Get all items in the same row
        const itemsInSameRow = items.filter(item => {
            const itemRect = item.getBoundingClientRect();
            const row = Math.floor((itemRect.top - containerRect.top) / itemRect.height);
            return row === itemRow;
        });

        // Sort items in this row by their x position
        itemsInSameRow.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            return rectA.left - rectB.left;
        });

        // Find where in this row the mouse is positioned
        const mousePositionInRow = itemsInSameRow.findIndex(item => {
            const rect = item.getBoundingClientRect();
            return mouseX < rect.left + rect.width / 2;
        });

        if (mousePositionInRow === -1) {
            // Mouse is after the last item in this row
            const lastItemInRow = itemsInSameRow[itemsInSameRow.length - 1];
            toggleImagesContainer.insertBefore(draggedItem, lastItemInRow.nextSibling);
        } else {
            // Mouse is before or at an item in this row
            const targetItem = itemsInSameRow[mousePositionInRow];
            toggleImagesContainer.insertBefore(draggedItem, targetItem);
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

// Helper function to detect mobile devices
function isMobileDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

// Helper function to enhance drag and drop visualization
function enhanceDragDropVisualization() {
    // Add visual cues for drop zones between slots
    document.querySelectorAll('.team-images').forEach(container => {
        // First, remove any existing drop zone indicators to prevent duplicates
        container.querySelectorAll('.drop-zone-indicator').forEach(indicator => {
            indicator.remove();
        });

        // Add a class to indicate this container supports between-slot dropping
        container.classList.add('supports-between-drops');

        // Add drop zone indicators at the beginning and end of the container
        const startDropZone = document.createElement('div');
        startDropZone.className = 'drop-zone-indicator start-zone';
        container.prepend(startDropZone);

        const endDropZone = document.createElement('div');
        endDropZone.className = 'drop-zone-indicator end-zone';
        container.appendChild(endDropZone);

        // Ensure we have exactly 5 image slots
        const imageSlots = Array.from(container.children).filter(child =>
            child.classList && child.classList.contains('image-slot'));

        if (imageSlots.length !== 5) {
            console.log(`Container has ${imageSlots.length} image slots, fixing...`);

            // Remove all non-indicator elements
            Array.from(container.children).forEach(child => {
                if (child.classList &&
                    !child.classList.contains('drop-zone-indicator') &&
                    !child.classList.contains('image-slot')) {
                    container.removeChild(child);
                }
            });

            // Re-count image slots
            const currentSlots = Array.from(container.children).filter(child =>
                child.classList && child.classList.contains('image-slot')).length;

            // Add empty slots if needed
            if (currentSlots < 5) {
                for (let i = currentSlots; i < 5; i++) {
                    const emptySlot = document.createElement('div');
                    emptySlot.className = 'image-slot empty';
                    // Insert before the end drop zone
                    container.insertBefore(emptySlot, endDropZone);
                }
            }
        }
    });
}

// Helper function to add mobile-specific classes
function setupMobileClasses() {
    if (isMobileDevice()) {
        document.body.classList.add('mobile-device');

        // Add touch feedback to draggable elements
        setupTouchListeners();

        // Set up a mutation observer to watch for new image slots
        setupMutationObserver();
    }
}

// Add touch event listeners to image slots
function setupTouchListeners(parent = document) {
    const imageSlots = parent.querySelectorAll('.image-slot');
    imageSlots.forEach(slot => {
        // Remove existing listeners to prevent duplicates
        slot.removeEventListener('touchstart', touchStartHandler);
        slot.removeEventListener('touchend', touchEndHandler);
        slot.removeEventListener('touchcancel', touchEndHandler);

        // Add new listeners
        slot.addEventListener('touchstart', touchStartHandler, { passive: true });
        slot.addEventListener('touchend', touchEndHandler, { passive: true });
        slot.addEventListener('touchcancel', touchEndHandler, { passive: true });
    });
}

// Touch event handlers
function touchStartHandler() {
    this.classList.add('touch-active');
}

function touchEndHandler() {
    this.classList.remove('touch-active');
}

// Set up mutation observer to watch for new image slots
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes are image slots or contain image slots
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.classList && node.classList.contains('image-slot')) {
                            // This is an image slot, add touch listeners
                            setupTouchListeners(node.parentNode);
                        } else if (node.querySelectorAll) {
                            // Check if this node contains any image slots
                            const slots = node.querySelectorAll('.image-slot');
                            if (slots.length > 0) {
                                setupTouchListeners(node);
                            }
                        }
                    }
                });
            }
        });
    });

    // Observe the entire document for changes to the DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Function to toggle filter debug mode
function toggleFilterDebugMode() {
    const currentMode = localStorage.getItem('filterDebugMode') === 'true';
    const newMode = !currentMode;
    localStorage.setItem('filterDebugMode', newMode);
    console.log(`Filter debug mode ${newMode ? 'enabled' : 'disabled'}`);

    // Add visual indicator for debug mode
    const debugIndicator = document.getElementById('debugModeIndicator');
    if (debugIndicator) {
        debugIndicator.style.display = newMode ? 'block' : 'none';
    } else if (newMode) {
        const indicator = document.createElement('div');
        indicator.id = 'debugModeIndicator';
        indicator.style.position = 'fixed';
        indicator.style.top = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '5px';
        indicator.style.zIndex = '9999';
        indicator.style.fontSize = '12px';
        indicator.style.fontWeight = 'bold';
        indicator.textContent = 'DEBUG MODE';
        document.body.appendChild(indicator);
    }

    // Refresh filters to see debug output
    updateFilters();
    return newMode;
}

// Initialize
window.onload = async () => {
    // Global variables are already initialized in storage.js

    // Load team names from localStorage
    loadTeamNames();
    updateAllTeamTitles();

    // Setup mobile-specific classes and behaviors
    setupMobileClasses();

    // Enhance drag and drop visualization
    enhanceDragDropVisualization();

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

    // Make sure all burst filter buttons have proper event handlers
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

    // Add event listeners to the gallery burst filter buttons
    document.querySelectorAll('.gallery-header .burst-filter-buttons .burst-btn').forEach(btn => {
        const dataValue = btn.getAttribute('data-value');
        if (dataValue) {
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

    // Copy data attributes from the original photo - ensure all attributes are lowercase for consistency
    toggleItem.setAttribute('data-number', photoElement.getAttribute('data-number') || '');
    toggleItem.setAttribute('data-name', photoElement.getAttribute('data-name') || '');
    toggleItem.setAttribute('data-type', (photoElement.getAttribute('data-type') || '').toLowerCase());
    toggleItem.setAttribute('data-position', (photoElement.getAttribute('data-position') || '').toLowerCase());
    toggleItem.setAttribute('data-faction', (photoElement.getAttribute('data-faction') || '').toLowerCase());
    toggleItem.setAttribute('data-rarity', (photoElement.getAttribute('data-rarity') || '').toLowerCase());
    toggleItem.setAttribute('data-weapon', (photoElement.getAttribute('data-weapon') || '').toLowerCase());

    // Store the original position value for filtering (separate from dataset.position used for drag-and-drop)
    toggleItem.setAttribute('data-original-position', (photoElement.getAttribute('data-position') || '').toLowerCase());

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

    // Make sure we have a valid data-original-position attribute
    if (!toggleItem.getAttribute('data-original-position') || toggleItem.getAttribute('data-original-position') === '') {
        // Try to extract position from the filename
        const filename = imgSrc.split('/').pop();
        // Look for position patterns like _atk_, _def_, _sp_ in the filename
        const posMatch = filename.match(/_(atk|def|sp)_/i);
        if (posMatch && posMatch[1]) {
            const extractedPosition = posMatch[1].toLowerCase();
            console.log('Extracted position from filename for toggle item:', extractedPosition);
            toggleItem.setAttribute('data-original-position', extractedPosition);
        } else {
            // If we can't extract from filename, use the original position
            const originalPosition = photoElement.getAttribute('data-position');
            if (originalPosition && !/^\d+$/.test(originalPosition)) {
                toggleItem.setAttribute('data-original-position', originalPosition.toLowerCase());
            } else {
                // Default to 'atk' if all else fails
                toggleItem.setAttribute('data-original-position', 'atk');
                console.log('Using default position "atk" for toggle item');
            }
        }
    }

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

// Refresh the selected state of images based on team slots
function refreshSelectedImages() {
    console.log('Refreshing selected state of images');

    // First, get all images in team slots
    const teamImageSources = Array.from(document.querySelectorAll('.team-images .image-slot img'))
        .map(img => img.src);

    console.log(`Found ${teamImageSources.length} images in team slots`);

    // Apply green borders to all images that are in team slots
    document.querySelectorAll('.photo img, .toggle-item img').forEach(img => {
        const isInTeamSlot = teamImageSources.includes(img.src);

        if (isInTeamSlot) {
            // Add selected class if not already present
            img.classList.add('selected');

            // Apply green border styling
            img.style.border = '3px solid #00ff00';
            img.style.outline = '1px solid #ffffff';
            img.style.boxShadow = '0 0 8px #00ff00';
            img.style.zIndex = '10';
            img.style.position = 'relative';
        } else {
            // Remove selected class and styles
            img.classList.remove('selected');
            img.style.border = '';
            img.style.outline = '';
            img.style.boxShadow = '';
            img.style.zIndex = '';
            img.style.position = '';
        }
    });

    // Update selection state in localStorage
    updateToggleImageSelectionState(currentTeamSet);

    console.log('Finished refreshing selected state of images');
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

// Function to edit team name
function editTeamName(setId) {
    const baseName = setId === '1' ? 'Defender' : 'Attacker';
    const currentName = teamNames[setId] || '';
    const newName = prompt(`Enter a custom name for ${baseName}:`, currentName);

    if (newName !== null) { // User didn't cancel
        updateTeamName(setId, newName.trim());
    }
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

                // Clear the custom team name
                teamNames[currentTeamSet] = '';
                updateTeamTitle(currentTeamSet);
                saveTeamNames();
                console.log(`Cleared custom name for team set ${currentTeamSet}`);

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
    console.log(`Switching to team set: ${setId}`);

    // Save current toggle images before switching
    saveCurrentToggleImages();

    // Update current team set
    currentTeamSet = setId;
    console.log(`Current team set updated to: ${currentTeamSet}`);

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
            console.log(`Made team set ${setId} visible`);
        } else {
            container.style.display = 'none';
            container.classList.add('hidden');
        }
    });

    // Update team score for the current team set
    updateTeamScore();

    // Update the green border lines for the current team set
    updateToggleImageSelectionState(setId);

    // Save the current team set to localStorage with a slight delay to ensure all updates are processed
    setTimeout(() => {
        try {
            // First try to get existing data
            const existingData = localStorage.getItem(STORAGE_KEY);
            if (existingData) {
                const parsedData = JSON.parse(existingData);
                parsedData.currentTeamSet = setId;

                // Update the team sets data to ensure it's current
                if (parsedData.teamSets && Array.isArray(parsedData.teamSets)) {
                    // Save team data for SET1 and SET2
                    for (let i = 1; i <= 2; i++) {
                        const teams = document.querySelectorAll(`#teamSet${i} .team-images`);
                        const teamsData = Array.from(teams).map(team => ({
                            images: Array.from(team.querySelectorAll('.image-slot img')).map(img => ({
                                src: img.src,
                                score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
                            }))
                        }));

                        // Update the team set data
                        if (i <= parsedData.teamSets.length) {
                            parsedData.teamSets[i-1] = teamsData;
                        } else {
                            parsedData.teamSets.push(teamsData);
                        }
                    }
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
                console.log(`Updated currentTeamSet to ${setId} and team data in localStorage`);
            } else {
                // If no existing data, save everything
                saveSelectionToLocalStorage();
            }
        } catch (error) {
            console.error('Error updating team set in localStorage:', error);
            // Fall back to saving everything
            saveSelectionToLocalStorage();
        }
    }, 100);

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
                <button id="importFromCodeBtn">Import from Code</button>
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

    const importFromCodeBtn = modal.querySelector('#importFromCodeBtn');
    if (importFromCodeBtn) {
        importFromCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Show the import from code dialog
            showImportFromCodeDialog(modal);
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

    // No alert message for successful import
    if (importCount > 0) {
        console.log(`Images imported successfully: ${importCount} images`);
    } else {
        console.log('No new images were imported.');
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
            selected: img.classList.contains('selected'),
            order: item.dataset.position || '0' // Include order for drag-and-drop positioning
        };
    });

    const exportData = {
        version: '1.0',
        type: 'nikke-portrait-my-nikkes',
        timestamp: new Date().toISOString(),
        toggleImages: toggleImagesData
    };

    // Ask user if they want to export as JSON file or generate a shareable code
    const exportType = confirm(
        'How would you like to export your My Nikkes selection?\n\n' +
        'Click OK to generate a shareable code (good for Discord).\n' +
        'Click Cancel to download as a JSON file (good for backup).'
    );

    if (exportType) {
        // Generate shareable code
        const shareableCode = generateShareableCodeForMyNikkes(exportData);
        if (shareableCode) {
            // Show the code in a dialog
            showShareableCodeDialog(shareableCode);
        }
    } else {
        // Export as JSON file
        // Convert to JSON string
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
}

// Function to generate a shareable code for My Nikkes - ultra-optimized version
function generateShareableCodeForMyNikkes(data) {
    try {
        // Extract just the essential data we need - the image IDs
        const imageIds = data.toggleImages.map(item => {
            // Extract the ID from the image source
            const src = item.src;
            const filename = src.split('/').pop();
            // Extract just the numeric part before the underscore (e.g., "100_name.png" -> "100")
            const id = filename.split('_')[0];
            return id;
        });

        // Create a compact string representation - just a comma-separated list of IDs
        const compactString = imageIds.join(',');

        // Log compression stats
        const jsonSize = JSON.stringify(data).length;
        console.log('Original JSON size:', jsonSize, 'bytes');
        console.log('Compact string size:', compactString.length, 'bytes');
        console.log('Size reduction:', Math.round((1 - compactString.length / jsonSize) * 100) + '%');

        // Compress using LZString
        const compressed = LZString.compressToEncodedURIComponent(compactString);
        console.log('Compressed size:', compressed.length, 'bytes');
        console.log('Final compression ratio:', Math.round((compressed.length / jsonSize) * 100) + '%');

        return compressed;
    } catch (error) {
        console.error('Error generating shareable code:', error);
        alert('Error generating shareable code: ' + error.message);
        return null;
    }
}

// Helper function to show a temporary message
function showTemporaryMessage(text, duration = 1500) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9999';
    message.style.fontSize = '16px';
    message.style.fontWeight = 'bold';
    document.body.appendChild(message);

    // Remove the message after the specified duration
    setTimeout(() => {
        document.body.removeChild(message);
    }, duration);
}

// Function to show the shareable code in a dialog
function showShareableCodeDialog(code) {
    // First, try to copy the code to clipboard automatically
    navigator.clipboard.writeText(code)
        .then(() => {
            console.log('Shareable code automatically copied to clipboard');
            showTemporaryMessage('Copied!'); // Show a temporary message
        })
        .catch(err => {
            console.error('Could not automatically copy code to clipboard:', err);
            // We'll let the user copy manually via the button
        });

    // Create a modal for the shareable code
    const modal = document.createElement('div');
    modal.className = 'import-modal';
    modal.innerHTML = `
        <div class="import-modal-content">
            <h2>Shareable Code for My Nikkes</h2>
            <p>Shareable code copied to clipboard!</p>
            <textarea id="shareableCodeArea" style="width: 100%; height: 100px; margin: 10px 0; padding: 10px; background-color: #333; color: white; border: 1px solid #555; border-radius: 5px;">${code}</textarea>
            <div class="import-controls">
                <button id="copyCodeBtn">Copy to Clipboard</button>
                <button id="closeCodeDialogBtn">Close</button>
            </div>
        </div>
    `;

    // Add the modal to the body
    document.body.appendChild(modal);

    // Add event handlers for buttons
    const copyCodeBtn = modal.querySelector('#copyCodeBtn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get the code from the textarea
            const codeArea = modal.querySelector('#shareableCodeArea');
            if (codeArea) {
                // Select the text
                codeArea.select();
                codeArea.setSelectionRange(0, 99999); // For mobile devices

                // Copy to clipboard
                navigator.clipboard.writeText(codeArea.value)
                    .then(() => {
                        showTemporaryMessage('Copied!'); // Show a temporary message
                    })
                    .catch(err => {
                        console.error('Could not copy code to clipboard:', err);
                        // Fallback for browsers that don't support clipboard API
                        try {
                            codeArea.select();
                            codeArea.setSelectionRange(0, 99999);
                            document.execCommand('copy');
                            showTemporaryMessage('Copied!'); // Show a temporary message
                        } catch (e) {
                            alert('Could not copy to clipboard. Please copy manually.');
                        }
                    });
            }
        });
    }

    const closeCodeDialogBtn = modal.querySelector('#closeCodeDialogBtn');
    if (closeCodeDialogBtn) {
        closeCodeDialogBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close the modal
            modal.remove();
        });
    }

    // Select the text in the textarea for easy manual copying
    setTimeout(() => {
        const codeArea = modal.querySelector('#shareableCodeArea');
        if (codeArea) {
            codeArea.select();
            codeArea.setSelectionRange(0, 99999); // For mobile devices
        }
    }, 100);
}

// Function to show the import from code dialog
function showImportFromCodeDialog(parentModal) {
    // Create a modal for the import from code dialog
    const modal = document.createElement('div');
    modal.className = 'import-modal';
    modal.innerHTML = `
        <div class="import-modal-content">
            <h2>Import My Nikkes from Code</h2>
            <p>Paste the shareable code below:</p>
            <textarea id="importCodeArea" style="width: 100%; height: 100px; margin: 10px 0; padding: 10px; background-color: #333; color: white; border: 1px solid #555; border-radius: 5px;"></textarea>
            <div class="import-controls">
                <button id="importCodeBtn">Import</button>
                <button id="cancelImportCodeBtn">Cancel</button>
            </div>
        </div>
    `;

    // Add the modal to the body
    document.body.appendChild(modal);

    // Add event handlers for buttons
    const importCodeBtn = modal.querySelector('#importCodeBtn');
    if (importCodeBtn) {
        importCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get the code from the textarea
            const codeArea = modal.querySelector('#importCodeArea');
            if (codeArea && codeArea.value.trim()) {
                // Import from the shareable code
                importFromShareableCode(codeArea.value.trim());

                // Close both modals
                modal.remove();
                if (parentModal) parentModal.remove();
            } else {
                alert('Please enter a valid shareable code.');
            }
        });
    }

    const cancelImportCodeBtn = modal.querySelector('#cancelImportCodeBtn');
    if (cancelImportCodeBtn) {
        cancelImportCodeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Close the modal
            modal.remove();
        });
    }
}

// Function to import from a shareable code - ultra-optimized version
function importFromShareableCode(code) {
    try {
        // Decompress the code using LZString
        const decompressed = LZString.decompressFromEncodedURIComponent(code);
        if (!decompressed) {
            throw new Error('Invalid shareable code. Could not decompress.');
        }

        // Check if it's our new ultra-compact format (just comma-separated IDs)
        let imageIds = [];
        let data = null;

        // Try to parse as JSON first (for old format)
        try {
            data = JSON.parse(decompressed);

            // Check if it's the old format
            if (data && data.toggleImages && Array.isArray(data.toggleImages)) {
                // Process the toggle images data from old format
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

                // Extract IDs from image sources
                imageIds = imageSources.map(src => {
                    const filename = src.split('/').pop();
                    return filename.split('_')[0]; // Extract ID
                });
            } else {
                throw new Error('Not a valid old format');
            }
        } catch (e) {
            // Not valid JSON, try parsing as our compact format

            // Check if it contains commas (our compact format)
            if (decompressed.includes(',')) {
                // Parse the comma-separated IDs
                imageIds = decompressed.split(',').filter(id => id.trim() !== '');
            } else {
                // Single ID
                imageIds = [decompressed];
            }
        }

        // Validate the data
        if (!imageIds || imageIds.length === 0) {
            throw new Error('Invalid data format. No image IDs found.');
        }

        // Confirm with the user
        const shouldImport = confirm('This will add the Nikkes from the shareable code to your current selection. Continue?');
        if (!shouldImport) return;

        // Get the toggle images container
        const toggleImagesContainer = document.querySelector('#toggleImages');
        if (!toggleImagesContainer) {
            throw new Error('Toggle images container not found.');
        }

        // Get existing toggle image sources to avoid duplicates
        const existingToggleImageSources = Array.from(toggleImagesContainer.querySelectorAll('.toggle-item img'))
            .map(img => img.src);
        console.log(`Found ${existingToggleImageSources.length} existing toggle images`);

        // Convert image IDs to full image sources
        const imageSources = imageIds.map(id => `image/${id}_name.png`);
        console.log(`Converted ${imageSources.length} image IDs to sources`);

        // Filter out images that already exist in the toggle container
        const newImageSources = imageSources.filter(src => {
            // Check if this image source or a similar one already exists
            return !existingToggleImageSources.some(existingSrc => {
                // Compare the filenames to handle different URL formats
                const existingFilename = existingSrc.split('/').pop();
                const newFilename = src.split('/').pop();
                return existingFilename === newFilename;
            });
        });

        console.log(`Found ${newImageSources.length} new images to import after filtering duplicates`);

        // Import the toggle images
        if (newImageSources.length > 0) {
            // Clear the userClearedSelection flag since we're loading data
            localStorage.removeItem('userClearedSelection');
            console.log('Loading data from shareable code, clearing userClearedSelection flag');

            importImagesToToggleGallery(newImageSources);

            // After importing, ensure green borders are applied to images in team slots
            setTimeout(() => {
                updateToggleImageSelectionState(currentTeamSet);
                console.log('Updated green borders for loaded images');
            }, 500);

            // No alert message for successful import
            console.log(`Shareable code imported successfully: ${newImageSources.length} new images`);
        } else {
            alert('No new images found in the shareable code. All images already exist in your collection.');
        }
    } catch (error) {
        console.error('Error importing from shareable code:', error);
        alert(`Error importing from shareable code: ${error.message}`);
    }
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
    teamSetsContainer.style.justifyContent = 'space-between';
    teamSetsContainer.style.flexDirection = 'row'; // Side by side
    teamSetsContainer.style.gap = '20px'; // Better spacing between sets
    teamSetsContainer.style.width = '100%';
    teamSetsContainer.style.minWidth = '850px'; // Ensure minimum width for high resolution
    teamSetsContainer.style.maxWidth = '850px'; // Increased maximum width for higher resolution
    teamSetsContainer.style.backgroundColor = '#151515'; // Slightly lighter background
    teamSetsContainer.style.padding = '20px'; // Increased padding
    teamSetsContainer.style.borderRadius = '8px';
    teamSetsContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'; // Add shadow for depth
    teamSetsContainer.style.boxSizing = 'border-box';

    // Make it responsive
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    if (mediaQuery.matches) {
        // Mobile-specific styles for the export container
        exportContainer.style.padding = '5px';
        exportContainer.style.justifyContent = 'flex-start';

        // Mobile-specific styles for the team sets container
        teamSetsContainer.style.flexDirection = 'column';
        teamSetsContainer.style.gap = '15px'; // Increased gap for vertical layout
        teamSetsContainer.style.minWidth = 'unset'; // Remove minimum width constraint
        teamSetsContainer.style.maxWidth = '100%'; // Allow full width
        teamSetsContainer.style.width = '95%'; // Set width to 95% of viewport to ensure margins
        teamSetsContainer.style.padding = '12px'; // Reduced padding
        teamSetsContainer.style.marginTop = '10px'; // Add some margin at the top
        teamSetsContainer.style.overflowX = 'hidden'; // Prevent horizontal scrolling
        teamSetsContainer.style.boxSizing = 'border-box'; // Ensure padding is included in width
    }

    // Create a header container for the title with improved design
    const headerContainer = document.createElement('div');
    headerContainer.style.width = '100%';
    headerContainer.style.textAlign = 'center';
    headerContainer.style.marginBottom = mediaQuery.matches ? '5px' : '10px'; // Reduced margin on mobile

    // Add title with improved design
    const title = document.createElement('h2');
    title.textContent = 'Arena Battle';
    title.style.color = '#fff';
    title.style.margin = '0';
    title.style.fontSize = mediaQuery.matches ? '20px' : '24px'; // Smaller font size on mobile
    title.style.fontWeight = '600'; // Semi-bold
    title.style.padding = mediaQuery.matches ? '8px 0' : '10px 0'; // Reduced padding on mobile
    title.style.letterSpacing = '0.5px'; // Slight letter spacing for better readability
    title.style.marginBottom = mediaQuery.matches ? '10px' : '15px'; // Reduced margin on mobile
    title.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)'; // Add text shadow for better visibility
    headerContainer.appendChild(title);

    // Add the header before the team sets container
    exportContainer.appendChild(headerContainer);

    // Clone both team sets
    const teamSet1 = document.querySelector('#teamSet1').cloneNode(true);
    const teamSet2 = document.querySelector('#teamSet2').cloneNode(true);

    // Disable Sortable.js functionality in the cloned team sets
    teamSet1.querySelectorAll('.team-images, .image-slot').forEach(el => {
        el.classList.add('no-sortable');
    });
    teamSet2.querySelectorAll('.team-images, .image-slot').forEach(el => {
        el.classList.add('no-sortable');
    });

    // Remove edit team name buttons from the cloned team sets
    teamSet1.querySelectorAll('.edit-team-name-btn').forEach(btn => btn.remove());
    teamSet2.querySelectorAll('.edit-team-name-btn').forEach(btn => btn.remove());

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

        // Remove drag and drop visual elements
        teamSet.querySelectorAll('.target-indicator, .path-dot, .path-arrow, .sortable-ghost, .sortable-fallback, .being-dragged').forEach(el => {
            el.remove();
        });

        // Remove any drag-related classes and disable drag/touch events
        teamSet.querySelectorAll('.image-slot').forEach(slot => {
            slot.classList.remove('drag-over', 'drag-target', 'drop-zone-highlight');
            // Remove any inline styles related to drag and drop
            if (slot.hasAttribute('style')) {
                const style = slot.getAttribute('style');
                if (style.includes('border') || style.includes('background')) {
                    slot.removeAttribute('style');
                }
            }

            // Add a class to hide the ::before pseudo-element (drag handle)
            slot.classList.add('export-view');

            // Disable draggable attribute
            slot.setAttribute('draggable', 'false');

            // Remove all touch and drag event listeners
            const newSlot = slot.cloneNode(true);
            slot.parentNode.replaceChild(newSlot, slot);

            // Ensure any images inside are also not draggable
            const img = newSlot.querySelector('img');
            if (img) {
                img.setAttribute('draggable', 'false');
                img.style.pointerEvents = 'none'; // Prevent touch/click events
            }
        });

        // Add a style element to hide the image-slot::before pseudo-element
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-export-view', 'true'); // Add data attribute for easier identification
        styleElement.textContent = `
            .export-view::before {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
            }

            .export-view {
                touch-action: none !important;
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
            }

            .export-view img {
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
            }

            .no-sortable {
                touch-action: none !important;
                pointer-events: none !important;
                user-select: none !important;
                -webkit-user-drag: none !important;
                cursor: default !important;
            }

            /* Hide the 'tap and hold to drag' text */
            .team-row::after {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                content: '' !important;
            }
        `;
        document.head.appendChild(styleElement);
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
        teamSet.style.paddingTop = '35px'; // Extra padding at top for SET label
        teamSet.style.paddingBottom = '30px'; // Extra padding at bottom for custom name label
        teamSet.style.margin = '0';
        teamSet.style.boxSizing = 'border-box';
        teamSet.style.backgroundColor = '#1e1e1e'; // Better background color
        teamSet.style.borderRadius = '8px'; // Better rounding
        teamSet.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'; // Enhanced shadow
        teamSet.style.minWidth = '350px'; // Minimum width for team set
        teamSet.style.maxWidth = '400px'; // Maximum width for team set

        // Add top label for Defender/Attacker
        const topLabel = document.createElement('div');
        const setId = (index + 1).toString();
        const baseName = index === 0 ? 'Defender' : 'Attacker';
        topLabel.textContent = baseName;
        topLabel.style.position = 'absolute';
        topLabel.style.top = '0';
        topLabel.style.left = '50%'; // Center horizontally
        topLabel.style.transform = 'translateX(-50%)'; // Center horizontally
        topLabel.style.fontSize = '18px'; // Increased font size
        topLabel.style.fontWeight = '600'; // Semi-bold
        topLabel.style.color = '#fff'; // Brighter color
        topLabel.style.backgroundColor = index === 0 ? 'rgba(42, 110, 209, 0.9)' : 'rgba(209, 42, 42, 0.9)'; // Different colors for Defender/Attacker
        topLabel.style.padding = '4px 20px'; // Increased padding
        topLabel.style.borderRadius = '0 0 10px 10px'; // Rounded bottom corners
        topLabel.style.boxShadow = '0 3px 6px rgba(0,0,0,0.4)'; // Enhanced shadow
        topLabel.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)'; // Text shadow for better readability
        topLabel.style.zIndex = '5'; // Ensure it's above other elements
        teamSet.style.position = 'relative'; // For absolute positioning of the label
        teamSet.appendChild(topLabel);

        // Add bottom label for custom team name (if exists)
        const customName = teamNames[setId];
        if (customName) {
            const bottomLabel = document.createElement('div');
            bottomLabel.textContent = customName;
            bottomLabel.style.position = 'absolute';
            bottomLabel.style.bottom = '0%';
            bottomLabel.style.left = '50%'; // Center horizontally
            bottomLabel.style.transform = 'translateX(-50%)'; // Center horizontally
            bottomLabel.style.fontSize = '16px'; // Slightly smaller than top label
            bottomLabel.style.fontWeight = '500'; // Medium weight
            bottomLabel.style.color = '#fff'; // Brighter color
            bottomLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Dark background for contrast
            bottomLabel.style.padding = '5px 10px'; // Slightly smaller padding
            bottomLabel.style.borderRadius = '10px 10px 0 0'; // Rounded top corners
            bottomLabel.style.boxShadow = '0 -2px 4px rgba(0,0,0,0.3)'; // Shadow pointing up
            bottomLabel.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)'; // Text shadow for better readability
            bottomLabel.style.zIndex = '5'; // Ensure it's above other elements
            bottomLabel.style.maxWidth = '90%'; // Prevent overflow
            bottomLabel.style.overflow = 'hidden'; // Hide overflow
            bottomLabel.style.textOverflow = 'ellipsis'; // Add ellipsis for long text
            bottomLabel.style.whiteSpace = 'nowrap'; // Prevent wrapping
            teamSet.appendChild(bottomLabel);
        }

        // Make responsive
        if (mediaQuery.matches) {

            teamSetsContainer.style.gap = '5px'; // Increased gap for vertical layout
            teamSetsContainer.style.minWidth = '350px'; // Remove minimum width constraint
            teamSetsContainer.style.maxWidth = '380px';
            teamSetsContainer.style.minHeight = '690px';
            teamSet.style.width = '480px';
            teamSet.style.left = '0%';
            teamSet.style.top = '10px';
            teamSet.style.minWidth = '340px'; // Remove minimum width constraint on mobile
            teamSet.style.maxWidth = '360px'; // Allow full width on mobile
            teamSet.style.paddingBottom = '40px'; // Extra padding at bottom for custom name label on mobile
            teamSet.style.boxSizing = 'border-box'; // Ensure padding is included in width
            teamSet.style.transform = 'scale(0.95)'; // Slightly scale down to ensure it fits
            teamSet.style.transformOrigin = 'center top'; // Scale from center top

            // Adjust top label for mobile
            if (topLabel) {
                topLabel.style.fontSize = '16px'; // Smaller font size on mobile
                topLabel.style.padding = '5px 15px'; // Smaller padding on mobile
            }

            // Adjust bottom label for mobile
            const bottomLabel = teamSet.querySelector('div:last-child:not(.team-row)');
            if (bottomLabel && customName) {
                bottomLabel.style.fontSize = '14px'; // Smaller font size on mobile
                bottomLabel.style.padding = '4px 12px'; // Smaller padding on mobile
                bottomLabel.style.maxWidth = '85%'; // Narrower on mobile
            }
        }

        // Redesign team rows with better proportions
        const teamRows = teamSet.querySelectorAll('.team-row');
        teamRows.forEach(row => {
            row.style.height = mediaQuery.matches ? '45px' : '50px'; // Smaller height on mobile
            row.style.marginBottom = mediaQuery.matches ? '6px' : '8px'; // Smaller margin on mobile
            row.style.padding = mediaQuery.matches ? '4px 6px' : '5px 8px'; // Smaller padding on mobile
            row.style.backgroundColor = '#252525'; // Better background
            row.style.borderRadius = '6px'; // Better rounding
            row.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)'; // Enhanced shadow
            row.style.maxWidth = mediaQuery.matches ? '100%' : '440px'; // Full width on mobile
            row.style.width = mediaQuery.matches ? '100%' : 'auto'; // Full width on mobile
            row.style.display = 'flex'; // Ensure flex display
            row.style.alignItems = 'center'; // Center items vertically
            row.style.boxSizing = 'border-box'; // Ensure padding is included in width

            // Redesign image slots with better proportions
            const imageSlots = row.querySelectorAll('.image-slot');
            imageSlots.forEach(slot => {
                // Adjust size based on device
                slot.style.width = mediaQuery.matches ? '36px' : '42px'; // Smaller on mobile
                slot.style.height = mediaQuery.matches ? '36px' : '42px'; // Smaller on mobile
                slot.style.margin = mediaQuery.matches ? '0 1px' : '0 2px'; // Smaller margin on mobile
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
                teamImages.style.height = mediaQuery.matches ? '36px' : '42px'; // Match image slot height
                teamImages.style.gap = mediaQuery.matches ? '2px' : '3px'; // Smaller gap on mobile
                teamImages.style.marginLeft = mediaQuery.matches ? '4px' : '6px'; // Smaller margin on mobile
                teamImages.style.marginRight = mediaQuery.matches ? '4px' : '6px'; // Smaller margin on mobile
                teamImages.style.display = 'flex'; // Ensure flex display
                teamImages.style.alignItems = 'center'; // Center items vertically
                teamImages.style.flex = '1'; // Take available space
                teamImages.style.justifyContent = 'center'; // Center items horizontally
            }

            // Redesign team label with better proportions
            const teamLabel = row.querySelector('.team-label');
            if (teamLabel) {
                teamLabel.style.width = mediaQuery.matches ? '28px' : '32px'; // Smaller on mobile
                teamLabel.style.height = mediaQuery.matches ? '28px' : '32px'; // Smaller on mobile
                teamLabel.style.fontSize = mediaQuery.matches ? '12px' : '14px'; // Smaller font on mobile
                teamLabel.style.fontWeight = '600'; // Semi-bold
                teamLabel.style.padding = '0'; // No padding
                teamLabel.style.display = 'flex';
                teamLabel.style.alignItems = 'center';
                teamLabel.style.justifyContent = 'center';
                teamLabel.style.marginRight = mediaQuery.matches ? '6px' : '8px'; // Smaller margin on mobile
                teamLabel.style.backgroundColor = '#333'; // Background color
                teamLabel.style.borderRadius = '4px'; // Rounded corners
                teamLabel.style.color = '#fff'; // Text color
                teamLabel.style.flexShrink = '0'; // Prevent shrinking
            }

            // Redesign team score with better proportions
            const teamScore = row.querySelector('.team-score');
            if (teamScore) {
                teamScore.style.width = mediaQuery.matches ? '50px' : '60px'; // Smaller width on mobile
                teamScore.style.fontSize = mediaQuery.matches ? '12px' : '14px'; // Smaller font on mobile
                teamScore.style.fontWeight = '500'; // Medium weight
                teamScore.style.padding = mediaQuery.matches ? '0 4px' : '0 6px'; // Smaller padding on mobile
                teamScore.style.display = 'flex';
                teamScore.style.alignItems = 'center';
                teamScore.style.justifyContent = 'flex-end'; // Right align
                teamScore.style.marginLeft = 'auto'; // Push to the right
                teamScore.style.borderRadius = '3px'; // Rounded corners
                teamScore.style.flexShrink = '0'; // Prevent shrinking

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
    buttonsContainer.style.gap = mediaQuery.matches ? '8px' : '10px'; // Reduced spacing on mobile
    buttonsContainer.style.marginTop = mediaQuery.matches ? '10px' : '12px'; // Reduced margin on mobile
    buttonsContainer.style.flexWrap = mediaQuery.matches ? 'wrap' : 'nowrap'; // Allow wrapping on mobile

    // Add export button with improved design
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export as JPEG';
    exportButton.style.padding = mediaQuery.matches ? '6px 12px' : '8px 16px'; // Smaller padding on mobile
    exportButton.style.backgroundColor = '#2a6ed1'; // Blue color
    exportButton.style.color = '#fff';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    exportButton.style.fontSize = mediaQuery.matches ? '12px' : '13px'; // Smaller font on mobile
    exportButton.style.fontWeight = '500'; // Medium weight
    exportButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Subtle shadow
    exportButton.style.transition = 'background-color 0.2s'; // Smooth hover transition
    exportButton.style.margin = mediaQuery.matches ? '3px' : '0'; // Add margin on mobile for wrapped buttons
    // Add hover effect
    exportButton.onmouseover = function() { this.style.backgroundColor = '#3a7ee1'; };
    exportButton.onmouseout = function() { this.style.backgroundColor = '#2a6ed1'; };
    buttonsContainer.appendChild(exportButton);

    // Add close button with improved design
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = mediaQuery.matches ? '6px 12px' : '8px 16px'; // Smaller padding on mobile
    closeButton.style.backgroundColor = '#444'; // Gray color
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = mediaQuery.matches ? '12px' : '13px'; // Smaller font on mobile
    closeButton.style.fontWeight = '500'; // Medium weight
    closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Subtle shadow
    closeButton.style.transition = 'background-color 0.2s'; // Smooth hover transition
    closeButton.style.margin = mediaQuery.matches ? '3px' : '0'; // Add margin on mobile for wrapped buttons
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
    footerText.textContent = 'Nikkes Arena • Team Builder';
    footerText.style.color = '#666';
    footerText.style.fontSize = mediaQuery.matches ? '9px' : '10px'; // Smaller font on mobile
    footerText.style.marginTop = mediaQuery.matches ? '6px' : '8px'; // Reduced margin on mobile
    footerText.style.textAlign = 'center';
    footerText.style.padding = mediaQuery.matches ? '0 5px 5px' : '0'; // Add bottom padding on mobile
    exportContainer.appendChild(footerText);

    // Add the export container to the body
    document.body.appendChild(exportContainer);

    // Remove any drag path indicators that might be in the DOM
    const dragPathIndicator = document.getElementById('dragPathIndicator');
    if (dragPathIndicator) {
        dragPathIndicator.remove();
    }

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
            // Remove the style element we added for hiding image-slot::before
            const exportStyleElement = document.querySelector('style[data-export-view="true"]');
            if (exportStyleElement) {
                exportStyleElement.remove();
            }
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

    // We no longer clear team slots when removing all toggle images
    console.log('Preserving team slots when removing all toggle images');

    // Update team score
    updateTeamScore();

    // Save the toggle tabs state
    saveToggleTabsToLocalStorage();

    // Update the team-specific toggle images
    saveCurrentToggleImages();

    // Also save to main storage to ensure it's updated
    saveSelectionToLocalStorage();

    // No alert message for successful removal
    console.log('All images have been removed from Nikkes selection');
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

        // Check if there are any team sets with images before loading default data
        let hasTeamSets = false;
        for (let i = 1; i <= 2; i++) {
            const teamContainer = document.querySelector(`#teamSet${i}`);
            if (teamContainer) {
                const teamImages = teamContainer.querySelectorAll('.team-images .image-slot img');
                if (teamImages.length > 0) {
                    hasTeamSets = true;
                    console.log(`Found ${teamImages.length} images in team set ${i}, preserving team sets`);
                    break;
                }
            }
        }

        // If there are team sets with images, don't load default data
        if (hasTeamSets) {
            console.log('Team sets with images found, not loading default data to preserve team sets');
            // Ensure the userClearedSelection flag is set to prevent auto-loading
            localStorage.setItem('userClearedSelection', 'true');

            // Immediately save the current team sets to localStorage to ensure they're preserved
            try {
                const savedDataString = localStorage.getItem(STORAGE_KEY);
                if (savedDataString) {
                    const savedData = JSON.parse(savedDataString);

                    // Collect current team data from DOM
                    const currentTeamSets = [];
                    for (let i = 1; i <= 2; i++) {
                        const teamSet = [];
                        const teamContainer = document.querySelector(`#teamSet${i}`);
                        if (teamContainer) {
                            teamContainer.querySelectorAll('.team-images').forEach(teamRow => {
                                const team = { images: [] };
                                teamRow.querySelectorAll('.image-slot img').forEach(img => {
                                    team.images.push({ src: img.src });
                                });
                                teamSet.push(team);
                            });
                        }
                        currentTeamSets.push(teamSet);
                    }

                    // Update the saved data with current team sets
                    savedData.teamSets = currentTeamSets;

                    // Save immediately without debouncing
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                    console.log('Immediately saved team sets to localStorage to ensure preservation');
                }
            } catch (error) {
                console.error('Error saving team sets to localStorage:', error);
            }

            return;
        }

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

                    // We no longer remove the image from team slots
                    // Keep images in team slots even when removed from toggle gallery
                    console.log(`Keeping image ${src} in team slots even though it's removed from toggle gallery`);

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

                    // We no longer remove images from teamSets in localStorage
                    // This ensures team sets are preserved even when toggle images are removed
                    console.log('Preserving team sets in localStorage when removing toggle images');

                    // Save the updated data back to localStorage
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                    console.log('Updated teamSets data in localStorage to reflect removed images');
                } catch (error) {
                    console.error('Error updating teamSets data in localStorage:', error);
                }
            }

            // Check if all toggle images are now removed
            const remainingToggleItems = toggleImagesContainer.querySelectorAll('.toggle-item');
            if (remainingToggleItems.length === 0) {
                // Check if there are any team sets with images before setting the flag
                let hasTeamSets = false;
                for (let i = 1; i <= 2; i++) {
                    const teamContainer = document.querySelector(`#teamSet${i}`);
                    if (teamContainer) {
                        const teamImages = teamContainer.querySelectorAll('.team-images .image-slot img');
                        if (teamImages.length > 0) {
                            hasTeamSets = true;
                            console.log(`Found ${teamImages.length} images in team set ${i}, preserving team sets`);
                            break;
                        }
                    }
                }

                // Set flag to indicate user intentionally cleared selection
                localStorage.setItem('userClearedSelection', 'true');
                console.log('All images removed, setting userClearedSelection flag');

                // If there are team sets with images, immediately save them to localStorage
                if (hasTeamSets) {
                    try {
                        const savedDataString = localStorage.getItem(STORAGE_KEY);
                        if (savedDataString) {
                            const savedData = JSON.parse(savedDataString);

                            // Collect current team data from DOM
                            const currentTeamSets = [];
                            for (let i = 1; i <= 2; i++) {
                                const teamSet = [];
                                const teamContainer = document.querySelector(`#teamSet${i}`);
                                if (teamContainer) {
                                    teamContainer.querySelectorAll('.team-images').forEach(teamRow => {
                                        const team = { images: [] };
                                        teamRow.querySelectorAll('.image-slot img').forEach(img => {
                                            team.images.push({ src: img.src });
                                        });
                                        teamSet.push(team);
                                    });
                                }
                                currentTeamSets.push(teamSet);
                            }

                            // Update the saved data with current team sets
                            savedData.teamSets = currentTeamSets;

                            // Save immediately without debouncing
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                            console.log('Immediately saved team sets to localStorage to ensure preservation');
                        }
                    } catch (error) {
                        console.error('Error saving team sets to localStorage:', error);
                    }
                }
            }

            // No alert message for successful removal
            console.log(`${selectedSources.length} image${selectedSources.length !== 1 ? 's' : ''} have been removed from Nikkes selection`);

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

            // We no longer clear team slots when removing all toggle images
            console.log('Preserving team slots when removing all toggle images');

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

                    // We no longer clear team images from teamSets in localStorage
                    // This ensures team sets are preserved even when all toggle images are removed
                    console.log('Preserving team sets in localStorage when removing all toggle images');

                    // Save the updated data back to localStorage
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                    console.log('Cleared all toggle images from localStorage');
                } catch (error) {
                    console.error('Error updating localStorage:', error);
                }
            }

            // Set flag to indicate user intentionally cleared selection
            localStorage.setItem('userClearedSelection', 'true');

            // Check if there are any team sets with images before setting the flag
            let hasTeamSets = false;
            for (let i = 1; i <= 2; i++) {
                const teamContainer = document.querySelector(`#teamSet${i}`);
                if (teamContainer) {
                    const teamImages = teamContainer.querySelectorAll('.team-images .image-slot img');
                    if (teamImages.length > 0) {
                        hasTeamSets = true;
                        console.log(`Found ${teamImages.length} images in team set ${i}, preserving team sets`);
                        break;
                    }
                }
            }

            // If there are team sets with images, immediately save them to localStorage
            if (hasTeamSets) {
                try {
                    const savedDataString = localStorage.getItem(STORAGE_KEY);
                    if (savedDataString) {
                        const savedData = JSON.parse(savedDataString);

                        // Collect current team data from DOM
                        const currentTeamSets = [];
                        for (let i = 1; i <= 2; i++) {
                            const teamSet = [];
                            const teamContainer = document.querySelector(`#teamSet${i}`);
                            if (teamContainer) {
                                teamContainer.querySelectorAll('.team-images').forEach(teamRow => {
                                    const team = { images: [] };
                                    teamRow.querySelectorAll('.image-slot img').forEach(img => {
                                        team.images.push({ src: img.src });
                                    });
                                    teamSet.push(team);
                                });
                            }
                            currentTeamSets.push(teamSet);
                        }

                        // Update the saved data with current team sets
                        savedData.teamSets = currentTeamSets;

                        // Save immediately without debouncing
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
                        console.log('Immediately saved team sets to localStorage to ensure preservation');
                    }
                } catch (error) {
                    console.error('Error saving team sets to localStorage:', error);
                }
            }

            // No alert message for successful removal
            console.log('All images have been removed from Nikkes selection');

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
