# 📘 stPageFlip Enhanced – Flipbook-Plugin für Joomla

Dieses Plugin integriert einen realistischen, blätterbaren Buch-Viewer in Joomla-Artikel – basierend auf der stPageFlip-Bibliothek – mit erweiterter Benutzeroberfläche, Zoom, Vollbild, Ton und mehr.

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