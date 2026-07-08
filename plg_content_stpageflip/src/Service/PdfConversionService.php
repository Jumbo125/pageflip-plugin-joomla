<?php

namespace Joomla\Plugin\Content\Stpageflip\Service;

use Joomla\CMS\Date\Date;
use Joomla\CMS\Log\Log;
use Joomla\CMS\Language\Text;
use Joomla\Filesystem\File;
use Joomla\Filesystem\Folder;

\defined('_JEXEC') or die;

final class PdfConversionService
{
    private const LOCK_FILE = '.pageflip-converting.lock';
    private const TMP_FOLDER = '.pageflip_tmp';
    private const STATUS_FILE = '.pageflip-conversion.json';
    private const LOCK_TTL = 1800;

    public function __construct(
        private readonly BookDirectoryService $bookDirectoryService
    ) {
    }

    public function convertBook(string $folder, array $options = []): array
    {
        $format  = \in_array($options['format'] ?? '', ['webp', 'jpeg', 'png'], true) ? $options['format'] : 'webp';
        $quality = max(1, min(100, (int) ($options['quality'] ?? 85)));
        $dpi     = max(72, min(600, (int) ($options['dpi'] ?? 150)));
        $ext     = $format === 'jpeg' ? 'jpg' : $format;

        $directory = $this->bookDirectoryService->resolveBookDirectory($folder);

        if ($directory === null) {
            return $this->result(false, 'invalid', Text::_('PLG_CONTENT_STPAGEFLIP_INVALID_FOLDER'));
        }

        $status = $this->bookDirectoryService->getBookStatus($folder);

        if ($status['imageCount'] > 0) {
            return $this->result(true, 'already_present', Text::_('PLG_CONTENT_STPAGEFLIP_IMAGES_EXIST'), ['pages' => $status['imageCount']]);
        }

        if ($status['pdfCount'] === 0) {
            return $this->result(true, 'no_pdf', Text::_('PLG_CONTENT_STPAGEFLIP_NO_PDF'));
        }

        if ($status['pdfCount'] > 1) {
            return $this->result(true, 'multiple_pdfs', Text::_('PLG_CONTENT_STPAGEFLIP_MULTIPLE_PDFS'));
        }

        if (!extension_loaded('imagick')) {
            return $this->result(false, 'imagick_missing', Text::_('PLG_CONTENT_STPAGEFLIP_IMAGICK_MISSING'));
        }

        $lockFile = $directory . '/' . self::LOCK_FILE;

        if (!$this->acquireLock($lockFile)) {
            return $this->result(true, 'locked', Text::_('PLG_CONTENT_STPAGEFLIP_LOCKED'));
        }

        $tmpDirectory = $directory . '/' . self::TMP_FOLDER;
        $pdfPath = $directory . '/' . $status['pdfFile'];

        try {
            Folder::create($tmpDirectory);
            $imagick = new \Imagick();
            $imagick->setResolution($dpi, $dpi);
            $imagick->readImage($pdfPath);

            $pageCount = $imagick->getNumberImages();

            if ($pageCount < 1) {
                throw new \RuntimeException('No pages found in PDF.');
            }

            $digits = max(3, strlen((string) $pageCount));
            $generatedFiles = [];

            foreach ($imagick as $index => $page) {
                $page->setImageFormat($format);
                $page->setImageCompressionQuality($quality);
                $filename = sprintf('page_%0' . $digits . 'd.' . $ext, $index + 1);
                $target = $tmpDirectory . '/' . $filename;
                $page->writeImage($target);
                $generatedFiles[] = $filename;
            }

            natcasesort($generatedFiles);
            $generatedFiles = array_values($generatedFiles);

            if ($generatedFiles === []) {
                throw new \RuntimeException('No images generated.');
            }

            foreach ($generatedFiles as $file) {
                File::move($tmpDirectory . '/' . $file, $directory . '/' . $file);
            }

            File::write(
                $directory . '/' . self::STATUS_FILE,
                json_encode([
                    'completed' => true,
                    'pdf' => $status['pdfFile'],
                    'pages' => count($generatedFiles),
                    'converted' => (new Date())->format(\DATE_ATOM),
                ], \JSON_PRETTY_PRINT | \JSON_UNESCAPED_SLASHES)
            );

            $imagick->clear();
            $imagick->destroy();
            $this->cleanupTempDirectory($tmpDirectory);

            return $this->result(true, 'converted', Text::sprintf('PLG_CONTENT_STPAGEFLIP_CONVERSION_SUCCESS', count($generatedFiles)), [
                'pages' => count($generatedFiles),
                'pdf' => $status['pdfFile'],
            ]);
        } catch (\Throwable $exception) {
            Log::add($exception->getMessage(), Log::ERROR, 'plg_content_stpageflip');
            $this->cleanupTempDirectory($tmpDirectory);

            return $this->result(false, 'conversion_failed', Text::_('PLG_CONTENT_STPAGEFLIP_CONVERSION_FAILED'));
        } finally {
            if (is_file($lockFile)) {
                @unlink($lockFile);
            }
        }
    }

    private function acquireLock(string $lockFile): bool
    {
        if (is_file($lockFile)) {
            $age = time() - (int) filemtime($lockFile);

            if ($age < self::LOCK_TTL) {
                return false;
            }

            @unlink($lockFile);
        }

        return File::write($lockFile, (string) time()) !== false;
    }

    private function cleanupTempDirectory(string $tmpDirectory): void
    {
        if (is_dir($tmpDirectory)) {
            Folder::delete($tmpDirectory);
        }
    }

    private function result(bool $success, string $status, string $message, array $extra = []): array
    {
        return array_merge([
            'success' => $success,
            'status' => $status,
            'message' => $message,
        ], $extra);
    }
}
