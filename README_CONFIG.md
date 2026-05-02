# Word Match Masters - In-Memory Configuration Setup

## Overview
This setup provides two ways to run the Word Match Masters application:
- **Original** (`index.html` + `app.js`): Uses `fetch()` to load JSON files (requires a web server)
- **No-Server** (`index2.html` + `config.js` + `app.js`): Uses in-memory data (works directly in browser)

## Files

### New Files Created
- **`generate-config.js`**: Node.js script that generates `config.js` from all JSON files
- **`config.js`**: Auto-generated file containing all configuration and word pool data (98KB)
- **`index2.html`**: Main HTML file for no-server setup with inline manifest

### Modified Files
- **`app.js`**: Updated `loadConfig()` function to detect and use `CONFIG_DATA` when available

## How to Use

### Option 1: Original Setup (requires web server)
```bash
# Start a simple Python web server
python -m http.server 8000

# Open in browser
http://localhost:8000/index.html
```

### Option 2: No-Server Setup (NO WEB SERVER NEEDED)
```bash
# Simply open in browser
index2.html

# Or double-click the file to open in your default browser
```

## Regenerating config.js

After updating any JSON files (config.json, *.json word pools), regenerate the config file:

```bash
node generate-config.js
```

This will update `config.js` with the latest data from:
- `config.json`
- `words_random1.json`
- `synonyms_random1.json`
- `synonyms_4th_grade.json`
- `synonyms_5th_grade.json`
- `synonyms_6th_grade.json`
- `farsi_words_1.json`
- `manifest.json`

## How It Works

1. **Generation Phase** (run once or after JSON changes):
   - `generate-config.js` reads all JSON files
   - Combines them into a single JavaScript file: `config.js`
   - `config.js` exports `CONFIG_DATA` global object

2. **Runtime Phase** (when app loads):
   - `index2.html` loads `config.js` first (file included in `<script>` tag)
   - `app.js` detects if `CONFIG_DATA` is available
   - If available, uses in-memory data (no fetch needed) ✓ Fast, no server required
   - If not available, falls back to `fetch()` (backward compatible)

## Benefits

✓ **No Web Server Required**: Open `index2.html` directly in browser  
✓ **Faster Loading**: All data is in memory, no HTTP requests  
✓ **CORS-Free**: No browser security restrictions  
✓ **Backward Compatible**: Original `index.html` still works with a web server  
✓ **Easy Maintenance**: Regenerate `config.js` whenever JSON files change  

## Manifest Handling

The `index2.html` includes an inline manifest using data URI:
```html
<link rel="manifest" href="data:application/manifest+json,...">
```

This eliminates the need for a separate `manifest.json` server request.

## File Sizes

- `config.js`: ~98KB (contains all word pools + configuration)
- `index2.html`: ~2KB (identical to original, just with config.js included)
- Total additional download: ~100KB (one-time, cached by browser)

## Notes

- Both versions use localStorage for saving game scores and settings
- Configuration can still be overridden via localStorage
- The app remains PWA-capable with the inline manifest
