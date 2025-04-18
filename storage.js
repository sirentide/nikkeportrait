// Storage keys and global variables for the application
const STORAGE_KEY = 'nikkePortraitData';
const TOGGLE_TABS_KEY = 'nikkeToggleTabsData';
const TEAM_NAMES_KEY = 'nikkeTeamNames';

// Global variables
let currentTeamSet = '1'; // Default to team set 1
let currentContentTab = 'toggleImages'; // Default to My Nikkes tab

// Default team names
let teamNames = {
    '1': '', // Custom name for Defender (SET1)
    '2': ''  // Custom name for Attacker (SET2)
};

// Flag to track if we've already shown the import prompt
let importPromptShown = false;

// Global variable to track filter state
let filterVisible = false;

// Global variable to track if we're currently toggling
let isToggling = false;

// Filter panel variables
let filterPanel;
let filterBtn;

// Flag to track if a save operation is in progress
let isSavingData = false;

// Cache for localStorage data to avoid repeated parsing
let cachedStorageData = null;

// Debounce function to prevent excessive save operations
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Shared utility functions
const getCheckedValues = (values) => {
    // Create a selector that matches any checkbox with a value in the values array
    const selector = `input[type="checkbox"][value^="${values.join('"], input[type="checkbox"][value="')}"]`;
    console.log('Checkbox selector:', selector);

    // Get all matching checkboxes that are checked
    const checkedBoxes = Array.from(document.querySelectorAll(selector))
        .filter(chk => chk.checked);

    console.log('Found checked boxes:', checkedBoxes.length);

    // Map to lowercase values for consistency
    return checkedBoxes.map(chk => chk.value.toLowerCase());
};

const getPhotoAttributes = (photo) => {
    // Generate a unique ID for logging purposes
    const itemId = photo.getAttribute('data-number') || Math.floor(Math.random() * 10000);
    const itemType = photo.classList.contains('toggle-item') ? 'toggle' : 'gallery';
    const logPrefix = `[${itemType}-${itemId}]`;

    // Safely get attribute with fallback to empty string if null
    const safeGetAttribute = (element, attr) => {
        const value = element.getAttribute(attr);
        const result = value ? value.toLowerCase() : '';
        return result;
    };

    // Check if this is a toggle-item (which has different structure than photo)
    const isToggleItem = photo.classList.contains('toggle-item');

    // Log the element we're processing
    const debugMode = localStorage.getItem('filterDebugMode') === 'true';
    if (debugMode) {
        console.log(`${logPrefix} Processing element:`, photo);
    }

    // Get raw attributes
    let position = safeGetAttribute(photo, 'data-position');
    let weapon = safeGetAttribute(photo, 'data-weapon');
    let type = safeGetAttribute(photo, 'data-type');
    let faction = safeGetAttribute(photo, 'data-faction');
    let rarity = safeGetAttribute(photo, 'data-rarity');
    let name = safeGetAttribute(photo, 'data-name');

    if (debugMode) {
        console.log(`${logPrefix} Raw attributes:`, {
            position, weapon, type, faction, rarity, name,
            originalPosition: safeGetAttribute(photo, 'data-original-position')
        });
    }

    // Special handling for toggle items
    if (isToggleItem) {
        // First, check if we have a data-original-position attribute
        const originalPosition = safeGetAttribute(photo, 'data-original-position');
        if (originalPosition && originalPosition !== '' && !/^\d+$/.test(originalPosition)) {
            if (debugMode) console.log(`${logPrefix} Using original position attribute:`, originalPosition);
            position = originalPosition;
        }
        // If not, check if data-position is a number (drag-and-drop index)
        else if (/^\d+$/.test(position)) {
            if (debugMode) console.log(`${logPrefix} Toggle item has numeric position:`, position);
            // This is a drag-and-drop index, not a class value
            // Try to get the real position from the gallery photo reference
            const galleryPhotoId = photo.dataset.galleryPhotoId;
            if (galleryPhotoId) {
                const galleryPhoto = document.getElementById(galleryPhotoId);
                if (galleryPhoto) {
                    position = safeGetAttribute(galleryPhoto, 'data-position');
                    if (debugMode) console.log(`${logPrefix} Retrieved position from gallery photo:`, position);

                    // Update the original-position attribute with the correct value
                    photo.setAttribute('data-original-position', position);
                    if (debugMode) console.log(`${logPrefix} Updated data-original-position attribute to:`, position);
                } else {
                    if (debugMode) console.log(`${logPrefix} Gallery photo not found for ID:`, galleryPhotoId);
                }
            } else {
                if (debugMode) console.log(`${logPrefix} No gallery photo ID found`);
            }

            // If we still don't have a valid position, try to extract it from the filename
            if (!position || position === '' || /^\d+$/.test(position)) {
                // Try to extract position from the image src
                const imgElement = photo.querySelector('img');
                if (imgElement && imgElement.src) {
                    const filename = imgElement.src.split('/').pop();
                    if (debugMode) console.log(`${logPrefix} Extracting position from filename:`, filename);

                    // Look for position patterns like _atk_, _def_, _sp_ in the filename
                    const posMatch = filename.match(/_(atk|def|sp)_/i);
                    if (posMatch && posMatch[1]) {
                        position = posMatch[1].toLowerCase();
                        if (debugMode) console.log(`${logPrefix} Extracted position from filename:`, position);

                        // Update the original-position attribute with the extracted value
                        photo.setAttribute('data-original-position', position);
                        if (debugMode) console.log(`${logPrefix} Updated data-original-position attribute to:`, position);
                    } else {
                        // Try a different pattern - some files might have position in a different format
                        const parts = filename.split('_');
                        if (parts.length > 1) {
                            // Check each part for position keywords
                            for (let i = 0; i < parts.length; i++) {
                                const part = parts[i].toLowerCase();
                                if (part === 'atk' || part === 'def' || part === 'sp') {
                                    position = part;
                                    if (debugMode) console.log(`${logPrefix} Found position in filename part:`, position);
                                    photo.setAttribute('data-original-position', position);
                                    break;
                                }
                            }
                        }

                        if (!position || position === '' || /^\d+$/.test(position)) {
                            if (debugMode) console.log(`${logPrefix} Could not extract position from filename:`, filename);
                        }
                    }
                } else {
                    if (debugMode) console.log(`${logPrefix} No image found to extract position from`);
                }
            }

            // If we still don't have a valid position, use a default
            if (!position || position === '' || /^\d+$/.test(position)) {
                position = 'atk'; // Default to attacker
                if (debugMode) console.log(`${logPrefix} Using default position "atk" for toggle item with numeric position`);
                photo.setAttribute('data-original-position', position);
            }
        }
    }

    // Check for swapped position/weapon values
    let correctedPosition = position;
    let correctedWeapon = weapon;

    // Weapon types
    const weaponTypes = ['sg', 'smg', 'ar', 'snr', 'rl', 'mg'];
    // Position types
    const positionTypes = ['atk', 'def', 'sp'];

    if (debugMode) {
        console.log(`${logPrefix} Checking for position/weapon swaps:`, { position, weapon });
        console.log(`${logPrefix} Valid position types:`, positionTypes);
        console.log(`${logPrefix} Valid weapon types:`, weaponTypes);
    }

    // If position contains a weapon type, it's likely swapped
    if (weaponTypes.includes(position)) {
        if (debugMode) console.log(`${logPrefix} Detected weapon type in position attribute:`, position, weapon);
        // If weapon contains a position type, swap them
        if (positionTypes.includes(weapon)) {
            correctedPosition = weapon;
            correctedWeapon = position;
            if (debugMode) console.log(`${logPrefix} Swapping position/weapon to:`, correctedPosition, correctedWeapon);
        } else {
            // If weapon doesn't contain a position type, use a default position
            correctedPosition = 'atk'; // Default to attacker
            if (debugMode) console.log(`${logPrefix} Using default position "atk" for weapon in position:`, position);
        }
    }

    // If weapon contains a position type, it's likely swapped
    if (positionTypes.includes(weapon) && !positionTypes.includes(position)) {
        if (debugMode) console.log(`${logPrefix} Detected position type in weapon attribute:`, position, weapon);
        // If position doesn't contain a position type, swap them
        if (weaponTypes.includes(position)) {
            correctedPosition = weapon;
            correctedWeapon = position;
            if (debugMode) console.log(`${logPrefix} Swapping position/weapon to:`, correctedPosition, correctedWeapon);
        }
    }

    // Final check to ensure we have valid values
    if (!positionTypes.includes(correctedPosition)) {
        if (debugMode) console.log(`${logPrefix} Final position value is invalid:`, correctedPosition);
        correctedPosition = 'atk'; // Default to attacker
        if (debugMode) console.log(`${logPrefix} Using default position "atk"`);
    }

    if (debugMode) {
        console.log(`${logPrefix} Final attribute values:`, {
            type: safeGetAttribute(photo, 'data-type'),
            position: correctedPosition,
            faction: safeGetAttribute(photo, 'data-faction'),
            rarity: safeGetAttribute(photo, 'data-rarity'),
            weapon: correctedWeapon,
            name: safeGetAttribute(photo, 'data-name')
        });
    }

    // Create the attributes object
    const attributes = {
        type: safeGetAttribute(photo, 'data-type'),
        position: correctedPosition,
        faction: safeGetAttribute(photo, 'data-faction'),
        rarity: safeGetAttribute(photo, 'data-rarity'),
        weapon: correctedWeapon,
        name: safeGetAttribute(photo, 'data-name'),
        isToggleItem: isToggleItem,
        originalPosition: safeGetAttribute(photo, 'data-original-position')
    };

    // Special handling for type attribute in toggle items
    if (isToggleItem && (!attributes.type || attributes.type === '')) {
        // Try to extract type from the image filename
        const img = photo.querySelector('img');
        if (img && img.src) {
            const filename = img.src.split('/').pop();

            // Check for type indicators in the filename
            if (filename.includes('_b1_') || filename.includes('_I_')) {
                attributes.type = 'b1';
                photo.setAttribute('data-type', 'b1');
            } else if (filename.includes('_b2_') || filename.includes('_II_')) {
                attributes.type = 'b2';
                photo.setAttribute('data-type', 'b2');
            } else if (filename.includes('_b3_') || filename.includes('_III_')) {
                attributes.type = 'b3';
                photo.setAttribute('data-type', 'b3');
            } else if (filename.includes('_a_') || filename.includes('_A_')) {
                attributes.type = 'a';
                photo.setAttribute('data-type', 'a');
            }

            if (attributes.type) {
                console.log(`Extracted type from filename: ${attributes.type} for ${filename}`);
            }
        }
    }

    return attributes;
};

const isPhotoMatchingFilters = (attributes, selectedFilters, searchValue) => {
    // Generate a unique ID for logging purposes
    const itemId = attributes.name || Math.floor(Math.random() * 10000);
    const itemType = attributes.isToggleItem ? 'toggle' : 'gallery';
    const logPrefix = `[${itemType}-${itemId}]`;

    // Get debug mode setting
    const debugMode = localStorage.getItem('filterDebugMode') === 'true';

    // Debug log for troubleshooting
    if (debugMode) {
        console.log(`${logPrefix} Checking item against filters:`);
        console.log(`${logPrefix} Item attributes:`, attributes);
        console.log(`${logPrefix} Selected filters:`, selectedFilters);
    }

    // Check if the photo matches all selected filters
    const filtersMatch = Object.keys(selectedFilters).every(key => {
        // If no filters of this type are selected, it's a match
        if (selectedFilters[key].length === 0) {
            if (debugMode) console.log(`${logPrefix} No ${key} filters selected, automatic match`);
            return true;
        }

        // If the attribute is empty and filters are selected, it's not a match
        if (!attributes[key] && selectedFilters[key].length > 0) {
            if (debugMode) console.log(`${logPrefix} Filter ${key} not matching: attribute is empty`);
            return false;
        }

        // Special handling for position (class) attribute
        if (key === 'position') {
            // Check if this is a toggle item with a numeric position (drag-and-drop index)
            const isToggleItem = attributes.isToggleItem;
            const isNumericPosition = /^\d+$/.test(attributes[key]);

            // If this is a toggle item with a numeric position, try to use the original position
            if (isToggleItem && isNumericPosition && attributes.originalPosition) {
                if (debugMode) console.log(`${logPrefix} Toggle item with numeric position, using original position: ${attributes.originalPosition}`);
                attributes.position = attributes.originalPosition;
            }

            // Normalize position values for comparison
            const normalizedAttrValue = normalizePositionValue(attributes[key]);
            if (debugMode) {
                console.log(`${logPrefix} Checking position filter:`);
                console.log(`${logPrefix} Original attribute value: ${attributes[key]}`);
                console.log(`${logPrefix} Normalized attribute value: ${normalizedAttrValue}`);
                console.log(`${logPrefix} Selected position filters:`, selectedFilters[key]);
            }

            // Check if any of the selected filters match the normalized attribute value
            const result = selectedFilters[key].some(value => {
                if (value === null || value === undefined) return false;
                const normalizedFilterValue = normalizePositionValue(value);

                if (debugMode) console.log(`${logPrefix} Comparing position filter: ${value} -> ${normalizedFilterValue} with attribute: ${normalizedAttrValue}`);

                // Case-insensitive comparison
                const isMatch = normalizedFilterValue.toLowerCase() === normalizedAttrValue.toLowerCase();

                if (debugMode) {
                    if (isMatch) {
                        console.log(`${logPrefix} ✅ Position filter MATCHED: ${normalizedFilterValue} == ${normalizedAttrValue}`);
                    } else {
                        console.log(`${logPrefix} ❌ Position filter NOT matched: ${normalizedFilterValue} != ${normalizedAttrValue}`);
                    }
                }

                return isMatch;
            });

            if (debugMode) console.log(`${logPrefix} Position filter match result: ${result}`);
            return result;
        }

        // Check if the attribute value is in the selected filters
        const result = selectedFilters[key].some(value => {
            // Skip null values
            if (value === null || value === undefined) return false;

            // Get lowercase versions for comparison
            const filterValueLower = value.toLowerCase();
            const attributeValueLower = attributes[key].toLowerCase();

            // Debug log for troubleshooting
            if (debugMode) console.log(`${logPrefix} Comparing filter ${key}: ${filterValueLower} with attribute: ${attributeValueLower}`);

            // Case-insensitive comparison
            const isMatch = filterValueLower === attributeValueLower;

            if (debugMode) {
                if (isMatch) {
                    console.log(`${logPrefix} ✅ Filter ${key} MATCHED: ${filterValueLower} == ${attributeValueLower}`);
                } else {
                    console.log(`${logPrefix} ❌ Filter ${key} NOT matched: ${filterValueLower} != ${attributeValueLower}`);
                }
            }

            return isMatch;
        });

        if (debugMode) console.log(`${logPrefix} Filter ${key} match result: ${result}`);
        return result;
    });

    // Check if the photo matches the search text
    const searchMatch = searchValue === '' ||
        (attributes.name && attributes.name.toLowerCase().includes(searchValue.toLowerCase()));

    if (debugMode) {
        if (searchValue !== '') {
            console.log(`${logPrefix} Search text: "${searchValue}", Item name: "${attributes.name}", Match: ${searchMatch}`);
        } else {
            console.log(`${logPrefix} No search text, automatic match`);
        }
    }

    // Photo matches if it passes both filter and search criteria
    const finalResult = filtersMatch && searchMatch;
    if (debugMode) console.log(`${logPrefix} Final match result: ${finalResult}`);
    return finalResult;
};

// Helper function to normalize position values
function normalizePositionValue(value) {
    if (!value) return '';

    // Get debug mode setting
    const debugMode = localStorage.getItem('filterDebugMode') === 'true';

    // Convert to lowercase
    value = value.toLowerCase();
    if (debugMode) console.log('Normalizing position value:', value);

    // If value is a number, it's likely a drag-and-drop index, not a position
    if (/^\d+$/.test(value)) {
        // Try to extract position from the element's data-original-position attribute
        // This is handled in getPhotoAttributes, so we just log and return a default here
        if (debugMode) console.log('Position value is numeric, using default "atk"');
        return 'atk'; // Default to attacker for numeric positions
    }

    // Map different variations of position values to standard ones
    const positionMap = {
        'def': 'def',
        'defender': 'def',
        'sp': 'sp',
        'support': 'sp',
        'supporter': 'sp',
        'atk': 'atk',
        'attacker': 'atk',
        // Handle special cases where position and weapon are swapped
        'sg': 'atk', // Some entries have sg as position and atk as weapon
        'snr': 'atk', // Some entries have snr as position and atk as weapon
        'rl': 'atk',  // Some entries might have rl as position
        'ar': 'atk',  // Some entries might have ar as position
        'smg': 'atk', // Some entries might have smg as position
        'mg': 'atk'   // Some entries might have mg as position
    };

    const result = positionMap[value] || value;
    if (debugMode) console.log('Normalized position value:', value, '->', result);
    return result;
}

// Optimized storage functions

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

// Debounced version of saveStorageData
const debouncedSaveStorageData = debounce((data) => {
    saveStorageData(data);
}, 300); // 300ms debounce time

// Functions for team names

// Load team names from localStorage
function loadTeamNames() {
    try {
        const savedNames = localStorage.getItem(TEAM_NAMES_KEY);
        if (savedNames) {
            teamNames = JSON.parse(savedNames);
            console.log('Loaded team names:', teamNames);
        } else {
            console.log('No saved team names found, using defaults');
        }
    } catch (error) {
        console.error('Error loading team names:', error);
    }
}

// Save team names to localStorage
function saveTeamNames() {
    try {
        localStorage.setItem(TEAM_NAMES_KEY, JSON.stringify(teamNames));
        console.log('Saved team names:', teamNames);
    } catch (error) {
        console.error('Error saving team names:', error);
    }
}

// Update team name and save to localStorage
function updateTeamName(setId, name) {
    teamNames[setId] = name;
    saveTeamNames();
    updateTeamTitle(setId);
}

// Update the team title in the UI
function updateTeamTitle(setId) {
    const container = document.querySelector(`#teamSet${setId}`);
    if (!container) return;

    const titleElement = container.querySelector('.team-title');
    if (!titleElement) return;

    const baseName = setId === '1' ? 'Defender' : 'Attacker';
    const customName = teamNames[setId] ? `, ${teamNames[setId]}` : '';
    titleElement.textContent = `${baseName}${customName}`;
}

// Update all team titles
function updateAllTeamTitles() {
    updateTeamTitle('1');
    updateTeamTitle('2');
}
