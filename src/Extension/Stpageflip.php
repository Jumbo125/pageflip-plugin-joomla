<?php

/**
 * @package     Joomla.Plugin
 * @subpackage  [PLUGIN_NAME]
 * @author      jumbo125
 * @copyright   Copyright (C) 2025 jumbo125. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 *
 * Fremde Skripte / Third-party libraries:
 * - Original library: StPageFlip, Copyright (c) 2020 Nodlik, https://github.com/Nodlik/StPageFlip
 * - Panzoom 4.6.0 for panning and zooming using CSS transforms, Copyright Timmy Willison and contributors
 * - Bootstrap 4 with Bootstrap Icons
 * - jQuery, jQuery UI
 */

namespace Joomla\Plugin\Content\Stpageflip\Extension;

// Sicherheitscheck
\defined('_JEXEC') or die;


use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Factory;
use Joomla\Event\Event;
use Joomla\CMS\Uri\Uri;
use Joomla\Event\SubscriberInterface;
use Joomla\CMS\Language\Text;
use Joomla\Filesystem\Folder;

class Stpageflip extends CMSPlugin
{
   private function parseAttributes(string $string): array
{
    if ($this->params->get('debug_mode', 0)) {
    Factory::getApplication()->enqueueMessage('🔍 parseAttributes() wurde aufgerufen');
    }

    $string = html_entity_decode($string, ENT_QUOTES);
    $attrs = [];

    preg_match_all('/([\w\-]+)\s*=\s*"([^"]*)"/', $string, $matches, PREG_SET_ORDER);
    if ($this->params->get('debug_mode', 0)) {
        if (!empty($matches)) {
            Factory::getApplication()->enqueueMessage('📘 Attribute gefunden: ' . count($matches));
        } else {
            Factory::getApplication()->enqueueMessage('⚠️ Keine Attribute im String: ' . $string);
        }
    }

    foreach ($matches as $m) {
        $attrs[$m[1]] = $m[2];
    }

    return $attrs;
}


    private function generateBookHtml(array $attrs): string
    {
        $basePath = Uri::root() . 'plugins/content/stpageflip/';
        //Factory::getApplication()->enqueueMessage('ATTRS: ' . print_r($attrs, true));

        $defaults = [
            'id' => $attrs['id'] ?? 'meinbuch',
            'pdf-src' => !empty($attrs['pdf']) ? Uri::root() . 'images/stpageflip/' . trim($attrs['pdf'], '/') . '/' : '',
            'img-src' => !empty($attrs['img']) ? Uri::root() . 'images/stpageflip/' . trim($attrs['img'], '/') . '/' : '',
            'color' => $attrs['color'] ?? '#333',
            'color-hover' => $attrs['hover'] ?? '#c00',
            'density' => 'soft',
            'center-single' => 'true',
            'mousewheel-scroll' => 'true',
            'slider' => 'true',
            'bt-options' => 'true',
            'home' => 'true',
            'download' => 'true',
            'prev' => 'true',
            'next' => 'true',
            'zoom-in' => 'true',
            'zoom-out' => 'true',
            'zoom-dblclick' => 'false',
            'zoom-default' => 'true',
            'fullscreen' => 'true',
            'reflection' => 'true',
            'tooltip' => 'false',
            'transform' => 'true',
            'inside-button' => 'true',
            'sound' => 'true',
        ];

        foreach ($attrs as $key => $val) {
            $defaults[$key] = $val;
        }

        $id = $defaults['id'];
        $html = '<div id="' . htmlspecialchars($id) . '" class="flip-book ui-flipbook"';
        $html .= ' data-base-path="' . $basePath . '"';

        foreach ($defaults as $key => $value) {
            if ($key !== 'id') {
                $html .= ' data-' . htmlspecialchars($key) . '="' . htmlspecialchars($value) . '"';
            }
        }

        $html .= '></div>';
        return $html;
    }

    /*
    public static function getSubscribedEvents(): array
    {
        return [
            'onContentPrepare' => 'handleBookShortcodes',
        ];
    }*/


    public function handleBookShortcodes(Event $event)
    {
        //Factory::getApplication()->enqueueMessage('onContentPrepare läuft');
        // Prüfen, ob Debug-Modus aktiviert ist

        // Debug-Hidden-Input vorbereiten    


        if ($this->params->get('debug_mode', 0)) {
            $debugInput = '<input type="hidden" id="stpageflip_debug" value="true">';
            $debug_mode = true;
        } else {
            $debugInput = '<input type="hidden" id="stpageflip_debug" value="false">';
            $debug_mode = false;
        }
        if (count($event->getArguments()) < 4) {
            return;
        }

        [$context, $article, $params, $page] = array_values($event->getArguments());

       if (!is_object($article)) {
            return;
        }

   if (isset($article->text)) {
    $textProperty = 'text';
} elseif (isset($article->product_desc)) {
    $textProperty = 'product_desc';
} elseif (isset($article->product_s_desc)) {
    $textProperty = 'product_s_desc';
} else {
    if ($this->params->get('debug_mode', 0)) {
        Factory::getApplication()->enqueueMessage('⚠️ Keine geeignete Text-Property gefunden.', 'warning');
        return;
    }
}

if (empty($article->{$textProperty})) {
    if ($this->params->get('debug_mode', 0)) {
        Factory::getApplication()->enqueueMessage('⚠️ Kein Inhalt in ' . $textProperty, 'warning');
        return;
    }
}


        //Debugg modus einfuegen
        // Debug-Input an den Artikel anhängen (frühzeitig)
        $article->{$textProperty} .= $debugInput;

        // Plugin läuft, aber tut nichts
        //Factory::getApplication()->enqueueMessage('Stpageflip Plugin: Testlauf');


        $regex = '/\[book([^\]]*)\]/i';
        $hasBookTag = false;
        $firstMatch = [];

        if (preg_match_all($regex, $article->{$textProperty}, $matches, PREG_SET_ORDER)) {
            $hasBookTag = true;

            // Nur den ersten Tag zur Pfadermittlung nutzen
            $firstMatch = $this->parseAttributes($matches[0][1]);

            foreach ($matches as $match) {
                $attributes = $this->parseAttributes($match[1]);
                $html = $this->generateBookHtml($attributes);
                $article->{$textProperty} = str_replace($match[0], $html, $article->{$textProperty});
            }
        } else {
            // Kein gültiger [book]-Tag? → Abbrechen
            return;
        }

        Factory::getApplication()->getLanguage()->load('plg_content_stpageflip', JPATH_BASE . "/plugins/content/stpageflip");

        $wa = Factory::getApplication()->getDocument()->getWebAssetManager();
        $wa = Factory::getApplication()->getDocument()->getWebAssetManager();
        $wa->getRegistry()->addRegistryFile('media/plg_content_stpageflip/joomla.asset.json');

        // Basis-Assets
        $wa->useScript('jquery');
        $wa->useAsset('style', 'pageflip_original');
        $wa->useAsset('style', 'pageflip_custom');
        $wa->useAsset('script', 'pageflip_main');
       $wa->useAsset('script', 'pageflip_controll_panzoom');

        // Optional Bootstrap
        if ($this->params->get('load_bootstrap', 0)) {
            $wa->useAsset('style', 'pageflip_bootstrap');
            if ($debug_mode) {
                $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_BOOTSTRAP_LOADED') . "</p>";
            }
        } else {
            if ($debug_mode) {
                $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_BOOTSTRAP_NOT_LOADED') . "</p>";
            }
        }

        // Optional Bootstrap Icons
        if ($this->params->get('load_bootstrap_icons', 1)) {
            $wa->useAsset('style', 'pageflip_bootstrap_ico');
            if ($debug_mode) {
                $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_ICONS_LOADED') . "</p>";
            }
        } else {
            if ($debug_mode) {
                $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_ICONS_NOT_LOADED') . "</p>";
            }
        }

        // Optional jQuery UI
        if ($this->params->get('load_jqueryui', 1)) {
            $wa->useAsset('script', 'pageflip_jquery_ui_draggable');
            if ($debug_mode) {
                $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_JQUERYUI_LOADED') . "</p>";
            }
        } else {
            if ($debug_mode) {
                $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_JQUERYUI_NOT_LOADED') . "</p>";
            }
        }

        $wa->useAsset('script', 'pageflip_controll_pageflip');


        // ------------------------------------------
        // Dateien nur beim ersten book verarbeiten
        // ------------------------------------------
        foreach ($matches as $match) {
            $attrs = $this->parseAttributes($match[1]);

            $bookId = isset($attrs['id']) && $attrs['id'] !== '' ? $attrs['id'] : uniqid('book_');
            $imgFolder =  JPATH_ROOT . '/images/stpageflip/' . trim($attrs['img'] ?? '', '/');

            $pdffolderName = trim($attrs['pdf'] ?? '', '/');

            if ($pdffolderName === '') {
                $pdffolderName = trim($attrs['img'] ?? '', '/');
            }

            $imgFolder =  JPATH_ROOT . '/images/stpageflip/' . trim($attrs['img'] ?? '', '/');
            $pdfFolder = JPATH_ROOT . '/images/stpageflip/' . $pdffolderName;

            $imageFiles = [];
            $pdfFiles = [];

            if (is_dir($imgFolder)) {
                foreach (scandir($imgFolder) as $file) {
                    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'JPG'])) {
                        $imageFiles[] = $file;
                    }
                }
                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMG_FOLDER_FOUND') . ": " . $imgFolder . " </p>";
                }
            } else {
                //Factory::getApplication()->enqueueMessage('Img Ordner nicht gefunden');
                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMG_FOLDER_NOT_FOUND') . ": " . $imgFolder . " </p>";
                }
            }

            if (is_dir($pdfFolder)) {
                foreach (scandir($pdfFolder) as $file) {
                    if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf') {
                        $pdfFiles[] = $file;
                    }
                }
                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_PDF_FOLDER_FOUND') . ": " . $pdfFolder . " </p>";
                }
            } else {
                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_PDF_FOLDER_NOT_FOUND') . ": " . $pdfFolder . ". " . Text::_('PLG_PAGEFLIP_DEBUG_FOLDER_HINT') . ": " . JPATH_ROOT . "/images/stpageflip/ </p>";
                }
            }

            //##################################################################################################
            //Falls keine Bilder vorhanden sind, jedoch aber ein Pdf, dann erstelle die bilder automatisch mit imgmagic
            if (empty($imageFiles) && !empty($pdfFiles)) {
                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-warning'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMG_FOLDER_PDF_NO_IMAGES') . ": " . $imgFolder . ". " . Text::_('PLG_PAGEFLIP_DEBUG_IMG_AUTOGENERATE') . "</p>";
                }
                if (!extension_loaded('imagick')) {
                    $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMAGICK_NOT_AVAILABLE') . "</p>";
                } else {
                    if ($debug_mode == true) {
                        $version = \Imagick::getVersion();
                        $article->{$textProperty} .= "<p class='alert alert-warning'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMAGICK_AVAILABLE') . ": " . $version['versionString'] . ". <br> " . Text::_('PLG_PAGEFLIP_DEBUG_AUTOGEN_POSSIBLE') . "<br> " . Text::_('PLG_PAGEFLIP_DEBUG_FIRST_PDF_USED') . "</p>";
                    }

                    //je nach XML DATEI------------------------------------
                    $createImages = (int) $this->params->get('create_img', 0);
                    if ($createImages && empty($imageFiles) && !empty($pdfFiles)) {

                        $article->{$textProperty} .= "<p class='alert alert-success'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMG_AUTOGEN_ENABLED') . "</p>";
                        //Bilder automatisch generieren --------------------------------------------------
                        $filename = $pdfFiles[0]; // PDF-Datei im gleichen Verzeichnis
                        $outputPrefix = 'seite_';         // Präfix für WebP-Dateien
                        $pdfPath =   $imgFolder . '/' . $filename;

                        if (!file_exists($pdfPath)) {
                            $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_PDF_NOT_FOUND') . ": " .  $pdfPath . "</p>";
                        } else {
                            try {
                                // Neue Imagick-Instanz mit dem PDF
                                $imagick = new \Imagick();
                                $imagick->setResolution(150, 150); // DPI – optional anpassen
                                $imagick->readImage($pdfPath);

                                $imagick->setImageFormat('webp');
                                $create_txt = "";
                                foreach ($imagick as $i => $page) {
                                    $page->setImageFormat('webp');
                                    $outputFile = $imgFolder . '/' . $outputPrefix . ($i + 1) . '.webp';
                                    $page->writeImage($outputFile);
                                    $create_txt .= "Seite " . ($i + 1) . " →" . $outputFile . " erstellt <br>";
                                    $imageFiles[$i] = $outputPrefix . ($i + 1) . '.webp';
                                    //erstelle bilder in img array ewinfügen

                                }
                                $article->{$textProperty} .= "<p class='alert alert-success'>" . $create_txt  . "</p>";

                                $imagick->clear();
                                $imagick->destroy();
                                $article->{$textProperty} .= "<p class='alert alert-success'>" . Text::_('PLG_PAGEFLIP_DEBUG_ALL_CONVERTED') . "</p>";
                            } catch (Exception $e) {
                                $article->{$textProperty} .= "<p class='alert alert-success'>" . Text::_('PLG_PAGEFLIP_DEBUG_ERROR') . ": " . $e->getMessage() . "</p>";
                            }
                        }
                    } else {
                        $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMG_AUTOGEN_DISABLED') . "</p>";
                    }
                }
            }


            if (!empty($imageFiles)) {

                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-success'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMAGES_PRESENT') . "</p>";
                }

                $fileList = implode(',', $imageFiles);

                $inputHtml = '<input id="' . htmlspecialchars($bookId . '_img_files', ENT_QUOTES) . '" type="hidden" value="' . htmlspecialchars($fileList, ENT_QUOTES) . '"';

                if ($debug_mode == true) {
                    $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_INPUT_TAG_INSERTED') . "<br> id='" . htmlspecialchars($bookId . "_img_files", ENT_QUOTES)  . "' type='hidden' value='" . htmlspecialchars($fileList, ENT_QUOTES) . "'</p>";
                }

                if (!empty($pdfList)) {
                    $pdfList = implode(',', $pdfFiles);
                    $inputHtml .= ' data-pdf-src="' . htmlspecialchars(Uri::root() . $pdfList, ENT_QUOTES) . '"';
                    $inputHtml .= ' data-pdf-path="' . htmlspecialchars(Uri::root() . $pdfFolder, ENT_QUOTES) . '"';
                    if ($debug_mode == true) {
                        $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_PDFS_FOUND') . ": " . $pdfList . " </p>";
                    }
                } else {
                    if ($debug_mode == true) {
                        $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_NO_PDFS') . "</p>";
                    }
                }

                if (!empty($fileList)) {
                    $inputHtml .= ' data-img-path="' . htmlspecialchars(Uri::root() . '/images/stpageflip/' . trim($attrs['img'], '/'), ENT_QUOTES) . '"';
                    if ($debug_mode == true) {
                        $article->{$textProperty} .= "<p class='alert alert-info'>" . Text::_('PLG_PAGEFLIP_DEBUG_IMAGES_FOUND') . ": " . $fileList . " </p>";
                    }
                } else {
                    if ($debug_mode == true) {
                        $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_NO_IMAGES') . "</p>";
                    }
                }

                $inputHtml .= '>';
                $article->{$textProperty} .= $inputHtml;
            } else {
                $article->{$textProperty} .= "<p class='alert alert-danger'>" . Text::_('PLG_PAGEFLIP_DEBUG_NO_IMG_FILES') . ": '/images/stpageflip/" . trim($attrs['img'], '/') . "/'</p>";
            }
        }
    }
public function onContentPrepare($context, &$article, &$params, $limit = 0)
{
    if ($debug_mode == true) {
        \Joomla\CMS\Factory::getApplication()->enqueueMessage('✅ Plugin-Methode onContentPrepare wurde aufgerufen.');
    }
    $event = new \Joomla\Event\Event(
        'onContentPrepare',
        [
            'context' => $context,
            'article' => &$article,
            'params' => &$params,
            'page' => $limit
        ]
    );

    $this->handleBookShortcodes($event);
}
}
