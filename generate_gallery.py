import os

# Define the folder where the images are stored
current_dir = os.path.dirname(__file__)  # Get the directory of the current script
folder_path = os.path.join(current_dir, 'image')  # Path to the 'image' folder

# Check if the folder exists
if not os.path.exists(folder_path):
    print(f"Folder does not exist: {folder_path}")
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
    <link rel="icon" href="image/favicon.ico" type="image/x-icon">
    <style>
        body { background-color: #000; color: #fff; font-family: Arial, sans-serif; }
        .gallery { display: flex; flex-wrap: wrap; gap: 0px; }
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

<div class="page-container">
    <div class="flex-container-1">
        <div class="top-controls-wrapper">
            <div class="controls-container">
                <div class="sort-controls">
                    <button id="sortToggle" onclick="toggleSortCriteria()">Sort by Name</button>
                    <button id="orderToggle" onclick="toggleSortOrder()">Lowest</button>
                </div>
            </div>
            <div class="filter-section">
                <button class="collapse-btn" onclick="toggleFilter(this)">Filters ▼</button>
                <div class="filter-content" style="display: none;"> <!-- Hidden by default -->
                    <div class="filter-grid">
                        <div class="filter-box">
                            <h4>Burst:</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" value="b1" onchange="updateFilters()"> B1</label>
                                <label class="checkbox-label"><input type="checkbox" value="b2" onchange="updateFilters()"> B2</label>
                                <label class="checkbox-label"><input type="checkbox" value="b3" onchange="updateFilters()"> B3</label>
                                <label class="checkbox-label"><input type="checkbox" value="a" onchange="updateFilters()"> A</label>
                            </div>
                        </div>
                        <div class="filter-box">
                            <h4>Class:</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" value="def" onchange="updateFilters()"> Defender</label>
                                <label class="checkbox-label"><input type="checkbox" value="sp" onchange="updateFilters()"> Supporter</label>
                                <label class="checkbox-label"><input type="checkbox" value="atk" onchange="updateFilters()"> Attacker</label>
                            </div>
                        </div>
                        <div class="filter-box">
                            <h4>Industry:</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" value="elysion" onchange="updateFilters()"> Elysion</label>
                                <label class="checkbox-label"><input type="checkbox" value="missilis" onchange="updateFilters()"> Missilis</label>
                                <label class="checkbox-label"><input type="checkbox" value="tetra" onchange="updateFilters()"> Tetra</label>
                                <label class="checkbox-label"><input type="checkbox" value="abnormal" onchange="updateFilters()"> Abnormal</label>
                                <label class="checkbox-label"><input type="checkbox" value="pilgrim" onchange="updateFilters()"> Pilgrim</label>
                            </div>
                        </div>
                        <div class="filter-box">
                            <h4>Rarity:</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" value="ssr" onchange="updateFilters()"> SSR</label>
                                <label class="checkbox-label"><input type="checkbox" value="sr" onchange="updateFilters()"> SR</label>
                                <label class="checkbox-label"><input type="checkbox" value="r" onchange="updateFilters()"> R</label>
                            </div>
                        </div>
                        <div class="filter-box">
                            <h4>Weapon Type:</h4>
                            <div class="checkbox-group">
                                <label class="checkbox-label"><input type="checkbox" value="smg" onchange="updateFilters()"> SMG</label>
                                <label class="checkbox-label"><input type="checkbox" value="ar" onchange="updateFilters()"> AR</label>
                                <label class="checkbox-label"><input type="checkbox" value="snr" onchange="updateFilters()"> SNR</label>
                                <label class="checkbox-label"><input type="checkbox" value="rl" onchange="updateFilters()"> RL</label>
                                <label class="checkbox-label"><input type="checkbox" value="sg" onchange="updateFilters()"> SG</label>
                                <label class="checkbox-label"><input type="checkbox" value="mg" onchange="updateFilters()"> MG</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Team Selection Container (Fixed) -->
    <div class="fixed-team-container">
        <h2 class="team-title">Team Selection</h2>
        <div id="selectedContainer">
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
    </div> <!-- End of fixed-team-container -->

    <!-- Filter section moved to top controls wrapper -->
</div>

<div class="search-wrapper">
    <div class="search-bar">
        <input type="text" id="searchInput" oninput="updateFilters()" placeholder="Type to search...">
    </div>
</div>

<!-- Fixed bottom buttons -->
<div class="bottom-buttons">
    <button id="exportBtn" class="fixed-button left" onclick="exportSelectedContainerAsPNG()">Export</button>
    <button id="clearSelectionBtn" class="fixed-button right">Clear Selected Team</button>
</div>
    <!-- Gallery Container -->
    <div class="gallery-container">
        <h2 class="gallery-title">Character Gallery</h2>
        <!-- Gallery -->
        <div class="gallery">
        {gallery_items}
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <script src="script.js"></script>
    <script src="export.js"></script>
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

# Generate gallery items
gallery_items = []
for filename in os.listdir(folder_path):
    if filename.endswith(".webp"):
        print(f"Processing file: {filename}")

        parts = filename.replace('.webp', '').split('_')
        if len(parts) < 7:  # Expecting 7 parts with the number included
            print(f"Skipping file with unexpected format: {filename}")
            continue

        number, faction, rarity, type_, position, weapon_type, characterName = parts
        print(f"Extracted: Number: {number}, Faction: {faction}, Rarity: {rarity}, Type: {type_}, Position: {position}, Weapon: {weapon_type}, Character: {characterName}")

        # Add gallery item
        gallery_items.append(f"""
        <div class="photo" data-number="{number}" data-name="{characterName}" data-type="{type_}" data-position="{position}" data-faction="{faction}" data-rarity="{rarity}" data-weapon="{weapon_type}">
            <img src="image/{filename}" alt="{filename}" onclick="toggleImageSelection(this)">
        </div>
        """)

# Insert gallery items into the HTML template
html_template = html_template.replace("{gallery_items}", "\n".join(gallery_items))

# Save the HTML to a file
output_path = os.path.join(current_dir, 'index.html')
with open(output_path, 'w', encoding='utf-8') as file:
    file.write(html_template)

print(f"HTML file generated successfully at: {output_path}")