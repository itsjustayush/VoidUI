# VoidUI — Futuristic Startpage & New Tab Extension

> An ultra-sleek, modular startpage inspired by **Nothing OS**, **Samsung OneUI widgets**, and the **CachyOS Linux Hyprland Caelestia** shell, featuring switchable typography including **Nothing NDot 55** and **Young Serif**.

![VoidUI Startpage Preview](public/favicon/icon-128.png)

---

## ⚡ Highlights & Aesthetic Influences

* **Nothing Phone & Nothing OS**:
  * Authentic **NDot 55** dot matrix display clock with blinking pulse colons.
  * Signature **Nothing Red** (`#d71921`) and monochrome dark palettes.
  * Real Nothing dot-matrix weather icons (`clear_day`, `cloud_day`, `rain`, `thunder`, `fog`, `snow`).
  * Interactive canvas dot matrix grid with cursor proximity glow.
* **Young Serif Display Typography**:
  * Direct integration of [Young Serif](https://72pt.app/font/young-serif) display font.
  * Switch to Young Serif Editorial mode for a curvaceous, luxury typography clock & greeting experience.
* **Samsung OneUI Widgets**:
  * Squircle geometry (`24px` radius) with layered card glassmorphism.
  * Integrated multi-metric cards: weather forecast (high/low/humidity/wind), task manager with completion bars, and persistent scratchpad.
* **CachyOS Linux Hyprland Caelestia**:
  * Floating top status bar with **Workspaces** `[1] [2] [3] [4] [5]` (Home, Code, AI, Tasks, Zen).
  * System pills: Live battery status via Web Battery API, network indicator, and clock HUD.
  * **Caelestia Runner / Fuzzel Command Palette** (`Ctrl + K` or `⌘K`): fuzzy-search shortcuts, toggle themes, switch clock styles, and open settings.
* **Ambient Lo-Fi Sound Synthesizer**:
  * Built-in Web Audio ambient soundscapes: *Cyberpunk Rain*, *Celestia Deep Space Drone*, *Vintage Vinyl*, and *Focus Noise*.
  * Real-time bouncing equalizer waveform visualizer.
* **Omnibar Search**:
  * Multi-engine instant switcher (Google, DuckDuckGo, Bing, Brave, Perplexity AI, Kagi, YouTube, GitHub, Wikipedia).
  * Query autocomplete suggestions and Web Speech voice search.

---

## 📥 How to Install in Your Browser

### 1. In Helium Browser (or Chrome, Brave, Edge, Arc)

1. Open your browser and navigate to the extensions page:
   * **Helium**: `helium://extensions`
   * **Chrome**: `chrome://extensions`
   * **Brave**: `brave://extensions`
   * **Edge**: `edge://extensions`
2. Enable **"Developer mode"** (toggle in the top-right corner).
3. Click **"Load unpacked"**.
4. Browse and select the `D:\VoidUI\dist` directory.
5. Open a new tab — **VoidUI** will instantly take over with 0ms delay!

### 2. In Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on..."**.
3. Select `D:\VoidUI\dist\manifest.json` (or extract `release/VoidUI-Firefox-v1.0.0.zip`).

### 3. Chrome Web Store & Edge Add-ons (Marketplace Distribution)

Ready-to-upload zip archives are automatically created in the `release/` folder:
* **Chromium (Chrome / Helium / Edge / Brave)**: `release/VoidUI-Extension-v1.0.0.zip`
* **Firefox**: `release/VoidUI-Firefox-v1.0.0.zip`

---

## 🔄 Self-Update & Updating Procedures

1. **In-App Update Checker**:
   * Click the **Settings** icon (or press `Ctrl+K` -> "Open VoidUI Settings").
   * Navigate to the **About** tab.
   * Click **"Check for Updates"** to compare your current version with the latest release.
2. **Updating Local / Unpacked Installation**:
   * Pull latest changes or update files in `VoidUI`:
     ```bash
     npm run build
     ```
   * Go to `chrome://extensions` (or `helium://extensions`) and click the **Reload icon (↻)** on the VoidUI extension card.
3. **Backup & Restore**:
   * Your shortcuts, tasks, scratchpad, and theme settings can be exported to JSON anytime in **Settings > Backup**.
   * When updating or installing on a new machine, click **Restore from JSON** to retain everything.

---

## 🛠️ Development & Building

Built with **Vite 6**, **React 19**, **TypeScript**, and **Tailwind CSS**.

```bash
# Install dependencies
npm install

# Start local dev server (preview in normal browser tab at http://localhost:3000)
npm run dev

# Build production extension to dist/
npm run build

# Package extension zip files into release/
npm run package
```

---

## 🎨 Themes & Customization

VoidUI includes 5 hand-crafted themes:
1. **Nothing Dark**: Classic dark carbon with Nothing Red accents.
2. **Caelestia Cyan**: CachyOS Hyprland electric cyan and glassmorphism.
3. **Celestia Violet**: Purple neon glow and deep night aurora.
4. **AMOLED Pitch Black**: Pure 0-nit black for OLED displays.
5. **Nothing Daylight**: High-contrast, stark white daylight aesthetic.

Press **`Ctrl + K`** at any time to open the quick runner!

