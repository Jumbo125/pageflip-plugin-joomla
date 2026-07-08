<p align="center">
  <img src="https://github.com/Jumbo125/st-pageflip-enhanced/blob/main/a080723b-e63e-49d4-a9e1-f0487cf1188b.png" alt="st-pageflip-enhanced" width="300">
</p>

# 📖 ST PageFlip – Joomla 4, 5, 6 Extension

A Joomla 4 extension package that integrates the **StPageFlip** library as an interactive, page-flipping flipbook in the Joomla frontend — embedded via a simple shortcode. No database required. Books are subfolders inside `images/stpageflip/`.

---

## 🔧 Requirements

- Joomla >= 4.4
- PHP >= 7.4
- PHP extension `imagick` with Ghostscript/PDF delegate (for PDF → image conversion)
- Write permissions on `images/stpageflip/`
- jQuery (optional, loadable via plugin settings)
- Panzoom (bundled)
- Bootstrap Icons (bundled)

---

## 📦 Package Contents

The package `pkg_stpageflip` bundles three plugins:

| Plugin | Group | Purpose |
|---|---|---|
| `plg_content_stpageflip` | content | Frontend rendering via `[book ...]` shortcode |
| `plg_ajax_stpageflip` | ajax | Backend AJAX: folder scan + PDF conversion |
| `plg_editorsxtd_stpageflip` | editors-xtd | Editor button to insert the shortcode visually |

---

## 📂 Project Structure (Development)

```
st_pageflip_develop/
├── pkg_stpageflip/                   Package manifest (bundles all 3 plugins)
│   └── pkg_stpageflip.xml
│
├── plg_content_stpageflip/           Main plugin (frontend rendering)
│   ├── stpageflip.xml                Manifest
│   ├── script.php                    Installer script (creates images/stpageflip/)
│   ├── services/provider.php         DI container registration
│   ├── src/
│   │   ├── Extension/Stpageflip.php
│   │   ├── Service/BookDirectoryService.php
│   │   ├── Service/PdfConversionService.php
│   │   ├── Service/PlaceholderDefaults.php
│   │   ├── Service/PlaceholderParser.php
│   │   └── Field/PageflipconversionField.php
│   ├── media/
│   │   ├── joomla.asset.json
│   │   ├── js/                       StPageFlip library + controller + panzoom
│   │   ├── css/                      StPageFlip CSS + Bootstrap + Bootstrap Icons
│   │   ├── sounds/                   Page flip sound
│   │   └── admin/                    Conversion UI (JS + CSS)
│   └── language/
│
├── plg_ajax_stpageflip/              Backend AJAX plugin
│   ├── stpageflip.xml
│   ├── services/provider.php
│   ├── src/Extension/Stpageflip.php
│   └── language/
│
├── plg_editorsxtd_stpageflip/        Editor button plugin
│   ├── stpageflip.xml
│   ├── services/provider.php
│   ├── src/Extension/Stpageflip.php
│   ├── media/
│   │   ├── joomla.asset.json
│   │   ├── stpageflip-editor-button.js
│   │   └── stpageflip-editor-button.css
│   └── language/
│
├── build-package.ps1                 Build script → dist/pkg_stpageflip-2.0.zip
├── dist/                             Build output (gitignored)
└── update/stpageflip_update.xml      Joomla update server manifest
```

---

## 🚀 Installation

1. Run the build script:
   ```powershell
   .\build-package.ps1
   ```
2. Install `dist/pkg_stpageflip-2.0.zip` via **Joomla → System → Install → Extension**.
3. Upgrading: install over the existing version (`method="upgrade"`) — settings and book folders are preserved.

Individual plugin ZIPs are also in `dist/` for separate testing.

---

## 📂 Book Folder Structure (Server)

Books are direct subfolders inside `images/stpageflip/`. Manage them via the Joomla Media Manager.

```
images/stpageflip/
├── katalog-2025/
│   ├── katalog-2025.pdf
│   ├── page_001.webp
│   └── page_002.webp
└── katalog-2026/
    └── katalog-2026.pdf     ← ready for conversion
```

- Only **direct subfolders** are books — no nesting
- Internal files: `.pageflip-converting.lock`, `.pageflip_tmp/`, `.pageflip-conversion.json`

---

## 🔍 Features

- ✅ Zoom (in, out, reset & double-click zoom)
- ✅ Fullscreen mode incl. position reset & control reordering
- ✅ Page reflection depending on page count & layout
- ✅ Page number & slider for navigation
- ✅ Page flip sound (optional)
- ✅ Drag & drop movement
- ✅ Button icons via Bootstrap Icons
- ✅ Custom colors via `color` & `hover` shortcode attributes
- ✅ Responsive aspect ratio (incl. DIN formats)
- ✅ PDF → WebP conversion via Imagick (one-click in backend)
- ✅ Editor button for visual shortcode insertion
- ✅ VirtueMart compatible (`product_desc`, `product_s_desc`)

---

## ✍️ Shortcode Usage

Insert a flipbook anywhere in a Joomla article using the `[book ...]` shortcode:

```
[book
 id="katalog-2026-a7f42c"
 img="katalog-2026"
 pdf="katalog-2026"
 width="false"
 height="false"
 din_format="not_use"
 aspect_ratio="0.707"
 density="soft"
 center-single="false"
 color="#333"
 hover="#c00"
 reflection="false"
 tooltip="true"
 transform="true"
 inside-button="false"
 mousewheel-scroll="false"
 slider="true"
 bt-options="true"
 home="true"
 download="true"
 prev="true"
 next="true"
 zoom-in="true"
 zoom-out="true"
 zoom-default="true"
 zoom-dblclick="false"
 fullscreen="true"
 sound="false"
 mute="true"
]
```

> 💡 Use the **Editor Button** (toolbar icon "cube") to insert the shortcode visually — it scans available books and generates the full shortcode automatically.

---

## 🏷️ Shortcode Attribute Reference

| Attribute | Type | Default | Description |
|---|---|---|---|
| `img` | String | — | **(Required)** Subfolder in `images/stpageflip/` containing the page images |
| `pdf` | String | = `img` | Subfolder containing the PDF (for download button). Defaults to `img` folder |
| `id` | String | auto | HTML element ID (auto-generated if omitted) |
| `width` | String/Number | `false` | `"responsive"` or pixel value (1–5000). `false` = auto |
| `height` | String/Number | `false` | Pixel height. `false` = auto |
| `din_format` | String | `not_use` | Format preset (see table below). Overrides `aspect_ratio` |
| `aspect_ratio` | Number | `0.707` | Width/height ratio as decimal (0.1–10). Used when `din_format="not_use"` |
| `density` | String | `soft` | Page density feel |
| `center-single` | Boolean | `false` | Center the last single page |
| `color` | Hex/RGB | `#333` | Icon button color |
| `hover` | Hex/RGB | `#c00` | Icon button hover color |
| `reflection` | Boolean | `false` | Show page reflection below the book |
| `tooltip` | Boolean | `true` | Show tooltips on buttons |
| `transform` | Boolean | `true` | Enable CSS transforms |
| `inside-button` | Boolean | `false` | Place buttons inside the book area |
| `mousewheel-scroll` | Boolean | `false` | Enable page flipping via mouse wheel |
| `slider` | Boolean | `true` | Show page navigation slider |
| `bt-options` | Boolean | `true` | Show options button |
| `home` | Boolean | `true` | Show home (first page) button |
| `download` | Boolean | `true` | Show PDF download button (auto-disabled if no PDF present) |
| `prev` | Boolean | `true` | Show previous page button |
| `next` | Boolean | `true` | Show next page button |
| `zoom-in` | Boolean | `true` | Show zoom-in button |
| `zoom-out` | Boolean | `true` | Show zoom-out button |
| `zoom-default` | Boolean | `true` | Show zoom reset button |
| `zoom-dblclick` | Boolean | `false` | Enable double-click zoom |
| `fullscreen` | Boolean | `true` | Show fullscreen button |
| `sound` | Boolean | `false` | Enable page flip sound (`sound` takes priority over `mute`) |
| `mute` | Boolean | `true` | Mute sound (inverse of `sound`; `sound` overrides this) |

**Notes:**
- `sound` takes priority over `mute` for backwards compatibility.
- `download` is automatically set to `false` if no PDF file is found in the book folder.
- Boolean values accept: `true/false`, `1/0`, `yes/no`, `on/off` (case-insensitive).

---

## 📐 Supported `din_format` Values

| Name | Aspect Ratio | Type |
|---|---|---|
| A0 | 0.707 | DIN A (portrait) |
| A1 | 0.706 | DIN A (portrait) |
| A2 | 0.707 | DIN A (portrait) |
| A3 | 0.707 | DIN A (portrait) |
| A4 | 0.707 | DIN A (portrait) |
| A5 | 0.705 | DIN A (portrait) |
| A6 | 0.709 | DIN A (portrait) |
| A7 | 0.705 | DIN A (portrait) |
| A8 | 0.703 | DIN A (portrait) |
| 16:9 | 1.778 | Screen / Video |
| 4:3 | 1.333 | Screen / Video |
| 3:2 | 1.500 | Screen / Video |
| 21:9 | 2.333 | Ultra-Wide |
| 1:1 | 1.000 | Square |
| 9:16 | 0.562 | Vertical / Mobile |
| 5x7 | 0.714 | Photo |
| 8x10 | 0.800 | Photo |
| 2:3 | 0.667 | Photo |
| Portrait Standard | 0.707 | Flipbook Classic |
| Comic/Manga | 0.650 | Flipbook Classic |
| Square | 1.000 | Flipbook Classic |
| Wide Book | 1.400 | Flipbook Classic |

> 💡 Use `din_format="A4"` (or any name from the list above) to auto-set the aspect ratio. Use `din_format="not_use"` to set a custom `aspect_ratio` instead.

---

## 🔄 PDF Conversion

1. Upload a PDF into a subfolder under `images/stpageflip/` (e.g. via Joomla Media Manager).
2. Go to **Joomla → System → Plugins → ST PageFlip (Content)** → tab **PDF Conversion**.
3. Click **Scan** to list all book folders and their current status.
4. Click **Convert** on any folder with status `conversion_required`.
5. Imagick converts PDF pages to `page_001.webp`, `page_002.webp`, … in the same folder.

**Conversion statuses:**

| Status | Meaning |
|---|---|
| `empty` | Folder is empty |
| `images_only` | Images present, no PDF |
| `conversion_required` | PDF present, no images yet |
| `complete` | PDF + images present |
| `multiple_pdfs` | More than one PDF found (not supported) |
| `invalid` | Security check failed |

---

## 🔒 Security

- AJAX endpoint only accessible from Joomla backend (`isClient('administrator')`)
- Requires POST + CSRF token + `core.manage` permission on `com_plugins`
- Path traversal prevention via `realpath()` check — all paths must stay within `images/stpageflip/`

---

## 📦 Optional: Extension Ideas

- 🔊 Multiple sound effects depending on action
- 🎨 Themes & styles via CSS variables
- 🖼️ Thumbnail navigation (miniature pages)
- 🔒 Password-protected books

---

## 💡 Note

This extension is **not officially affiliated** with the StPageFlip project and builds on its open-source version. Use at your own risk.

---

## 🧑‍💻 Author

**Jumbo125**

---

## 📄 License

MIT License

---

## 📄 Third-Party Licenses

### Panzoom
Panzoom (c) 2020 Timmy Willison
MIT License — https://github.com/timmywil/panzoom

### StPageFlip
Original library: StPageFlip
Copyright (c) 2020 Nodlik — https://github.com/Nodlik/StPageFlip

Extended Joomla plugin functionality:
(c) 2025 Jumbo125 – Enhancements for Joomla 4 integration, controls, UI, zoom, sound, PDF conversion, editor button, etc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
