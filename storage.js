// Storage keys and global variables for the application
const STORAGE_KEY = 'nikkePortraitData';
const TOGGLE_TABS_KEY = 'nikkeToggleTabsData';

// Global variables
let currentTeamSet = '1'; // Default to team set 1
let currentContentTab = 'toggleImages'; // Default to My Nikkes tab

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
    // Safely get attribute with fallback to empty string if null
    const safeGetAttribute = (element, attr) => {
        const value = element.getAttribute(attr);
        return value ? value.toLowerCase() : '';
    };

    // Check if this is a toggle-item (which has different structure than photo)
    const isToggleItem = photo.classList.contains('toggle-item');

    // Get raw attributes
    let position = safeGetAttribute(photo, 'data-position');
    let weapon = safeGetAttribute(photo, 'data-weapon');

    // Special handling for toggle items
    if (isToggleItem) {
        // First, check if we have a data-original-position attribute
        const originalPosition = safeGetAttribute(photo, 'data-original-position');
        if (originalPosition && originalPosition !== '' && !/^\d+$/.test(originalPosition)) {
            console.log('Using original position attribute:', originalPosition);
            position = originalPosition;
        }
        // If not, check if data-position is a number (drag-and-drop index)
        else if (/^\d+$/.test(position)) {
            console.log('Toggle item has numeric position:', position);
            // This is a drag-and-drop index, not a class value
            // Try to get the real position from the gallery photo reference
            const galleryPhotoId = photo.dataset.galleryPhotoId;
            if (galleryPhotoId) {
                const galleryPhoto = document.getElementById(galleryPhotoId);
                if (galleryPhoto) {
                    position = safeGetAttribute(galleryPhoto, 'data-position');
                    console.log('Retrieved position from gallery photo:', position);

                    // Update the original-position attribute with the correct value
                    photo.setAttribute('data-original-position', position);
                    console.log('Updated data-original-position attribute to:', position);
                }
            }

            // If we still don't have a valid position, try to extract it from the filename
            if (!position || position === '' || /^\d+$/.test(position)) {
                // Try to extract position from the image src
                const imgElement = photo.querySelector('img');
                if (imgElement && imgElement.src) {
                    const filename = imgElement.src.split('/').pop();
                    // Look for position patterns like _atk_, _def_, _sp_ in the filename
                    const posMatch = filename.match(/_(atk|def|sp)_/i);
                    if (posMatch && posMatch[1]) {
                        position = posMatch[1].toLowerCase();
                        console.log('Extracted position from filename:', position);

                        // Update the original-position attribute with the extracted value
                        photo.setAttribute('data-original-position', position);
                        console.log('Updated data-original-position attribute to:', position);
                    }
                }
            }

            // If we still don't have a valid position, use a default
            if (!position || position === '' || /^\d+$/.test(position)) {
                position = 'atk'; // Default to attacker
                console.log('Using default position "atk" for toggle item with numeric position');
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

    // If position contains a weapon type, it's likely swapped
    if (weaponTypes.includes(position)) {
        console.log('Detected weapon type in position attribute:', position, weapon);
        // If weapon contains a position type, swap them
        if (positionTypes.includes(weapon)) {
            correctedPosition = weapon;
            correctedWeapon = position;
            console.log('Swapping position/weapon to:', correctedPosition, correctedWeapon);
        } else {
            // If weapon doesn't contain a position type, use a default position
            correctedPosition = 'atk'; // Default to attacker
            console.log('Using default position "atk" for weapon in position:', position);
        }
    }

    // If weapon contains a position type, it's likely swapped
    if (positionTypes.includes(weapon) && !positionTypes.includes(position)) {
        console.log('Detected position type in weapon attribute:', position, weapon);
        // If position doesn't contain a position type, swap them
        if (weaponTypes.includes(position)) {
            correctedPosition = weapon;
            correctedWeapon = position;
            console.log('Swapping position/weapon to:', correctedPosition, correctedWeapon);
        }
    }

    return {
        type: safeGetAttribute(photo, 'data-type'),
        position: correctedPosition,
        faction: safeGetAttribute(photo, 'data-faction'),
        rarity: safeGetAttribute(photo, 'data-rarity'),
        weapon: correctedWeapon,
        name: safeGetAttribute(photo, 'data-name'),
        isToggleItem: isToggleItem,
        originalPosition: safeGetAttribute(photo, 'data-original-position')
    };
};

const isPhotoMatchingFilters = (attributes, selectedFilters, searchValue) => {
    // Debug log for troubleshooting
    console.debug('Checking photo with attributes:', attributes);
    console.debug('Against filters:', selectedFilters);

    // Check if the photo matches all selected filters
    const filtersMatch = Object.keys(selectedFilters).every(key => {
        // If no filters of this type are selected, it's a match
        if (selectedFilters[key].length === 0) return true;

        // If the attribute is empty and filters are selected, it's not a match
        if (!attributes[key] && selectedFilters[key].length > 0) {
            console.debug(`Filter ${key} not matching: attribute is empty`);
            return false;
        }

        // Special handling for position (class) attribute
        if (key === 'position') {
            // Check if this is a toggle item with a numeric position (drag-and-drop index)
            const isToggleItem = attributes.isToggleItem;
            const isNumericPosition = /^\d+$/.test(attributes[key]);

            // If this is a toggle item with a numeric position, try to use the original position
            if (isToggleItem && isNumericPosition && attributes.originalPosition) {
                console.log(`Toggle item with numeric position, using original position: ${attributes.originalPosition}`);
                attributes.position = attributes.originalPosition;
            }

            // Normalize position values for comparison
            const normalizedAttrValue = normalizePositionValue(attributes[key]);
            console.log(`Checking position filter for attribute: ${attributes[key]} -> ${normalizedAttrValue}`);
            console.log(`Selected position filters:`, selectedFilters[key]);

            // Check if any of the selected filters match the normalized attribute value
            const result = selectedFilters[key].some(value => {
                if (value === null || value === undefined) return false;
                const normalizedFilterValue = normalizePositionValue(value);
                console.log(`Comparing position filter: ${value} -> ${normalizedFilterValue} with attribute: ${normalizedAttrValue}`);
                return normalizedFilterValue === normalizedAttrValue;
            });

            console.log(`Position filter match result: ${result}`);
            return result;
        }

        // Check if the attribute value is in the selected filters
        return selectedFilters[key].some(value => {
            // Skip null values
            if (value === null || value === undefined) return false;

            // Get lowercase versions for comparison
            const filterValueLower = value.toLowerCase();
            const attributeValueLower = attributes[key].toLowerCase();

            // Debug log for troubleshooting
            console.debug(`Comparing filter ${key}: ${filterValueLower} with attribute: ${attributeValueLower}`);

            // Case-insensitive comparison
            return filterValueLower === attributeValueLower;
        });
    });

    // Check if the photo matches the search text
    const searchMatch = searchValue === '' ||
        (attributes.name && attributes.name.toLowerCase().includes(searchValue.toLowerCase()));

    // Photo matches if it passes both filter and search criteria
    return filtersMatch && searchMatch;
};

// Helper function to normalize position values
function normalizePositionValue(value) {
    if (!value) return '';

    // Convert to lowercase
    value = value.toLowerCase();
    console.log('Normalizing position value:', value);

    // If value is a number, it's likely a drag-and-drop index, not a position
    if (/^\d+$/.test(value)) {
        // Try to extract position from the element's data-original-position attribute
        // This is handled in getPhotoAttributes, so we just log and return a default here
        console.log('Position value is numeric, using default "atk"');
        return 'atk'; // Default to attacker for numeric positions
    }

    // Map different variations of position values to standard ones
    const positionMap = {
        'def': 'def',
        'defender': 'def',
        'sp': 'sp',
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
    console.log('Normalized position value:', value, '->', result);
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
