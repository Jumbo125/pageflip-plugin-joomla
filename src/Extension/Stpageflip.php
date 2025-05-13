<?php
namespace Joomla\Plugin\Content\Stpageflip\Extension;

\defined('_JEXEC') or die;

use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Factory;
use Joomla\Event\Event;
use Joomla\CMS\Uri\Uri;
use Joomla\Event\SubscriberInterface;

class Stpageflip extends CMSPlugin implements SubscriberInterface
{
    private function parseAttributes(string $string): array
    {
        $string = html_entity_decode($string, ENT_QUOTES);
        $attrs = [];
        preg_match_all('/([\w\-]+)\s*=\s*"([^"]*)"/', $string, $matches, PREG_SET_ORDER);
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

    public static function getSubscribedEvents(): array
    {
        return [
            'onContentPrepare' => 'handleBookShortcodes',
        ];
    }

    public function handleBookShortcodes(Event $event)
    {
        //Factory::getApplication()->enqueueMessage('onContentPrepare läuft');
        // Prüfen, ob Debug-Modus aktiviert ist
          
        // Debug-Hidden-Input vorbereiten    
      
               
        if ($this->params->get('debug_mode', 0)) {
            $debugInput = '<input type="hidden" id="stpageflip_debug" value="true">';
            $debug_mode = true; 
        }
        else{
            $debugInput = '<input type="hidden" id="stpageflip_debug" value="false">';  
            $debug_mode = false;
        }
        if (count($event->getArguments()) < 4) {
            return;
        }

        [$context, $article, $params, $page] = array_values($event->getArguments());

        if (!is_object($article) || empty($article->text)) {
            return;
        }
        if (!isset($article->id) || !isset($article->alias)) {
            return;
        }
        
        //Debugg modus einfuegen
        // Debug-Input an den Artikel anhängen (frühzeitig)
           $article->text .= $debugInput;

         // Plugin läuft, aber tut nichts
        //Factory::getApplication()->enqueueMessage('Stpageflip Plugin: Testlauf');
        
    
    $regex = '/\[book([^\]]*)\]/i';
        $hasBookTag = false;
        $firstMatch = [];

        if (preg_match_all($regex, $article->text, $matches, PREG_SET_ORDER)) {
            $hasBookTag = true;

            // Nur den ersten Tag zur Pfadermittlung nutzen
            $firstMatch = $this->parseAttributes($matches[0][1]);

            foreach ($matches as $match) {
                $attributes = $this->parseAttributes($match[1]);
                $html = $this->generateBookHtml($attributes);
                $article->text = str_replace($match[0], $html, $article->text);
            }
        } else {
            // Kein gültiger [book]-Tag? → Abbrechen
            return;
        }

        // Assets laden nur einmal
        $doc = Factory::getApplication()->getDocument();
        $base = Uri::root() . 'plugins/content/stpageflip/js/';
        $cssBase = Uri::root() . 'plugins/content/stpageflip/css/';


        $doc->addStyleSheet($cssBase . 'stPageFlip.css');
        $doc->addStyleSheet($cssBase . 'custom.css');


        if ($this->params->get('load_bootstrap', 0)) {
            $doc->addStyleSheet($cssBase . 'bootstrap.css');
            if ($debug_mode == true){
                $article->text .= "<p class='alert alert-info'>bootstrap.css eingebunden</p>";
            }
        }
        else{
              if ($debug_mode == true){
                $article->text .= "<p class='alert alert-danger'>bootstrap.css NICHT eingebunden</p>";
              }
        }

        if ($this->params->get('load_bootstrap_icons', 1)) {
            $doc->addStyleSheet($cssBase . 'bootstrap_ico/bootstrap-icons.css');
             if ($debug_mode == true){
                $article->text .= "<p class='alert alert-info'>bootstrap-icons.css eingebunden</p>";
            }
          }
        else{
              if ($debug_mode == true){
                $article->text .= "<p class='alert alert-danger'>bootstrap-icons.css NICHT eingebunden</p>";
              }
        }

        if ($this->params->get('load_jquery', 0)) {
            $doc->addScript($base . 'jquery.js', ['version' => 'auto'], ['defer' => true]);
             if ($debug_mode == true){
                $article->text .= "<p class='alert alert-info'>jquery.js eingebunden</p>";
            }
        }
        else{
              if ($debug_mode == true){
                $article->text .= "<p class='alert alert-danger'>jquery.js NICHT eingebunden</p>";
              }
        }

        if ($this->params->get('load_jqueryui', 1)) {
            $doc->addScript($base . 'jquery_ui_draggable.min.js', ['version' => 'auto'], ['defer' => true]);
               if ($debug_mode == true){
                    $article->text .= "<p class='alert alert-info'>jquery_ui_draggable.min.js eingebunden</p>";
                }
        }
        else{
              if ($debug_mode == true){
                $article->text .= "<p class='alert alert-danger'>jquery_ui_draggable.min.js NICHT eingebunden</p>";
              }
        }

        $doc->addScript($base . 'panzoom.min.js', ['version' => 'auto'], ['defer' => true]);
        $doc->addScript($base . 'page-flip.browser.modif.min.js', ['version' => 'auto'], ['defer' => true]);
        $doc->addScript($base . 'page-flip_controll.js', ['version' => 'auto'], ['defer' => true]);


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
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'bmp'])) {
                        $imageFiles[] = $file;
                    }
                }
                   if ($debug_mode == true){
                         $article->text .= "<p class='alert alert-info'>IMG Ordner gefunden: " . $imgFolder . " </p>";
                    }
            }
            else{
                //Factory::getApplication()->enqueueMessage('Img Ordner nicht gefunden');
                 if ($debug_mode == true){
                         $article->text .= "<p class='alert alert-danger'>IMG Ordner NICHT gefunden: " . $imgFolder . " </p>";
                    }
            }
        
            if (is_dir($pdfFolder)) {
                foreach (scandir($pdfFolder) as $file) {
                    if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'pdf') {
                        $pdfFiles[] = $file;
                    }
                }
                   if ($debug_mode == true){
                        $article->text .= "<p class='alert alert-info'>PDF Ordner gefunden: " . $pdfFolder . " </p>";
                    }
            }
            else{
                    if ($debug_mode == true){           
                        $article->text .= "<p class='alert alert-danger'>PDF Ordner NICHT gefunden: " . $pdfFolder . ". Der Ordner muss in " .JPATH_ROOT . "/images/stpageflip/ liegen </p>";
                    }
            }
        
            if (!empty($imageFiles) || !empty($pdfFiles)) {
                $fileList = implode(',', $imageFiles);
                $pdfList = implode(',', $pdfFiles);
        
                //Factory::getApplication()->enqueueMessage('create input: id="' . $bookId . '"');
                 
                    

                $inputHtml = '<input id="' . htmlspecialchars($bookId . '_img_files', ENT_QUOTES) . '" type="hidden" value="' . htmlspecialchars($fileList, ENT_QUOTES) . '"';
                
                     if ($debug_mode == true){           
                        $article->text .= "<p class='alert alert-info'>verstecktes input tag eingefügt, mit den werten <br> id='" . htmlspecialchars($bookId . "_img_files", ENT_QUOTES)  . " type='hidden' value='" . htmlspecialchars($fileList, ENT_QUOTES) . "'</p>";
                    }

                if (!empty($pdfList)) {
                    $inputHtml .= ' data-pdf-src="' . htmlspecialchars($pdfList, ENT_QUOTES) . '"';
                    $inputHtml .= ' data-pdf-path="' . htmlspecialchars('/images/stpageflip/' . trim($attrs['pdf'], '/') , ENT_QUOTES) . '"';
                    if ($debug_mode == true){
                        $article->text .= "<p class='alert alert-info'>Gefundene PDFs: " . $pdfList . " </p>";
                    }
                }
                else{
                     if ($debug_mode == true){
                        $article->text .= "<p class='alert alert-danger'>KEINE gefundenen PDFs</p>";
                    }
                }
        
                if (!empty($fileList)) {
                    $inputHtml .= ' data-img-path="' . htmlspecialchars('/images/stpageflip/' . trim($attrs['img'], '/') , ENT_QUOTES) . '"';
                    if ($debug_mode == true){
                        $article->text .= "<p class='alert alert-info'>Gefundene Bilder: " . $fileList . " </p>";
                    }
                }
                else{
                     if ($debug_mode == true){
                        $article->text .= "<p class='alert alert-danger'>KEINE BILDER gefunden</p>";
                    }
                }
        
                $inputHtml .= '>';
                $article->text .= $inputHtml;
            }
        }
    }
}
