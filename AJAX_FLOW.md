# AJAX-Ablauf

## Endpunkt

- `POST /administrator/index.php?option=com_ajax&plugin=stpageflip&group=ajax&format=json`

## Sicherheitsregeln

- nur Backend
- nur `POST`
- gültiger Joomla-CSRF-Token
- angemeldeter Benutzer
- Berechtigung `core.manage` für `com_plugins`

## Aktionen

### `scan`

- listet direkte Unterordner von `images/stpageflip/`
- liefert pro Buch:
  - Ordnername
  - PDF-Anzahl
  - Bildanzahl
  - Status
  - erste PDF-Datei

### `convert`

- verarbeitet genau einen Buchordner
- überspringt Bücher mit vorhandenen Bildern
- verweigert Konvertierung bei mehreren PDFs
- nutzt Lock-Datei `.pageflip-converting.lock`
- rendert Bilder zuerst in `.pageflip_tmp/`
- verschiebt fertige Bilder erst nach erfolgreicher Gesamtkonvertierung
