# Handbuch - Joomla Content Plugin "StPageFlip" (plg_content_stpageflip)

**Autor:** jumbo125  
**Stand:** 10.02.2026  
**Lizenz:** GNU GPL v2 oder spaeter  
**Zweck:** Einbindung eines interaktiven Flipbooks in Joomla-Inhalte ueber den Shortcode `[book ...]`.

---

## Deckblatt

**Produkt:** StPageFlip - Flipbook fuer Joomla (Content Plugin)  
**Komponenten:** PHP-Plugin (onContentPrepare) + JavaScript-Controller (St.PageFlip, Panzoom, jQuery/jQuery UI, Bootstrap Icons)  
**Asset-Pipeline:** Joomla WebAssetManager (Registry: `media/plg_content_stpageflip/joomla.asset.json`)  
**Medienpfad fuer Buecher:** `images/stpageflip/<ordner>/`

---

## Quickguide (in 5 Minuten)

1. **Plugin installieren und aktivieren**
   - Plugin-Verzeichnis: `plugins/content/stpageflip/`
   - Media/Assets: `media/plg_content_stpageflip/`
   - Plugin in Joomla aktivieren: **Erweiterungen -> Plugins -> "Content - StPageFlip"**

2. **Buch-Dateien ablegen**
   - Lege einen Ordner an: `images/stpageflip/meinbuch/`
   - **Variante A (empfohlen):** Seitenbilder in diesen Ordner kopieren (jpg/png/webp ...)
   - **Variante B:** Nur ein PDF ablegen (pdf) und im Plugin optional **Bilder automatisch generieren** aktivieren (Imagick erforderlich)

3. **Shortcode im Beitrag einfuegen**
   - Minimal:
     - `[book id="meinbuch" img="meinbuch"]`
   - Mit PDF-Download:
     - `[book id="meinbuch" img="meinbuch" pdf="meinbuch"]`

4. **Seite aufrufen und testen**
   - Flipbook sollte als `<div class="flip-book ui-flipbook" ...>` gerendert werden.
   - Unter dem Beitrag wird ein verstecktes Input-Feld erzeugt:
     - `id="meinbuch_img_files"` mit der Bildliste und `data-img-path`.

5. **Bei Problemen Debug aktivieren**
   - Plugin-Option **debug_mode** aktivieren.
   - Es werden zusaetzliche Meldungen im Frontend angezeigt und die JS-Konsole loggt mehr Informationen.

---

## Inhaltsuebersicht

1. Funktionsprinzip (Ablauf und Datenfluss)  
2. Installation und Ordnerstruktur  
3. Verwendung im Content (Shortcode und Beispiele)  
4. Attribute und Optionen (data-Attribute / Parameter)  
5. Bedienung und Features (Slider, Zoom, Fullscreen, Drag, Sound, Reflection)  
6. Debugging und Troubleshooting  
7. Bekannte Auffaelligkeiten im aktuellen Code (Hinweise fuer Entwickler)  

---

## 1. Funktionsprinzip

### 1.1 PHP-Teil (Joomla Plugin)

Das Plugin haengt sich in `onContentPrepare` ein und durchsucht den Artikeltext nach Tags im Format:

- `[book ...]`

Ablauf:

1. Ermitteln der Text-Property am Artikelobjekt:
   - `text` (Standard)
   - alternativ `product_desc` oder `product_s_desc` (z.B. in Shop-Komponenten)
2. Einfuegen eines Hidden-Inputs fuer Debug:
   - `<input type="hidden" id="stpageflip_debug" value="true|false">`
3. Ersetzen jedes `[book ...]` durch ein HTML-Container-DIV:
   - `<div id="..." class="flip-book ui-flipbook" data-...></div>`
4. Laden der WebAssets (CSS/JS) ueber den WebAssetManager
5. Scannen der Medienordner:
   - Bilder in `images/stpageflip/<img>/`
   - PDFs in `images/stpageflip/<pdf>/` (oder fallback auf `<img>/`)
6. Erzeugen eines Hidden-Inputs je Buch mit Bildliste:
   - `id="<bookId>_img_files" value="seite1.webp,seite2.webp,..."`
   - zusaetzlich `data-img-path=".../images/stpageflip/<img>"`

### 1.2 JavaScript-Teil (Flipbook Controller)

Der JS-Code:

- findet alle `.flip-book` Container,
- erzeugt fuer jede Seite ein `.page` Element mit `background-image`,
- initialisiert `St.PageFlip(...)`,
- baut Bedien-Controls (Slider + Buttons),
- registriert globale Events (Wheel, DblClick, Fullscreen, KeyDown),
- verwaltet Instanzen in `PageFlipRegistry`.

---

## 2. Installation und Ordnerstruktur

### 2.1 Plugin-Dateien (typische Struktur)

- `plugins/content/stpageflip/`  
  - `src/Extension/Stpageflip.php` (Plugin-Klasse)
  - `services/provider.php` (Service Provider / DI Registrierung)

- `media/plg_content_stpageflip/`
  - `joomla.asset.json` (WebAsset-Definitionen fuer CSS/JS)
  - `js/...` (pageflip_main, controll_pageflip, controll_panzoom, jquery-ui-draggable etc.)
  - `css/...` (pageflip_original, pageflip_custom, optional bootstrap)
  - `sounds/turn.mp3` (optional Sound beim Blaettern)

### 2.2 Medien fuer Buecher

- `images/stpageflip/<buchordner>/`
  - Seitenbilder: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `webp` (Gross-/Kleinschreibung teils tolerant)
  - optional: PDF-Dateien (Endung `.pdf`)

**Empfehlung fuer Dateinamen:**  
Nutze ein konsistentes, aufsteigend sortierbares Schema, z.B. `seite_1.webp`, `seite_2.webp`, ...

---

## 3. Verwendung im Content

### 3.1 Minimalbeispiel

```text
[book id="meinbuch" img="meinbuch"]
```

- `img="meinbuch"` bedeutet: Bilder liegen in `images/stpageflip/meinbuch/`
- `id="meinbuch"` wird als DOM-ID verwendet und muss auf der Seite eindeutig sein.

### 3.2 Mit PDF-Ordner (Download + Auto-Generate moeglich)

```text
[book id="katalog2026" img="katalog2026" pdf="katalog2026"]
```

### 3.3 Mehrere Buecher in einem Beitrag

```text
[book id="buch1" img="buch1"]
[book id="buch2" img="buch2" width="responsive" din_format="A4" fullscreen="false"]
```

---

## 4. Attribute und Optionen

Das Plugin mappt Attribute aus dem Shortcode auf `data-*` Attribute am Container-DIV.

### 4.1 Wichtige Attribute (PHP-Defaults)

| Attribut im Shortcode | data-Attribut am DIV | Default | Bedeutung |
|---|---|---:|---|
| `id` | `id` | `meinbuch` | Eindeutige DOM-ID des Flipbooks |
| `img` | `data-img-src` | leer | Unterordner unter `images/stpageflip/` fuer Bilder |
| `pdf` | `data-pdf-src` | leer | Unterordner unter `images/stpageflip/` fuer PDF(s) |
| `color` | `data-color` | `#333` | Icon-Farbe |
| `hover` | `data-color-hover` | `#c00` | Icon-Farbe beim Hover |
| - | `data-density` | `soft` | Seitenhaerte: `soft`, `hard`, `hard_book` |
| - | `data-center-single` | `true` | Letzte Einzelseite zentrieren (wenn aktiv) |
| - | `data-mousewheel-scroll` | `true` | Mousewheel blaettert (Desktop, nicht iOS/Android) |
| - | `data-slider` | `true` | Seiten-Slider anzeigen |
| - | `data-bt-options` | `true` | Button-Leiste anzeigen |
| - | `data-home` | `true` | Home/erste Seite Button |
| - | `data-download` | `true` | Download Button (PDF) |
| - | `data-prev` | `true` | Zurueck Button |
| - | `data-next` | `true` | Weiter Button |
| - | `data-zoom-in` | `true` | Zoom+ Button |
| - | `data-zoom-out` | `true` | Zoom- Button |
| - | `data-zoom-default` | `true` | Zoom-Reset Button |
| - | `data-zoom-dblclick` | `false` | Doppelklick-Zoom (JS) |
| - | `data-fullscreen` | `true` | Fullscreen Button (iOS Fallback vorhanden) |
| - | `data-reflection` | `true` | Spiegel-Reflexion unter dem Buch |
| - | `data-tooltip` | `false` | Tooltips via `<abbr>` |
| - | `data-transform` | `true` | Platzhalter fuer Transform-Feature (nicht voll implementiert) |
| - | `data-inside-button` | `true` | Prev/Next Buttons direkt im Buch |
| - | `data-sound` | `true` | Sound-Button anzeigen |
| `mute="true|false"` | `data-mute` | `true` | Startzustand Sound (JS liest `data-mute`) |

### 4.2 Layout-Attribute (JS)

Diese Werte werden im JS aus dem Container gelesen:

| data-Attribut | Beispiel | Bedeutung |
|---|---|---|
| `data-width` | `responsive` oder `800` | Breite des Flipbooks; `responsive` nutzt Containerbreite |
| `data-height` | `600` | Hoehe; wenn fehlt, wird aus width/aspect_ratio berechnet |
| `data-aspect_ratio` | `0.707` | Seitenverhaeltnis (z.B. A4 hochkant) |
| `data-din_format` | `A4`, `A5`, `16:9` | Setzt aspect_ratio anhand vordefinierter Liste |

**Hinweis:** Im Code werden sowohl `aspect_ratio` als auch `din_format` unterstuetzt. Wenn `din_format` gesetzt ist (nicht `not_use`), ueberschreibt es den `aspect_ratio`.

---

## 5. Bedienung und Features (Frontend)

### 5.1 Slider und Seitenanzeige

- Zeigt "Seite X von Y"
- Im Doppelseitenmodus wird "X und Y" angezeigt
- Schrittweite des Sliders passt sich an (1 oder 2)

### 5.2 Navigation

- Home: springt zur ersten Seite
- Prev/Next: blaettert seitenweise (mit Schutz vor Unterlauf/Ueberlauf)
- Mousewheel (Desktop): Scrollrad blaettert (optional)

### 5.3 Zoom und Pan (Panzoom)

- Zoom+ / Zoom- (Schritte 0.1)
- Reset: setzt Zoom und Cursor zurueck
- Doppelklick-Zoom (optional): zoomt auf 1.5 und panned auf Klickposition

### 5.4 Verschieben (Drag)

- Button "Move" aktiviert jQuery UI Draggable fuer das Buch
- Button "Back" setzt Position auf urspruengliche Werte (`data-original-left/top`) und setzt Pan auf (0,0)

### 5.5 Fullscreen

- Desktop: nutzt Fullscreen API auf dem Container `.pdf_book_fullscreen`
- iOS: Pseudo-Fullscreen ueber CSS-Klassen (`pseudo-fullscreen`)

### 5.6 Reflection

- Optionaler Reflexionsbereich unter dem Buch (per CSS mask-image)
- Wird bei Flip aktualisiert und in Fullscreen ausgeblendet/eingeblendet

### 5.7 Sound

- Sound Button toggelt Klassen `sound_on/sound_off`
- Audio-Playback ist vorbereitet (MP3 Pfad), aber in `beforeFlip` aktuell auskommentiert
- Es existiert eine `play_sound()` Funktion, die beim Prev/Next aufgerufen wird

---

## 6. Debugging und Troubleshooting

### 6.1 Typische Ursachen

1. **Keine Bilder gefunden**
   - Pruefe Ordner: `images/stpageflip/<img>/`
   - Pruefe Dateiendungen (jpg/png/webp ...) und Leserechte
2. **Keine PDFs gefunden**
   - Pruefe Ordner: `images/stpageflip/<pdf>/`
3. **St.PageFlip oder Panzoom nicht geladen**
   - Pruefe WebAsset Registry (`joomla.asset.json`)
   - Pruefe Browser-Konsole: "St.PageFlip NICHT verfuegbar" / "Panzoom ist nicht verfuegbar"
4. **jQuery UI Drag funktioniert nicht**
   - Plugin-Option `load_jqueryui` aktivieren
5. **Bootstrap / Icons fehlen**
   - `load_bootstrap` und/oder `load_bootstrap_icons` aktivieren
   - Alternativ eigene CSS/Icons bereitstellen

### 6.2 Debug-Modus

Wenn `debug_mode=1`:

- PHP schreibt Info- und Fehlermeldungen direkt in den Content (als Bootstrap Alerts).
- JS loggt zusaetzliche Informationen mit `show_debug_msg(...)`.

### 6.3 Imagick / Auto-Bildgenerierung

Voraussetzungen:

- PHP-Extension `imagick` installiert und aktiv
- Plugin-Parameter `create_img` aktiviert

Ablauf:

- Wenn **keine Bilder** vorhanden sind, aber **ein PDF** gefunden wurde, werden Seiten als WebP nach `images/stpageflip/<img>/` geschrieben.

---

## 7. Bekannte Auffaelligkeiten im aktuellen Code (Hinweise fuer Entwickler)

Die folgenden Punkte ergeben sich direkt aus dem bereitgestellten Code und koennen je nach PHP-Fehlerlevel relevant sein:

1. **`$debug_mode` in `onContentPrepare()` nicht definiert**  
   In `onContentPrepare()` wird `$debug_mode` verwendet, aber dort nicht gesetzt. Empfehlung: Debug-Flag aus Plugin-Parametern lesen oder als Klassenproperty speichern.

2. **PDF-Listenvariable `pdfList` wird verwendet, aber nicht gesetzt**  
   Im Block, der das Hidden-Input fuer PDFs befuellt, wird `if (!empty($pdfList))` geprueft, jedoch existiert `$pdfList` vorher nicht. Vermutlich ist `$pdfFiles` gemeint.

3. **PDF-Pfad bei Imagick-Konvertierung**  
   `\$pdfPath` wird aus `\$imgFolder . '/' . $filename` gebaut, obwohl das PDF aus `\$pdfFolder` gescannt wurde. Das klappt nur, wenn PDF und Bilder im selben Ordner liegen. Empfehlung: `\$pdfPath = $pdfFolder . '/' . $filename`.

4. **Attribut-Parsing nur fuer double quotes**  
   `parseAttributes()` matched `key="value"`. Werte mit einfachen Anfuehrungszeichen oder ohne Quotes werden ignoriert.

5. **Mehrfach-Initialisierung / Selektoren**  
   Es gibt Stellen wie `document.querySelector('.ui-flipbook')...`, die nur das erste Element selektieren. Bei mehreren Buechern pro Seite sollten diese Listener pro Instanz oder per Delegation gesetzt werden.

---

## Anhang A - Beispielkonfigurationen

### A.1 A4 Flipbook, responsive, ohne Fullscreen

```text
[book id="a4_demo" img="a4_demo" width="responsive" din_format="A4" fullscreen="false" reflection="false"]
```

### A.2 Katalog mit harten Umschlagseiten

```text
[book id="katalog" img="katalog" density="hard_book" sound="true" mute="false"]
```

---

## Anhang B - Checkliste fuer Go-Live

- [ ] Plugin aktiviert
- [ ] `media/plg_content_stpageflip/joomla.asset.json` vorhanden und korrekt registriert
- [ ] Bilder liegen in `images/stpageflip/<img>/`
- [ ] Optional: PDF liegt in `images/stpageflip/<pdf>/`
- [ ] Rechte/Ownership der Ordner stimmen
- [ ] Debug aus (Produktiv)
- [ ] Test auf Desktop + iOS/Android (Fullscreen, Mousewheel, Zoom)

