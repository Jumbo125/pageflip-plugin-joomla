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

// Sicherheitscheck
defined('_JEXEC') or die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Joomla\Plugin\Content\Stpageflip\Extension\Stpageflip;

return new class implements ServiceProviderInterface {
    public function register(Container $container) {
        $container->set(
            PluginInterface::class,
            function (Container $container) {
                // ✅ Konfiguration aus Plugin laden!
                $config = (array) PluginHelper::getPlugin('content', 'stpageflip');
                $dispatcher = $container->get(DispatcherInterface::class);

                $plugin = new Stpageflip($dispatcher, $config);
                $plugin->setApplication(Factory::getApplication());

                return $plugin;
            }
        );
    }
};
