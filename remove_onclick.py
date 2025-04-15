import re
import os

# Path to the HTML file
html_file = 'index.html'

# Read the HTML file
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Remove onclick attributes
html_content = re.sub(r' onclick="[^"]*"', '', html_content)

# Write the modified HTML back to the file
with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("All onclick attributes have been removed from the HTML file.")
