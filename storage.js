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

// Shared utility functions
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
