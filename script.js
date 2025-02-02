// Utility functions
const getCheckedValues = (values) => 
    Array.from(document.querySelectorAll(`input[type="checkbox"][value^="${values.join('"], input[type="checkbox"][value="')}"]`))
        .filter(chk => chk.checked)
        .map(chk => chk.value);

const getPhotoAttributes = (photo) => ({
    type: photo.getAttribute('data-type'),
    position: photo.getAttribute('data-position'),
    faction: photo.getAttribute('data-faction'),
    rarity: photo.getAttribute('data-rarity'),
    weapon: photo.getAttribute('data-weapon'),
    name: photo.getAttribute('data-name').toLowerCase(),
});

const isPhotoMatchingFilters = (attributes, selectedFilters, searchValue) =>
    Object.keys(selectedFilters).every(key =>
        selectedFilters[key].length === 0 || selectedFilters[key].includes(attributes[key])
    ) && (searchValue === '' || attributes.name.includes(searchValue));

// Function to update filters based on selected checkboxes and search input
function updateFilters() {
    const photos = document.querySelectorAll('.photo');
    const selectedFilters = {
        type: getCheckedValues(['b1', 'b2', 'b3', 'a']),
        position: getCheckedValues(['def', 'sp', 'atk']),
        faction: getCheckedValues(['elysion', 'missilis', 'tetra', 'abnormal', 'pilgrim']),
        rarity: getCheckedValues(['ssr', 'sr', 'r']),
        weapon: getCheckedValues(['smg', 'ar', 'snr', 'rl', 'sg', 'mg']),
    };

    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    photos.forEach(photo => {
        const attributes = getPhotoAttributes(photo);
        const isMatch = isPhotoMatchingFilters(attributes, selectedFilters, searchValue);
        photo.style.display = isMatch ? 'flex' : 'none';
    });
}

// Sort functionality
let currentSortCriteria = 'number'; // Default to sorting by name
let currentSortOrder = 'desc'; // Default to ascending order
sortImages();


// Toggle sort criteria
function toggleSortCriteria() {
    currentSortCriteria = currentSortCriteria === 'name' ? 'number' : 'name';
    document.getElementById('sortToggle').innerText = currentSortCriteria === 'name' ? 'Sort by Burst Gen' : 'Sort by Name';
    sortImages();
}

// Toggle sort order
function toggleSortOrder() {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    document.getElementById('orderToggle').innerText = currentSortOrder === 'asc' ? 'Highest' : 'Lowest';
    sortImages();
}

// Function to sort images
function sortImages() {
    const photosArray = Array.from(document.querySelectorAll('.photo'));
    photosArray.sort((a, b) => {
        const comparison = currentSortCriteria === 'name' 
            ? a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')) 
            : parseInt(a.getAttribute('data-number')) - parseInt(b.getAttribute('data-number'));

        return currentSortOrder === 'asc' ? comparison : -comparison;
    });

    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; 
    photosArray.forEach(photo => gallery.appendChild(photo));
}

// Image selection functionality
function toggleImageSelection(imgElement) {
    const imgSrc = imgElement.src;
    const selectedContainer = document.getElementById('selectedContainer');
    const isSelected = imgElement.classList.contains('selected');
    const score = parseInt(imgSrc.split('/').pop().split('_')[0], 10) / 10;

    if (isSelected) {
        removeImageFromSelection(imgElement, imgSrc);
    } else {
        addImageToSelection(imgElement, imgSrc);
    }

    updateTeamScore();
}

// Remove image from selection
function removeImageFromSelection(imgElement, imgSrc) {
    const selectedContainer = document.getElementById('selectedContainer');
    selectedContainer.querySelectorAll('img').forEach(img => {
        if (img.src === imgSrc) img.remove();
    });

    document.querySelectorAll('.team-images').forEach(teamRow => {
        teamRow.querySelectorAll('img').forEach(img => {
            if (img.src === imgSrc) teamRow.removeChild(img);
        });
    });

    imgElement.classList.remove('selected');

    updateTeamScore();
}

// Add image to selection
function addImageToSelection(imgElement, imgSrc) {
    const teamRows = document.querySelectorAll('.team-images');
    for (const teamRow of teamRows) {
        if (teamRow.children.length < 5) {
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
    document.querySelectorAll('.team-row').forEach(teamRow => {
        const teamScoreElement = teamRow.querySelector('.team-score');
        const totalScore = Array.from(teamRow.querySelectorAll('img'))
            .reduce((total, img) => total + parseInt(img.src.split('/').pop().split('_')[0], 10) / 10, 0);

        teamScoreElement.textContent = totalScore.toFixed(1);
    });
}

// Clear image selection
function clearSelection() {
    document.querySelectorAll('.selected').forEach(image => {
        image.classList.remove('selected');
        removeImageFromSelection(image, image.src);
    });
}

// Event listener for clear selection
document.getElementById('clearSelectionBtn').addEventListener('click', clearSelection);

// Toggle show/hide for all images
let showAll = true;
function toggleShowHide() {
    document.querySelectorAll('.photo').forEach(photo => {
        photo.style.display = showAll ? 'flex' : 'none';
    });
    showAll = !showAll;
}

// Hide all images on page load
window.onload = toggleShowHide;

// Toggle filter visibility
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

<<<<<<< HEAD
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
=======
// Prevent right-click and long-press menu on images
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // This prevents the right-click menu or long press menu
    });
>>>>>>> 88d1bd2 (fix dragging)
});
