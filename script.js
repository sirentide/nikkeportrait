// Function to update filters based on selected checkboxes and search input
function updateFilters() {
    const photos = document.querySelectorAll('.photo');

    // Extract the checked filters and search input
    const selectedFilters = {
        type: Array.from(document.querySelectorAll('input[type="checkbox"][value^="b"], input[type="checkbox"][value="a"]'))
            .filter(chk => chk.checked)
            .map(chk => chk.value),
        position: Array.from(document.querySelectorAll('input[type="checkbox"][value="def"], input[type="checkbox"][value="sp"], input[type="checkbox"][value="atk"]'))
            .filter(chk => chk.checked)
            .map(chk => chk.value),
        faction: Array.from(document.querySelectorAll('input[type="checkbox"][value="elysion"], input[type="checkbox"][value="missilis"], input[type="checkbox"][value="tetra"], input[type="checkbox"][value="abnormal"], input[type="checkbox"][value="pilgrim"]'))
            .filter(chk => chk.checked)
            .map(chk => chk.value),
        rarity: Array.from(document.querySelectorAll('input[type="checkbox"][value="ssr"], input[type="checkbox"][value="sr"], input[type="checkbox"][value="r"]'))
            .filter(chk => chk.checked)
            .map(chk => chk.value),
        weapon: Array.from(document.querySelectorAll('input[type="checkbox"][value="smg"], input[type="checkbox"][value="ar"], input[type="checkbox"][value="snr"], input[type="checkbox"][value="rl"], input[type="checkbox"][value="sg"], input[type="checkbox"][value="mg"]'))
            .filter(chk => chk.checked)
            .map(chk => chk.value),
    };

    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    photos.forEach(photo => {
        const attributes = {
            type: photo.getAttribute('data-type'),
            position: photo.getAttribute('data-position'),
            faction: photo.getAttribute('data-faction'),
            rarity: photo.getAttribute('data-rarity'),
            weapon: photo.getAttribute('data-weapon'),
            name: photo.getAttribute('data-name').toLowerCase(),
        };

        const isMatch = Object.keys(selectedFilters).every(key => {
            return selectedFilters[key].length === 0 || selectedFilters[key].includes(attributes[key]);
        }) && (searchValue === '' || attributes.name.includes(searchValue));

        photo.style.display = isMatch ? 'flex' : 'none';
    });
}

// Sort functionality
let currentSortCriteria = 'number'; // Default sort criteria
let currentSortOrder = 'desc'; // Default sort order

function toggleSortCriteria() {
    // Toggle between 'name' and 'number'
    if (currentSortCriteria === 'name') {
        currentSortCriteria = 'number';
        document.getElementById('sortToggle').innerText = 'Sort by Name';
    } else {
        currentSortCriteria = 'name';
        document.getElementById('sortToggle').innerText = 'Sort by Burst Gen';
    }
    sortImages(); // Call your sort function after toggling
}


function toggleSortOrder() {
    // Toggle between 'asc' and 'desc'
    if (currentSortOrder === 'asc') {
        currentSortOrder = 'desc';
        document.getElementById('orderToggle').innerText = 'Lowest';
    } else {
        currentSortOrder = 'asc';
        document.getElementById('orderToggle').innerText = 'Highest';
    }
    sortImages(); // Call your sort function after toggling
}

function sortImages() {
    const photosArray = Array.from(document.querySelectorAll('.photo'));

    photosArray.sort((a, b) => {
        let comparison = 0;
        if (currentSortCriteria === 'name') {
            const nameA = a.getAttribute('data-name').toLowerCase();
            const nameB = b.getAttribute('data-name').toLowerCase();
            comparison = nameA.localeCompare(nameB);
        } else if (currentSortCriteria === 'number') {
            const numberA = parseInt(a.getAttribute('data-number'), 10);
            const numberB = parseInt(b.getAttribute('data-number'), 10);
            comparison = numberA - numberB; // Sort by actual number
        }

        // Reverse comparison if descending
        return currentSortOrder === 'asc' ? comparison : -comparison;
    });

    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; // Clear current images
    photosArray.forEach(photo => gallery.appendChild(photo)); // Add sorted photos back
}



// Function to toggle image selection
function toggleImageSelection(imgElement) {
    const selectedContainer = document.getElementById('selectedContainer');
    const imgSrc = imgElement.src;

    const isSelected = imgElement.classList.contains('selected');
    const score = parseInt(imgSrc.split('/').pop().split('_')[0], 10) / 10;

    if (isSelected) {
        // Remove image from selected team row
        teamRows.forEach(teamRow => {
            const imagesInTeam = teamRow.querySelectorAll('img');
            imagesInTeam.forEach(img => {
                if (img.src === imgSrc) {
                    teamRow.removeChild(img); // Remove from team row
                }
            });
        });
        imgElement.classList.remove('selected'); // Unselect the original image
        updateTeamScore(); // Update the team scores
        return;
    }



    // Check if the image is already in the selected container
    const existingSelectedImage = Array.from(selectedContainer.querySelectorAll('img')).find(img => img.src === imgSrc);
    
    if (existingSelectedImage) {
        // If the image is already in the selected container, remove it
        const teamRows = document.querySelectorAll('.team-images');
        
        // Remove the image from the selected container
        existingSelectedImage.remove();
        
        // Remove the image from the team grid
        teamRows.forEach(teamRow => {
            Array.from(teamRow.children).forEach(img => {
                if (img.src === imgSrc) {
                    teamRow.removeChild(img); // Remove from team grid
                }
            });
        });
        
        imgElement.classList.remove('selected'); // Unselect the original image
        return; // Exit the function, as the image has been removed
    }

    // If the image is not in the selected container, add it to the grid
    const teamRows = document.querySelectorAll('.team-images');
    let added = false;

    for (const teamRow of teamRows) {
        if (teamRow.children.length < 5) { // Check if the row has less than 5 images
            const selectedImg = document.createElement('img');
            selectedImg.src = imgSrc;

            // Adjust the image size based on screen width
            function adjustImageSize() {
                if (window.innerWidth <= 768) {
                    selectedImg.style.width = '50px'; // Mobile size
                    selectedImg.style.height = '50px';
                } else {
                    selectedImg.style.width = '100px'; // Desktop size
                    selectedImg.style.height = '100px';
                }
            }
            adjustImageSize(); // Initial size adjustment

            // Handle dynamic resizing
            window.addEventListener('resize', adjustImageSize);

            // Add click event to remove from selection
            selectedImg.onclick = function () {
                teamRow.removeChild(selectedImg); // Remove from the grid
                imgElement.classList.remove('selected'); // Unselect the original image
                window.removeEventListener('resize', adjustImageSize); // Cleanup on removal
                updateTeamScore(); // Update the team scores
            };

            teamRow.appendChild(selectedImg); // Add to the grid
            added = true;
            break; // Stop after adding to the first available row
        }
    }

    if (!added) {
        alert('All teams are full!'); // Notify the user if all rows are full
    } else {
        imgElement.classList.add('selected'); // Mark the image as selected
    }
    updateTeamScore(); // Update the team scores
}

function updateTeamScore() {
    const teamRows = document.querySelectorAll('.team-row');
    teamRows.forEach(teamRow => {
        const teamScoreElement = teamRow.querySelector('.team-score');
        const teamImages = teamRow.querySelectorAll('img');
        let totalScore = 0;

        teamImages.forEach(img => {
            const imgSrc = img.src;
            const score = parseInt(imgSrc.split('/').pop().split('_')[0], 10) / 10;
            totalScore += score;
        });

        teamScoreElement.textContent = totalScore.toFixed(1); // Display the total score
    });
}

document.body.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'clearSelectionBtn') {
        clearSelection(); // Call the function when the clear selection button is clicked
    }
});


function clearSelection() {
    const selectedImages = document.querySelectorAll('.selected');
    const selectedContainer = document.getElementById('selectedContainer');

    // Loop through each selected image
    selectedImages.forEach(image => {
        // Remove the 'selected' class to deselect the image
        image.classList.remove('selected');

        // Remove the image from any rows in the team grid
        const teamRows = document.querySelectorAll('.team-images');
        teamRows.forEach(row => {
            Array.from(row.children).forEach(img => {
                if (img.src === image.src) {
                    row.removeChild(img); // Remove from team grid if it exists
                    updateTeamScore(); // Update the team scores
                }
            });
        });
    });

    // Instead of clearing the whole container, just remove the images from the grid
    // This will ensure that the images can be re-selected if needed
    const selectedImagesInContainer = Array.from(selectedContainer.querySelectorAll('img'));
    selectedImagesInContainer.forEach(img => {
        selectedContainer.removeChild(img); // Remove image from selected container
    });
}


document.getElementById('clearSelectionBtn').addEventListener('click', clearSelection);

// Function to show or hide all images
let showAll = true; // Set to true to indicate that images are hidden by default

function toggleShowHide() {
    const photos = document.querySelectorAll('.photo');

    // Toggle display based on the current state
    if (showAll) {
        photos.forEach(photo => {
            photo.style.display = 'flex'; // Show all photos
        });
        showAll = false;
    } else {
        photos.forEach(photo => {
            photo.style.display = 'none'; // Hide all photos
        });
        showAll = true;
    }
}

// Hide all images on page load
window.onload = function () {
    toggleShowHide(); // Call toggleShowHide function to hide all images by default
};


// Initial sort of images
sortImages();

// Disable long-press on touch devices
let touchTimer;

document.addEventListener('touchstart', function (e) {
    touchTimer = setTimeout(() => {
        e.preventDefault(); // Prevent the default touch behavior only for long presses
    }, 500); // 500ms delay for long press
}, { passive: false });

document.addEventListener('touchend', function (e) {
    clearTimeout(touchTimer); // Clear the timer if the touch ends quickly
});

function toggleFilter(button) {
    var content = button.nextElementSibling; // Get the filter-content div
    if (content.style.display === "none") {
        content.style.display = "block"; // Show the filter content
        button.innerHTML = "Filters ▲"; // Change button text to '▲'
    } else {
        content.style.display = "none"; // Hide the filter content
        button.innerHTML = "Filters ▼"; // Change button text to '▼'
    }
}

document.addEventListener("contextmenu", function(event) {
    if (event.target.tagName === "IMG") {
        event.preventDefault();
    }
});

// Prevent long-press save on mobile (but allow taps for toggle)
document.addEventListener("touchstart", function(event) {
    if (event.target.tagName === "IMG") {
        event.target.setAttribute("draggable", "false"); // Disable dragging
    }
});
