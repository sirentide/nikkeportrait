// Team Sets Management
const SAVED_SETS_KEY = 'nikkePortraitSavedSets';

// Import functions from storage.js if they're not already available
if (typeof saveTeamNames !== 'function') {
    // This will be used as a fallback if the function isn't available
    function saveTeamNames() {
        try {
            localStorage.setItem('nikkeTeamNames', JSON.stringify(teamNames));
            console.log('Saved team names:', teamNames);
        } catch (error) {
            console.error('Error saving team names:', error);
        }
    }
}

// Function to save a team set
function saveTeamSet(name) {
    if (!name || name.trim() === '') {
        alert('Please enter a name for the team set');
        return;
    }

    // Get the current team set
    const currentTeamContainer = document.querySelector(`#teamSet${currentTeamSet}`);
    if (!currentTeamContainer) {
        console.error('Current team container not found');
        return;
    }

    // Get all teams in the current team set
    const teams = currentTeamContainer.querySelectorAll('.team-images');

    // Create an array to hold our team data
    const teamsData = [];

    // Process each team
    teams.forEach((team) => {
        // Get all images in this team
        const images = Array.from(team.querySelectorAll('.image-slot img'));

        // Add this team's data to our teams array
        teamsData.push({
            images: images.map(img => ({
                src: img.src,
                score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
            }))
        });
    });

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
    }

    // Add the new set - ensure it's in the expected format
    savedSets[name] = {
        teams: teamsData,
        timestamp: new Date().toISOString()
    };

    // Debug the saved data structure
    console.log('Saved team set structure:', savedSets[name]);

    // Save back to localStorage
    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(savedSets));

    // Show success message
    alert(`Team set "${name}" has been saved.`);

    // Refresh the saved sets panel if it's open
    if (document.querySelector('.saved-sets-panel')) {
        showSavedSetsPanel();
    }
}

// Function to load a team set
function loadTeamSet(name, targetSet) {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        return;
    }

    // Check if the set exists
    if (!savedSets[name]) {
        alert(`Team set "${name}" not found.`);
        return;
    }

    // Get the target team set container
    const targetTeamContainer = document.querySelector(`#teamSet${targetSet}`);
    if (!targetTeamContainer) {
        console.error('Target team container not found');
        return;
    }

    // Clear the target team set
    const teamRows = targetTeamContainer.querySelectorAll('.team-images');
    teamRows.forEach(row => {
        row.querySelectorAll('.image-slot').forEach(slot => {
            slot.innerHTML = '';
            slot.classList.add('empty');
        });
    });

    // Load the saved team set
    const savedTeams = savedSets[name].teams;
    savedTeams.forEach((team, teamIndex) => {
        if (teamIndex >= teamRows.length) return;

        const teamRow = teamRows[teamIndex];
        const slots = teamRow.querySelectorAll('.image-slot');

        // Handle all possible data formats for maximum compatibility
        if (Array.isArray(team)) {
            // Ultra-compact format - just an array of IDs
            team.forEach((id, imgIndex) => {
                if (imgIndex >= slots.length) return;

                const slot = slots[imgIndex];
                const img = document.createElement('img');

                // Reconstruct the full path from the ID
                img.src = `image/${id}_name.png`;

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

                slot.appendChild(img);
                slot.classList.remove('empty');
            });
        } else if (team.images) {
            // Old format with full image data
            team.images.forEach((imgData, imgIndex) => {
                if (imgIndex >= slots.length) return;

                const slot = slots[imgIndex];
                const img = document.createElement('img');
                img.src = imgData.src;

                // Add click handler for removal
                img.onclick = () => {
                    const galleryImg = document.querySelector(`.photo img[src="${imgData.src}"]`);
                    if (galleryImg) {
                        toggleImageSelection(galleryImg);
                    } else {
                        const toggleImg = document.querySelector(`.toggle-item img[src="${imgData.src}"]`);
                        if (toggleImg) {
                            toggleImageSelection(toggleImg);
                        }
                    }
                };

                slot.appendChild(img);
                slot.classList.remove('empty');
            });
        } else if (team.i) {
            // Intermediate optimized format with just filenames
            team.i.forEach((filename, imgIndex) => {
                if (imgIndex >= slots.length) return;

                const slot = slots[imgIndex];
                const img = document.createElement('img');

                // Reconstruct the full path
                img.src = `image/${filename}`;

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

                slot.appendChild(img);
                slot.classList.remove('empty');
            });
        }
    });

    // Refresh the selected state of images
    refreshSelectedImages();

    // Update team score
    updateTeamScore();

    // Extract the custom name from the saved team set name
    let customName = '';
    if (name.includes(',')) {
        // If the name has a comma, extract the part after the comma as the custom name
        customName = name.split(',').slice(1).join(',').trim();
    } else {
        // If no comma, use the whole name as the custom name
        customName = name;
    }

    // Update the team name
    if (customName) {
        teamNames[targetSet] = customName;
        updateTeamTitle(targetSet);
        console.log(`Updated team name for set ${targetSet} to "${customName}"`);
    }

    // Update the team-specific toggle images
    if (typeof saveCurrentToggleImages === 'function') {
        saveCurrentToggleImages();
    }

    // Switch to the target team set
    switchTeamSet(targetSet);

    // Save the selection to localStorage with a slight delay to ensure all updates are processed
    setTimeout(() => {
        // Save to main storage
        saveSelectionToLocalStorage();

        // Also update the toggle tabs storage if available
        if (typeof saveToggleTabsToLocalStorage === 'function') {
            saveToggleTabsToLocalStorage();
        }

        // Save the updated team names
        saveTeamNames();

        console.log(`Team set "${name}" loaded into ${targetSet === '1' ? 'Defender' : 'Attacker'} and saved to localStorage`);
    }, 100);

    // Show success message
    const setName = targetSet === '1' ? 'Defender' : 'Attacker';
    alert(`Team set "${name}" has been loaded into ${setName}.`);
}

// Function to rename a team set
function renameTeamSet(oldName, newName) {
    if (!oldName || !newName || oldName.trim() === '' || newName.trim() === '') {
        alert('Invalid team set name');
        return false;
    }

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        return false;
    }

    // Check if the old name exists
    if (!savedSets[oldName]) {
        alert(`Team set "${oldName}" not found.`);
        return false;
    }

    // Check if the new name already exists
    if (savedSets[newName]) {
        alert(`A team set with the name "${newName}" already exists.`);
        return false;
    }

    // Rename the team set
    savedSets[newName] = savedSets[oldName];
    delete savedSets[oldName];

    // Update the timestamp
    savedSets[newName].timestamp = new Date().toISOString();

    // Save back to localStorage
    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(savedSets));

    // No alert message for rename operation
    console.log(`Team set renamed from "${oldName}" to "${newName}"`);
    return true;
}

// Function to delete a team set
function deleteTeamSet(name) {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        return;
    }

    // Check if the set exists
    if (!savedSets[name]) {
        alert(`Team set "${name}" not found.`);
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete team set "${name}"?`)) {
        return;
    }

    // Delete the set
    delete savedSets[name];

    // Save back to localStorage
    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(savedSets));

    // Show success message
    alert(`Team set "${name}" has been deleted.`);

    // Refresh the saved sets panel if it's open
    if (document.querySelector('.saved-sets-panel')) {
        showSavedSetsPanel();
    }
}

// Function to filter saved sets based on search query
function filterSavedSets(query, setsList, savedSets) {
    // Clear the current list
    setsList.innerHTML = '';

    if (Object.keys(savedSets).length === 0) {
        const noSets = document.createElement('p');
        noSets.textContent = 'No saved team sets found.';
        noSets.style.textAlign = 'center';
        noSets.style.color = '#aaa';
        setsList.appendChild(noSets);
        return;
    }

    // Sort sets by timestamp (newest first)
    const sortedSets = Object.entries(savedSets).sort((a, b) => {
        const timeA = new Date(a[1].timestamp || 0).getTime();
        const timeB = new Date(b[1].timestamp || 0).getTime();
        return timeB - timeA;
    });

    // Filter sets based on query
    const filteredSets = sortedSets.filter(([name]) =>
        name.toLowerCase().includes(query)
    );

    if (filteredSets.length === 0) {
        const noResults = document.createElement('p');
        noResults.textContent = `No results found for "${query}"`;
        noResults.style.textAlign = 'center';
        noResults.style.color = '#aaa';
        setsList.appendChild(noResults);
        return;
    }

    // Create set items for filtered sets
    filteredSets.forEach(([name, data]) => {
        const setItem = document.createElement('div');
        setItem.className = 'set-item';
        setItem.style.backgroundColor = '#333';
        setItem.style.borderRadius = '6px';
        setItem.style.padding = '15px';
        setItem.style.marginBottom = '10px';

        // Set name and timestamp
        const setInfo = document.createElement('div');
        setInfo.style.marginBottom = '10px';
        setInfo.style.display = 'flex';
        setInfo.style.justifyContent = 'space-between';
        setInfo.style.alignItems = 'center';

        const nameContainer = document.createElement('div');
        nameContainer.style.flex = '1';

        const setName = document.createElement('h3');
        setName.textContent = name;
        setName.style.margin = '0 0 5px 0';
        nameContainer.appendChild(setName);
        setInfo.appendChild(nameContainer);

        // Add edit button
        const editButton = document.createElement('button');
        editButton.innerHTML = '✏️';
        editButton.title = 'Edit name';
        editButton.style.marginLeft = '10px';
        editButton.style.padding = '5px 10px';
        editButton.style.backgroundColor = '#444';
        editButton.style.border = 'none';
        editButton.style.borderRadius = '4px';
        editButton.style.cursor = 'pointer';
        editButton.style.fontSize = '14px';

        // Add hover effect
        editButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#555';
        });
        editButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#444';
        });

        // Add click handler for editing
        editButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the set item click

            // Create an input field to edit the name
            const input = document.createElement('input');
            input.type = 'text';
            input.value = name;
            input.style.width = '100%';
            input.style.padding = '5px';
            input.style.borderRadius = '4px';
            input.style.border = '1px solid #00aaff';
            input.style.backgroundColor = '#333';
            input.style.color = 'white';
            input.style.fontSize = '16px';

            // Replace the name with the input field
            nameContainer.innerHTML = '';
            nameContainer.appendChild(input);
            input.focus();
            input.select();

            // Handle saving the edited name
            function saveEditedName() {
                const newName = input.value.trim();
                if (newName && newName !== name) {
                    // Rename the team set in localStorage
                    const success = renameTeamSet(name, newName);

                    if (success) {
                        // Update the name variable in the closure
                        // This is crucial for subsequent edit operations
                        name = newName;

                        // Update all references to the name in this item
                        setName.textContent = newName;

                        // Update the load buttons to use the new name
                        const loadButtons = setItem.querySelectorAll('button');
                        loadButtons.forEach(button => {
                            if (button.textContent === 'Load to Defender' ||
                                button.textContent === 'Load to Attacker') {
                                // Remove old event listeners
                                const newButton = button.cloneNode(true);
                                button.parentNode.replaceChild(newButton, button);

                                // Add new event listener with updated name
                                if (newButton.textContent === 'Load to Defender') {
                                    newButton.addEventListener('click', function() {
                                        loadTeamSet(newName, '1');
                                    });
                                } else if (newButton.textContent === 'Load to Attacker') {
                                    newButton.addEventListener('click', function() {
                                        loadTeamSet(newName, '2');
                                    });
                                }
                            }
                        });

                        // Update the delete button to use the new name
                        const deleteButton = setItem.querySelector('button[style*="background-color: #9c2a2a"]');
                        if (deleteButton) {
                            const newDeleteButton = deleteButton.cloneNode(true);
                            deleteButton.parentNode.replaceChild(newDeleteButton, deleteButton);
                            newDeleteButton.addEventListener('click', function() {
                                deleteTeamSet(newName);
                            });
                        }

                        // Update the export button to use the new name
                        const exportButton = setItem.querySelector('button[style*="background-color: #555"]');
                        if (exportButton) {
                            const newExportButton = exportButton.cloneNode(true);
                            exportButton.parentNode.replaceChild(newExportButton, exportButton);
                            newExportButton.addEventListener('click', function() {
                                const shareableLink = generateShareableLink(newName);
                                if (shareableLink) {
                                    navigator.clipboard.writeText(shareableLink)
                                        .then(() => {
                                            alert('Shareable code copied to clipboard!');
                                        })
                                        .catch(err => {
                                            console.error('Could not copy link to clipboard:', err);
                                            prompt('Copy this shareable link:', shareableLink);
                                        });
                                }
                            });
                        }
                    }

                    // Restore the name container
                    nameContainer.innerHTML = '';
                    nameContainer.appendChild(setName);
                } else {
                    // Restore the original name
                    nameContainer.innerHTML = '';
                    nameContainer.appendChild(setName);
                }
            }

            // Save on Enter key
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEditedName();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    nameContainer.innerHTML = '';
                    nameContainer.appendChild(setName);
                }
            });

            // Save on blur (when clicking outside)
            input.addEventListener('blur', saveEditedName);
        });

        setInfo.appendChild(editButton);

        if (data.timestamp) {
            const timestamp = document.createElement('div');
            timestamp.textContent = new Date(data.timestamp).toLocaleString();
            timestamp.style.fontSize = '12px';
            timestamp.style.color = '#aaa';
            nameContainer.appendChild(timestamp);
        }

        setItem.appendChild(setInfo);

        // Action buttons
        // Create two rows of actions for better organization
        const actionsContainer = document.createElement('div');
        actionsContainer.style.display = 'flex';
        actionsContainer.style.flexDirection = 'column';
        actionsContainer.style.gap = '8px';

        // First row: Load buttons
        const loadActions = document.createElement('div');
        loadActions.style.display = 'flex';
        loadActions.style.gap = '10px';

        const loadSet1Button = document.createElement('button');
        loadSet1Button.textContent = 'Load to Defender';
        loadSet1Button.style.flex = '1';
        loadSet1Button.style.padding = '8px';
        loadSet1Button.style.backgroundColor = '#2a6e9c';
        loadSet1Button.style.color = 'white';
        loadSet1Button.style.border = 'none';
        loadSet1Button.style.borderRadius = '4px';
        loadSet1Button.style.cursor = 'pointer';
        loadSet1Button.style.fontSize = '12px'; // Smaller font size
        loadSet1Button.addEventListener('click', function() {
            loadTeamSet(name, '1');
        });
        loadActions.appendChild(loadSet1Button);

        const loadSet2Button = document.createElement('button');
        loadSet2Button.textContent = 'Load to Attacker';
        loadSet2Button.style.flex = '1';
        loadSet2Button.style.padding = '8px';
        loadSet2Button.style.backgroundColor = '#2a6e9c';
        loadSet2Button.style.color = 'white';
        loadSet2Button.style.border = 'none';
        loadSet2Button.style.borderRadius = '4px';
        loadSet2Button.style.cursor = 'pointer';
        loadSet2Button.style.fontSize = '12px'; // Smaller font size
        loadSet2Button.addEventListener('click', function() {
            loadTeamSet(name, '2');
        });
        loadActions.appendChild(loadSet2Button);

        // Add the load actions to the container
        actionsContainer.appendChild(loadActions);

        // Second row: Import/Export/Delete buttons
        const utilActions = document.createElement('div');
        utilActions.style.display = 'flex';
        utilActions.style.gap = '10px';

        // Export button for this specific team set
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export';
        exportButton.style.flex = '1';
        exportButton.style.padding = '8px';
        exportButton.style.backgroundColor = '#555';
        exportButton.style.color = 'white';
        exportButton.style.border = 'none';
        exportButton.style.borderRadius = '4px';
        exportButton.style.cursor = 'pointer';
        exportButton.style.fontSize = '12px';
        exportButton.addEventListener('click', function() {
            // Generate shareable link for this team set
            const shareableLink = generateShareableLink(name);
            if (shareableLink) {
                // Copy to clipboard
                navigator.clipboard.writeText(shareableLink)
                    .then(() => {
                        alert('Shareable code copied to clipboard!');
                    })
                    .catch(err => {
                        console.error('Could not copy link to clipboard:', err);
                        // Show the link in a prompt so user can copy it manually
                        prompt('Copy this shareable link:', shareableLink);
                    });
            }
        });
        utilActions.appendChild(exportButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.flex = '1';
        deleteButton.style.padding = '8px';
        deleteButton.style.backgroundColor = '#9c2a2a';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.fontSize = '12px';
        deleteButton.addEventListener('click', function() {
            deleteTeamSet(name);
        });
        utilActions.appendChild(deleteButton);

        // Add the utility actions to the container
        actionsContainer.appendChild(utilActions);

        setItem.appendChild(actionsContainer);

        setsList.appendChild(setItem);
    });
}

// Function to compress team data for sharing - ultra-optimized version
function compressTeamData(data) {
    try {
        // For maximum compression, we'll use a custom format instead of JSON
        // Format: name|team1data|team2data where team data is comma-separated IDs

        // Extract the name and teams data
        const name = data.n || '';
        const teams = data.t || [];

        // Debug the data structure
        console.log('Data structure to compress:', data);
        console.log('Teams data type:', typeof teams, Array.isArray(teams));
        if (teams.length > 0) {
            console.log('First team type:', typeof teams[0], Array.isArray(teams[0]));
        }

        // Create a compact string representation
        // Format: name|id1,id2,id3|id4,id5,id6
        // Make sure each team is an array before calling join
        const compactString = [
            name,
            ...teams.map(team => {
                // Ensure team is an array before joining
                if (Array.isArray(team)) {
                    return team.join(',');
                } else if (team.images) {
                    // Handle old format with images array
                    return team.images.map(img => {
                        // Extract ID from image source
                        const filename = img.src.split('/').pop();
                        const id = filename.split('_')[0];
                        return id;
                    }).join(',');
                } else if (team.i) {
                    // Handle intermediate format
                    return team.i.join(',');
                } else {
                    console.warn('Unknown team format:', team);
                    return '';
                }
            })
        ].join('|');

        // Compress using LZString's most efficient method for URLs
        const compressed = LZString.compressToEncodedURIComponent(compactString);

        console.log('Original data structure size:', JSON.stringify(data).length, 'bytes');
        console.log('Compact string size:', compactString.length, 'bytes');
        console.log('Compressed size:', compressed.length, 'bytes');
        console.log('Compression ratio vs JSON:', (compressed.length / JSON.stringify(data).length * 100).toFixed(2) + '%');

        return compressed;
    } catch (error) {
        console.error('Error compressing team data:', error);
        return null;
    }
}

// Function to decompress team data from a shared link - ultra-optimized version
function decompressTeamData(compressed) {
    try {
        // Decompress using LZString
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);

        if (!decompressed) {
            throw new Error('Failed to decompress data');
        }

        // Check if it's our new compact format (contains pipe characters)
        if (decompressed.includes('|')) {
            // Parse the compact string format: name|team1data|team2data
            const parts = decompressed.split('|');
            const name = parts[0];

            // Parse team data (arrays of IDs)
            const teams = parts.slice(1).map(teamStr => {
                if (!teamStr) return [];
                return teamStr.split(',').filter(id => id.trim() !== '');
            });

            // Return in our internal format
            return {
                n: name,
                t: teams
            };
        }

        // If we get here, try to parse as JSON (for very old links)
        try {
            return JSON.parse(decompressed);
        } catch (e) {
            console.error('Not valid JSON:', e);
            throw new Error('Invalid data format. Could not parse the shared code.');
        }
    } catch (error) {
        console.error('Error decompressing team data:', error);
        return null;
    }
}

// Function to generate a shareable link for a team set - ultra-optimized version
function generateShareableLink(teamSetName) {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        alert('Error generating link: ' + error.message);
        return null;
    }

    // Check if the team set exists
    if (!savedSets[teamSetName]) {
        alert(`Team set "${teamSetName}" not found.`);
        return null;
    }

    // Get the team data and convert to our ultra-compact format
    const teamSet = savedSets[teamSetName];
    const teams = teamSet.teams || [];

    // Create a simple string representation of the team set
    // Format: name|id1,id2,id3|id4,id5,id6
    let compactString = teamSetName;

    // Add each team's data
    teams.forEach(team => {
        // Extract IDs from the team's images
        if (team.images && Array.isArray(team.images)) {
            const teamIds = team.images.map(img => {
                const filename = img.src.split('/').pop();
                return filename.split('_')[0]; // Extract ID
            }).join(',');
            compactString += '|' + teamIds;
        } else {
            // Add an empty team if no images
            compactString += '|';
        }
    });

    // Compress the string directly
    const compressed = LZString.compressToEncodedURIComponent(compactString);
    if (!compressed) {
        alert('Error compressing team data.');
        return null;
    }

    // Generate the shareable link with the shortest possible parameter name
    const baseUrl = window.location.href.split('?')[0];
    const shareableLink = `${baseUrl}?t=${compressed}`; // Even shorter parameter name 't'

    return shareableLink;
}

// Function to export all saved team sets to a JSON file
function exportSavedTeamSets() {
    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
        alert('Error exporting saved team sets: ' + error.message);
        return;
    }

    // Check if there are any saved sets
    if (Object.keys(savedSets).length === 0) {
        alert('No saved team sets found to export.');
        return;
    }

    // Export as JSON file directly (removed shareable code option since it's available per team set)
    // Create export data with metadata
    const exportData = {
        version: '1.0',
        type: 'nikke-portrait-saved-sets',
        timestamp: new Date().toISOString(),
        sets: savedSets
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2); // Pretty print with 2 spaces

    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a timestamp for the filename
    const now = new Date();
    const timestamp = now.getFullYear() +
                     ('0' + (now.getMonth() + 1)).slice(-2) +
                     ('0' + now.getDate()).slice(-2) + '_' +
                     ('0' + now.getHours()).slice(-2) +
                     ('0' + now.getMinutes()).slice(-2);

    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nikke_saved_team_sets_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL object
    URL.revokeObjectURL(a.href);

    // Show success message
    console.log('Saved team sets exported successfully as JSON file');
}

// Function to import saved team sets from a JSON file or shared code
function importSavedTeamSets() {
    // Ask user if they want to import from a file or a shared code
    const importType = confirm(
        'How would you like to import team sets?\n\n' +
        'Click OK to import from a shared code (from Discord).\n' +
        'Click Cancel to import from a JSON file.'
    );

    if (importType) {
        // User chose to import from a shared code
        showImportCodeModal();
    } else {
        // User chose to import from a JSON file
        importFromJsonFile();
    }
}

// Function to show a modal for importing from a shared code
function showImportCodeModal() {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'import-modal-container';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '9999';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'import-modal-content';
    modalContent.style.backgroundColor = '#222';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Import Team Sets from Code';
    title.style.color = '#fff';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    modalContent.appendChild(title);

    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Paste the shared code below to import team sets.';
    instructions.style.color = '#ccc';
    instructions.style.marginBottom = '15px';
    modalContent.appendChild(instructions);

    // Add text area for code input
    const textArea = document.createElement('textarea');
    textArea.placeholder = 'Paste the shared code here...';
    textArea.style.width = '100%';
    textArea.style.height = '120px';
    textArea.style.padding = '10px';
    textArea.style.backgroundColor = '#333';
    textArea.style.color = '#fff';
    textArea.style.border = '1px solid #444';
    textArea.style.borderRadius = '4px';
    textArea.style.resize = 'none';
    textArea.style.marginBottom = '15px';
    modalContent.appendChild(textArea);

    // Add import button
    const importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.style.padding = '8px 16px';
    importButton.style.backgroundColor = '#2a6e9c';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '4px';
    importButton.style.cursor = 'pointer';
    importButton.style.marginRight = '10px';
    importButton.addEventListener('click', function() {
        const code = textArea.value.trim();
        if (!code) {
            alert('Please enter a shared code.');
            return;
        }

        try {
            // Try to import the code
            importFromSharedCode(code);
            // Close the modal on success
            document.body.removeChild(modalContainer);
        } catch (error) {
            alert('Error importing from code: ' + error.message);
        }
    });
    modalContent.appendChild(importButton);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cancel';
    closeButton.style.padding = '8px 16px';
    closeButton.style.backgroundColor = '#444';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    modalContent.appendChild(closeButton);

    // Add the modal content to the container
    modalContainer.appendChild(modalContent);

    // Add the modal container to the body
    document.body.appendChild(modalContainer);

    // Focus the text area
    setTimeout(() => {
        textArea.focus();
    }, 100);
}

// Function to import from a shared code - ultra-optimized version
function importFromSharedCode(code) {
    try {
        // Try to decompress the code
        let importData;

        // Check if it's a URL with our ultra-compact parameter
        if (code.includes('?t=') || code.includes('?ts=') || code.includes('?teamset=')) {
            // Extract the compressed data from the URL
            let compressed;
            if (code.includes('?t=')) {
                const urlParts = code.split('?t=');
                if (urlParts.length < 2) {
                    throw new Error('Invalid URL format. Could not find parameter.');
                }
                compressed = urlParts[1].split('&')[0]; // Get the value, ignoring other parameters
            } else if (code.includes('?ts=')) {
                const urlParts = code.split('?ts=');
                if (urlParts.length < 2) {
                    throw new Error('Invalid URL format. Could not find parameter.');
                }
                compressed = urlParts[1].split('&')[0];
            } else {
                const urlParts = code.split('?teamset=');
                if (urlParts.length < 2) {
                    throw new Error('Invalid URL format. Could not find parameter.');
                }
                compressed = urlParts[1].split('&')[0];
            }
            importData = decompressTeamData(compressed);
        } else {
            // Assume it's a compressed code directly
            importData = decompressTeamData(code);
        }

        if (!importData) {
            throw new Error('Could not decompress the shared code. Please check that you copied it correctly.');
        }

        // Get current saved sets
        let currentSets = {};
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            currentSets = JSON.parse(savedSetsJson);
        }

        // Handle our ultra-compact format
        if (importData.n !== undefined && importData.t !== undefined) {
            // Ultra-compact format with name and teams
            const setName = importData.n || `Imported Set ${new Date().toLocaleString()}`;

            // Convert the array of IDs back to the expected format
            const teamsData = importData.t.map(team => {
                // Ensure team is an array
                const teamArray = Array.isArray(team) ? team :
                                  (typeof team === 'string' ? team.split(',') : []);

                return {
                    images: teamArray.map(id => ({
                        src: `image/${id}_name.png`, // Reconstruct the image path
                        score: parseInt(id, 10) / 10 // Reconstruct the score
                    }))
                };
            });

            // Create the team set structure
            currentSets[setName] = {
                teams: teamsData,
                timestamp: new Date().toISOString()
            };
        }
        // Legacy format handling - minimal support for backward compatibility
        else if (importData.type && (importData.set || importData.sets)) {
            console.warn('Importing legacy format - consider updating your shared links');

            if (importData.set) {
                // Single team set
                const setName = importData.name || `Imported Set ${new Date().toLocaleString()}`;
                currentSets[setName] = importData.set;
            } else if (importData.sets) {
                // Multiple sets - just replace everything
                currentSets = importData.sets;
            }
        }
        // Handle the intermediate format
        else if (importData.v && importData.s) {
            const setName = importData.n || `Imported Set ${new Date().toLocaleString()}`;
            currentSets[setName] = importData.s;
        }
        else {
            throw new Error('Invalid data format. This does not appear to be a valid Nikke Portrait team sets code.');
        }

        // Save back to localStorage
        localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(currentSets));

        // No alert message for successful import
        console.log(`Team set has been imported successfully.`);

        // Refresh the saved sets panel if it's open
        if (document.querySelector('.saved-sets-panel')) {
            showSavedSetsPanel();
        }
    } catch (error) {
        console.error('Error importing from shared code:', error);
        alert('Error importing from shared code: ' + error.message);
        throw error; // Re-throw to handle in the calling function
    }
}

// Function to import from a JSON file
function importFromJsonFile() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Add event listener for file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            document.body.removeChild(fileInput);
            return;
        }

        // Read the file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // Parse the JSON data
                const importData = JSON.parse(e.target.result);

                // Validate the import data
                if (!importData.type || importData.type !== 'nikke-portrait-saved-sets' || !importData.sets) {
                    throw new Error('Invalid file format. This does not appear to be a valid Nikke Portrait saved team sets file.');
                }

                // Get current saved sets
                let currentSets = {};
                const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
                if (savedSetsJson) {
                    currentSets = JSON.parse(savedSetsJson);
                }

                // Count imported sets
                const importCount = Object.keys(importData.sets).length;

                // Ask user if they want to merge or replace
                let action = 'merge';
                if (Object.keys(currentSets).length > 0) {
                    const userChoice = confirm(
                        `You have ${Object.keys(currentSets).length} existing saved team sets. \n\n` +
                        `Would you like to merge the ${importCount} imported sets with your existing sets? \n\n` +
                        `Click OK to merge (keep both existing and imported sets). \n` +
                        `Click Cancel to replace (delete existing sets and only keep imported sets).`
                    );

                    action = userChoice ? 'merge' : 'replace';
                }

                // Process based on user choice
                if (action === 'replace') {
                    // Replace all existing sets with imported sets
                    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(importData.sets));
                    console.log(`Replaced existing saved team sets with ${importCount} imported sets.`);
                } else {
                    // Merge imported sets with existing sets
                    const mergedSets = { ...currentSets, ...importData.sets };
                    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(mergedSets));
                    console.log(`Merged ${importCount} imported sets with your existing saved team sets.`);
                }

                // Refresh the saved sets panel if it's open
                if (document.querySelector('.saved-sets-panel')) {
                    showSavedSetsPanel();
                }

            } catch (error) {
                console.error('Error importing saved team sets:', error);
                alert('Error importing saved team sets: ' + error.message);
            } finally {
                document.body.removeChild(fileInput);
            }
        };

        reader.onerror = function() {
            alert('Error reading the file. Please try again.');
            document.body.removeChild(fileInput);
        };

        reader.readAsText(file);
    });

    // Trigger the file input dialog
    fileInput.click();
}

// Function to show a dialog for selecting which team set to share
function showShareDialog(setNames) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'share-dialog-container';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '9999';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'share-dialog-content';
    modalContent.style.backgroundColor = '#222';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '600px';
    modalContent.style.width = '90%';
    modalContent.style.maxHeight = '80vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Select Team Set to Share';
    title.style.color = '#fff';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    modalContent.appendChild(title);

    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Choose which team set you want to share:';
    instructions.style.color = '#ccc';
    instructions.style.marginBottom = '15px';
    modalContent.appendChild(instructions);

    // Create list of sets
    const setsList = document.createElement('div');
    setsList.className = 'sets-list';
    setsList.style.marginBottom = '20px';

    // Add each set as a button
    setNames.forEach(name => {
        const setButton = document.createElement('button');
        setButton.textContent = name;
        setButton.style.display = 'block';
        setButton.style.width = '100%';
        setButton.style.padding = '10px';
        setButton.style.marginBottom = '8px';
        setButton.style.backgroundColor = '#333';
        setButton.style.color = 'white';
        setButton.style.border = '1px solid #444';
        setButton.style.borderRadius = '4px';
        setButton.style.cursor = 'pointer';
        setButton.style.textAlign = 'left';
        setButton.style.fontSize = '14px';

        // Add hover effect
        setButton.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#444';
        });
        setButton.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#333';
        });

        // Add click handler
        setButton.addEventListener('click', function() {
            // Generate shareable link for this set
            const shareableLink = generateShareableLink(name);
            if (shareableLink) {
                // Copy to clipboard
                navigator.clipboard.writeText(shareableLink)
                    .then(() => {
                        alert('Shareable code copied to clipboard!');
                        // Close the modal
                        document.body.removeChild(modalContainer);
                    })
                    .catch(err => {
                        console.error('Could not copy link to clipboard:', err);
                        // Show the link in a prompt so user can copy it manually
                        prompt('Copy this shareable link:', shareableLink);
                        // Close the modal
                        document.body.removeChild(modalContainer);
                    });
            } else {
                // Close the modal
                document.body.removeChild(modalContainer);
            }
        });

        setsList.appendChild(setButton);
    });

    modalContent.appendChild(setsList);

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#444';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(modalContainer);
    });
    modalContent.appendChild(cancelButton);

    // Add the modal content to the container
    modalContainer.appendChild(modalContent);

    // Add the modal container to the body
    document.body.appendChild(modalContainer);
}

// Function to show the saved sets panel
function showSavedSetsPanel() {
    // Remove existing panel if any
    const existingPanel = document.querySelector('.saved-sets-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // Get saved sets from localStorage
    let savedSets = {};
    try {
        const savedSetsJson = localStorage.getItem(SAVED_SETS_KEY);
        if (savedSetsJson) {
            savedSets = JSON.parse(savedSetsJson);
        }
    } catch (error) {
        console.error('Error parsing saved sets:', error);
    }

    // Create the panel
    const panel = document.createElement('div');
    panel.className = 'saved-sets-panel';

    // Create header
    const header = document.createElement('div');
    header.className = 'saved-sets-header';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Saved Team Sets';
    title.style.margin = '0';
    title.style.textAlign = 'center';
    title.style.width = '100%';
    header.appendChild(title);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-saved-sets-btn';
    closeBtn.innerHTML = '&#10005;'; // ✕ symbol
    closeBtn.addEventListener('click', function() {
        panel.remove();
    });
    header.appendChild(closeBtn);

    panel.appendChild(header);

    // Create save form
    const saveForm = document.createElement('div');
    saveForm.className = 'save-form';
    saveForm.style.display = 'flex';
    saveForm.style.marginBottom = '20px';
    saveForm.style.gap = '10px';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter a name for your team set';
    nameInput.style.flex = '1';
    nameInput.style.padding = '8px';
    nameInput.style.borderRadius = '4px';
    nameInput.style.border = '1px solid #444';
    nameInput.style.backgroundColor = '#333';
    nameInput.style.color = 'white';

    // Add event listener for Enter key
    nameInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveTeamSet(nameInput.value);
        }
    });

    // Pre-fill with current team name if available
    const currentSetId = currentTeamSet; // '1' for Defender, '2' for Attacker
    const customName = teamNames[currentSetId] || '';

    // Use only the custom name if available, otherwise leave empty
    nameInput.value = customName;

    saveForm.appendChild(nameInput);

    // Focus and select the text in the input field after a short delay
    // (to ensure the panel is fully rendered)
    setTimeout(() => {
        nameInput.focus();
        nameInput.select();
    }, 100);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Current';
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#2a6e9c';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.addEventListener('click', function() {
        saveTeamSet(nameInput.value);
    });
    saveForm.appendChild(saveButton);

    panel.appendChild(saveForm);

    // Create a container for import/export buttons
    const importExportContainer = document.createElement('div');
    importExportContainer.className = 'import-export-container';
    importExportContainer.style.display = 'flex';
    importExportContainer.style.justifyContent = 'space-between';
    importExportContainer.style.marginBottom = '15px';
    importExportContainer.style.gap = '10px';

    // Create export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export All Sets';
    exportButton.style.padding = '8px 12px';
    exportButton.style.backgroundColor = '#2a6e9c';
    exportButton.style.color = 'white';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    exportButton.style.fontSize = '12px';
    exportButton.style.flex = '1';
    exportButton.addEventListener('click', function() {
        exportSavedTeamSets();
    });
    // Add hover effects
    exportButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#3a8ebc';
    });
    exportButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#2a6e9c';
    });
    importExportContainer.appendChild(exportButton);

    // Create import button
    const importButton = document.createElement('button');
    importButton.textContent = 'Import Sets';
    importButton.style.padding = '8px 12px';
    importButton.style.backgroundColor = '#555';
    importButton.style.color = 'white';
    importButton.style.border = 'none';
    importButton.style.borderRadius = '4px';
    importButton.style.cursor = 'pointer';
    importButton.style.fontSize = '12px';
    importButton.style.flex = '1';
    importButton.addEventListener('click', function() {
        importSavedTeamSets();
    });
    // Add hover effects
    importButton.addEventListener('mouseover', function() {
        this.style.backgroundColor = '#666';
    });
    importButton.addEventListener('mouseout', function() {
        this.style.backgroundColor = '#555';
    });
    importExportContainer.appendChild(importButton);

    panel.appendChild(importExportContainer);

    // Create search form
    const searchForm = document.createElement('div');
    searchForm.className = 'search-form';
    searchForm.style.display = 'flex';
    searchForm.style.marginBottom = '20px';
    searchForm.style.gap = '10px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search saved team sets...';
    searchInput.style.flex = '1';
    searchInput.style.padding = '8px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #444';
    searchInput.style.backgroundColor = '#333';
    searchInput.style.color = 'white';
    searchInput.addEventListener('input', function() {
        // Filter the saved sets based on search input
        filterSavedSets(this.value.toLowerCase(), setsList, savedSets);
    });
    searchForm.appendChild(searchInput);

    panel.appendChild(searchForm);

    // Create list of saved sets
    const setsList = document.createElement('div');
    setsList.className = 'sets-list';

    // Initialize with all sets (empty search query)
    filterSavedSets('', setsList, savedSets);

    panel.appendChild(setsList);

    // Add some bottom padding
    const bottomPadding = document.createElement('div');
    bottomPadding.style.height = '20px';
    panel.appendChild(bottomPadding);

    // Add the panel to the body
    document.body.appendChild(panel);

    // Add click outside functionality to close the panel
    // Use a flag to prevent the panel from closing immediately when it's opened
    let justOpened = true;
    setTimeout(() => {
        justOpened = false;
    }, 100);

    // Use setTimeout to ensure this event listener is added after any other click events
    setTimeout(() => {
        document.addEventListener('click', function closeOnClickOutside(e) {
            // Check if the panel still exists in the DOM
            const currentPanel = document.querySelector('.saved-sets-panel');
            if (!currentPanel) {
                // Panel is already gone, remove the event listener
                document.removeEventListener('click', closeOnClickOutside);
                return;
            }

            // Check if the panel just opened (to prevent immediate closing)
            if (justOpened) {
                return;
            }

            // Check if the click was outside the panel
            if (!currentPanel.contains(e.target) && e.target !== document.querySelector('#savedSetsBtn')) {
                // Click was outside the panel and not on the button that opened it
                currentPanel.remove();
                document.removeEventListener('click', closeOnClickOutside);
            }
        });
    }, 10);
}
