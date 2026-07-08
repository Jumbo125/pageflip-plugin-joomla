<?php

namespace Joomla\Plugin\Content\Stpageflip\Service;

\defined('_JEXEC') or die;

final class PlaceholderDefaults
{
    public const DEFAULTS = [
        'id' => '',
        'img' => '',
        'pdf' => '',
        'width' => 'false',
        'height' => 'false',
        'responsive' => 'true',
        'din_format' => 'not_use',
        'aspect_ratio' => '0.707',
        'density' => 'soft',
        'center-single' => 'false',
        'color' => '#333',
        'hover' => '#c00',
        'reflection' => 'false',
        'tooltip' => 'true',
        'transform' => 'true',
        'inside-button' => 'false',
        'mousewheel-scroll' => 'false',
        'slider' => 'true',
        'bt-options' => 'true',
        'home' => 'true',
        'download' => 'true',
        'prev' => 'true',
        'next' => 'true',
        'zoom-in' => 'true',
        'zoom-out' => 'true',
        'zoom-default' => 'true',
        'zoom-dblclick' => 'false',
        'fullscreen' => 'true',
        'sound' => 'false',
        'mute' => 'true',
    ];

    private const BOOLEAN_KEYS = [
        'responsive',
        'center-single',
        'reflection',
        'tooltip',
        'transform',
        'inside-button',
        'mousewheel-scroll',
        'slider',
        'bt-options',
        'home',
        'download',
        'prev',
        'next',
        'zoom-in',
        'zoom-out',
        'zoom-default',
        'zoom-dblclick',
        'fullscreen',
        'sound',
        'mute',
    ];

    private const NUMERIC_KEYS = [
        'width',
        'height',
        'aspect_ratio',
    ];

    public static function getDefaults(): array
    {
        return self::DEFAULTS;
    }

    public static function getKnownKeys(): array
    {
        return array_keys(self::DEFAULTS);
    }

    public static function merge(array $attributes): array
    {
        $merged = self::DEFAULTS;

        foreach ($attributes as $key => $value) {
            if (!array_key_exists($key, self::DEFAULTS)) {
                continue;
            }

            $merged[$key] = self::sanitizeValue($key, $value);
        }

        if ($merged['pdf'] === '') {
            $merged['pdf'] = (string) $merged['img'];
        }

        if (array_key_exists('sound', $attributes)) {
            $merged['sound'] = self::boolToString(self::toBool($attributes['sound'], self::toBool(self::DEFAULTS['sound'])));
        } elseif (array_key_exists('mute', $attributes)) {
            $merged['sound'] = self::boolToString(!self::toBool($attributes['mute'], self::toBool(self::DEFAULTS['mute'])));
        }

        $soundEnabled = self::toBool($merged['sound'], false);
        $merged['mute'] = self::boolToString(!$soundEnabled);

        if ($merged['responsive'] === 'true') {
            $merged['width'] = 'responsive';
        }

        $merged['id'] = self::sanitizeHtmlId((string) ($merged['id'] ?: self::generateHtmlId((string) $merged['img'])));
        $merged['img'] = self::sanitizeFolderName((string) $merged['img']);
        $merged['pdf'] = self::sanitizeFolderName((string) $merged['pdf']);

        return $merged;
    }

    public static function sanitizeFolderName(string $folder): string
    {
        return trim($folder);
    }

    public static function sanitizeHtmlId(string $id): string
    {
        $id = trim($id);
        $id = preg_replace('/[^A-Za-z0-9\-_:.]+/', '-', $id) ?? '';
        $id = trim($id, '-');

        if ($id === '' || !preg_match('/^[A-Za-z]/', $id)) {
            $id = 'b' . ($id !== '' ? '-' . $id : '');
        }

        return $id;
    }

    public static function generateHtmlId(string $folder): string
    {
        $base = self::sanitizeHtmlId($folder !== '' ? $folder : 'book');
        $suffix = substr(bin2hex(random_bytes(4)), 0, 6);

        return $base . '-' . $suffix;
    }

    public static function buildPlaceholder(array $attributes): string
    {
        $attributes = self::merge($attributes);
        $lines = ['[book'];

        foreach (self::getKnownKeys() as $key) {
            $value = $attributes[$key] ?? self::DEFAULTS[$key];
            $lines[] = ' ' . $key . '="' . htmlspecialchars((string) $value, \ENT_QUOTES) . '"';
        }

        $lines[] = ']';

        return implode("\n", $lines);
    }

    public static function boolToString(bool $value): string
    {
        return $value ? 'true' : 'false';
    }

    public static function toBool($value, ?bool $fallback = null): bool
    {
        if (\is_bool($value)) {
            return $value;
        }

        if (\is_int($value) || \is_float($value)) {
            return (int) $value !== 0;
        }

        $normalized = strtolower(trim((string) $value));

        if ($normalized === '') {
            return $fallback ?? false;
        }

        if (\in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }

        if (\in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return false;
        }

        return $fallback ?? false;
    }

    private static function sanitizeValue(string $key, $value): string
    {
        if (\in_array($key, self::BOOLEAN_KEYS, true)) {
            return self::boolToString(self::toBool($value, self::toBool(self::DEFAULTS[$key])));
        }

        if (\in_array($key, self::NUMERIC_KEYS, true)) {
            return self::sanitizeNumeric($key, (string) $value);
        }

        if ($key === 'id') {
            return self::sanitizeHtmlId((string) $value);
        }

        if ($key === 'color' || $key === 'hover') {
            return self::sanitizeColor((string) $value, self::DEFAULTS[$key]);
        }

        return trim((string) $value);
    }

    private static function sanitizeNumeric(string $key, string $value): string
    {
        $value = trim($value);

        if ($key === 'width' && strtolower($value) === 'responsive') {
            return 'responsive';
        }

        if ($value === '' || strtolower($value) === 'false') {
            return 'false';
        }

        if (!is_numeric($value)) {
            return self::DEFAULTS[$key];
        }

        $number = (float) $value;

        if ($key === 'aspect_ratio') {
            if ($number <= 0.1 || $number > 10) {
                return self::DEFAULTS[$key];
            }

            return rtrim(rtrim(number_format($number, 4, '.', ''), '0'), '.');
        }

        $number = max(1, min(5000, $number));

        return (string) (int) round($number);
    }

    private static function sanitizeColor(string $value, string $fallback): string
    {
        $value = trim($value);

        if ($value === '') {
            return $fallback;
        }

        if (preg_match('/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $value)) {
            return $value;
        }

        if (preg_match('/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/', $value)) {
            return $value;
        }

        return $fallback;
    }
}
