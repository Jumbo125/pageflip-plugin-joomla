<?php

namespace Joomla\Plugin\Content\Stpageflip\Service;

use Joomla\CMS\Uri\Uri;
use Joomla\Filesystem\Folder;

\defined('_JEXEC') or die;

final class BookDirectoryService
{
    private const IMAGE_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png'];

    public function getBaseDirectory(): string
    {
        return JPATH_ROOT . '/images/stpageflip';
    }

    public function getBaseUrl(): string
    {
        return rtrim(Uri::root(), '/') . '/images/stpageflip';
    }

    public function ensureBaseDirectory(): void
    {
        $base = $this->getBaseDirectory();

        if (!is_dir($base)) {
            Folder::create($base);
        }
    }

    public function isSafeFolderName(string $folder): bool
    {
        $folder = trim($folder);

        if ($folder === '' || $folder === '.' || $folder === '..') {
            return false;
        }

        if (strpos($folder, "\0") !== false) {
            return false;
        }

        if (preg_match('#[\\\\/]#', $folder)) {
            return false;
        }

        if (preg_match('#^[A-Za-z]:[\\\\/]#', $folder) || str_starts_with($folder, '/')) {
            return false;
        }

        return true;
    }

    public function resolveBookDirectory(string $folder, bool $mustExist = true): ?string
    {
        if (!$this->isSafeFolderName($folder)) {
            return null;
        }

        $base = $this->getBaseDirectory();
        $candidate = $base . '/' . $folder;

        if ($mustExist && !is_dir($candidate)) {
            return null;
        }

        $baseReal = realpath($base);
        $targetReal = realpath($candidate);

        if ($baseReal === false) {
            return null;
        }

        if ($targetReal === false) {
            $parentReal = realpath(dirname($candidate));

            if ($parentReal === false || !$this->isWithinBase($baseReal, $parentReal)) {
                return null;
            }

            return $candidate;
        }

        return $this->isWithinBase($baseReal, $targetReal) ? $targetReal : null;
    }

    public function listBooks(): array
    {
        $base = $this->getBaseDirectory();

        if (!is_dir($base)) {
            return [];
        }

        $items = scandir($base) ?: [];
        $books = [];

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $path = $base . '/' . $item;

            if (!is_dir($path)) {
                continue;
            }

            $books[] = $this->getBookStatus($item);
        }

        usort($books, static fn(array $a, array $b): int => strnatcasecmp($a['folder'], $b['folder']));

        return $books;
    }

    public function getBookStatus(string $folder): array
    {
        $directory = $this->resolveBookDirectory($folder);

        if ($directory === null) {
            return [
                'folder' => $folder,
                'pdfCount' => 0,
                'imageCount' => 0,
                'status' => 'invalid',
                'pdfFile' => null,
                'images' => [],
            ];
        }

        $pdfFiles = $this->findPdfFiles($directory);
        $imageFiles = $this->findImageFiles($directory);
        $status = 'empty';

        if (count($pdfFiles) > 1) {
            $status = 'multiple_pdfs';
        } elseif (count($imageFiles) > 0 && count($pdfFiles) === 0) {
            $status = 'images_only';
        } elseif (count($imageFiles) > 0) {
            $status = 'complete';
        } elseif (count($pdfFiles) === 1) {
            $status = 'conversion_required';
        }

        return [
            'folder' => $folder,
            'pdfCount' => count($pdfFiles),
            'imageCount' => count($imageFiles),
            'status' => $status,
            'pdfFile' => $pdfFiles[0] ?? null,
            'images' => $imageFiles,
        ];
    }

    public function resolveFrontendBook(string $imageFolder, ?string $pdfFolder = null): array
    {
        $imageDirectory = $this->resolveBookDirectory($imageFolder);
        $pdfDirectory = $this->resolveBookDirectory($pdfFolder !== null && $pdfFolder !== '' ? $pdfFolder : $imageFolder);

        $images = $imageDirectory ? $this->findImageFiles($imageDirectory) : [];
        $pdfs = $pdfDirectory ? $this->findPdfFiles($pdfDirectory) : [];
        $pdfFile = $pdfs[0] ?? null;

        return [
            'imageFolder' => $imageFolder,
            'imageDirectory' => $imageDirectory,
            'imageUrl' => $imageDirectory ? $this->buildBookUrl($imageFolder) : null,
            'images' => $images,
            'pdfFolder' => $pdfFolder !== null && $pdfFolder !== '' ? $pdfFolder : $imageFolder,
            'pdfDirectory' => $pdfDirectory,
            'pdfFiles' => $pdfs,
            'pdfFile' => $pdfFile,
            'pdfUrl' => ($pdfDirectory && $pdfFile) ? $this->buildBookUrl(($pdfFolder !== null && $pdfFolder !== '' ? $pdfFolder : $imageFolder), $pdfFile) : null,
        ];
    }

    public function findPdfFiles(string $directory): array
    {
        return $this->findFilesByExtensions($directory, ['pdf']);
    }

    public function findImageFiles(string $directory): array
    {
        return $this->findFilesByExtensions($directory, self::IMAGE_EXTENSIONS);
    }

    public function buildBookUrl(string $folder, ?string $file = null): string
    {
        $segments = [rawurlencode($folder)];

        if ($file !== null && $file !== '') {
            $segments[] = rawurlencode($file);
        }

        return $this->getBaseUrl() . '/' . implode('/', $segments);
    }

    private function findFilesByExtensions(string $directory, array $extensions): array
    {
        if (!is_dir($directory)) {
            return [];
        }

        $items = scandir($directory) ?: [];
        $files = [];

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $path = $directory . '/' . $item;

            if (!is_file($path)) {
                continue;
            }

            $extension = strtolower(pathinfo($item, \PATHINFO_EXTENSION));

            if (\in_array($extension, $extensions, true)) {
                $files[] = $item;
            }
        }

        natcasesort($files);

        return array_values($files);
    }

    private function isWithinBase(string $baseReal, string $targetReal): bool
    {
        $base = rtrim(str_replace('\\', '/', $baseReal), '/');
        $target = rtrim(str_replace('\\', '/', $targetReal), '/');

        return $target === $base || str_starts_with($target . '/', $base . '/');
    }
}
