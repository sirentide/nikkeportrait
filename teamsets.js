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
    panel.style.position = 'fixed';
    panel.style.top = '50%';
    panel.style.left = '50%';
    panel.style.transform = 'translate(-50%, -50%)';
    panel.style.backgroundColor = '#222';
    panel.style.border = '2px solid #00aaff';
    panel.style.borderRadius = '8px';
    panel.style.padding = '20px';
    panel.style.zIndex = '9999';
    panel.style.width = '90%';
    panel.style.maxWidth = '600px';
    panel.style.maxHeight = '80vh';
    panel.style.overflowY = 'auto';
    panel.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    panel.style.color = 'white';

    // Create header
    const header = document.createElement('div');
    header.innerHTML = '<h2>Saved Team Sets</h2>';
    header.style.marginBottom = '20px';
    header.style.textAlign = 'center';
    panel.appendChild(header);

    // Create save form
    const saveForm = document.createElement('div');
    saveForm.className = 'save-form';
    saveForm.style.display = 'flex';
    saveForm.style.marginBottom = '20px';
    saveForm.style.gap = '10px';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter a name for the current team set';
    nameInput.style.flex = '1';
    nameInput.style.padding = '8px';
    nameInput.style.borderRadius = '4px';
    nameInput.style.border = '1px solid #444';
    nameInput.style.backgroundColor = '#333';
    nameInput.style.color = 'white';
    saveForm.appendChild(nameInput);

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

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.display = 'block';
    closeButton.style.margin = '20px auto 0';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#555';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function() {
        panel.remove();
    });
    panel.appendChild(closeButton);

    // Add the panel to the body
    document.body.appendChild(panel);
}
