# Quick Start Guide

## 🚀 No Server Required - Just Open in Browser!

### ✅ Quick Start (Easiest Way)
1. Open **`index2.html`** directly in your browser
2. Done! The app loads without needing any web server

### 📋 How It Works

**Before (Original - requires server):**
```
index.html → fetch() → config.json, words_random1.json, etc. → Browser loads data
```

**After (New way - no server needed):**
```
index2.html → loads config.js → CONFIG_DATA in memory → Browser uses data
```

### 📁 Files You Need to Know

| File | Purpose |
|------|---------|
| `index2.html` | New HTML file (open this in browser) |
| `config.js` | Auto-generated (98KB) - contains ALL data |
| `app.js` | Updated to use in-memory data first |
| `generate-config.js` | Script to regenerate config.js if you modify JSON files |

### ⚙️ If You Change JSON Files

If you modify any of these files:
- `config.json`
- `words_random1.json`
- `synonyms_*.json`
- `farsi_words_1.json`

Run this command to regenerate `config.js`:
```bash
node generate-config.js
```

### 📊 Comparison

| Aspect | Original | New (index2.html) |
|--------|----------|---------------------------|
| Web Server | ✓ Required | ✗ Not needed |
| Load Time | Slower (multiple requests) | Faster (data in memory) |
| CORS Issues | ✓ May occur | ✗ None |
| Browser Support | All modern | All modern |
| File Size | Multiple small files | One 98KB file |
| Works Offline | After caching | ✓ Yes |

### 💡 Usage Examples

**Example 1: Just want to play the game**
```
Double-click index2.html → Play!
```

**Example 2: Development with web server**
```bash
# Terminal
python -m http.server 8000

# Browser
http://localhost:8000/index2.html
```

**Example 3: After adding new word pools**
```bash
# 1. Edit config.json or add new JSON files
# 2. Regenerate config.js
node generate-config.js

# 3. Reload index2.html in browser
```

### ❓ FAQ

**Q: Can I still use the original index.html?**  
A: Yes! Both versions work. Use `index.html` with a web server or `index2.html` without one.

**Q: What happens if I forget to regenerate config.js?**  
A: The app will still work, but with old data. Just run `node generate-config.js`.

**Q: Is config.js safe to edit manually?**  
A: No - always use `generate-config.js` to regenerate it. The file even says "DO NOT EDIT MANUALLY".

**Q: Why is config.js 98KB?**  
A: It contains all the word pools, colors, and configuration combined. Typical download is ~30-40KB with gzip compression.

### ✨ Secret Benefit

The `app.js` is smart - it will:
1. Check if `CONFIG_DATA` exists (from `config.js`)
2. Use in-memory data if available (fast!) 🚀
3. Fall back to `fetch()` if needed (backward compatible) 🔄

This means both `index.html` and `index2.html` use the same `app.js` file!
