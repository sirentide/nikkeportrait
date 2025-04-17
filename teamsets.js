// Team Sets Management
const SAVED_SETS_KEY = 'nikkePortraitSavedSets';

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
    const teamsData = Array.from(teams).map(team => ({
        images: Array.from(team.querySelectorAll('.image-slot img')).map(img => ({
            src: img.src,
            score: parseInt(img.src.split('/').pop().split('_')[0], 10) / 10
        }))
    }));

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

    // Add the new set
    savedSets[name] = {
        teams: teamsData,
        timestamp: new Date().toISOString()
    };

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
    });

    // Refresh the selected state of images
    refreshSelectedImages();

    // Update team score
    updateTeamScore();

    // Save the selection to localStorage
    saveSelectionToLocalStorage();

    // Show success message
    const setName = targetSet === '1' ? 'Defender' : 'Attacker';
    alert(`Team set "${name}" has been loaded into ${setName}.`);

    // Switch to the target team set
    switchTeamSet(targetSet);
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

        const setName = document.createElement('h3');
        setName.textContent = name;
        setName.style.margin = '0 0 5px 0';
        setInfo.appendChild(setName);

        if (data.timestamp) {
            const timestamp = document.createElement('div');
            timestamp.textContent = new Date(data.timestamp).toLocaleString();
            timestamp.style.fontSize = '12px';
            timestamp.style.color = '#aaa';
            setInfo.appendChild(timestamp);
        }

        setItem.appendChild(setInfo);

        // Action buttons
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '10px';

        const loadSet1Button = document.createElement('button');
        loadSet1Button.textContent = 'Load to SET1';
        loadSet1Button.style.flex = '1';
        loadSet1Button.style.padding = '8px';
        loadSet1Button.style.backgroundColor = '#2a6e9c';
        loadSet1Button.style.color = 'white';
        loadSet1Button.style.border = 'none';
        loadSet1Button.style.borderRadius = '4px';
        loadSet1Button.style.cursor = 'pointer';
        loadSet1Button.addEventListener('click', function() {
            loadTeamSet(name, '1');
        });
        actions.appendChild(loadSet1Button);

        const loadSet2Button = document.createElement('button');
        loadSet2Button.textContent = 'Load to SET2';
        loadSet2Button.style.flex = '1';
        loadSet2Button.style.padding = '8px';
        loadSet2Button.style.backgroundColor = '#2a6e9c';
        loadSet2Button.style.color = 'white';
        loadSet2Button.style.border = 'none';
        loadSet2Button.style.borderRadius = '4px';
        loadSet2Button.style.cursor = 'pointer';
        loadSet2Button.addEventListener('click', function() {
            loadTeamSet(name, '2');
        });
        actions.appendChild(loadSet2Button);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.padding = '8px';
        deleteButton.style.backgroundColor = '#9c2a2a';
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.addEventListener('click', function() {
            deleteTeamSet(name);
        });
        actions.appendChild(deleteButton);

        setItem.appendChild(actions);

        setsList.appendChild(setItem);
    });
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
    alert('Saved team sets exported successfully!');
}

// Function to import saved team sets from a JSON file
function importSavedTeamSets() {
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
                    alert(`Replaced existing saved team sets with ${importCount} imported sets.`);
                } else {
                    // Merge imported sets with existing sets
                    const mergedSets = { ...currentSets, ...importData.sets };
                    localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(mergedSets));
                    alert(`Merged ${importCount} imported sets with your existing saved team sets.`);
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
}
