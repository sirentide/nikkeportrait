// Filter Panel Functionality

// Global variables are defined in storage.js

// Function to toggle filter panel visibility
function toggleFilterPanel() {
    // Prevent rapid toggling
    if (isToggling) return;
    isToggling = true;

    if (!filterPanel) {
        filterPanel = document.getElementById('filterPanel');
        if (!filterPanel) {
            console.error('Filter panel not found');
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
});
