// team-storage.js - Functions for saving and loading team set data

// Constants
const TEAM_STORAGE_KEY = 'nikkePortraitTeamData';

// Disable all console logging
function logInfo() {
    // Do nothing - logging disabled
}

function logError() {
    // Do nothing - logging disabled
}

// Function to save team set data to localStorage
function saveTeamSetData() {
    try {
        // Get all team sets
        const teamSets = {};

        logInfo('=== SAVING TEAM SET DATA ===');

        // Process each team set (1 and 2)
        for (let setId = 1; setId <= 2; setId++) {
            const teamContainer = document.querySelector(`#teamSet${setId}`);
            if (!teamContainer) continue;

            logInfo(`Team Set ${setId}:`);

            // Get all team rows
            const teamRows = teamContainer.querySelectorAll('.team-images');
            const teamData = [];

            // Process each team row
            teamRows.forEach((row, rowIndex) => {
                const slots = [];

                // // console.log(`  Row ${rowIndex}:`);

                // Process each slot in the row - include ALL slots, even empty ones
                row.querySelectorAll('.image-slot').forEach((slot, slotIndex) => {
                    const img = slot.querySelector('img');

                    // Create a unique identifier for this slot position
                    const slotPositionId = `${rowIndex}-${slotIndex}`;

                    // Create slot data - for both filled and empty slots
                    const slotData = {
                        position: {
                            row: rowIndex,
                            slot: slotIndex,
                            // Store the original position to track moves
                            originalPosition: slot.dataset.originalPosition || slotPositionId
                        },
                        isEmpty: !img, // Track if the slot is empty
                        slotId: slotPositionId // Unique identifier for this slot
                    };

                    // If this is the first time saving, set the original position
                    if (!slot.dataset.originalPosition) {
                        slot.dataset.originalPosition = slotPositionId;
                    }

                    // Log slot information
                    // // console.log(`    Slot ${slotIndex}: ${img ? 'Has Image' : 'Empty'}, ID: ${slotPositionId}, Original Position: ${slot.dataset.originalPosition}`);

                    // Add image data if the slot has an image
                    if (img) {
                        const src = img.src;
                        const filename = src.split('/').pop();
                        const id = filename.split('_')[0];

                        // Add image-specific data
                        slotData.id = id;
                        slotData.src = src;

                        // Extract metadata from data attributes if available
                        slotData.metadata = {
                            number: img.dataset.number || id,
                            name: img.dataset.name || '',
                            type: img.dataset.type || '',
                            position: img.dataset.position || '',
                            faction: img.dataset.faction || '',
                            rarity: img.dataset.rarity || '',
                            weapon: img.dataset.weapon || ''
                        };

                        // Store the image's position data
                        // First, store the current position if available
                        if (img.dataset.currentPosition) {
                            slotData.currentImagePosition = img.dataset.currentPosition;
                        }

                        // Then store the original slot position if available
                        if (img.dataset.originalSlot) {
                            slotData.originalImageSlot = img.dataset.originalSlot;
                        } else {
                            // If not set yet, set it now
                            img.dataset.originalSlot = slotPositionId;
                            slotData.originalImageSlot = slotPositionId;
                        }

                        // Log image information
                        // console.log(`      Image ID: ${id}, Name: ${slotData.metadata.name}, Original Slot: ${slotData.originalImageSlot}`);
                    }

                    // Add slot data to the array
                    slots.push(slotData);
                });

                // Add row data - include all rows, even if they have no images
                teamData.push({
                    row: rowIndex,
                    slots: slots
                });
            });

            // Add team set data
            teamSets[setId] = teamData;
        }

        // Save to localStorage
        const dataToSave = {
            version: '1.2', // Updated version to reflect the new format
            timestamp: new Date().toISOString(),
            teamSets: teamSets,
            currentTeamSet: currentTeamSet || '1'
        };

        // Save to localStorage
        const jsonData = JSON.stringify(dataToSave);
        localStorage.setItem(TEAM_STORAGE_KEY, jsonData);

        // Verify the data was saved correctly
        const savedData = localStorage.getItem(TEAM_STORAGE_KEY);
        if (savedData === jsonData) {
            // // console.log('Saved team set data with enhanced position tracking, size:', jsonData.length, 'bytes');
            // // console.log('Data structure:', JSON.stringify(dataToSave, null, 2).substring(0, 500) + '...');
            return true;
        } else {
            // console.error('Failed to save team set data to localStorage! Data mismatch or storage limit exceeded.');
            // console.error('Attempted to save:', jsonData.length, 'bytes');
            return false;
        }
    } catch (error) {
        // console.error('Error saving team set data:', error);
        return false;
    }
}

// Function to load team set data from localStorage
async function loadTeamSetData() {
    try {
        logInfo('=== LOADING TEAM SET DATA ===');

        // Get data from localStorage
        const savedData = localStorage.getItem(TEAM_STORAGE_KEY);
        if (!savedData) {
            logInfo('No saved data found in localStorage');
            return false;
        }

        // Parse the data
        const parsedData = JSON.parse(savedData);
        if (!parsedData || !parsedData.teamSets) {
            logInfo('Invalid data format in localStorage');
            return false;
        }

        // Check version to handle different formats
        const dataVersion = parsedData.version || '1.0';
        logInfo(`Loading data version: ${dataVersion}`);

        // Process each team set
        for (const setId in parsedData.teamSets) {
            const teamData = parsedData.teamSets[setId];
            if (!teamData || !Array.isArray(teamData)) continue;

            // // console.log(`Team Set ${setId}:`);

            // Get the team container
            const teamContainer = document.querySelector(`#teamSet${setId}`);
            if (!teamContainer) continue;

            // First, reset all slots to empty in all rows
            teamContainer.querySelectorAll('.image-slot').forEach(slot => {
                slot.innerHTML = '';
                slot.classList.add('empty');
                // Clear any position tracking attributes
                delete slot.dataset.originalPosition;
                delete slot.dataset.originalSlot;
            });

            // // console.log('  All slots reset to empty');

            // Create a map to store slot data by position
            const slotDataMap = new Map();

            // First pass: collect all slot data
            // // console.log('  First pass: collecting slot data');
            teamData.forEach(rowData => {
                if (!rowData || !rowData.slots || !Array.isArray(rowData.slots)) return;

                const rowIndex = rowData.row;
                // // console.log(`    Row ${rowIndex}:`);

                rowData.slots.forEach(slotData => {
                    if (!slotData) return;

                    // Skip empty slots for version 1.1+ unless we're on version 1.2+
                    if (dataVersion >= '1.1' && dataVersion < '1.2' && slotData.isEmpty) {
                        // // console.log(`      Skipping empty slot (v${dataVersion}): ${slotData.slotId || 'unknown'}`);
                        return;
                    }

                    // For version 1.0, skip slots without src
                    if (dataVersion === '1.0' && (!slotData || !slotData.src)) {
                        // // console.log(`      Skipping slot without src (v1.0): ${slotData.slotId || 'unknown'}`);
                        return;
                    }

                    // For version 1.2+, use the slotId as the key
                    let mapKey;
                    if (dataVersion >= '1.2' && slotData.slotId) {
                        mapKey = slotData.slotId;
                        slotDataMap.set(mapKey, slotData);
                        // // console.log(`      Mapped slot by ID: ${mapKey}, isEmpty: ${slotData.isEmpty}, hasImage: ${!!slotData.src}`);
                    } else {
                        // For older versions, use row-slot as the key
                        mapKey = `${slotData.position.row}-${slotData.position.slot}`;
                        slotDataMap.set(mapKey, slotData);
                        // // console.log(`      Mapped slot by position: ${mapKey}, isEmpty: ${slotData.isEmpty || 'unknown'}, hasImage: ${!!slotData.src}`);
                    }
                });
            });

            // Second pass: place images in their correct positions
            // // console.log('  Second pass: placing images in slots');

            // First, create a map of all slots by their original position
            const slotsByOriginalPosition = new Map();

            // Collect all slots with their original positions
            teamData.forEach(rowData => {
                if (!rowData || !rowData.slots || !Array.isArray(rowData.slots)) return;

                rowData.slots.forEach(slotData => {
                    if (!slotData) return;

                    // Skip slots without position data
                    if (!slotData.position) return;

                    // Get the original position
                    const originalPosition = slotData.position.originalPosition || slotData.slotId;

                    // Store the slot data by its original position
                    slotsByOriginalPosition.set(originalPosition, slotData);
                    // // console.log(`    Mapped slot by original position: ${originalPosition}, isEmpty: ${slotData.isEmpty}, hasImage: ${!!slotData.src}`);
                });
            });

            // Now process each row
            teamData.forEach(rowData => {
                if (!rowData || !rowData.slots || !Array.isArray(rowData.slots)) return;

                // Get the row
                const rowIndex = rowData.row;
                const teamRows = teamContainer.querySelectorAll('.team-images');
                if (rowIndex >= teamRows.length) return;

                const row = teamRows[rowIndex];
                // // console.log(`    Row ${rowIndex}:`);

                // Process each slot in the row
                row.querySelectorAll('.image-slot').forEach((slot, slotIndex) => {
                    // Create a position key for this slot
                    const posKey = `${rowIndex}-${slotIndex}`;

                    // Get the slot data for this position
                    let slotData = slotDataMap.get(posKey);

                    // Skip if no data (for version < 1.2)
                    if (!slotData) {
                        // // console.log(`      Slot ${slotIndex}: No data found for position ${posKey}`);
                        return;
                    }

                    // For version 1.2+, we need to handle empty slots differently
                    if (dataVersion >= '1.2') {
                        // Set the original position attribute
                        if (slotData.position && slotData.position.originalPosition) {
                            slot.dataset.originalPosition = slotData.position.originalPosition;
                            // // console.log(`      Slot ${slotIndex}: Set originalPosition to ${slotData.position.originalPosition}`);
                        } else {
                            slot.dataset.originalPosition = posKey;
                            // // console.log(`      Slot ${slotIndex}: Set originalPosition to ${posKey} (default)`);
                        }

                        // Skip if this is an empty slot
                        if (slotData.isEmpty) {
                            // // console.log(`      Slot ${slotIndex}: Empty slot, skipping image creation`);
                            return;
                        }
                    } else if (dataVersion < '1.2' && slotData.isEmpty) {
                        // // console.log(`      Slot ${slotIndex}: Skipping empty slot (v${dataVersion})`);
                        return;
                    }

                    // Create the image
                    const img = document.createElement('img');
                    img.src = slotData.src;
                    img.draggable = false;

                    // Add metadata
                    if (slotData.metadata) {
                        for (const key in slotData.metadata) {
                            img.dataset[key] = slotData.metadata[key];
                        }
                    }

                    // Set the position attributes for the image
                    if (dataVersion >= '1.2') {
                        // Set the original slot attribute
                        if (slotData.originalImageSlot) {
                            img.dataset.originalSlot = slotData.originalImageSlot;
                            // // console.log(`      Slot ${slotIndex}: Set image originalSlot to ${slotData.originalImageSlot}`);
                        }

                        // Set the current position attribute
                        if (slotData.currentImagePosition) {
                            img.dataset.currentPosition = slotData.currentImagePosition;
                            // // console.log(`      Slot ${slotIndex}: Set image currentPosition to ${slotData.currentImagePosition}`);
                        } else {
                            // If not available, use the current position
                            img.dataset.currentPosition = posKey;
                            // // console.log(`      Slot ${slotIndex}: Set image currentPosition to ${posKey} (default)`);
                        }
                    }

                    // Add click handler for removal
                    img.onclick = () => {
                        const galleryImg = document.querySelector(`.photo img[src="${img.src}"]`);
                        if (galleryImg) {
                            toggleImageSelection(galleryImg);
                        } else {
                            const toggleImg = document.querySelector(`.toggle-item img[src="${img.src}"]`);
                            if (toggleImg) {
                                toggleImageSelection(toggleImg);
                            }
                        }
                    };

                    // Clear the slot and add the image
                    slot.innerHTML = '';
                    slot.appendChild(img);
                    slot.classList.remove('empty');
                    // // console.log(`      Slot ${slotIndex}: Added image ${slotData.id || 'unknown'}, name: ${slotData.metadata?.name || 'unknown'}`);
                });
            });
        }

        // Set the current team set
        if (parsedData.currentTeamSet) {
            currentTeamSet = parsedData.currentTeamSet;
            switchTeamSet(currentTeamSet);
            // // console.log(`Switched to team set ${currentTeamSet}`);
        }

        // Update the selection state of toggle images
        updateToggleImageSelectionState(currentTeamSet);

        // Update team score
        updateTeamScore();

        // // console.log(`Loaded team set data (version ${dataVersion}) with enhanced position tracking`);

        // Log the current state of the DOM after loading
        // // console.log('=== CURRENT DOM STATE AFTER LOADING ===');
        for (let setId = 1; setId <= 2; setId++) {
            const teamContainer = document.querySelector(`#teamSet${setId}`);
            if (!teamContainer) continue;

            // // console.log(`Team Set ${setId}:`);

            teamContainer.querySelectorAll('.team-images').forEach((row, rowIndex) => {
                // // console.log(`  Row ${rowIndex}:`);

                row.querySelectorAll('.image-slot').forEach((slot, slotIndex) => {
                    const img = slot.querySelector('img');
                    // // console.log(`    Slot ${slotIndex}: ${img ? 'Has Image' : 'Empty'}, Original Position: ${slot.dataset.originalPosition || 'not set'}`);

                    if (img) {
                        // // console.log(`      Image Original Slot: ${img.dataset.originalSlot || 'not set'}, Name: ${img.dataset.name || 'unknown'}`);
                    }
                });
            });
        }

        return true;
    } catch (error) {
        // console.error('Error loading team set data:', error);
        return false;
    }
}

// Function to clear team set data
function clearTeamSetData() {
    try {
        localStorage.removeItem(TEAM_STORAGE_KEY);
        return true;
    } catch (error) {
        // console.error('Error clearing team set data:', error);
        return false;
    }
}

// Function to initialize Sortable for team sets
function initializeSortable() {
    logInfo('=== INITIALIZING SORTABLE FOR TEAM SETS ===');

    // Check if Sortable is available
    if (!window.Sortable) {
        logError('Sortable library not found! Make sure it is loaded before initializing.');
        return;
    }

    logInfo('Sortable library found, initializing...');

    // Create a map to store Sortable instances
    const sortableInstances = new Map();

    // First, destroy any existing Sortable instances to prevent duplicates
    document.querySelectorAll('.team-images').forEach((teamRow) => {
        const existingSortable = teamRow.sortableInstance;
        if (existingSortable && typeof existingSortable.destroy === 'function') {
            logInfo('Destroying existing Sortable instance');
            existingSortable.destroy();
            delete teamRow.sortableInstance;
        }
    });

    // Initialize Sortable for each team row
    document.querySelectorAll('.team-images').forEach((teamRow, rowIndex) => {
        logInfo(`Initializing Sortable for row ${rowIndex}`);

        try {
            // Use the global Sortable object from the CDN
            // The Sortable library is included in index.html
            const sortable = Sortable.create(teamRow, {
            animation: 150,
            draggable: '.image-slot', // Make all slots draggable, not just those with images
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            dragClass: 'sortable-drag',
            group: 'team-slots', // Allow dragging between rows
            onStart: function(evt) {
                // console.log('=== SORTABLE DRAG START ===');

                // Check if the slot is empty (no image)
                const slot = evt.item;
                // console.log(`Drag started for slot:`, slot);

                if (slot.classList.contains('empty') && !slot.querySelector('img')) {
                    // Cancel the drag if the slot is empty
                    // console.log('Slot is empty, canceling drag');
                    evt.cancel = true;
                } else {
                    // console.log('Slot has content, proceeding with drag');

                    // Add active class to all team rows
                    document.querySelectorAll('.team-images').forEach(row => {
                        row.classList.add('sortable-active');
                    });

                    // Store the original position of the dragged item
                    const img = slot.querySelector('img');
                    if (img) {
                        // Get the row and slot indices
                        const rowIndex = Array.from(document.querySelectorAll('.team-images')).indexOf(teamRow);
                        const slotIndex = Array.from(teamRow.querySelectorAll('.image-slot')).indexOf(slot);

                        // Store the original position
                        evt.originalPosition = {
                            row: rowIndex,
                            slot: slotIndex
                        };

                        // console.log(`Dragging slot with image from position ${rowIndex}-${slotIndex}`);
                        // console.log(`Image src: ${img.src.split('/').pop()}`);
                        // console.log(`Slot originalPosition: ${slot.dataset.originalPosition || 'not set'}`);
                        // console.log(`Image originalSlot: ${img.dataset.originalSlot || 'not set'}`);
                    } else {
                        // console.log('Slot has no image but is not empty (might contain other content)');
                    }
                }
            },
            onEnd: function(evt) {
                // console.log('=== SORTABLE DRAG END ===');

                // Remove active class from all team rows
                document.querySelectorAll('.team-images').forEach(row => {
                    row.classList.remove('sortable-active');
                });

                // Get the dragged slot
                const draggedSlot = evt.item;
                const img = draggedSlot.querySelector('img');

                // Get source and destination information
                const fromRow = evt.from;
                const toRow = evt.to;
                const fromRowIndex = Array.from(document.querySelectorAll('.team-images')).indexOf(fromRow);
                const toRowIndex = Array.from(document.querySelectorAll('.team-images')).indexOf(toRow);

                // console.log(`Drag from row ${fromRowIndex} to row ${toRowIndex}`);
                // console.log(`Old index: ${evt.oldIndex}, New index: ${evt.newIndex}`);

                if (img) {
                    // Get the new position
                    const newRow = evt.to;
                    const newRowIndex = Array.from(document.querySelectorAll('.team-images')).indexOf(newRow);
                    const newSlotIndex = Array.from(newRow.querySelectorAll('.image-slot')).indexOf(draggedSlot);

                    // Create position identifiers
                    const newPositionId = `${newRowIndex}-${newSlotIndex}`;
                    const oldPositionId = img.dataset.originalSlot || 'unknown';

                    // console.log(`Dragged slot has image: ${img.src.split('/').pop()}`);
                    // console.log(`Image original slot: ${oldPositionId}`);
                    // console.log(`New position: ${newPositionId}`);

                    // Always update the slot's originalPosition to track the current position
                    // This is the key to preserving the position after refresh
                    draggedSlot.dataset.originalPosition = newPositionId;
                    // console.log(`Updated slot originalPosition to ${newPositionId}`);

                    // Update the image's position data
                    // This is crucial for tracking image positions when swapping
                    img.dataset.currentPosition = newPositionId;
                    // console.log(`Set image currentPosition to ${newPositionId}`);

                    // Update the image's original slot if it's the first time moving
                    if (!img.dataset.originalSlot) {
                        img.dataset.originalSlot = newPositionId;
                        // console.log(`Set image originalSlot to ${newPositionId} (first move)`);
                    } else {
                        // console.log(`Keeping image originalSlot as ${img.dataset.originalSlot}`);
                    }

                    // Log the movement
                    // console.log(`Moved image from ${evt.originalPosition?.row}-${evt.originalPosition?.slot} to ${newPositionId}`);

                    // Update all slots in both the source and destination rows
                    // This ensures that all position data is properly updated
                    [fromRow, toRow].forEach((row, rowIdx) => {
                        const rowIndex = rowIdx === 0 ? fromRowIndex : toRowIndex;
                        if (rowIndex === -1) return;

                        row.querySelectorAll('.image-slot').forEach((slot, slotIndex) => {
                            const slotImg = slot.querySelector('img');
                            if (slotImg) {
                                // Update the image's current position
                                const currentPosId = `${rowIndex}-${slotIndex}`;
                                slotImg.dataset.currentPosition = currentPosId;

                                // Also update the slot's position data
                                slot.dataset.originalPosition = currentPosId;

                                // console.log(`Updated position data for slot ${currentPosId} with image ${slotImg.src.split('/').pop()}`);
                            }
                        });
                    });
                } else {
                    // console.log('Dragged slot has no image');
                }

                // Force a save immediately after the drag operation
                // This is crucial to ensure the position data is saved
                // console.log('Forcing immediate save after drag operation');
                try {
                    // Save immediately without setTimeout
                    saveTeamSetData();

                    // Also trigger a manual save event to ensure it's captured
                    const saveEvent = new CustomEvent('teamDataSaved', {
                        detail: { source: 'dragEnd', timestamp: new Date().toISOString() }
                    });
                    document.dispatchEvent(saveEvent);

                    // console.log('Triggered teamDataSaved event after drag end');
                } catch (error) {
                    console.error('Error saving team set data after drag end:', error);
                }

                // Log the current state of all slots in the affected rows
                // console.log('Current state after drag:');

                [fromRowIndex, toRowIndex].forEach(rowIndex => {
                    if (rowIndex === -1) return;

                    const row = document.querySelectorAll('.team-images')[rowIndex];
                    // console.log(`  Row ${rowIndex}:`);

                    row.querySelectorAll('.image-slot').forEach((slot, slotIndex) => {
                        const slotImg = slot.querySelector('img');
                        // console.log(`    Slot ${slotIndex}: ${slotImg ? 'Has Image' : 'Empty'}, Original Position: ${slot.dataset.originalPosition || 'not set'}`);

                        if (slotImg) {
                            // console.log(`      Image Original Slot: ${slotImg.dataset.originalSlot || 'not set'}, Name: ${slotImg.dataset.name || 'unknown'}`);
                        }
                    });
                });

                // Save the team set data after sorting
                // console.log('Saving team set data after drag and drop');

                // Force a synchronous save to ensure the position data is saved
                try {
                    // First save the team set data
                    saveTeamSetData();

                    // Then force a save to localStorage
                    const savedData = localStorage.getItem(TEAM_STORAGE_KEY);
                    if (savedData) {
                        // console.log('Verified data was saved to localStorage, size:', savedData.length, 'bytes');

                        // Trigger a custom event to notify that data was saved
                        const saveEvent = new CustomEvent('teamDataSaved', {
                            detail: { source: 'dragEndFinal', timestamp: new Date().toISOString(), dataSize: savedData.length }
                        });
                        document.dispatchEvent(saveEvent);
                        // console.log('Triggered final teamDataSaved event after drag end');
                    } else {
                        console.error('Failed to save data to localStorage!');
                        // Try again with a direct save
                        const teamSets = {};

                        // Process each team set (1 and 2)
                        for (let setId = 1; setId <= 2; setId++) {
                            const teamContainer = document.querySelector(`#teamSet${setId}`);
                            if (!teamContainer) continue;

                            // Get all team rows
                            const teamRows = teamContainer.querySelectorAll('.team-images');
                            const teamData = [];

                            // Process each team row
                            teamRows.forEach((row, rowIndex) => {
                                const slots = [];

                                // Process each slot in the row - include ALL slots, even empty ones
                                row.querySelectorAll('.image-slot').forEach((slot, slotIndex) => {
                                    const img = slot.querySelector('img');

                                    // Create a unique identifier for this slot position
                                    const slotPositionId = `${rowIndex}-${slotIndex}`;

                                    // Create slot data - for both filled and empty slots
                                    const slotData = {
                                        position: {
                                            row: rowIndex,
                                            slot: slotIndex,
                                            // Store the original position to track moves
                                            originalPosition: slot.dataset.originalPosition || slotPositionId
                                        },
                                        isEmpty: !img, // Track if the slot is empty
                                        slotId: slotPositionId // Unique identifier for this slot
                                    };

                                    // Add image data if the slot has an image
                                    if (img) {
                                        const src = img.src;
                                        const filename = src.split('/').pop();
                                        const id = filename.split('_')[0];

                                        // Add image-specific data
                                        slotData.id = id;
                                        slotData.src = src;

                                        // Extract metadata from data attributes if available
                                        slotData.metadata = {
                                            number: img.dataset.number || id,
                                            name: img.dataset.name || '',
                                            type: img.dataset.type || '',
                                            position: img.dataset.position || '',
                                            faction: img.dataset.faction || '',
                                            rarity: img.dataset.rarity || '',
                                            weapon: img.dataset.weapon || ''
                                        };

                                        // Store the image's original slot position if available
                                        if (img.dataset.originalSlot) {
                                            slotData.originalImageSlot = img.dataset.originalSlot;
                                        } else {
                                            // If not set yet, set it now
                                            img.dataset.originalSlot = slotPositionId;
                                            slotData.originalImageSlot = slotPositionId;
                                        }
                                    }

                                    // Add slot data to the array
                                    slots.push(slotData);
                                });

                                // Add row data - include all rows, even if they have no images
                                teamData.push({
                                    row: rowIndex,
                                    slots: slots
                                });
                            });

                            // Add team set data
                            teamSets[setId] = teamData;
                        }

                        // Save to localStorage
                        const dataToSave = {
                            version: '1.2', // Updated version to reflect the new format
                            timestamp: new Date().toISOString(),
                            teamSets: teamSets,
                            currentTeamSet: currentTeamSet || '1'
                        };

                        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(dataToSave));
                        // console.log('Forced direct save to localStorage after drag and drop');
                    }
                } catch (error) {
                    console.error('Error saving team set data after drag and drop:', error);
                }

                // Update team score
                updateTeamScore();

                // // console.log('Updated slot positions after drag and drop');
            }
        });

            // Store a reference to the Sortable instance on the element itself
            // This makes it easier to access and destroy later
            teamRow.sortableInstance = sortable;

            // // console.log(`Successfully initialized Sortable for row ${rowIndex}`);
        } catch (error) {
            // console.error(`Error initializing Sortable for row ${rowIndex}:`, error);
        }
    });

    // Return success
    return true;
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOMContentLoaded event fired');

    // Initialize Sortable
    // console.log('Calling initializeSortable()');
    initializeSortable();

    // Load team set data
    // console.log('Calling loadTeamSetData()');
    loadTeamSetData();

    // Add a mouseup event listener to the document to ensure we save after any drag operation
    document.addEventListener('mouseup', function(e) {
        // Only save on left-click mouseup (button 0)
        if (e.button === 0) {
            // console.log('Left-click mouseup event, saving team set data');
            saveTeamSetData();
        }
    });

    // Add a listener for the custom teamDataSaved event
    document.addEventListener('teamDataSaved', function(e) {
        // console.log(`Team data saved event received from ${e.detail.source} at ${e.detail.timestamp}`);

        // Update team score
        if (typeof updateTeamScore === 'function') {
            updateTeamScore();
        }

        // Update toggle image selection state
        if (typeof updateToggleImageSelectionState === 'function') {
            updateToggleImageSelectionState(currentTeamSet);
        }
    });

    // Add a listener for the window load event to ensure everything is fully loaded
    window.addEventListener('load', function() {
        // console.log('Window load event fired');
        // console.log('Re-initializing Sortable to ensure it works');
        initializeSortable();

        // Add a manual trigger for Sortable initialization after a short delay
        setTimeout(function() {
            // console.log('Delayed re-initialization of Sortable');
            initializeSortable();

            // Add direct event listeners to image slots
            document.querySelectorAll('.image-slot').forEach(function(slot) {
                // Add mouseup event listener to each slot
                slot.addEventListener('mouseup', function(e) {
                    // Only save on left-click mouseup (button 0)
                    if (e.button === 0) {
                        // console.log('Slot mouseup event, saving team set data');
                        try {
                            saveTeamSetData();
                        } catch (error) {
                            console.error('Error saving team set data from slot mouseup:', error);
                        }
                    }
                });

                // Add dragend event listener to each slot
                slot.addEventListener('dragend', function(e) {
                    // console.log('Slot dragend event, saving team set data');
                    try {
                        saveTeamSetData();

                        // Trigger a custom event to notify that data was saved
                        const saveEvent = new CustomEvent('teamDataSaved', {
                            detail: { source: 'slotDragEnd', timestamp: new Date().toISOString() }
                        });
                        document.dispatchEvent(saveEvent);
                    } catch (error) {
                        console.error('Error saving team set data from slot dragend:', error);
                    }
                });
            });

            // Add event listeners to the fixed-team-container
            document.querySelectorAll('.fixed-team-container').forEach(function(container) {
                container.addEventListener('drop', function(e) {
                    // console.log('Container drop event, saving team set data');
                    try {
                        // Wait a short time to ensure the DOM has updated
                        setTimeout(function() {
                            saveTeamSetData();

                            // Trigger a custom event to notify that data was saved
                            const saveEvent = new CustomEvent('teamDataSaved', {
                                detail: { source: 'containerDrop', timestamp: new Date().toISOString() }
                            });
                            document.dispatchEvent(saveEvent);
                        }, 50);
                    } catch (error) {
                        console.error('Error saving team set data from container drop:', error);
                    }
                });
            });
        }, 1000);
    });
});

// Export functions
window.teamStorage = {
    saveTeamSetData,
    loadTeamSetData,
    clearTeamSetData,
    initializeSortable
};
