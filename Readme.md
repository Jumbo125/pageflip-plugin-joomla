# 📘 stPageFlip Enhanced – Flipbook-Plugin für Joomla

Dieses Plugin integriert einen realistischen, blätterbaren Buch-Viewer in Joomla-Artikel – basierend auf der stPageFlip-Bibliothek – mit erweiterter Benutzeroberfläche, Zoom, Vollbild, Ton und mehr.

## 🧪 Wichtigste Features

1. **Serverseitige PDF-Konvertierung**  
   Ressourcenschonende Umwandlung von PDF zu WebP direkt auf dem Server – effizienter als leistungshungrige Client-Konvertierung.

2. **Optionale automatische PDF-Konvertierung**  
   - Erkennt PDFs im Ordner `source/img` und erstellt automatisch WebP-Dateien mit **150 dpi**.  
   - Dateibenennung: `Seite_x.webp`  
   - Das Löschen vorhandener Bilder triggert automatisch eine neue Konvertierung.

3. **Direkter PDF-Download**  
   Ermöglicht Nutzern das sofortige Herunterladen des vollständigen PDFs.

4. **Blättern per Mausrad**  
   Intuitive Navigation für ein angenehmes Leseerlebnis.

5. **Slider zum schnellen Durchblättern**  
   Besonders nützlich bei umfangreichen PDFs.

6. **Anzeige der aktuellen Seite**  
   Bietet gute Orientierung, besonders bei mehrseitigen Dokumenten.

7. **100 % responsives Design**  
   Optimiert für alle Bildschirmgrößen  
   _Hinweis: Der Vollbild-Modus wird derzeit noch verbessert._

8. **Vollbildmodus**  
   Für ein immersives Benutzererlebnis.

9. **Integrierte Navigationsbuttons**  
   Alternative Steuerungsmöglichkeit neben Scrollen und Slider.

10. **Steuerleiste am unteren Rand**  
    Zentrale Bedienung aller Navigationselemente.

11. **Optionaler Spiegeleffekt**  
    Realistische Darstellung durch reflektierte Seitenoptik (abschaltbar).

---

## ⚙️ Technische & Entwickler-Features

12. **Automatische Erstellung des `stpageflip`-Ordners**  
    Keine manuelle Einrichtung notwendig bei der Installation.

13. **ImageMagick-Verfügbarkeitsprüfung**  
    Stellt sicher, dass die PDF-Konvertierung auf dem Server funktioniert.

14. **Erweiterte Debug-Ausgabe im Frontend**  
    Aktiv bei eingeschaltetem Debug-Modus – hilfreich für Fehlerdiagnosen.

15. **Bundsteg-Design via CSS**  
    Realistischer Buchcharakter durch Mittelsteg-Design.

---

> 📎 **Hinweis:** Für die PDF-Konvertierung wird **ImageMagick** auf dem Server benötigt.


## 🧪 Anwendungsbeispiel:
```plaintext
[book id="demo-book" img="verzeichnis-mit-bildern" pdf="optional-pdf-verzeichnis" color="#004080" hover="#0099ff" width="responsive" din_format="A4"]
```

## 📁 Informationen zu Bild- und PDF-Pfaden
- `img` und `pdf` sind Ordnernamen innerhalb von `images/stpageflip/`.
- **Beispiel:** `img="book1"` → lädt Bilder aus `images/stpageflip/book1/`
- **Beispiel:** `pdf="book1"` → lädt PDF aus `images/stpageflip/book1/`
- 💬 Diese Ordner müssen **manuell angelegt** werden und die entsprechenden Dateien enthalten.

**Erforderliche Attribute:** `id`, `img`

## ⚙️ Verfügbare Attribute

| Attribut         | Typ     | Beschreibung                              |
|------------------|---------|-------------------------------------------|
| pdf              | String  | (Optional) Ordner für PDF-Download-Button |
| width            | String  | "responsive" oder feste Breite in px      |
| height           | String  | Optionale feste Höhe in px                |
| din_format       | String  | Format: A4, 16:9, Comic/Manga etc.        |
| aspect_ratio     | Float   | Benutzerdefiniertes Seitenverhältnis      |
| color            | Hex     | Farbe der Icons (z. B. #004080)           |
| hover            | Hex     | Farbe beim Hovern                         |
| center-single    | Boolean | Letzte Einzelseite zentrieren             |
| mousewheel-scroll| Boolean | Blättern mit dem Mausrad                  |
| slider           | Boolean | Seitenslider anzeigen                     |
| bt-options       | Boolean | Button-Leiste anzeigen                    |
| home             | Boolean | „Zur ersten Seite“-Button                 |
| download         | Boolean | PDF-Download-Button anzeigen              |
| prev             | Boolean | Vorherige Seite                           |
| next             | Boolean | Nächste Seite                             |
| zoom-in          | Boolean | Hineinzoomen                              |
| zoom-out         | Boolean | Herauszoomen                              |
| zoom-default     | Boolean | Zoom zurücksetzen                         |
| zoom-dblclick    | Boolean | Zoom bei Doppelklick                      |
| fullscreen       | Boolean | Vollbild aktivieren                       |
| reflection       | Boolean | Seitenreflexion anzeigen                  |
| tooltip          | Boolean | Tooltips anzeigen                         |
| transform        | Boolean | Verschieben/Bewegen erlauben              |
| inside-button    | Boolean | Interne Vor-/Zurück-Buttons               |
| sound            | Boolean | Umblätter-Sound aktivieren                |

*Alle Boolean-Attribute sind standardmäßig `true`, sofern nicht anders angegeben.*

## 📐 Unterstützte `din_format` Werte

| Name             | Seitenverhältnis | Typ               |
|------------------|------------------|-------------------|
| A0               | 0.707            | DIN A (Hochformat)|
| A1               | 0.706            | DIN A (Hochformat)|
| A2               | 0.707            | DIN A (Hochformat)|
| A3               | 0.707            | DIN A (Hochformat)|
| A4               | 0.707            | DIN A (Hochformat)|
| A5               | 0.705            | DIN A (Hochformat)|
| A6               | 0.709            | DIN A (Hochformat)|
| A7               | 0.705            | DIN A (Hochformat)|
| A8               | 0.703            | DIN A (Hochformat)|
| 16:9             | 1.778            | Bildschirm / Video|
| 4:3              | 1.333            | Bildschirm / Video|
| 3:2              | 1.500            | Bildschirm / Video|
| 21:9             | 2.333            | Ultra-Wide        |
| 1:1              | 1.000            | Quadratisch       |
| 9:16             | 0.562            | Vertikal / Mobil  |
| 5x7              | 0.714            | Foto              |
| 8x10             | 0.800            | Foto              |
| 2:3              | 0.667            | Foto              |
| Portrait Standard| 0.707            | Flipbook Klassisch|
| Comic/Manga      | 0.650            | Flipbook Klassisch|
| Square           | 1.000            | Flipbook Klassisch|
| Wide Book        | 1.400            | Flipbook Klassisch|

*Nutze das Attribut `din_format`, um automatisch ein vorkonfiguriertes Seitenverhältnis anzuwenden.*

📘 stPageFlip Enhanced – Flipbook Plugin for Joomla

This plugin integrates a realistic page-flipping book viewer into Joomla articles – based on the stPageFlip library – with an enhanced user interface, zoom, fullscreen, sound, and more.

# 📘 stPageFlip Enhanced – Flipbook Plugin for Joomla

This plugin integrates a realistic, page-flipping book viewer into Joomla articles – based on the stPageFlip library – featuring an enhanced user interface, zoom, fullscreen mode, sound effects, and more.

## English Translation

## 🧪 Key Features

1. **Server-side PDF Conversion**  
   Resource-efficient conversion of PDF to WebP directly on the server – more efficient than client-side rendering.

2. **Optional Automatic PDF Conversion**  
   - Detects PDFs in the `source/img` folder and automatically creates WebP files at **150 dpi**.  
   - File naming: `Seite_x.webp`  
   - Deleting existing images automatically triggers a new conversion.

3. **Direct PDF Download**  
   Allows users to instantly download the complete PDF.

4. **Mouse Wheel Page Flipping**  
   Intuitive navigation for a smooth reading experience.

5. **Slider for Quick Browsing**  
   Especially helpful for large PDFs.

6. **Current Page Display**  
   Provides orientation, especially in multi-page documents.

7. **100% Responsive Design**  
   Optimized for all screen sizes  
   _Note: Fullscreen mode is currently being improved._

8. **Fullscreen Mode**  
   For an immersive user experience.

9. **Integrated Navigation Buttons**  
   Alternative navigation alongside scrolling and slider.

10. **Bottom Control Bar**  
    Central access to all navigation elements.

11. **Optional Reflection Effect**  
    Adds a realistic touch with mirrored page visuals (can be disabled).

---

## ⚙️ Technical & Developer Features

12. **Automatic Creation of `stpageflip` Folder**  
    No manual setup needed during installation.

13. **ImageMagick Availability Check**  
    Ensures PDF conversion works on the server.

14. **Extended Debug Output in Frontend**  
    Enabled when debug mode is active – helpful for troubleshooting.

15. **Gutter Design via CSS**  
    Adds a realistic book spine through central gutter styling.

---

> 📎 **Note:** PDF conversion requires **ImageMagick** installed on the server.

## 🧪 Usage Example:
```plaintext
[book id="demo-book" img="folder-with-images" pdf="optional-pdf-folder" color="#004080" hover="#0099ff" width="responsive" din_format="A4"]
```

## 📁 Image and PDF Path Information
- `img` and `pdf` are folder names within `images/stpageflip/`.
- **Example:** `img="book1"` → loads images from `images/stpageflip/book1/`
- **Example:** `pdf="book1"` → loads PDF from `images/stpageflip/book1/`
- 💬 These folders must be **manually created** and contain the required files.

**Required Attributes:** `id`, `img`

## ⚙️ Available Attributes

| Attribute         | Type    | Description                                |
|------------------|---------|--------------------------------------------|
| pdf              | String  | (Optional) Folder for PDF download button  |
| width            | String  | "responsive" or fixed width in px          |
| height           | String  | Optional fixed height in px                |
| din_format       | String  | Format: A4, 16:9, Comic/Manga etc.         |
| aspect_ratio     | Float   | Custom aspect ratio                        |
| color            | Hex     | Icon color (e.g. #004080)                  |
| hover            | Hex     | Hover icon color                           |
| center-single    | Boolean | Center the last single page                |
| mousewheel-scroll| Boolean | Flip pages with mouse wheel                |
| slider           | Boolean | Show page slider                           |
| bt-options       | Boolean | Show button toolbar                        |
| home             | Boolean | "Go to first page" button                  |
| download         | Boolean | Show PDF download button                   |
| prev             | Boolean | Previous page                              |
| next             | Boolean | Next page                                  |
| zoom-in          | Boolean | Zoom in                                    |
| zoom-out         | Boolean | Zoom out                                   |
| zoom-default     | Boolean | Reset zoom                                 |
| zoom-dblclick    | Boolean | Zoom on double-click                       |
| fullscreen       | Boolean | Enable fullscreen mode                     |
| reflection       | Boolean | Show page reflection                       |
| tooltip          | Boolean | Show tooltips                              |
| transform        | Boolean | Enable drag/move                           |
| inside-button    | Boolean | Show internal navigation buttons           |
| sound            | Boolean | Enable page flip sound                     |

*All Boolean attributes default to `true` unless otherwise specified.*

## 📐 Supported `din_format` Values

| Name             | Aspect Ratio | Type               |
|------------------|--------------|--------------------|
| A0               | 0.707        | DIN A (Portrait)   |
| A1               | 0.706        | DIN A (Portrait)   |
| A2               | 0.707        | DIN A (Portrait)   |
| A3               | 0.707        | DIN A (Portrait)   |
| A4               | 0.707        | DIN A (Portrait)   |
| A5               | 0.705        | DIN A (Portrait)   |
| A6               | 0.709        | DIN A (Portrait)   |
| A7               | 0.705        | DIN A (Portrait)   |
| A8               | 0.703        | DIN A (Portrait)   |
| 16:9             | 1.778        | Screen / Video     |
| 4:3              | 1.333        | Screen / Video     |
| 3:2              | 1.500        | Screen / Video     |
| 21:9             | 2.333        | Ultra-Wide         |
| 1:1              | 1.000        | Square             |
| 9:16             | 0.562        | Vertical / Mobile  |
| 5x7              | 0.714        | Photo              |
| 8x10             | 0.800        | Photo              |
| 2:3              | 0.667        | Photo              |
| Portrait Standard| 0.707        | Flipbook Classic   |
| Comic/Manga      | 0.650        | Flipbook Classic   |
| Square           | 1.000        | Flipbook Classic   |
| Wide Book        | 1.400        | Flipbook Classic   |

*Use the `din_format` attribute to quickly apply a predefined aspect ratio.*