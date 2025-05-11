<?php
header('Content-Type: application/json');

// Parameter prüfen
if (!isset($_GET['do']) || $_GET['do'] !== 'get_img_files' || !isset($_GET['pfad'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Ungültige Anfrage']);
    exit;
}
$relativePath = $_GET['pfad'] ?? '';
// Immer mit / beginnen, nie mit //
$relativePath = '/' . ltrim($relativePath, '/');
// Basisverzeichnis erlauben (z. B. nur innerhalb von /images/stpageflip/)
$basePath = '/images/stpageflip/';
// Sicherheitscheck: erlaubt nur Zugriff auf Unterverzeichnisse von $basePath
if (!str_starts_with($relativePath, $basePath)) {
    http_response_code(403);
    exit('Zugriff verweigert');
}

// Absoluter Pfad auf dem Server
$absolutePath = $_SERVER['DOCUMENT_ROOT'] . $relativePath;

if (!is_dir($absolutePath)) {
    http_response_code(404);
    exit('Verzeichnis nicht gefunden');
}

$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
$result = [];

if (is_dir($absolutePath)) {
    foreach (scandir($absolutePath) as $file) {
        $filePath = $absolutePath . DIRECTORY_SEPARATOR . $file;

        if (is_file($filePath)) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (in_array($ext, $allowedExtensions)) {
                $result[] = $file; // Nur Dateinamen zurückgeben
            }
        }
    }

    echo json_encode($result);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Verzeichnis nicht gefunden']);
}
