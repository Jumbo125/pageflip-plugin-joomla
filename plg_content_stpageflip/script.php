<?php
/**
 * @package     Joomla.Plugin
 * @subpackage  Content.Stpageflip
 * @author      jumbo125
 * @copyright   Copyright (C) 2025 jumbo125. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Installer\InstallerAdapter;
use Joomla\CMS\Installer\InstallerScriptInterface;
use Joomla\CMS\Language\Text;
use Joomla\Filesystem\Folder;

return new class () implements InstallerScriptInterface {
    private string $minimumJoomla = '4.4.0';
    private string $minimumPhp = '7.4.0';

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

        if (!is_dir($folder) && !Folder::create($folder)) {
            Factory::getApplication()->enqueueMessage('Failed to create folder "/images/stpageflip". Please check permissions.', 'error');
        }
    }
};
