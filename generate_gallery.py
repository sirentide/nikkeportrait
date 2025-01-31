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

<div class="filter-section">
    <button class="collapse-btn" onclick="toggleFilter(this)">Filters ▼</button>
    <div class="filter-content" style="display: none;"> <!-- Hidden by default -->
        <div class="filter-box">
            <h4>Burst:</h4>
            <div class="checkbox-group">
                <label><input type="checkbox" value="b1" onchange="updateFilters()"> B1</label>
                <label><input type="checkbox" value="b2" onchange="updateFilters()"> B2</label>
                <label><input type="checkbox" value="b3" onchange="updateFilters()"> B3</label>
                <label><input type="checkbox" value="a" onchange="updateFilters()"> A</label>
            </div>
        </div>
        <div class="filter-box">
            <h4>Class:</h4>
            <div class="checkbox-group">
                <label><input type="checkbox" value="def" onchange="updateFilters()"> Defender</label>
                <label><input type="checkbox" value="sp" onchange="updateFilters()"> Supporter</label>
                <label><input type="checkbox" value="atk" onchange="updateFilters()"> Attacker</label>
            </div>
        </div>
        <div class="filter-box">
            <h4>Industry:</h4>
            <div class="checkbox-group">
                <label><input type="checkbox" value="elysion" onchange="updateFilters()"> Elysion</label>
                <label><input type="checkbox" value="missilis" onchange="updateFilters()"> Missilis</label>
                <label><input type="checkbox" value="tetra" onchange="updateFilters()"> Tetra</label>
                <label><input type="checkbox" value="abnormal" onchange="updateFilters()"> Abnormal</label>
                <label><input type="checkbox" value="pilgrim" onchange="updateFilters()"> Pilgrim</label>
            </div>
        </div>
        <div class="filter-box">
            <h4>Rarity:</h4>
            <div class="checkbox-group">
                <label><input type="checkbox" value="ssr" onchange="updateFilters()"> SSR</label>
                <label><input type="checkbox" value="sr" onchange="updateFilters()"> SR</label>
                <label><input type="checkbox" value="r" onchange="updateFilters()"> R</label>
            </div>
        </div>
        <div class="filter-box">
            <h4>Weapon Type:</h4>
            <div class="checkbox-group">
                <label><input type="checkbox" value="smg" onchange="updateFilters()"> SMG</label>
                <label><input type="checkbox" value="ar" onchange="updateFilters()"> AR</label>
                <label><input type="checkbox" value="snr" onchange="updateFilters()"> SNR</label>
                <label><input type="checkbox" value="rl" onchange="updateFilters()"> RL</label>
                <label><input type="checkbox" value="sg" onchange="updateFilters()"> SG</label>
                <label><input type="checkbox" value="mg" onchange="updateFilters()"> MG</label>
            </div>
        </div>
    </div>
</div>

    <!-- Sort Controls -->
    <div class="sort-controls">
        <button id="sortToggle" onclick="toggleSortCriteria()">Sort by Burst Gen</button>
        <button id="orderToggle" onclick="toggleSortOrder()">Highest</button>
        <button id="showHideButton" onclick="toggleShowHide()">Show/Hide All</button>
    </div>

    <!-- Search Input -->

    <div class="search-wrapper">
    <div class="search-bar">
        <input type="text" id="searchInput" oninput="updateFilters()" placeholder="Type to search...">
        <button id="clearSelectionBtn">Clear Selection</button>
    </div>
</div>


    <div id="selectedContainer">
        <!-- Team 1 -->
        <div class="team-row" data-team="1">
            <div class="team-label">T1</div>
            <div class="team-images" data-team="1">
            </div>
        </div>
        <!-- Team 2 -->
        <div class="team-row" data-team="2">
            <div class="team-label">T2</div>
            <div class="team-images" data-team="2">
            </div>
        </div>
        <!-- Team 3 -->
        <div class="team-row" data-team="3">
            <div class="team-label">T3</div>
            <div class="team-images" data-team="3">
            </div>
        </div>
        <!-- Team 4 -->
        <div class="team-row" data-team="4">
            <div class="team-label">T4</div>
            <div class="team-images" data-team="4">
            </div>
        </div>
        <!-- Team 5 -->
        <div class="team-row" data-team="5">
            <div class="team-label">T5</div>
            <div class="team-images" data-team="5">
            </div>
        </div>
    </div>



    <!-- Gallery -->
    <div class="gallery">
        {gallery_items}
    </div>


    <script src="script.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
     <script>
        // Initialize Sortable.js on each team-images container with group option
        document.querySelectorAll('.team-images').forEach((teamContainer) => {
            new Sortable(teamContainer, {
                animation: 150,  // Smooth animation
                ghostClass: 'sortable-ghost',  // Class for the dragged item
                group: {
                    name: 'shared',  // The group name must be the same for all teams to allow movement
                    pull: true,  // Allow pulling items from this list
                    put: true   // Allow putting items into this list
                },
                onEnd: function(evt) {
                    console.log(`Image moved from team ${evt.from.getAttribute('data-team')} to team ${evt.to.getAttribute('data-team')}`);
                    // You can perform other actions after the drag event
                }
            });
        });
    </script>


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