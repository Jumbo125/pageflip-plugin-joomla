<?php

namespace Joomla\Plugin\EditorsXtd\Stpageflip\Extension;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Session\Session;
use Joomla\CMS\Uri\Uri;
use Joomla\CMS\Object\CMSObject;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\Plugin\Content\Stpageflip\Service\PlaceholderDefaults;

final class Stpageflip extends CMSPlugin
{
    protected $autoloadLanguage = true;

    public function onDisplay($name)
    {
        $app = Factory::getApplication();
        $app->getLanguage()->load('plg_editorsxtd_stpageflip', JPATH_SITE)
            || $app->getLanguage()->load('plg_editorsxtd_stpageflip', JPATH_PLUGINS . '/editors-xtd/stpageflip');

        $document = $app->getDocument();
        $mediaUrl  = Uri::root() . 'media/plg_editorsxtd_stpageflip/';
        $document->addStyleSheet($mediaUrl . 'stpageflip-editor-button.css');
        $document->addScript($mediaUrl . 'stpageflip-editor-button.js');
        HTMLHelper::_('bootstrap.framework');

        $config = [
            'editor' => $name,
            'ajaxUrl' => Uri::base() . 'index.php?option=com_ajax&plugin=stpageflip&group=ajax&format=json',
            'token'   => Session::getFormToken(),
            'defaults' => PlaceholderDefaults::getDefaults(),
            'texts' => [
                'title' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_SELECT_BOOK'),
                'insert' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_INSERT'),
                'notInsertable' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_NOT_INSERTABLE'),
                'pdf' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_PDF'),
                'pages' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_PAGES'),
                'status' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_STATUS'),
                'loadError' => Text::_('PLG_EDITORSXTD_STPAGEFLIP_LOAD_ERROR'),
            ],
        ];

        $document->addScriptDeclaration(
            'window.StPageFlipEditorButtonConfig = ' . json_encode($config, \JSON_UNESCAPED_SLASHES | \JSON_UNESCAPED_UNICODE) . ';'
        );

        $button = new CMSObject();
        $button->class = 'btn';
        $button->text = Text::_('PLG_EDITORSXTD_STPAGEFLIP_BUTTON');
        $button->name = 'book';
        $button->onclick = 'window.StPageFlipEditorButton && window.StPageFlipEditorButton.open("' . addslashes((string) $name) . '"); return false;';
        $button->icon = 'cube';

        return $button;
    }
}
