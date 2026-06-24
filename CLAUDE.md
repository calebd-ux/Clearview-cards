# Clearview Cards Instructions for Claude Code

Welcome! You are managing the generation of business cards and Apple Wallet passes for Clearview. This repository contains the raw templates, headshots, and compiled files.

**IMPORTANT RULES:**
1. **Never attempt to natively generate or edit a binary file (like a PDF or .pkpass) using text editing.** You will corrupt the file.
2. ALWAYS use the provided Node.js scripts to compile the final files.
3. Only edit HTML templates, and DO NOT change the CSS unless explicitly instructed to.

## How to Create a New Printable Business Card
If the user asks you to create a printable business card for a new employee:

1. **Find a Template:** Look in the `print-cards/` directory. Copy the file `template.html` and name the new file `[employee_firstname]_card.html` inside the `print-cards/` directory.
2. **Edit the HTML:**
   - **CRITICAL:** The logos are perfectly built into the template using SVG image links to `../assets/`. Leave the logo HTML exactly as it is.
   - Update the employee's Name, Title, and Phone Number in the HTML.
   - Update the `<title>` tag.
   - Look inside the `vCardData` variable in the `<script>` tag at the bottom and update their Name, Title, Phone, and Email there (this controls the QR code).
   - Update the `<img src="...">` path to point to their headshot (e.g. `../headshots/colin_clinton_headshot.jpg`). Make sure the headshot exists.
3. **Compile to PDF/PNG:**
   - You MUST run the compilation script to generate the final PDF and PNG files.
   - From the root of the repository, run: `node scripts/generate_print_ready.js print-cards/[employee_firstname]_card.html`
   - This script will use headless Chrome to render the HTML and automatically create the front PNG, back PNG, and print-ready PDF in the `print-cards/` directory.
4. **Final Step:**
   - Always tell the user to look at the **`.pdf`** or **`.png`** files that are generated, and NOT the raw `.html` file. If they preview the `.html` file in a code editor, the images will appear broken due to local server path restrictions.

## Apple Wallet Cards (.pkpass)
If the user asks you to create an Apple Wallet Card (.pkpass file):
- Note: A `.pkpass` file is a cryptographically signed ZIP file. You cannot natively create a valid one without Apple Developer certificates and the `passsign` tool.
- If you are asked to make one, inform the user: *"I cannot natively generate a valid signed Apple Wallet (.pkpass) file from scratch on this machine without the Apple Developer certificates. You will need to use your centralized card generator tool or Antigravity for Apple Wallet cards."*

## Notes on Dependencies
The `scripts/generate_print_ready.js` script requires `puppeteer-core`. If it fails because of missing modules, run `npm install puppeteer-core` in the root directory.
