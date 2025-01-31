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

// Drag-and-drop functionality for selected images
let placeholder = document.createElement('div');
placeholder.style.height = '100px'; // Match the height of your images
placeholder.style.backgroundColor = 'rgba(0, 0, 255, 0.3)'; // Light blue color
placeholder.style.margin = '5px 0'; // Spacing
placeholder.style.display = 'none'; // Initially hidden

document.getElementById('selectedContainer').appendChild(placeholder);

document.getElementById('selectedContainer').ondragover = function (event) {
    event.preventDefault(); // Prevent default to allow drop
};

document.getElementById('selectedContainer').ondrop = function (event) {
    event.preventDefault();
    placeholder.style.display = 'none'; // Hide placeholder after drop

    const draggedImgSrc = event.dataTransfer.getData('text/plain');
    const draggedImg = Array.from(document.getElementById('selectedContainer').querySelectorAll('img')).find(img => img.src === draggedImgSrc);
    const targetImg = event.target;

    // Ensure we drop on a valid image
    if (targetImg.tagName === 'IMG' && draggedImg) {
        const rect = targetImg.getBoundingClientRect();
        const offset = event.clientY - rect.top;

        if (offset < rect.height / 2) {
            // Drop before the target image
            document.getElementById('selectedContainer').insertBefore(draggedImg.parentElement, targetImg.parentElement);
        } else {
            // Drop after the target image
            const nextElement = targetImg.parentElement.nextElementSibling;
            if (nextElement) {
                document.getElementById('selectedContainer').insertBefore(draggedImg.parentElement, nextElement);
            } else {
                document.getElementById('selectedContainer').appendChild(draggedImg.parentElement);
            }
        }
    }
};

// Show placeholder only when dragging over an image
document.getElementById('selectedContainer').onmousemove = function (event) {
    const targetImg = document.elementFromPoint(event.clientX, event.clientY);
    if (targetImg && targetImg.tagName === 'IMG') {
        const rect = targetImg.getBoundingClientRect();
        const offset = event.clientY - rect.top;

        placeholder.style.display = 'block';
        if (offset < rect.height / 2) {
            document.getElementById('selectedContainer').insertBefore(placeholder, targetImg.parentElement);
        } else {
            const nextElement = targetImg.parentElement.nextElementSibling;
            if (nextElement) {
                document.getElementById('selectedContainer').insertBefore(placeholder, nextElement);
            } else {
                document.getElementById('selectedContainer').appendChild(placeholder);
            }
        }
    } else {
        placeholder.style.display = 'none'; // Hide if not over an image
    }
};

// Clean up placeholder when dragging out
document.getElementById('selectedContainer').onmouseleave = function () {
    placeholder.style.display = 'none'; // Hide when mouse leaves the container
};

// Sort functionality
let currentSortCriteria = 'name'; // Default sort criteria
let currentSortOrder = 'asc'; // Default sort order

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

    // Check if the image is already selected
    if (imgElement.classList.contains('selected')) {
        imgElement.classList.remove('selected');

        // Remove the image from the selected container
        const selectedImages = selectedContainer.querySelectorAll('img');
        selectedImages.forEach(selectedImg => {
            if (selectedImg.src === imgSrc) {
                selectedContainer.removeChild(selectedImg.parentElement);
            }
        });
    } else {
        imgElement.classList.add('selected');

        // Clone the image to display in the selected container
        const selectedImg = document.createElement('img');
        selectedImg.src = imgSrc;
        selectedImg.style.width = '100px'; // Size in the selected container
        selectedImg.style.height = '100px'; // Size in the selected container
        selectedImg.draggable = true; // Make it draggable

        // Add drag and drop functionality
        selectedImg.ondragstart = function (event) {
            event.dataTransfer.setData('text/plain', imgSrc);
            event.dataTransfer.effectAllowed = 'move';
        };

        // Add click event to remove from selection
        selectedImg.onclick = function () {
            imgElement.classList.remove('selected'); // Unselect the original image
            selectedContainer.removeChild(selectedImg.parentElement); // Remove from selected container
        };

        const selectedItem = document.createElement('div');
        selectedItem.appendChild(selectedImg);
        selectedContainer.appendChild(selectedItem);
    }
}

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

// Function to hide all images
function hideAll() {
    const photos = document.querySelectorAll('.photo');
    photos.forEach(photo => {
        photo.style.display = 'none'; // Hide all photos
    });
    showAll = true; // Reset state so "Show All" can be clicked to show photos
}

// Function to reset filters and show all photos
function resetFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateFilters();
    showAll = false; // Reset state so the "Show All" button will work correctly
}

// Hide all images on page load
window.onload = function () {
    hideAll(); // Call hideAll function to hide all images by default
};

// Function to save selected images to a JSON file
function saveSelectedImages() {
    const selectedImages = document.querySelectorAll('#selectedContainer img');
    const imageArray = Array.from(selectedImages).map(img => img.src);

    // Create a blob from the image array
    const fileData = JSON.stringify(imageArray, null, 2); // Convert to JSON format
    const blob = new Blob([fileData], { type: 'application/json' }); // Create a blob
    const url = URL.createObjectURL(blob); // Create a URL for the blob

    // Create a link element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected_images.json'; // Filename for the downloaded file
    document.body.appendChild(a); // Append link to body
    a.click(); // Trigger download
    document.body.removeChild(a); // Remove link from body
    URL.revokeObjectURL(url); // Free up memory
}

// Function to load selected images from a JSON file
function loadSelectedImages(event) {
    const file = event.target.files[0]; // Get the selected file

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageArray = JSON.parse(e.target.result); // Parse the JSON file
            const selectedContainer = document.getElementById('selectedContainer');
            selectedContainer.innerHTML = ''; // Clear current selections

            imageArray.forEach(src => {
                // Create a new image element and add it to the selected container
                const img = document.createElement('img');
                img.src = src;
                img.style.width = '100px'; // Size in the selected container
                img.style.height = '100px'; // Size in the selected container
                img.draggable = true; // Make it draggable

                img.onclick = function () {
                    // Remove from selection when clicked
                    img.classList.remove('selected');
                    selectedContainer.removeChild(img);
                };

                selectedContainer.appendChild(img); // Add the image to the selected container
            });
        };
        reader.readAsText(file); // Read the file as text
    }
}

// Initial sort of images
sortImages();

// Disable right-click and long-press for images
const images = document.querySelectorAll('.photo img');
images.forEach(img => {
    img.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // Prevent the default context menu
    });

    img.addEventListener('touchstart', function (e) {
        e.preventDefault(); // Prevent the default touch behavior
    }, { passive: false });
});