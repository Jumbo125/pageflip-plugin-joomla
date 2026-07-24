<?php

namespace Joomla\Plugin\Content\Stpageflip\Extension;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;
use Joomla\Event\Event;
use Joomla\Event\SubscriberInterface;
use Joomla\Plugin\Content\Stpageflip\Service\BookDirectoryService;
use Joomla\Plugin\Content\Stpageflip\Service\PlaceholderDefaults;
use Joomla\Plugin\Content\Stpageflip\Service\PlaceholderParser;

final class Stpageflip extends CMSPlugin implements SubscriberInterface
{
    protected $autoloadLanguage = true;

    private static bool $debugInputRendered = false;
    private static bool $assetsLoaded = false;
    private static bool $stylesLoaded = false;

    private ?PlaceholderParser $placeholderParser = null;
    private ?BookDirectoryService $bookDirectoryService = null;

    public static function getSubscribedEvents(): array
    {
        return [
            'onContentPrepare' => 'onContentPrepare',
            'onAfterDispatch'  => 'onAfterDispatch',
        ];
    }

    public function onAfterDispatch(): void
    {
        $app = Factory::getApplication();

        if (!$app->isClient('site')) {
            return;
        }

        $document = $app->getDocument();

        if ($document->getType() !== 'html') {
            return;
        }

        $this->loadStyles();
    }

    public function onContentPrepare(Event $event): void
    {
        $article = $event->getArgument('subject');
        $property = $this->detectTextProperty($article);

        if ($property === null || trim((string) $article->{$property}) === '') {
            return;
        }

        $matches = $this->getPlaceholderParser()->findAll((string) $article->{$property});

        if ($matches === []) {
            return;
        }

        $this->loadAssets();

        $article->{$property} = preg_replace_callback(
            PlaceholderParser::SHORTCODE_PATTERN,
            fn(array $match): string => $this->renderBookPlaceholder($match[1] ?? ''),
            (string) $article->{$property}
        );

        if (!self::$debugInputRendered) {
            $article->{$property} .= '<input type="hidden" id="stpageflip_debug" value="' . ($this->isDebugMode() ? 'true' : 'false') . '">';
            self::$debugInputRendered = true;
        }
    }

    private function renderBookPlaceholder(string $rawAttributes): string
    {
        $attributes = $this->getPlaceholderParser()->parse($rawAttributes);

        if ($attributes['img'] === '') {
            return $this->renderDebugMessage(Text::_('PLG_CONTENT_STPAGEFLIP_INVALID_FOLDER'));
        }

        $book = $this->getBookDirectoryService()->resolveFrontendBook($attributes['img'], $attributes['pdf']);

        if ($book['imageDirectory'] === null) {
            return $this->renderDebugMessage(Text::sprintf('PLG_CONTENT_STPAGEFLIP_FOLDER_NOT_FOUND', $attributes['img']));
        }

        if ($book['pdfFile'] === null) {
            $attributes['download'] = 'false';
        }

        $dataAttributes = [
            'base-path' => Uri::root() . 'plugins/content/stpageflip/',
            'pdf-src' => $book['pdfUrl'] ?? '',
            'img-src' => $book['imageUrl'] ?? '',
        ];

        foreach (PlaceholderDefaults::getKnownKeys() as $key) {
            if ($key === 'id') {
                continue;
            }

            $dataKey = $key === 'hover' ? 'color-hover' : $key;
            $dataAttributes[$dataKey] = (string) $attributes[$key];
        }

        $html = '<div id="' . htmlspecialchars($attributes['id'], \ENT_QUOTES) . '" class="flip-book ui-flipbook"';

        foreach ($dataAttributes as $name => $value) {
            $html .= ' data-' . htmlspecialchars($name, \ENT_QUOTES) . '="' . htmlspecialchars($value, \ENT_QUOTES) . '"';
        }

        $html .= '></div>';
        $html .= $this->renderBookDataInput($attributes['id'], $book);

        if ($this->isDebugMode() && count($book['pdfFiles']) > 1) {
            $html .= '<p class="alert alert-warning">' . htmlspecialchars(Text::_('PLG_CONTENT_STPAGEFLIP_MULTIPLE_PDFS_FRONTEND'), \ENT_QUOTES) . '</p>';
        }

        return $html;
    }

    private function renderBookDataInput(string $bookId, array $book): string
    {
        if ($book['images'] === []) {
            $langKey = !empty($book['pdfFile'])
                ? 'PLG_CONTENT_STPAGEFLIP_NO_IMAGES_PDF_NOT_CONVERTED'
                : 'PLG_CONTENT_STPAGEFLIP_NO_IMAGES_IN_FOLDER';

            return '<p class="alert alert-warning">' . htmlspecialchars(Text::sprintf($langKey, $book['imageFolder']), \ENT_QUOTES) . '</p>';
        }

        $attributes = [
            'id' => $bookId . '_img_files',
            'type' => 'hidden',
            'value' => implode(',', $book['images']),
            'data-img-path' => $book['imageUrl'] ?? '',
        ];

        if (!empty($book['pdfUrl'])) {
            $attributes['data-pdf-src'] = $book['pdfUrl'];
        }

        $html = '<input';

        foreach ($attributes as $name => $value) {
            $html .= ' ' . $name . '="' . htmlspecialchars((string) $value, \ENT_QUOTES) . '"';
        }

        $html .= '>';

        return $html;
    }

    private function detectTextProperty($article): ?string
    {
        if (!\is_object($article)) {
            return null;
        }

        foreach (['text', 'product_desc', 'product_s_desc'] as $property) {
            if (isset($article->{$property})) {
                return $property;
            }
        }

        return null;
    }

    private function loadAssets(): void
    {
        if (self::$assetsLoaded) {
            return;
        }

        self::$assetsLoaded = true;

        $wa = Factory::getApplication()->getDocument()->getWebAssetManager();

        $this->loadStyles();

        if ($this->params->get('load_jquery', 0)) {
            $wa->useScript('jquery');
        }

        $base = 'media/plg_content_stpageflip/';

        $wa->registerAndUseScript('pageflip_main', $base . 'js/page-flip.browser.modif.min.js', [], [], ['jquery']);
        $wa->registerAndUseScript('pageflip_controll_panzoom', $base . 'js/panzoom.min.js');

        if ($this->params->get('load_jqueryui', 1)) {
            $wa->registerAndUseScript('pageflip_jquery_ui_draggable', $base . 'js/jquery_ui_draggable.min.js', [], [], ['jquery']);
        }

        $wa->registerAndUseScript('pageflip_controll_pageflip', $base . 'js/page-flip_controll.js', [], [], ['jquery', 'pageflip_main']);
    }

    private function loadStyles(): void
    {
        if (self::$stylesLoaded) {
            return;
        }

        self::$stylesLoaded = true;

        $wa   = Factory::getApplication()->getDocument()->getWebAssetManager();
        $base = 'media/plg_content_stpageflip/';

        $wa->registerAndUseStyle('pageflip_original', $base . 'css/stPageFlip.css');
        $wa->registerAndUseStyle('pageflip_custom', $base . 'css/custom.css');

        if ($this->params->get('load_bootstrap', 0)) {
            $wa->registerAndUseStyle('pageflip_bootstrap', $base . 'css/bootstrap.css');
        }

        if ($this->params->get('load_bootstrap_icons', 1)) {
            $wa->registerAndUseStyle('pageflip_bootstrap_ico', $base . 'css/bootstrap_ico/bootstrap-icons.css');
        }
    }

    private function renderDebugMessage(string $message): string
    {
        if (!$this->isDebugMode()) {
            return '';
        }

        return '<p class="alert alert-warning">' . htmlspecialchars($message, \ENT_QUOTES) . '</p>';
    }

    private function isDebugMode(): bool
    {
        return (bool) $this->params->get('debug_mode', 0);
    }

    private function getPlaceholderParser(): PlaceholderParser
    {
        return $this->placeholderParser ??= new PlaceholderParser();
    }

    private function getBookDirectoryService(): BookDirectoryService
    {
        return $this->bookDirectoryService ??= new BookDirectoryService();
    }
}
