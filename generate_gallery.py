import os

# Define the folder where the images are stored relative to the script's location
# Use relative paths instead of absolute ones
current_dir = os.path.dirname(__file__)  # Get the directory of the current script
folder_path = os.path.join(current_dir, 'image')  # This assumes 'image' folder is at the same level as the script

# Check if the folder exists
if not os.path.exists(folder_path):
    print(f"Folder does not exist: {folder_path}")
    exit()
    

# Initialize the HTML template
html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="styles.css">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Organizer</title>
    <style>
        body {
            background-color: #000;  /* Black background */
            color: #fff;  /* White text */
            font-family: Arial, sans-serif;  /* Font style */
        }
        .gallery { display: flex; flex-wrap: wrap; gap: 10px; }
        .photo { display: none; flex-direction: column; align-items: center; }
        .photo img { width: 100px; height: 100px; object-fit: cover; cursor: pointer; border-radius: 5px; }
        .photo img.selected { border: 2px solid blue; }  /* Selection indicator */
        .filter-buttons { margin-bottom: 20px; }
        label { margin-right: 10px; color: #fff; }
        #selectedContainer { margin-top: 20px; }
        h3, h4 { color: #fff; }  /* Header colors */
        button {
            background-color: #444;  /* Dark gray */
            color: #fff;  /* White text */
            border: none;  /* No border */
            padding: 10px;  /* Padding */
            cursor: pointer;  /* Pointer cursor */
            border-radius: 5px;  /* Rounded corners */
            transition: background-color 0.3s;  /* Smooth transition */
        }
        button:hover {
            background-color: #666;  /* Lighter gray on hover */
        }
    </style>
</head>
<body>

<div class="filter-buttons">
    <div>
        <h4>Type:</h4>
        <label><input type="checkbox" value="b1" onchange="updateFilters()"> B1</label>
        <label><input type="checkbox" value="b2" onchange="updateFilters()"> B2</label>
        <label><input type="checkbox" value="b3" onchange="updateFilters()"> B3</label>
        <label><input type="checkbox" value="a" onchange="updateFilters()"> A</label>
    </div>
    <div>
        <h4>Position:</h4>
        <label><input type="checkbox" value="def" onchange="updateFilters()"> DEF</label>
        <label><input type="checkbox" value="sp" onchange="updateFilters()"> SP</label>
        <label><input type="checkbox" value="atk" onchange="updateFilters()"> ATK</label>
    </div>
    <div>
        <h4>Faction:</h4>
        <label><input type="checkbox" value="elysion" onchange="updateFilters()"> Elysion</label>
        <label><input type="checkbox" value="missilis" onchange="updateFilters()"> Missilis</label>
        <label><input type="checkbox" value="tetra" onchange="updateFilters()"> Tetra</label>
        <label><input type="checkbox" value="abnormal" onchange="updateFilters()"> Abnormal</label>
        <label><input type="checkbox" value="pilgrim" onchange="updateFilters()"> Pilgrim</label>
    </div>
    <div>
        <h4>Rarity:</h4>
        <label><input type="checkbox" value="ssr" onchange="updateFilters()"> SSR</label>
        <label><input type="checkbox" value="sr" onchange="updateFilters()"> SR</label>
        <label><input type="checkbox" value="r" onchange="updateFilters()"> R</label>
    </div>
    <div>
        <h4>Weapon Type:</h4>
        <label><input type="checkbox" value="smg" onchange="updateFilters()"> SMG</label>
        <label><input type="checkbox" value="ar" onchange="updateFilters()"> AR</label>
        <label><input type="checkbox" value="snr" onchange="updateFilters()"> SNR</label>
        <label><input type="checkbox" value="rl" onchange="updateFilters()"> RL</label>
        <label><input type="checkbox" value="sg" onchange="updateFilters()"> SG</label>
        <label><input type="checkbox" value="mg" onchange="updateFilters()"> MG</label>
        </div>
</div>
    
<div class="sort-controls">
    <button id="showHideButton" onclick="toggleShowHide()">Show All</button>
    
    <button id="sortToggle" onclick="toggleSortCriteria()">Sort by Name</button>
    
    <button id="orderToggle" onclick="toggleSortOrder()">Lowest</button>
</div>




    <div class="filter-buttons">
    <!-- Existing filter sections -->
    <h3>Search by Name:</h3>
    <input type="text" id="searchInput" oninput="updateFilters()" placeholder="Type to search...">
    </div>



<div class="gallery">
"""


# Iterate through each file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".webp"):
        print(f"Processing file: {filename}")

        parts = filename.replace('.webp', '').split('_')
        if len(parts) < 7:  # Expecting 7 parts with the number included
            print(f"Skipping file with unexpected format: {filename}")
            continue
        
        number = parts[0]  # First part is the number
        faction = parts[1].lower()
        rarity = parts[2].lower()
        type_ = parts[3].lower()
        position = parts[4].lower()
        weapon_type = parts[5].lower()
        characterName = parts[6]  # Assuming the character name is the last part

        print(f"Extracted: Number: {number}, Faction: {faction}, Rarity: {rarity}, Type: {type_}, Position: {position}, Weapon: {weapon_type}, Character: {characterName}")

        # Update HTML template with image and data attributes
        html_template += f"""
    <div class="photo" data-number="{number}" data-name="{characterName}" data-type="{type_}" data-position="{position}" data-faction="{faction}" data-rarity="{rarity}" data-weapon="{weapon_type}">
        <img src="image/{filename}" alt="{filename}" onclick="toggleImageSelection(this)">
    </div>
    """





print(f"Image Path: {os.path.join(folder_path, filename)}")




# Finalize the HTML template
html_template += """
</div>

<div id="selectedContainer" class="gallery"></div>

<script>
function updateFilters() {
    const photos = document.querySelectorAll('.photo');
    
    // Get all checkbox elements for different filters
    const typeChecks = document.querySelectorAll('input[type="checkbox"][value="b1"], input[type="checkbox"][value="b2"], input[type="checkbox"][value="b3"], input[type="checkbox"][value="a"]');
    const positionChecks = document.querySelectorAll('input[type="checkbox"][value="def"], input[type="checkbox"][value="sp"], input[type="checkbox"][value="atk"]');
    const factionChecks = document.querySelectorAll('input[type="checkbox"][value="elysion"], input[type="checkbox"][value="missilis"], input[type="checkbox"][value="tetra"], input[type="checkbox"][value="abnormal"], input[type="checkbox"][value="pilgrim"]');
    const rarityChecks = document.querySelectorAll('input[type="checkbox"][value="ssr"], input[type="checkbox"][value="sr"], input[type="checkbox"][value="r"]');
    const weaponChecks = document.querySelectorAll('input[type="checkbox"][value="smg"], input[type="checkbox"][value="ar"], input[type="checkbox"][value="snr"], input[type="checkbox"][value="rl"], input[type="checkbox"][value="sg"], input[type="checkbox"][value="mg"]');

    const searchInput = document.getElementById('searchInput').value.toLowerCase(); // Get search input value

    photos.forEach(photo => {
        const type = photo.getAttribute('data-type').toLowerCase();
        const position = photo.getAttribute('data-position').toLowerCase();
        const faction = photo.getAttribute('data-faction').toLowerCase();
        const rarity = photo.getAttribute('data-rarity').toLowerCase();
        const weapon = photo.getAttribute('data-weapon').toLowerCase();
        const imgAlt = photo.querySelector('img').alt.toLowerCase(); // Get the alt text for filtering by name

        // Check conditions for each filter
        const typeMatch = Array.from(typeChecks).some(check => check.checked && type.includes(check.value));
        const positionMatch = Array.from(positionChecks).some(check => check.checked && position.includes(check.value));
        const factionMatch = Array.from(factionChecks).some(check => check.checked && faction.includes(check.value));
        const rarityMatch = Array.from(rarityChecks).some(check => check.checked && rarity === check.value); // Adjusted to match exactly
        const weaponMatch = Array.from(weaponChecks).some(check => check.checked && weapon.includes(check.value));
        const nameMatch = imgAlt.includes(searchInput); // Match against the search input

        // Determine if the photo should be displayed
        if (
            (typeMatch || !Array.from(typeChecks).some(check => check.checked)) &&
            (positionMatch || !Array.from(positionChecks).some(check => check.checked)) &&
            (factionMatch || !Array.from(factionChecks).some(check => check.checked)) &&
            (rarityMatch || !Array.from(rarityChecks).some(check => check.checked)) && // Exact match for rarity
            (weaponMatch || !Array.from(weaponChecks).some(check => check.checked)) &&
            (nameMatch || searchInput === "") // Include name filter
        ) {
            photo.style.display = 'flex';
        } else {
            photo.style.display = 'none';
        }
    });
}




let placeholder = document.createElement('div');
placeholder.style.height = "100px";  // Match the height of your images
placeholder.style.backgroundColor = "rgba(0, 0, 255, 0.3)"; // Light blue color
placeholder.style.margin = "5px 0"; // Spacing
placeholder.style.display = "none"; // Initially hidden

selectedContainer.appendChild(placeholder);

selectedContainer.ondragover = function(event) {
    event.preventDefault(); // Prevent default to allow drop
};

selectedContainer.ondrop = function(event) {
    event.preventDefault();
    placeholder.style.display = "none"; // Hide placeholder after drop

    const draggedImgSrc = event.dataTransfer.getData("text/plain");
    const draggedImg = Array.from(selectedContainer.querySelectorAll('img')).find(img => img.src === draggedImgSrc);
    const targetImg = event.target;

    // Ensure we drop on a valid image
    if (targetImg.tagName === "IMG" && draggedImg) {
        const rect = targetImg.getBoundingClientRect();
        const offset = event.clientY - rect.top;

        if (offset < rect.height / 2) {
            // Drop before the target image
            selectedContainer.insertBefore(draggedImg.parentElement, targetImg.parentElement);
        } else {
            // Drop after the target image
            const nextElement = targetImg.parentElement.nextElementSibling;
            if (nextElement) {
                selectedContainer.insertBefore(draggedImg.parentElement, nextElement);
            } else {
                selectedContainer.appendChild(draggedImg.parentElement);
            }
        }
    }
};

// Show placeholder only when dragging over an image
selectedContainer.onmousemove = function(event) {
    const targetImg = document.elementFromPoint(event.clientX, event.clientY);
    if (targetImg && targetImg.tagName === "IMG") {
        const rect = targetImg.getBoundingClientRect();
        const offset = event.clientY - rect.top;

        placeholder.style.display = "block";
        if (offset < rect.height / 2) {
            selectedContainer.insertBefore(placeholder, targetImg.parentElement);
        } else {
            const nextElement = targetImg.parentElement.nextElementSibling;
            if (nextElement) {
                selectedContainer.insertBefore(placeholder, nextElement);
            } else {
                selectedContainer.appendChild(placeholder);
            }
        }
    } else {
        placeholder.style.display = "none"; // Hide if not over an image
    }
};

// Clean up placeholder when dragging out
selectedContainer.onmouseleave = function() {
    placeholder.style.display = "none"; // Hide when mouse leaves the container
};

let sortOrder = 'name'; // Default sort order
let sortDirection = 'asc'; // Default sort direction
let currentSortCriteria = 'name'; // Default sort criteria
let currentSortOrder = 'asc'; // Default sort order

function toggleSortCriteria() {
    // Toggle between 'name' and 'number'
    if (currentSortCriteria === 'name') {
        currentSortCriteria = 'number';
        document.getElementById('sortToggle').innerText = 'Sort by Burst Gen';
    } else {
        currentSortCriteria = 'name';
        document.getElementById('sortToggle').innerText = 'Sort by Name';
    }
    sortImages(); // Call your sort function after toggling
}

function toggleSortOrder() {
    // Toggle between 'asc' and 'desc'
    if (currentSortOrder === 'asc') {
        currentSortOrder = 'desc';
        document.getElementById('orderToggle').innerText = 'Highest';
    } else {
        currentSortOrder = 'asc';
        document.getElementById('orderToggle').innerText = 'Lowest';
    }
    sortImages(); // Call your sort function after toggling
}

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


// Function to set the sort order
function setSortOrder(order) {
    sortOrder = order; // Set the sort order
    sortImages(); // Sort images after setting order
}

// Function to set the sort direction
function setSortDirection(direction) {
    sortDirection = direction; // Set the sort direction
    sortImages(); // Sort images after setting direction
}




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
        selectedImg.style.width = "100px"; // Size in the selected container
        selectedImg.style.height = "100px"; // Size in the selected container
        selectedImg.draggable = true; // Make it draggable

        // Add drag and drop functionality
        selectedImg.ondragstart = function(event) {
            event.dataTransfer.setData("text/plain", imgSrc);
            event.dataTransfer.effectAllowed = "move";
        };

        selectedContainer.ondragover = function(event) {
            event.preventDefault(); // Prevent default to allow drop
        };

        selectedContainer.ondrop = function(event) {
            event.preventDefault();
            const draggedImgSrc = event.dataTransfer.getData("text/plain");
            const draggedImg = Array.from(selectedContainer.querySelectorAll('img')).find(img => img.src === draggedImgSrc);

            // Get the target element where the dragged image is dropped
            const targetImg = event.target;

            if (targetImg.tagName === "IMG" && draggedImg) {
                // Insert before or after the target image
                const rect = targetImg.getBoundingClientRect();
                const offset = event.clientY - rect.top;

                if (offset < rect.height / 2) {
                    selectedContainer.insertBefore(draggedImg.parentElement, targetImg.parentElement);
                } else {
                    const nextElement = targetImg.parentElement.nextElementSibling;
                    if (nextElement) {
                        selectedContainer.insertBefore(draggedImg.parentElement, nextElement);
                    } else {
                        selectedContainer.appendChild(draggedImg.parentElement);
                    }
                }
            }
        };

        // Add click event to remove from selection
        selectedImg.onclick = function() {
            imgElement.classList.remove('selected');  // Unselect the original image

            // Remove this image from the selected container
            selectedContainer.removeChild(selectedImg.parentElement);
        };

        const selectedItem = document.createElement('div');
        selectedItem.appendChild(selectedImg);
        selectedContainer.appendChild(selectedItem);
    }
}




   // Function to show or hide all images
let showAll = true; // Set to true to indicate that images are hidden by default

// Function to toggle between showing and hiding all images
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
window.onload = function() {
    hideAll(); // Call hideAll function to hide all images by default
};



    sortImages();
</script>




</body>
</html>
"""

# Save the HTML to a file
output_path = 'E:/Coding/nikkesportrait/index.html'
with open(output_path, 'w', encoding='utf-8') as file:
    file.write(html_template)

print(f"HTML file generated successfully at: {output_path}")    