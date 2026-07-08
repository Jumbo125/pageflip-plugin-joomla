<?php

namespace Joomla\Plugin\Ajax\Stpageflip\Extension;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\CMS\Session\Session;
use Joomla\Registry\Registry;
use Joomla\Plugin\Content\Stpageflip\Service\BookDirectoryService;
use Joomla\Plugin\Content\Stpageflip\Service\PdfConversionService;

final class Stpageflip extends CMSPlugin
{
    protected $autoloadLanguage = true;

    public function onAjaxStpageflip(): array
    {
        $app = Factory::getApplication();

        if (!$app->isClient('administrator')) {
            return ['success' => false, 'message' => Text::_('PLG_AJAX_STPAGEFLIP_ADMIN_ONLY')];
        }

        if (strtoupper($app->input->getMethod()) !== 'POST') {
            return ['success' => false, 'message' => Text::_('PLG_AJAX_STPAGEFLIP_POST_ONLY')];
        }

        if (!Session::checkToken('post')) {
            return ['success' => false, 'message' => Text::_('JINVALID_TOKEN')];
        }

        $user = $app->getIdentity();

        if (!$user || !$user->authorise('core.manage', 'com_plugins')) {
            return ['success' => false, 'message' => Text::_('JERROR_ALERTNOAUTHOR')];
        }

        $action = $app->input->post->getCmd('action');
        $bookDirectoryService = new BookDirectoryService();

        if ($action === 'scan') {
            return [
                'success' => true,
                'books' => $bookDirectoryService->listBooks(),
            ];
        }

        if ($action === 'convert') {
            $folder = $app->input->post->getString('folder');

            $contentPluginData = PluginHelper::getPlugin('content', 'stpageflip');
            $contentParams = new Registry($contentPluginData ? $contentPluginData->params : '{}');

            $options = [
                'format'  => $contentParams->get('conversion_format', 'webp'),
                'quality' => (int) $contentParams->get('conversion_quality', 85),
                'dpi'     => (int) $contentParams->get('conversion_dpi', 150),
            ];

            $service = new PdfConversionService($bookDirectoryService);

            return $service->convertBook($folder, $options);
        }

        return ['success' => false, 'message' => Text::_('PLG_AJAX_STPAGEFLIP_UNKNOWN_ACTION')];
    }
}
