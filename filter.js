// Filter Panel Functionality

// Global variables are defined in storage.js

// Function to toggle filter panel visibility
function toggleFilterPanel() {
    // Prevent rapid toggling
    if (isToggling) return;
    isToggling = true;

    // Always try to get the filter panel fresh in case it was added to the DOM after initial load
    filterPanel = document.getElementById('filterPanel');
    if (!filterPanel) {
        console.log('Filter panel not found, creating it');
        // Create the filter panel if it doesn't exist
        createFilterPanel();
        filterPanel = document.getElementById('filterPanel');
        if (!filterPanel) {
            console.error('Failed to create filter panel');
            isToggling = false;
            return;
        }
    }

    console.log('Toggle filter panel, current visible state:', filterPanel.classList.contains('visible'));

    if (filterPanel.classList.contains('visible')) {
        hideFilterPanel();
    } else {
        showFilterPanel();
    }

    // Reset toggling flag after a delay
    setTimeout(() => {
        isToggling = false;
    }, 500);
}

// Function to create the filter panel if it doesn't exist
function createFilterPanel() {
    console.log('Creating filter panel');
    const filterPanelHTML = `
    <div id="filterPanel" class="filter-panel" style="display: block; width: 120px; height: auto; max-height: 90vh; overflow-y: auto;">
        <div class="filter-header">
            <h3 class="filter-title">Filters</h3>
            <button id="closeFilterBtn" class="close-filter-btn" onclick="event.stopPropagation(); event.preventDefault(); setTimeout(function() { hideFilterPanel(); }, 5);">✕</button>
        </div>
        <div class="filter-grid">
            <!-- Compact filter layout -->

            <div class="filter-box compact">
                <h4>Class</h4>
                <div class="checkbox-group compact">
                    <label class="checkbox-label compact"><input type="checkbox" name="position" value="def" onchange="updateFilters()"><span>DEF</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="position" value="sp" onchange="updateFilters()"><span>SP</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="position" value="atk" onchange="updateFilters()"><span>ATK</span></label>
                </div>
            </div>
            <div class="filter-box compact">
                <h4>Rarity</h4>
                <div class="checkbox-group compact">
                    <label class="checkbox-label compact"><input type="checkbox" name="rarity" value="ssr" onchange="updateFilters()"><span>SSR</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="rarity" value="sr" onchange="updateFilters()"><span>SR</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="rarity" value="r" onchange="updateFilters()"><span>R</span></label>
                </div>
            </div>
            <div class="filter-box compact">
                <h4>Industry</h4>
                <div class="checkbox-group compact">
                    <label class="checkbox-label compact"><input type="checkbox" name="faction" value="elysion" onchange="updateFilters()"><span>Elysion</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="faction" value="missilis" onchange="updateFilters()"><span>Missilis</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="faction" value="tetra" onchange="updateFilters()"><span>Tetra</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="faction" value="abnormal" onchange="updateFilters()"><span>Abnormal</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="faction" value="pilgrim" onchange="updateFilters()"><span>Pilgrim</span></label>
                </div>
            </div>
            <div class="filter-box compact">
                <h4>Weapon</h4>
                <div class="checkbox-group compact">
                    <label class="checkbox-label compact"><input type="checkbox" name="weapon" value="smg" onchange="updateFilters()"><span>SMG</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="weapon" value="ar" onchange="updateFilters()"><span>AR</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="weapon" value="snr" onchange="updateFilters()"><span>SNR</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="weapon" value="rl" onchange="updateFilters()"><span>RL</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="weapon" value="sg" onchange="updateFilters()"><span>SG</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="weapon" value="mg" onchange="updateFilters()"><span>MG</span></label>
                </div>
            </div>
            <div class="filter-box compact">
                <h4>Element</h4>
                <div class="checkbox-group compact">
                    <label class="checkbox-label compact"><input type="checkbox" name="element" value="fire" onchange="updateFilters()"><span>Fire</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="element" value="water" onchange="updateFilters()"><span>Water</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="element" value="wind" onchange="updateFilters()"><span>Wind</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="element" value="electric" onchange="updateFilters()"><span>Electric</span></label>
                    <label class="checkbox-label compact"><input type="checkbox" name="element" value="iron" onchange="updateFilters()"><span>Iron</span></label>
                </div>
            </div>

        </div>
    </div>
    `;

    // Append the filter panel to the body
    document.body.insertAdjacentHTML('beforeend', filterPanelHTML);

    // Add click handler to filter panel to stop propagation
    const newFilterPanel = document.getElementById('filterPanel');
    if (newFilterPanel) {
        newFilterPanel.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }
}

// Function to show filter panel
function showFilterPanel() {
    if (!filterPanel) {
        filterPanel = document.getElementById('filterPanel');
        if (!filterPanel) {
            console.error('Filter panel not found');
            return;
        }
    }

    // Force layout recalculation
    filterPanel.style.display = 'block';
    filterPanel.style.opacity = '0';
    filterPanel.style.transform = 'translateX(400px)';

    // Force reflow
    filterPanel.offsetHeight;

    // Add visible class
    filterPanel.classList.add('visible');

    // Also set inline styles for maximum compatibility
    filterPanel.style.transform = 'translateX(0)';
    filterPanel.style.opacity = '1';

    console.log('Filter panel shown with dimensions:', {
        offsetWidth: filterPanel.offsetWidth,
        offsetHeight: filterPanel.offsetHeight,
        clientWidth: filterPanel.clientWidth,
        clientHeight: filterPanel.clientHeight
    });

    // Log position for debugging
    setTimeout(() => {
        const rect = filterPanel.getBoundingClientRect();
        console.log('Filter panel position after delay:', {
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });
    }, 500);
}

// Function to hide filter panel
function hideFilterPanel() {
    if (!filterPanel) {
        filterPanel = document.getElementById('filterPanel');
        if (!filterPanel) {
            console.error('Filter panel not found');
            return;
        }
    }

    // Remove visible class
    filterPanel.classList.remove('visible');

    // Also set inline styles for maximum compatibility
    if (window.innerWidth <= 768) {
        // Mobile
        filterPanel.style.transform = 'translateY(-100vh)';
    } else {
        // Desktop
        filterPanel.style.transform = 'translateX(400px)';
    }
    filterPanel.style.opacity = '0';

    console.log('Filter panel hidden');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    filterBtn = document.getElementById('filterBtn');
    filterPanel = document.getElementById('filterPanel');
    const closeFilterBtn = document.getElementById('closeFilterBtn');

    // Initialize filter panel
    if (filterPanel) {
        // Make sure it's visible in the DOM but not shown yet
        filterPanel.style.display = 'block';
        filterPanel.classList.remove('visible');

        // Set initial transform based on device
        if (window.innerWidth <= 768) {
            // Mobile
            filterPanel.style.transform = 'translateY(-100vh)';
        } else {
            // Desktop
            filterPanel.style.transform = 'translateX(400px)';
        }
        filterPanel.style.opacity = '0';

        // Move the filter panel to the body to ensure it's not affected by tab visibility
        document.body.appendChild(filterPanel);

        console.log('Filter panel initialized with dimensions:', {
            offsetWidth: filterPanel.offsetWidth,
            offsetHeight: filterPanel.offsetHeight,
            clientWidth: filterPanel.clientWidth,
            clientHeight: filterPanel.clientHeight,
            display: filterPanel.style.display,
            opacity: filterPanel.style.opacity,
            transform: filterPanel.style.transform
        });
    }

    // Add click handler to filter button
    if (filterBtn) {
        filterBtn.addEventListener('click', function(event) {
            // Stop propagation and prevent default
            event.stopPropagation();
            event.preventDefault();

            console.log('Filter button clicked');

            // Use setTimeout to ensure this happens after any other click handlers
            setTimeout(() => {
                toggleFilterPanel();
            }, 10);
        });
    }

    // Add click handler to close button
    if (closeFilterBtn) {
        closeFilterBtn.addEventListener('click', function(event) {
            // Stop propagation and prevent default
            event.stopPropagation();
            event.preventDefault();

            console.log('Close button clicked');

            // Use setTimeout to ensure this happens after any other click handlers
            setTimeout(() => {
                hideFilterPanel();
            }, 10);
        });
    }

    // Add click handler to filter panel to stop propagation
    if (filterPanel) {
        filterPanel.addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    // Add document click handler to close filter panel when clicking outside
    document.addEventListener('click', function(event) {
        // Don't process if we're currently toggling
        if (isToggling) return;

        // Check if we should close the panel
        if (filterPanel && filterPanel.classList.contains('visible')) {
            // Check if click is outside both the panel and the button
            const clickedOutside = !filterPanel.contains(event.target) &&
                                  (filterBtn && !filterBtn.contains(event.target));

            if (clickedOutside) {
                console.log('Click outside detected, hiding panel');
                hideFilterPanel();
            } else {
                console.log('Click inside panel or button, keeping open');
            }
        }
    });

    // Burst filter buttons are now handled in script.js
});

// Function to update filters
function updateFilters() {
    // Make this function available globally for script.js to call
    window.filter = window.filter || {};
    window.filter.updateFilters = updateFilters;
    console.log('Updating filters');

    // Get all checked filter values
    const filters = {
        position: [],
        rarity: [],
        faction: [],
        weapon: [],
        element: [],
        type: []
    };

    // Get total number of checkboxes for each filter type
    const totalCheckboxes = {
        position: 0,
        rarity: 0,
        faction: 0,
        weapon: 0,
        element: 0,
        type: 0
    };

    // Count total checkboxes for each filter type
    document.querySelectorAll('#filterPanel input[type="checkbox"]').forEach(checkbox => {
        const filterType = checkbox.name;
        if (totalCheckboxes[filterType] !== undefined) {
            totalCheckboxes[filterType]++;
        }
    });

    // Collect all checked values from filter panel
    const checkedCheckboxes = {
        position: 0,
        rarity: 0,
        faction: 0,
        weapon: 0,
        element: 0,
        type: 0
    };

    document.querySelectorAll('#filterPanel input[type="checkbox"]:checked').forEach(checkbox => {
        const filterType = checkbox.name;
        const filterValue = checkbox.value;
        if (filters[filterType]) {
            filters[filterType].push(filterValue);
            checkedCheckboxes[filterType]++;
        }
    });

    // Get active burst filters from burst buttons
    const burstButtons = document.querySelectorAll('.burst-btn.active:not(.filter-btn)');
    const uniqueBurstValues = new Set();
    burstButtons.forEach(button => {
        const value = button.getAttribute('data-value');
        if (value) {
            // Make sure the value is lowercase for consistency
            uniqueBurstValues.add(value.toLowerCase());
        }
    });

    // Add unique burst values to filters
    uniqueBurstValues.forEach(value => {
        filters.type.push(value);
    });

    console.log('Active burst filters:', Array.from(uniqueBurstValues));

    // If all checkboxes of a filter type are checked, clear the filter (treat as if none are checked)
    for (const [filterType, count] of Object.entries(checkedCheckboxes)) {
        if (count > 0 && count === totalCheckboxes[filterType]) {
            console.log(`All ${filterType} filters selected, clearing filter`);
            filters[filterType] = [];
        }
    }

    console.log('Active filters:', filters);

    // Apply filters to gallery items
    const galleryItems = document.querySelectorAll('.photo');
    let galleryVisibleCount = 0;

    galleryItems.forEach(item => {
        let shouldShow = true;

        // Check each filter type
        for (const [filterType, filterValues] of Object.entries(filters)) {
            // If no filters of this type are selected, skip this check
            if (filterValues.length === 0) continue;

            // For gallery items, use data-position attribute
            let itemValue;
            if (filterType === 'position') {
                // First try to get data-position attribute
                itemValue = item.getAttribute('data-position');
                if (!itemValue) {
                    // Try to extract position from the filename
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for position patterns like _atk_, _def_, _sp_ in the filename
                        const posMatch = filename.match(/_(atk|def|sp)_/i);
                        if (posMatch && posMatch[1]) {
                            itemValue = posMatch[1].toLowerCase();
                            // console.log('Extracted position from filename for gallery item:', itemValue);
                        }
                    }
                }
            } else if (filterType === 'type') {
                // For type filtering, use data-type attribute
                itemValue = item.getAttribute('data-type');
                // Debug logging removed
            } else if (filterType === 'element') {
                // For element filtering, use data-element attribute
                itemValue = item.getAttribute('data-element');

                // If element attribute is missing, try to extract it from the filename
                if (!itemValue) {
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for element patterns in the filename
                        const elementMatch = filename.match(/_(fire|water|wind|electric|iron)_/i);
                        if (elementMatch && elementMatch[1]) {
                            itemValue = elementMatch[1].toLowerCase();
                            // Debug logging removed

                            // Update the data-element attribute for future use
                            item.setAttribute('data-element', itemValue);
                        }
                    }
                }

                // Debug logging removed
            } else if (filterType === 'weapon') {
                // For weapon filtering, use data-weapon attribute
                itemValue = item.getAttribute('data-weapon');

                // If weapon attribute is missing, try to extract it from the filename
                if (!itemValue) {
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for weapon patterns in the filename
                        const weaponMatch = filename.match(/_(sg|smg|ar|snr|rl|mg)_/i);
                        if (weaponMatch && weaponMatch[1]) {
                            itemValue = weaponMatch[1].toLowerCase();

                            // Update the data-weapon attribute for future use
                            item.setAttribute('data-weapon', itemValue);
                        }
                    }
                }
            } else {
                itemValue = item.dataset[filterType];
            }

            if (!itemValue) {
                // Debug logging removed
                shouldShow = false;
                break;
            }

            // Special handling for type filter (burst type)
            if (filterType === 'type') {
                // Convert both to lowercase for case-insensitive comparison
                let itemValueLower = itemValue.toLowerCase();

                // Handle numeric data-type values by mapping them to burst types
                // This is needed because some gallery items might have numeric data-type values
                if (!isNaN(itemValueLower)) {
                    // Extract the burst type from the filename if available
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for burst type patterns in the filename
                        if (filename.includes('_b1_') || filename.includes('_B1_')) {
                            itemValueLower = 'b1';
                        } else if (filename.includes('_b2_') || filename.includes('_B2_')) {
                            itemValueLower = 'b2';
                        } else if (filename.includes('_b3_') || filename.includes('_B3_')) {
                            itemValueLower = 'b3';
                        } else if (filename.includes('_a_') || filename.includes('_A_')) {
                            itemValueLower = 'a';
                        }
                        // Debug logging removed
                    }
                }

                // Check if any filter value is included in the item value
                const typeMatch = filterValues.some(filterValue => {
                    const filterValueLower = filterValue.toLowerCase();
                    const exactMatch = itemValueLower === filterValueLower;
                    const includesMatch = itemValueLower.includes(filterValueLower);
                    const result = exactMatch || includesMatch;
                    // Debug logging removed
                    return result;
                });

                if (!typeMatch) {
                    // Debug logging removed
                    shouldShow = false;
                    break;
                }
            } else {
                // For other filters, use exact match
                if (!filterValues.includes(itemValue.toLowerCase())) {
                    shouldShow = false;
                    break;
                }
            }
        }

        // Show or hide the item
        item.style.display = shouldShow ? '' : 'none';
        if (shouldShow) galleryVisibleCount++;
    });

    // Apply filters to toggle items
    const toggleItems = document.querySelectorAll('.toggle-item');
    let toggleVisibleCount = 0;

    toggleItems.forEach(item => {
        let shouldShow = true;

        // Check each filter type
        for (const [filterType, filterValues] of Object.entries(filters)) {
            // If no filters of this type are selected, skip this check
            if (filterValues.length === 0) continue;

            // For toggle items, use data-original-position for position filtering
            let itemValue;
            if (filterType === 'position') {
                // First try to get data-original-position attribute
                itemValue = item.getAttribute('data-original-position');
                if (!itemValue) {
                    // Try to extract position from the filename
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        console.log('Extracting position from filename for toggle item:', filename);

                        // Look for position patterns like _atk_, _def_, _sp_ in the filename
                        const posMatch = filename.match(/_(atk|def|sp)_/i);
                        if (posMatch && posMatch[1]) {
                            itemValue = posMatch[1].toLowerCase();
                            console.log('Extracted position from filename pattern for toggle item:', itemValue);
                        } else {
                            // Try a different approach - check each part of the filename
                            const parts = filename.split('_');
                            for (let i = 0; i < parts.length; i++) {
                                const part = parts[i].toLowerCase();
                                if (part === 'atk' || part === 'def' || part === 'sp') {
                                    itemValue = part;
                                    console.log('Found position in filename part for toggle item:', itemValue);
                                    break;
                                }
                            }
                        }
                    }

                    // If still no value, fall back to dataset.position
                    if (!itemValue) {
                        itemValue = item.dataset[filterType];
                    }
                }
            } else if (filterType === 'type') {
                // For type filtering, use data-type attribute
                itemValue = item.getAttribute('data-type');
                // Debug logging removed
            } else if (filterType === 'element') {
                // For element filtering, use data-element attribute
                itemValue = item.getAttribute('data-element');

                // If element attribute is missing, try to extract it from the filename
                if (!itemValue) {
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for element patterns in the filename
                        const elementMatch = filename.match(/_(fire|water|wind|electric|iron)_/i);
                        if (elementMatch && elementMatch[1]) {
                            itemValue = elementMatch[1].toLowerCase();
                            // Debug logging removed

                            // Update the data-element attribute for future use
                            item.setAttribute('data-element', itemValue);
                        }
                    }
                }

                // Debug logging removed
            } else if (filterType === 'weapon') {
                // For weapon filtering, use data-weapon attribute
                itemValue = item.getAttribute('data-weapon');

                // If weapon attribute is missing, try to extract it from the filename
                if (!itemValue) {
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for weapon patterns in the filename
                        const weaponMatch = filename.match(/_(sg|smg|ar|snr|rl|mg)_/i);
                        if (weaponMatch && weaponMatch[1]) {
                            itemValue = weaponMatch[1].toLowerCase();

                            // Update the data-weapon attribute for future use
                            item.setAttribute('data-weapon', itemValue);
                        }
                    }
                }
            } else {
                itemValue = item.dataset[filterType];
            }

            if (!itemValue) {
                // Debug logging removed
                shouldShow = false;
                break;
            }

            // Special handling for type filter (burst type)
            if (filterType === 'type') {
                // Convert both to lowercase for case-insensitive comparison
                let itemValueLower = itemValue.toLowerCase();

                // Handle numeric data-type values by mapping them to burst types
                // This is needed because some toggle items have numeric data-type values
                if (!isNaN(itemValueLower) || itemValueLower.length > 3) {
                    // Extract the burst type from the filename if available
                    const img = item.querySelector('img');
                    if (img && img.src) {
                        const filename = img.src.split('/').pop();
                        // Look for burst type patterns in the filename
                        if (filename.includes('_b1_') || filename.includes('_B1_')) {
                            itemValueLower = 'b1';
                        } else if (filename.includes('_b2_') || filename.includes('_B2_')) {
                            itemValueLower = 'b2';
                        } else if (filename.includes('_b3_') || filename.includes('_B3_')) {
                            itemValueLower = 'b3';
                        } else if (filename.includes('_a_') || filename.includes('_A_')) {
                            itemValueLower = 'a';
                        }
                        // Debug logging removed
                    }

                    // If we still don't have a valid burst type, try to extract it from the data-name attribute
                    if (!['b1', 'b2', 'b3', 'a'].includes(itemValueLower)) {
                        // Update the data-type attribute with the correct burst type
                        item.setAttribute('data-type', itemValueLower);
                        // Debug logging removed
                    }
                }

                // Check if any filter value is included in the item value
                const typeMatch = filterValues.some(filterValue => {
                    const filterValueLower = filterValue.toLowerCase();
                    const exactMatch = itemValueLower === filterValueLower;
                    const includesMatch = itemValueLower.includes(filterValueLower);
                    const result = exactMatch || includesMatch;
                    // Debug logging removed
                    return result;
                });

                if (!typeMatch) {
                    // Debug logging removed
                    shouldShow = false;
                    break;
                }
            } else {
                // For other filters, use exact match
                if (!filterValues.includes(itemValue.toLowerCase())) {
                    shouldShow = false;
                    break;
                }
            }
        }

        // Show or hide the item
        item.style.display = shouldShow ? 'flex' : 'none';
        if (shouldShow) toggleVisibleCount++;
    });

    // Update the count of visible items
    // Use the count we've already calculated
    const galleryHiddenCount = galleryItems.length - galleryVisibleCount;
    console.log(`Filtered: ${galleryHiddenCount} items hidden, ${galleryVisibleCount} items shown`);

    if (toggleItems.length > 0) {
        // Use the count we've already calculated
        const toggleHiddenCount = toggleItems.length - toggleVisibleCount;
        console.log(`Toggle items filtered: ${toggleHiddenCount} items hidden, ${toggleVisibleCount} items shown`);
    }

    // Add debug logging for filter discrepancies
    if (localStorage.getItem('filterDebugMode') === 'true') {
        console.log('Active filters:', filters);

        // Log any items with potential position/weapon swaps
        const allItems = [...galleryItems, ...toggleItems];
        const suspiciousItems = allItems.filter(item => {
            const position = item.getAttribute('data-position');
            const weapon = item.getAttribute('data-weapon');
            const weaponTypes = ['sg', 'smg', 'ar', 'snr', 'rl', 'mg'];
            const positionTypes = ['atk', 'def', 'sp'];

            // Check for weapon types in position attribute or position types in weapon attribute
            return (weaponTypes.includes(position?.toLowerCase()) || positionTypes.includes(weapon?.toLowerCase()));
        });

        if (suspiciousItems.length > 0) {
            console.warn('Found items with potential position/weapon swaps:');
            suspiciousItems.forEach(item => {
                const img = item.querySelector('img');
                const filename = img?.src.split('/').pop() || 'unknown';
                console.warn(`Item ${item.getAttribute('data-id')}: ${filename}`);
                console.warn(`  Position: ${item.getAttribute('data-position')}, Weapon: ${item.getAttribute('data-weapon')}`);

                // Try to extract correct values from filename
                if (img && img.src) {
                    const posMatch = filename.match(/_(atk|def|sp)_/i);
                    const weapMatch = filename.match(/_(sg|smg|ar|snr|rl|mg)_/i);

                    if (posMatch && posMatch[1]) {
                        const correctPos = posMatch[1].toLowerCase();
                        console.warn(`  Correct position from filename: ${correctPos}`);
                        // Auto-fix the position attribute
                        item.setAttribute('data-position', correctPos);
                    }

                    if (weapMatch && weapMatch[1]) {
                        const correctWeap = weapMatch[1].toLowerCase();
                        console.warn(`  Correct weapon from filename: ${correctWeap}`);
                        // Auto-fix the weapon attribute
                        item.setAttribute('data-weapon', correctWeap);
                    }
                }
            });

            // After fixing attributes, reapply filters
            console.warn('Fixed attributes for items with position/weapon swaps. Reapplying filters...');
            updateFilters();
            return; // Exit early since we're calling updateFilters again
        }
    }

    // Removed circular reference to script.js updateFilters
}

// Function to toggle filter debug mode
function toggleFilterDebugMode() {
    const currentMode = localStorage.getItem('filterDebugMode') === 'true';
    const newMode = !currentMode;
    localStorage.setItem('filterDebugMode', newMode);
    console.log(`Filter debug mode ${newMode ? 'enabled' : 'disabled'}`);

    if (newMode) {
        // Run updateFilters to check for issues
        updateFilters();
    }

    return newMode;
}
