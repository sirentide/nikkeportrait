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
                <style>
                    body {
                        background-color: #222;
                        color: white;
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    h1 {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .team-row {
                        background-color: #333;
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                    }
                    .team-info {
                        width: 80px;
                        text-align: center;
                    }
                    .team-label {
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .team-score {
                        margin-top: 5px;
                        font-size: 16px;
                    }
                    .team-slots {
                        display: flex;
                        flex: 1;
                        gap: 10px;
                        margin-left: 20px;
                    }
                    .slot {
                        width: 80px;
                        height: 80px;
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
                        bottom: -25px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 12px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .instructions {
                        margin-top: 30px;
                        padding: 15px;
                        background-color: #333;
                        border-radius: 5px;
                    }
                    .instructions h2 {
                        margin-top: 0;
                        font-size: 18px;
                    }
                    .instructions ol {
                        margin-left: 20px;
                        line-height: 1.5;
                    }
                    .timestamp {
                        text-align: right;
                        font-size: 12px;
                        color: #aaa;
                        margin-top: 20px;
                    }
                    .export-area {
                        margin-top: 20px;
                        padding: 20px;
                        background-color: #1a1a1a;
                        border-radius: 5px;
                        border: 2px dashed #444;
                    }
                    @media print {
                        .instructions {
                            display: none;
                        }
                        .export-area {
                            border: none;
                            padding: 0;
                            margin: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="instructions">
                        <h2>Take a Screenshot</h2>
                        <ol>
                            <li>Take a screenshot of the team selection below</li>
                            <li>On Windows: Press <strong>Windows+Shift+S</strong> and select the area</li>
                            <li>On Mac: Press <strong>Command+Shift+4</strong> and select the area</li>
                            <li>Or click the Print button to print or save as PDF</li>
                        </ol>
                        <button onclick="window.print()">Print</button>
                    </div>
                    
                    <div class="export-area">
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
        
        // Add timestamp
        html += `
                        <div class="timestamp">Exported: ${timestamp}</div>
                    </div>
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
