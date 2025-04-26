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
    console.log('Updating filters');

    // Get all checked filter values
    const filters = {
        position: [],
        rarity: [],
        faction: [],
        weapon: [],
        type: []
    };

    // Get total number of checkboxes for each filter type
    const totalCheckboxes = {
        position: 0,
        rarity: 0,
        faction: 0,
        weapon: 0,
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
            uniqueBurstValues.add(value);
        }
    });

    // Add unique burst values to filters
    uniqueBurstValues.forEach(value => {
        filters.type.push(value);
    });

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
            } else {
                itemValue = item.dataset[filterType];
            }

            if (!itemValue) {
                shouldShow = false;
                break;
            }

            // Special handling for type filter (burst type)
            if (filterType === 'type') {
                // Convert both to lowercase for case-insensitive comparison
                const itemValueLower = itemValue.toLowerCase();
                // Check if any filter value is included in the item value
                const typeMatch = filterValues.some(filterValue => {
                    return itemValueLower.includes(filterValue.toLowerCase());
                });

                if (!typeMatch) {
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
                        // Look for position patterns like _atk_, _def_, _sp_ in the filename
                        const posMatch = filename.match(/_(atk|def|sp)_/i);
                        if (posMatch && posMatch[1]) {
                            itemValue = posMatch[1].toLowerCase();
                            // console.log('Extracted position from filename for toggle item:', itemValue);
                        }
                    }

                    // If still no value, fall back to dataset.position
                    if (!itemValue) {
                        itemValue = item.dataset[filterType];
                    }
                }
            } else {
                itemValue = item.dataset[filterType];
            }

            if (!itemValue) {
                shouldShow = false;
                break;
            }

            // Special handling for type filter (burst type)
            if (filterType === 'type') {
                // Convert both to lowercase for case-insensitive comparison
                const itemValueLower = itemValue.toLowerCase();
                // Check if any filter value is included in the item value
                const typeMatch = filterValues.some(filterValue => {
                    return itemValueLower.includes(filterValue.toLowerCase());
                });

                if (!typeMatch) {
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

    // If script.js has its own updateFilters function, call it to ensure consistency
    if (typeof window.updateFilters === 'function' && window.updateFilters !== updateFilters) {
        console.log('Calling script.js updateFilters for consistency');
        window.updateFilters();
    }
}
