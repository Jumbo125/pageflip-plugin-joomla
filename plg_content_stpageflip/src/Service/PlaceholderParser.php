<?php

namespace Joomla\Plugin\Content\Stpageflip\Service;

\defined('_JEXEC') or die;

final class PlaceholderParser
{
    public const SHORTCODE_PATTERN = '/\[book\b([^\]]*)\]/iu';

    public function findAll(string $content): array
    {
        preg_match_all(self::SHORTCODE_PATTERN, $content, $matches, \PREG_SET_ORDER);

        return $matches;
    }

    public function parse(string $rawAttributes): array
    {
        $attributes = [];
        $pattern = '/([A-Za-z][A-Za-z0-9\-]*)\s*=\s*(?:"([^"]*)"|\'([^\']*)\')/u';

        preg_match_all($pattern, html_entity_decode($rawAttributes, \ENT_QUOTES | \ENT_HTML5), $matches, \PREG_SET_ORDER);

        foreach ($matches as $match) {
            $key = $match[1];
            $value = $match[2] !== '' ? $match[2] : $match[3];

            if (!\in_array($key, PlaceholderDefaults::getKnownKeys(), true)) {
                continue;
            }

            $attributes[$key] = $value;
        }

        return PlaceholderDefaults::merge($attributes);
    }
}
