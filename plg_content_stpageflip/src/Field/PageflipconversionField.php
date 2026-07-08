<?php

namespace Joomla\Plugin\Content\Stpageflip\Field;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Form\FormField;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Session\Session;
use Joomla\CMS\Uri\Uri;
use Joomla\Plugin\Content\Stpageflip\Service\BookDirectoryService;

final class PageflipconversionField extends FormField
{
    protected $type = 'Pageflipconversion';

    protected function getLabel(): string
    {
        return '';
    }

    protected function getInput(): string
    {
        $document = Factory::getApplication()->getDocument();
        $wa = $document->getWebAssetManager();
        $wa->getRegistry()->addRegistryFile('media/plg_content_stpageflip/joomla.asset.json');
        $wa->useStyle('pageflip_admin_style');
        $wa->useStyle('pageflip_bootstrap_ico');

        // Inline JS: WebAssetManager-Timing im Joomla-Admin ist nicht zuverlässig.
        // addScriptDeclaration() garantiert, dass das Script im HTML landet.
        $jsFile = JPATH_ROOT . '/media/plg_content_stpageflip/admin/pageflip-admin.js';

        if (is_file($jsFile)) {
            $document->addScriptDeclaration(file_get_contents($jsFile));
        }

        HTMLHelper::_('bootstrap.framework');

        $config = [
            'ajaxUrl' => Uri::base() . 'index.php?option=com_ajax&plugin=stpageflip&group=ajax&format=json',
            'token'   => Session::getFormToken(),
            'texts'   => [
                'checking'     => Text::_('PLG_CONTENT_STPAGEFLIP_CHECKING_BOOKS'),
                'processing'   => Text::_('PLG_CONTENT_STPAGEFLIP_PROCESSING_BOOK'),
                'ready'        => Text::_('PLG_CONTENT_STPAGEFLIP_READY'),
                'scanError'    => Text::_('PLG_CONTENT_STPAGEFLIP_SCAN_FAILED'),
                'convertError' => Text::_('PLG_CONTENT_STPAGEFLIP_CONVERSION_FAILED'),
                'noBooks'      => Text::_('PLG_CONTENT_STPAGEFLIP_NO_BOOKS'),
                'noPending'    => Text::_('PLG_CONTENT_STPAGEFLIP_NO_PENDING'),
                'colFolder'    => Text::_('PLG_CONTENT_STPAGEFLIP_COL_FOLDER'),
                'colStatus'    => Text::_('PLG_CONTENT_STPAGEFLIP_COL_STATUS'),
                'colImages'    => Text::_('PLG_CONTENT_STPAGEFLIP_COL_IMAGES'),
                'colPdf'       => Text::_('PLG_CONTENT_STPAGEFLIP_COL_PDF'),
                'status'       => [
                    'complete'            => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_COMPLETE'),
                    'images_only'         => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_IMAGES_ONLY'),
                    'conversion_required' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_CONVERSION_REQUIRED'),
                    'multiple_pdfs'       => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_MULTIPLE_PDFS'),
                    'empty'               => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_EMPTY'),
                    'invalid'             => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_INVALID'),
                ],
            ],
        ];

        try {
            $books = (new BookDirectoryService())->listBooks();
        } catch (\Throwable $_) {
            $books = [];
        }

        return '
            <div class="stpageflip-conversion" data-config="' . htmlspecialchars(json_encode($config, \JSON_UNESCAPED_SLASHES | \JSON_UNESCAPED_UNICODE), \ENT_QUOTES) . '">
                <div class="alert alert-info">' . Text::_('PLG_CONTENT_STPAGEFLIP_CONVERSION_INFO') . '</div>
                <div class="stpageflip-conversion__actions">
                    <button type="button" class="btn btn-outline-secondary btn-sm" data-action="refresh">
                        <i class="bi bi-arrow-clockwise"></i> ' . Text::_('PLG_CONTENT_STPAGEFLIP_REFRESH') . '
                    </button>
                    <button type="button" class="btn btn-success btn-sm" data-action="convert">
                        <i class="bi bi-gear-fill"></i> ' . Text::_('PLG_CONTENT_STPAGEFLIP_CONVERT_MISSING') . '
                    </button>
                    <a href="' . Uri::base() . 'index.php?option=com_media&path=images/stpageflip" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary btn-sm">
                        <i class="bi bi-folder2-open"></i> ' . Text::_('PLG_CONTENT_STPAGEFLIP_OPEN_MEDIA_MANAGER') . '
                    </a>
                </div>
                <div class="stpageflip-conversion__progress">' . Text::_('PLG_CONTENT_STPAGEFLIP_READY') . '</div>
                <div class="stpageflip-conversion__book-list">' . $this->renderBookTable($books) . '</div>
                <ul class="stpageflip-conversion__results list-group mt-2"></ul>
            </div>
        ';
    }

    private function renderBookTable(array $books): string
    {
        if ($books === []) {
            return '<p class="text-muted small mt-2">' . htmlspecialchars(Text::_('PLG_CONTENT_STPAGEFLIP_NO_BOOKS'), \ENT_QUOTES) . '</p>';
        }

        $statusMap = [
            'complete'            => ['icon' => 'bi-check-circle-fill text-success',       'label' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_COMPLETE')],
            'images_only'         => ['icon' => 'bi-images text-info',                     'label' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_IMAGES_ONLY')],
            'conversion_required' => ['icon' => 'bi-file-earmark-pdf text-warning',        'label' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_CONVERSION_REQUIRED')],
            'multiple_pdfs'       => ['icon' => 'bi-exclamation-triangle-fill text-danger', 'label' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_MULTIPLE_PDFS')],
            'empty'               => ['icon' => 'bi-folder text-secondary',                'label' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_EMPTY')],
            'invalid'             => ['icon' => 'bi-x-circle-fill text-danger',            'label' => Text::_('PLG_CONTENT_STPAGEFLIP_STATUS_INVALID')],
        ];

        $html  = '<table class="table table-sm table-striped stpageflip-book-list mt-0 mb-0">';
        $html .= '<thead class="table-light"><tr>';
        $html .= '<th class="fw-semibold">' . Text::_('PLG_CONTENT_STPAGEFLIP_COL_FOLDER') . '</th>';
        $html .= '<th class="fw-semibold">' . Text::_('PLG_CONTENT_STPAGEFLIP_COL_STATUS') . '</th>';
        $html .= '<th class="fw-semibold text-end">' . Text::_('PLG_CONTENT_STPAGEFLIP_COL_IMAGES') . '</th>';
        $html .= '<th class="fw-semibold">' . Text::_('PLG_CONTENT_STPAGEFLIP_COL_PDF') . '</th>';
        $html .= '</tr></thead><tbody>';

        foreach ($books as $book) {
            $status = $book['status'] ?? 'invalid';
            $sc     = $statusMap[$status] ?? $statusMap['invalid'];
            $pdf    = !empty($book['pdfFile'])
                ? htmlspecialchars($book['pdfFile'], \ENT_QUOTES)
                : '<span class="text-muted">–</span>';

            $html .= '<tr>';
            $html .= '<td><code>' . htmlspecialchars($book['folder'], \ENT_QUOTES) . '</code></td>';
            $html .= '<td><i class="bi ' . $sc['icon'] . '"></i> ' . htmlspecialchars($sc['label'], \ENT_QUOTES) . '</td>';
            $html .= '<td class="text-end">' . (int) ($book['imageCount'] ?? 0) . '</td>';
            $html .= '<td>' . $pdf . '</td>';
            $html .= '</tr>';
        }

        $html .= '</tbody></table>';

        return $html;
    }
}
