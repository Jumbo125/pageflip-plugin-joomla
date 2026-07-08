<?php

defined('_JEXEC') or die;

use Joomla\CMS\Extension\PluginInterface;
use Joomla\CMS\Factory;
use Joomla\CMS\Plugin\PluginHelper;
use Joomla\DI\Container;
use Joomla\DI\ServiceProviderInterface;
use Joomla\Event\DispatcherInterface;
use Joomla\Plugin\Ajax\Stpageflip\Extension\Stpageflip;

return new class implements ServiceProviderInterface {
    public function register(Container $container): void
    {
        \JLoader::registerNamespace(
            'Joomla\\Plugin\\Content\\Stpageflip',
            JPATH_PLUGINS . '/content/stpageflip/src',
            false,
            false,
            'psr4'
        );

        $container->set(
            PluginInterface::class,
            function (Container $container) {
                $config = (array) PluginHelper::getPlugin('ajax', 'stpageflip');
                $dispatcher = $container->get(DispatcherInterface::class);
                $plugin = new Stpageflip($dispatcher, $config);
                $plugin->setApplication(Factory::getApplication());

                return $plugin;
            }
        );
    }
};
