// Simple export function that opens a clean view for screenshots
function exportSelectedContainerAsPNG() {
    console.log("Preparing screenshot view...");

    try {
        // Get team data
        const teamData = [];
        const teamRows = document.querySelectorAll('.team-row');

        teamRows.forEach(row => {
            const teamLabel = row.querySelector('.team-label').textContent;
            const teamScore = row.querySelector('.team-score').textContent;
            const imageSlots = [];

            row.querySelectorAll('.image-slot').forEach(slot => {
                const img = slot.querySelector('img');
                if (img) {
                    // Get character name from data-name attribute if available
                    let characterName = img.getAttribute('data-name');

                    // If data-name is not available, try to extract from src
                    if (!characterName) {
                        const src = img.src;
                        const filename = src.split('/').pop();
                        const parts = filename.split('_');

                        if (parts.length > 5) {
                            characterName = parts.slice(5).join(' ').replace('.webp', '');
                        } else {
                            characterName = "Unknown";
                        }
                    }

                    imageSlots.push({
                        filled: true,
                        src: img.src,
                        name: characterName
                    });
                } else {
                    imageSlots.push({
                        filled: false
                    });
                }
            });

            teamData.push({
                label: teamLabel,
                score: teamScore,
                slots: imageSlots
            });
        });

        // Create a new window with the team data
        const newWindow = window.open('', 'teamExport', 'width=800,height=600');
        if (!newWindow) {
            throw new Error('Popup blocked. Please allow popups to view the exported team.');
        }

        // Generate HTML for the new window
        const timestamp = new Date().toLocaleString();
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Team Export - ${timestamp}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        background-color: #222;
                        color: white;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 10px;
                        width: 100%;
                        overflow-x: hidden;
                    }
                    .container {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        box-sizing: border-box;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 24px;
                    }
                    .team-row {
                        background-color: #333;
                        border-radius: 5px;
                        padding: 10px;
                        margin-bottom: 10px;
                        display: flex;
                        align-items: center;
                    }
                    .team-info {
                        width: 60px;
                        text-align: center;
                    }
                    .team-label {
                        font-weight: bold;
                        font-size: 16px;
                    }
                    .team-score {
                        margin-top: 3px;
                        font-size: 14px;
                    }
                    .team-slots {
                        display: flex;
                        flex: 1;
                        gap: 8px;
                        margin-left: 10px;
                        justify-content: space-between;
                    }
                    .slot {
                        width: 60px;
                        height: 60px;
                        background-color: #222;
                        border-radius: 5px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: hidden;
                    }
                    .slot.empty {
                        border: 2px dashed #444;
                    }
                    .slot.filled {
                        border: 2px solid #666;
                    }
                    .character-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .character-name {
                        position: absolute;
                        bottom: -20px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 10px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .instructions {
                        margin-top: 20px;
                        padding: 10px;
                        background-color: #333;
                        border-radius: 5px;
                        transition: max-height 0.3s ease-out;
                        overflow: hidden;
                    }
                    .instructions.collapsed {
                        max-height: 40px;
                    }
                    .instructions.expanded {
                        max-height: 500px;
                    }
                    .instructions h2 {
                        margin: 0;
                        font-size: 16px;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .instructions h2:after {
                        content: "▼";
                        font-size: 12px;
                    }
                    .instructions.collapsed h2:after {
                        content: "▶";
                    }
                    .instructions-content {
                        margin-top: 10px;
                        display: none;
                    }
                    .instructions.expanded .instructions-content {
                        display: block;
                    }
                    .instructions ol {
                        margin-left: 20px;
                        line-height: 1.4;
                        font-size: 14px;
                    }
                    .timestamp {
                        text-align: right;
                        font-size: 12px;
                        color: #aaa;
                        margin-top: 15px;
                    }
                    .export-area {
                        margin-top: 10px;
                        padding: 15px;
                        background-color: #1a1a1a;
                        border-radius: 5px;
                        border: 2px dashed #444;
                    }
                    .button-row {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 10px;
                    }
                    button {
                        padding: 8px 12px;
                        background-color: #444;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #555;
                    }
                    .clean-view-btn {
                        background-color: #2a6496;
                    }
                    .clean-view-btn:hover {
                        background-color: #3a7db6;
                    }
                    .clean-mode .instructions,
                    .clean-mode .button-row {
                        display: none;
                    }
                    .clean-mode .export-area {
                        border: none;
                        padding: 0;
                        background-color: transparent;
                    }
                    @media print {
                        .instructions, .button-row {
                            display: none;
                        }
                        .export-area {
                            border: none;
                            padding: 0;
                            margin: 0;
                        }
                    }
                    @media (max-width: 600px) {
                        .container {
                            padding: 0;
                            width: 100%;
                        }
                        .slot {
                            width: calc((100% - 40px) / 5);
                            height: calc((100vw - 80px) / 5);
                            min-width: 40px;
                            min-height: 40px;
                            max-width: 60px;
                            max-height: 60px;
                        }
                        .team-info {
                            width: 40px;
                        }
                        .team-label {
                            font-size: 14px;
                        }
                        .team-score {
                            font-size: 12px;
                        }
                        h1 {
                            font-size: 20px;
                            margin-bottom: 15px;
                        }
                        .team-row {
                            padding: 8px;
                        }
                        .character-name {
                            font-size: 8px;
                            bottom: -16px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="instructions collapsed">
                        <h2 onclick="toggleInstructions()">Screenshot Instructions</h2>
                        <div class="instructions-content">
                            <ol>
                                <li>Use the "Clean View" button to hide these instructions and buttons</li>
                                <li>Take a screenshot of the team selection below</li>
                                <li>On Windows: Press <strong>Windows+Shift+S</strong> and select the area</li>
                                <li>On Mac: Press <strong>Command+Shift+4</strong> and select the area</li>
                                <li>On Mobile: Use your device's screenshot function</li>
                                <li>Or click the Print button to print or save as PDF</li>
                            </ol>
                        </div>
                    </div>

                    <div class="export-area" id="export-area">
                        <h1>Team Selection</h1>
        `;

        // Add team rows
        teamData.forEach(team => {
            html += `
                <div class="team-row">
                    <div class="team-info">
                        <div class="team-label">${team.label}</div>
                        <div class="team-score">${team.score}</div>
                    </div>
                    <div class="team-slots">
            `;

            // Add slots
            team.slots.forEach(slot => {
                if (slot.filled) {
                    html += `
                        <div class="slot filled">
                            <img class="character-img" src="${slot.src}" alt="${slot.name}" />
                            <div class="character-name">${slot.name}</div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="slot empty">
                            <div>+</div>
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                </div>
            `;
        });

        // Add timestamp and close the export area
        html += `
                        <div class="timestamp">Exported: ${timestamp}</div>
                    </div>

                    <div class="button-row">
                        <button class="clean-view-btn" onclick="toggleCleanView()">Clean View</button>
                        <button onclick="window.print()">Print</button>
                        <button onclick="window.close()">Close</button>
                    </div>

                    <script>
                        function toggleInstructions() {
                            const instructions = document.querySelector('.instructions');
                            if (instructions.classList.contains('collapsed')) {
                                instructions.classList.remove('collapsed');
                                instructions.classList.add('expanded');
                            } else {
                                instructions.classList.remove('expanded');
                                instructions.classList.add('collapsed');
                            }
                        }

                        function toggleCleanView() {
                            const body = document.body;
                            if (body.classList.contains('clean-mode')) {
                                body.classList.remove('clean-mode');
                                document.querySelector('.clean-view-btn').textContent = 'Clean View';
                            } else {
                                body.classList.add('clean-mode');
                                document.querySelector('.clean-view-btn').textContent = 'Show Controls';
                            }
                        }
                    </script>
                </div>
            </body>
            </html>
        `;

        // Write the HTML to the new window
        newWindow.document.write(html);
        newWindow.document.close();

    } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed: ' + error.message);
    }
}
