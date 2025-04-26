import os
import shutil

# Define the folder where the images are stored
current_dir = os.path.dirname(__file__)  # Get the directory of the current script
image_path = os.path.join(current_dir, 'image')  # Path to the 'image' folder in the current project

# Check if the image folder exists, create it if it doesn't
if not os.path.exists(image_path):
    os.makedirs(image_path)
    print(f"Created image folder: {image_path}")

# Define the path to the assets repository
assets_image_id_path = "E:\\Coding\\public-host\\nikkesportrait-assets\\image-id"
if not os.path.exists(assets_image_id_path):
    print(f"Assets image-id folder does not exist: {assets_image_id_path}")
    exit()

html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="styles.css">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nikkes Arena</title>
    <link rel="icon" href="https://raw.githubusercontent.com/sirentide/public-host/refs/heads/master/image-id/favicon.ico" type="image/x-icon">
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js"></script>
    <script src="github-assets.js"></script>
    <style>
        body { background-color: #000; color: #fff; font-family: Arial, sans-serif; }
        label { margin-right: 10px; color: #fff; }
        #selectedContainer { margin-top: 20px; }
        h3, h4 { color: #fff; }
        button {
            background-color: #444; color: #fff; border: none; padding: 10px;
            cursor: pointer; border-radius: 5px; transition: background-color 0.3s;
        }
        button:hover { background-color: #666; }
   </style>
</head>
<body>

    <!-- Team Selection Container (Fixed) - Multiple team sets with tabs -->
    <!-- Team Set 1 -->
    <div class="fixed-team-container" id="teamSet1" data-team-set="1">
        <div class="team-title-container">
            <h2 class="team-title">Defender</h2>
            <button class="edit-team-name-btn" onclick="editTeamName('1')">✏️</button>
        </div>
        <div id="selectedContainer1" class="selected-container">
            <div class="team-row" data-team="1">
                <div class="team-label">T1</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="2">
                <div class="team-label">T2</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="3">
                <div class="team-label">T3</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="4">
                <div class="team-label">T4</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="5">
                <div class="team-label">T5</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Team Set 2 -->
    <div class="fixed-team-container hidden" id="teamSet2" data-team-set="2">
        <div class="team-title-container">
            <h2 class="team-title">Attacker</h2>
            <button class="edit-team-name-btn" onclick="editTeamName('2')">✏️</button>
        </div>
        <div id="selectedContainer2" class="selected-container">
            <div class="team-row" data-team="1">
                <div class="team-label">T1</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="2">
                <div class="team-label">T2</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="3">
                <div class="team-label">T3</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="4">
                <div class="team-label">T4</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
            <div class="team-row" data-team="5">
                <div class="team-label">T5</div>
                <div class="team-score">0.0</div>
                <div class="team-images">
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                    <div class="image-slot empty"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- SET3 has been removed -->

    <!-- Filter section moved to top controls wrapper -->
</div>



<!-- Fixed bottom buttons -->
<div class="bottom-buttons">
    <button id="clearSelectionBtn" class="fixed-button right">Clear Selected Team</button>
</div>

<!-- Tab System for My Nikkes -->
<div class="toggle-tabs-container">
    <div class="toggle-container" id="toggleImagesContainer">
        <div class="toggle-header">
            <h2 class="toggle-title">My Nikkes List</h2>
            <div class="burst-filter-buttons">
                <button class="burst-btn" data-value="b1">I</button>
                <button class="burst-btn" data-value="b2">II</button>
                <button class="burst-btn" data-value="b3">III</button>
                <button class="burst-btn" data-value="a">A</button>
            </div>
        </div>
        <div class="toggle-images" id="toggleImages"></div>
    </div>
</div>

<!-- Tab Navigation -->
<div class="tab-navigation">
    <div class="tab-group">
        <button class="tab-button" data-tab="gallery">Nikkes</button>
        <button class="tab-button active" data-tab="toggleImages">My Nikke lists</button>
        <button class="tab-button import-toggle" id="importToggleBtn">Add lists</button>
        <button class="tab-button clear-toggle" id="clearToggleBtn">Remove lists</button>
        <button class="tab-button export-data" id="exportToggleDataBtn">Save lists</button>
        <button class="tab-button reset-data" id="resetDataBtn" title="Reset all saved data (for troubleshooting)">Reset Site Data</button>
    </div>
    <div class="tab-group">
        <button id="exportBtn" class="tab-button">Compare</button>
        <button class="tab-button team-tab active" data-set="1">Defender</button>
        <button class="tab-button team-tab" data-set="2">Attacker</button>
        <button class="tab-button saved-sets" id="savedSetsBtn">Saved Sets</button>
        <div class="search-wrapper">
            <div class="search-bar">
                <input type="text" id="myNikkesSearchInput" placeholder="Search all Nikkes...">
            </div>
        </div>
        <div class="filter-wrapper">
            <button id="filterBtn" class="burst-btn filter-btn" onclick="event.stopPropagation(); event.preventDefault(); setTimeout(function() { toggleFilterPanel(); }, 10);"><i class="filter-icon">⚙️</i></button>
        </div>
    </div>
</div>

<!-- Gallery Container -->
    <div class="gallery-container">
        <div class="gallery-header">
            <h2 class="gallery-title">Nikkes</h2>
            <div class="burst-filter-buttons">
                <button class="burst-btn" data-value="b1">I</button>
                <button class="burst-btn" data-value="b2">II</button>
                <button class="burst-btn" data-value="b3">III</button>
                <button class="burst-btn" data-value="a">A</button>
            </div>
        </div>
        <!-- Gallery -->
        <div class="gallery">
        {gallery_items}
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <script src="script.js"></script>
    <script src="export.js"></script>
    <script src="teamsets.js"></script>
    <script src="filter.js"></script>
    <script src="storage.js"></script>
    <script src="optimized-storage.js"></script>
    <script src="lzstring.min.js"></script>
     <script>
        // Initialize Sortable.js on each team-images container with group option
        document.querySelectorAll('.team-images').forEach((teamContainer) => {
            new Sortable(teamContainer, {
                animation: 150,  // Smooth animation
                ghostClass: 'sortable-ghost',  // Class for the dragged item
                delay: 300, // Require 300ms hold before dragging
                delayOnTouchOnly: true, // Apply delay only on touch devices
                group: {
                    name: 'shared',  // The group name must be the same for all teams to allow movement
                    pull: true,  // Allow pulling items from this list
                    put: true   // Allow putting items into this list
                },
                swapThreshold: 0.65, // Threshold of the swap zone (0.65 means 65% overlap required to swap)
                swap: true, // Enable swap mode
                onStart: function(evt) {
                    // Store the number of slots in each team before dragging
                    document.querySelectorAll('.team-images').forEach(team => {
                        team.dataset.slotCount = team.children.length;
                    });
                },
                onEnd: function(evt) {
                    console.log(`Image moved from team ${evt.from.parentNode.getAttribute('data-team')} to team ${evt.to.parentNode.getAttribute('data-team')}`);

                    // Check if any team has more than 5 slots and fix it
                    document.querySelectorAll('.team-images').forEach(team => {
                        const originalCount = parseInt(team.dataset.slotCount || 5);
                        const currentCount = team.children.length;

                        // If this team has more slots than it should
                        if (currentCount > 5) {
                            console.log(`Team ${team.parentNode.getAttribute('data-team')} has ${currentCount} slots, fixing...`);

                            // Remove excess slots
                            while (team.children.length > 5) {
                                team.removeChild(team.lastChild);
                            }
                        }

                        // If this team has fewer slots than it should
                        if (currentCount < 5) {
                            console.log(`Team ${team.parentNode.getAttribute('data-team')} has ${currentCount} slots, adding empty slots...`);

                            // Add empty slots
                            for (let i = currentCount; i < 5; i++) {
                                const emptySlot = document.createElement('div');
                                emptySlot.className = 'image-slot empty';
                                team.appendChild(emptySlot);
                            }
                        }
                    });

                    // Update team scores
                    updateTeamScore();
                    saveSelectionToLocalStorage();
                }
            });
        });
    </script>
    <!-- Export function moved to export.js -->


</body>
</html>
"""

# Copy images from assets repo to local image folder
print("Copying images from assets repo to local image folder...")
for filename in os.listdir(assets_image_id_path):
    if filename.endswith(".webp") and not filename == "rename.bat":
        src_path = os.path.join(assets_image_id_path, filename)
        dst_path = os.path.join(image_path, filename)
        shutil.copy2(src_path, dst_path)
        print(f"Copied: {filename}")

# Generate gallery items
gallery_items = []
for filename in os.listdir(assets_image_id_path):
    if not filename.endswith(".webp") or filename == "rename.bat":
        continue

    print(f"Processing file: {filename}")
    name = filename[:-5]  # Remove ".webp"
    parts = name.split('_')

    # Debugging log: see how parts are split
    print(f"Parts after split: {parts}")

    if len(parts) < 9:
        print(f"Skipping file with unexpected format: {filename}")
        continue

    # Extract fixed fields
    ID = parts[0]
    number = parts[1]
    element = parts[2]
    faction = parts[3]
    rarity = parts[4]
    type_ = parts[5]
    position = parts[6]
    weapon_type = parts[7]

    # Join the rest as character name
    characterName = '_'.join(parts[8:])

    # Debugging log: check what each field looks like
    print(f"Extracted fields: ID={ID}, number={number}, element={element}, faction={faction}, rarity={rarity}, type_={type_}, position={position}, weapon_type={weapon_type}, characterName={characterName}")

    gallery_items.append(f"""
    <div class="photo" data-id="{ID}" data-number="{number}" data-name="{characterName}" data-element="{element}" data-type="{type_}" data-position="{position}" data-faction="{faction}" data-rarity="{rarity}" data-weapon="{weapon_type}">
        <img crossorigin="anonymous" src="https://raw.githubusercontent.com/sirentide/public-host/refs/heads/master/image-id/{filename}" alt="{filename}">
    </div>
    """)


# Insert gallery items into the HTML template
html_template = html_template.replace("{gallery_items}", "\n".join(gallery_items))

# Save the HTML to a file
output_path = os.path.join(current_dir, 'index.html')
with open(output_path, 'w', encoding='utf-8') as file:
    file.write(html_template)

print(f"HTML file generated successfully at: {output_path}")