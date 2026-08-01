# Assets Needed for Publishing

## ✅ DONE: Extension Icons

Icons (16/32/48/96/128 px) live at the project root and are referenced in `manifest.json`. The 96px icon is added to the Firefox package only, by `build.sh`. Do not modify them; the SVG masters are kept in `assets/` as reference.

### 1. Store Listing Screenshots (REQUIRED — still needed)

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

### 2. Store Promotional Images (OPTIONAL but Recommended)

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
Calendar Liberator exports your Outlook calendar to standard ICS format in seconds.

✨ KEY FEATURES
• One-click export with simple popup interface
• Auto-detects your timezone (customizable)
• Filter declined and out-of-office events
• Exports a 28-day window (7 days back + 21 days forward)
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

- [x] Icon 16x16
- [x] Icon 32x32
- [x] Icon 48x48
- [x] Icon 128x128
- [ ] Screenshot 1: Popup interface
- [ ] Screenshot 2: Export in progress
- [ ] Screenshot 3: Success/Import
- [ ] (Optional) Promotional tile 440x280
- [ ] (Optional) Marquee 1400x560
- [ ] (Optional) Edge store icon 300x300 (export from `assets/icon-master.svg`)

---

## 📋 Pre-Submission Checklist

### Code
- [x] All console.logs reviewed (diagnostic only, no sensitive data)
- [x] No personal information in code
- [x] No hardcoded credentials or API keys
- [x] Proper error handling throughout
- [x] Code follows store policies

### Manifest
- [x] Version number set (see `manifest.json`)
- [x] Description under character limit
- [x] Icons defined
- [x] Permissions minimal and justified
- [x] Host permissions cover all Outlook domains
- [x] Firefox `browser_specific_settings.gecko` handled by `build.sh`

### Documentation
- [x] README.md complete and accurate
- [x] LICENSE file present (MIT)
- [x] BUILD.md with packaging instructions
- [x] PRIVACY.md (use its GitHub URL as the privacy policy link in store listings)

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
- [x] Privacy policy (see `PRIVACY.md` — publish the repo and link to it)
- [ ] Screenshots prepared
- [x] Icons created

---

## 📤 Submission Order Recommendation

1. **Test thoroughly** — Load unpacked and test all features on a real Outlook calendar
2. **Take screenshots** — Use the extension in a real Outlook calendar
3. **Submit to Firefox** — Fastest review, good for initial feedback
4. **Submit to Edge** — Usually fast, similar to Chrome
5. **Submit to Chrome** — Can take longest, most popular store

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
