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
defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Filesystem\Folder;
use Joomla\CMS\Installer\InstallerAdapter;
use Joomla\CMS\Installer\InstallerScriptInterface;
use Joomla\CMS\Language\Text;

return new class () implements InstallerScriptInterface {

    private string $minimumJoomla = '4.4.0';
    private string $minimumPhp    = '7.4.0';

    public function install(InstallerAdapter $adapter): bool
    {
        $this->createImageFolder();
        return true;
    }

    public function update(InstallerAdapter $adapter): bool
    {
        $this->createImageFolder();
        return true;
    }

    public function uninstall(InstallerAdapter $adapter): bool
    {
        return true;
    }

    public function preflight(string $type, InstallerAdapter $adapter): bool
    {
        if (version_compare(PHP_VERSION, $this->minimumPhp, '<')) {
            Factory::getApplication()->enqueueMessage(sprintf(Text::_('JLIB_INSTALLER_MINIMUM_PHP'), $this->minimumPhp), 'error');
            return false;
        }

        if (version_compare(JVERSION, $this->minimumJoomla, '<')) {
            Factory::getApplication()->enqueueMessage(sprintf(Text::_('JLIB_INSTALLER_MINIMUM_JOOMLA'), $this->minimumJoomla), 'error');
            return false;
        }

        return true;
    }

    public function postflight(string $type, InstallerAdapter $adapter): bool
    {
        return true;
    }

    private function createImageFolder(): void
    {
        $folder = JPATH_ROOT . '/images/stpageflip';

        if (!Folder::exists($folder)) {
            if (Folder::create($folder)) {
                Factory::getApplication()->enqueueMessage('📁 Folder "/images/stpageflip" has been created.', 'message');
            } else {
                Factory::getApplication()->enqueueMessage('❌ Failed to create folder "/images/stpageflip". Please check permissions.', 'error');
            }
        } else {
            Factory::getApplication()->enqueueMessage('✅ Folder "/images/stpageflip" already exists.', 'message');
        }
    }
};
