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
let currentSortCriteria = 'number';
let currentSortOrder = 'desc';
sortImages()

// Toggle sort criteria
function toggleSortCriteria() {
    currentSortCriteria = currentSortCriteria === 'name' ? 'number' : 'name';
    document.getElementById('sortToggle').innerText = currentSortCriteria === 'name' ? 'Sort by Name' : 'Sort by Burst Gen';
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
            adjustImageSize(selectedImg);
            selectedImg.onclick = () => removeImageFromSelection(selectedImg, imgSrc);

            teamRow.appendChild(selectedImg);
            imgElement.classList.add('selected');
            break;
        }
    }
}

// Adjust image size based on screen width
function adjustImageSize(imgElement) {
    const width = window.innerWidth <= 768 ? 50 : 100;
    imgElement.style.width = `${width}px`;
    imgElement.style.height = `${width}px`;
}

// Update team scores
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
    const content = button.nextElementSibling;
    content.style.display = content.style.display === "none" ? "block" : "none";
    button.innerHTML = content.style.display === "none" ? "Filters ▼" : "Filters ▲";
}

// Disable right-click on images but allow dragging
document.querySelectorAll('img').forEach(img => {
    // Prevent right-click context menu
    img.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // Prevent the right-click context menu
    });

    // Disable long-press (touch and hold) on images for mobile devices but allow dragging
    img.addEventListener('touchstart', function (e) {
        // Prevent long-press behavior, but allow dragging
        if (e.target.draggable) {
            return; // Allow drag event if the image is draggable
        }

        e.preventDefault(); // Prevent default long press menu if not dragging
    }, { passive: false });
});


