# Assets Needed for Publishing

## ⚠️ CRITICAL: Missing Assets

### 1. Extension Icons (REQUIRED)
You **must** create icon files before publishing. All stores require these.

#### Required Sizes:
- **16x16** — Browser toolbar (manifest: `"16": "icons/icon-16.png"`)
- **32x32** — Retina toolbar (manifest: `"32": "icons/icon-32.png"`)
- **48x48** — Extension management page (manifest: `"48": "icons/icon-48.png"`)
- **128x128** — Chrome Web Store listing (manifest: `"128": "icons/icon-128.png"`)

#### Design Recommendations:
- Use calendar emoji 📅 or a stylized calendar icon
- Simple, recognizable design that works at 16x16
- Purple gradient theme matching popup (#667eea → #764ba2)
- Transparent background (PNG)
- High contrast for visibility

#### How to Add:
1. Create `icons/` folder in project root
2. Add all 4 icon files
3. Update `manifest.json`:
   ```json
   "icons": {
     "16": "icons/icon-16.png",
     "32": "icons/icon-32.png",
     "48": "icons/icon-48.png",
     "128": "icons/icon-128.png"
   }
   ```

### 2. Store Listing Screenshots (REQUIRED)

#### Chrome Web Store:
- **1-5 screenshots** (1280x800 or 640x400)
- Show: popup interface, export in progress, successful export
- Recommended: 3 screenshots covering main flow

#### Firefox Add-ons:
- **1-10 screenshots** (any size, but 1280x800 recommended)
- Same as Chrome

#### Edge Add-ons:
- **1-10 screenshots** (1366x768 or 1920x1080)
- Same as Chrome

#### Screenshot Ideas:
1. **"Simple one-click interface"** — Show popup with timezone selector and options
2. **"Real-time progress tracking"** — Show export in progress with progress bar
3. **"Export complete"** — Show success message and downloaded file
4. **"Import anywhere"** — Show ICS file being imported to iOS/Google Calendar

### 3. Store Promotional Images (OPTIONAL but Recommended)

#### Chrome Web Store:
- **Small tile:** 440x280 (appears in search results)
- **Marquee:** 1400x560 (featured placement, if selected)

#### Firefox:
- No promotional images required

#### Edge:
- **Store icon:** 300x300 (appears in store listings)

---

## 📝 Store Listing Content

### Short Description (All Stores)
**132 characters max for Chrome:**
```
Export your Outlook calendar to ICS format. One-click export with timezone selection. Works with all Outlook/Office 365 domains.
```

### Detailed Description

```markdown
CalendarLiberator exports your Outlook calendar to standard ICS format in seconds.

✨ KEY FEATURES
• One-click export with simple popup interface
• Auto-detects your timezone (customizable)
• Filter declined and out-of-office events
• Exports 4 weeks of events (past + current + next 2 weeks)
• Works with all Outlook and Office 365 domains
• 100% private — all processing happens locally
• No data transmission or cloud storage

🚀 HOW IT WORKS
1. Click the extension icon on any Outlook calendar page
2. Select your timezone (auto-detected)
3. Choose export options (include/exclude declined, OOO)
4. Click "Export to ICS"
5. Import the file into any calendar app

🔒 PRIVACY & SECURITY
• Zero data collection
• No external servers or analytics
• Minimal permissions (activeTab only)
• Open source for full transparency

📱 WORKS WITH
• iOS Calendar
• Google Calendar
• Microsoft Calendar
• Any calendar application supporting ICS import

Perfect for:
✓ Backing up work calendars
✓ Syncing to personal devices
✓ Importing to non-corporate calendar apps
✓ Creating offline calendar archives
```

### Category
- **Chrome:** Productivity
- **Firefox:** Productivity
- **Edge:** Productivity

### Tags/Keywords
```
outlook, calendar, export, ics, office 365, calendar backup, calendar sync, productivity
```

---

## 🎨 Design Assets Checklist

- [ ] Icon 16x16
- [ ] Icon 32x32
- [ ] Icon 48x48
- [ ] Icon 128x128
- [ ] Screenshot 1: Popup interface
- [ ] Screenshot 2: Export in progress
- [ ] Screenshot 3: Success/Import
- [ ] (Optional) Promotional tile 440x280
- [ ] (Optional) Marquee 1400x560
- [ ] (Optional) Edge store icon 300x300

---

## 📋 Pre-Submission Checklist

### Code
- [x] All console.logs reviewed (diagnostic only, no sensitive data)
- [x] No personal information in code
- [x] No hardcoded credentials or API keys
- [x] Proper error handling throughout
- [x] Code follows store policies

### Manifest
- [x] Version number set (1.0.0)
- [x] Description under character limit
- [ ] Icons defined (NEED TO CREATE)
- [x] Permissions minimal and justified
- [x] Host permissions cover all Outlook domains

### Documentation
- [x] README.md complete and accurate
- [x] LICENSE file present (MIT)
- [x] BUILD.md with packaging instructions

### Testing
- [ ] Tested on multiple Outlook accounts
- [ ] Tested with different calendar configurations
- [ ] Tested timezone selection
- [ ] Tested event filters (declined, OOO)
- [ ] Verified ICS imports correctly
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Edge

### Store Requirements
- [ ] Developer account created
- [ ] Payment ($5 for Chrome, free for Firefox/Edge)
- [ ] Privacy policy URL (if collecting any data — NOT NEEDED for this extension)
- [ ] Screenshots prepared
- [ ] Icons created

---

## 🔧 How to Create Icons Quickly

### Option 1: Use Figma/Sketch/Illustrator
1. Design at 128x128 with transparent background
2. Export at 128x128, 48x48, 32x32, 16x16

### Option 2: Use Online Tools
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Icon Generator](https://cthedot.de/icongen/)
- [Photopea](https://www.photopea.com/) (free Photoshop alternative)

### Option 3: Simple Text Icon (Quick Placeholder)
For testing purposes, you can use a simple colored square with "📅" emoji:
```html
<!-- Create in HTML canvas, screenshot, resize -->
<div style="width:128px; height:128px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); display:flex; align-items:center; justify-content:center; font-size:64px;">📅</div>
```

---

## 📤 Submission Order Recommendation

1. **Create icons first** — This is blocking all stores
2. **Test thoroughly** — Load unpacked and test all features
3. **Take screenshots** — Use extension in real Outlook calendar
4. **Submit to Firefox** — Fastest review, good for initial feedback
5. **Submit to Edge** — Usually fast, similar to Chrome
6. **Submit to Chrome** — Can take longest, most popular store

---

## ⏱️ Expected Review Times

- **Chrome Web Store:** 1-3 business days (sometimes up to 7 days)
- **Firefox Add-ons:** 1-7 days (automated review possible for simple extensions)
- **Edge Add-ons:** 1-3 business days

---

## 📞 Support Resources

- **Chrome:** [Developer Support](https://support.google.com/chrome_webstore/contact/one_stop_support)
- **Firefox:** [Add-on Developer Hub](https://addons.mozilla.org/developers/)
- **Edge:** [Partner Center Support](https://partner.microsoft.com/support)
