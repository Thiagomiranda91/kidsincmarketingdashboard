<?php
/**
 * Flamingo API Bridge — functions.php version
 *
 * Exposes recent Flamingo (Contact Form 7) submissions via a secured,
 * read-only REST API endpoint, for use by the marketing dashboard.
 * Requires the Flamingo plugin to be active.
 *
 * Paste everything below this comment block into your theme's functions.php.
 */

// Replace this with a long random string (generate one with: openssl rand -hex 32).
// This must match the FLAMINGO_API_KEY env var set on Vercel, exactly.
// If you ever get access to wp-config.php, you can instead define
// FLAMINGO_BRIDGE_API_KEY there and delete this block — the check below
// already prefers wp-config.php's value when present.
if (!defined('FLAMINGO_BRIDGE_API_KEY')) {
    define('FLAMINGO_BRIDGE_API_KEY', 'replace-with-a-long-random-string');
}

add_action('rest_api_init', function () {
    register_rest_route('flamingo-bridge/v1', '/messages', [
        'methods'             => 'GET',
        'callback'            => 'flamingo_bridge_get_messages',
        'permission_callback' => 'flamingo_bridge_check_api_key',
    ]);
});

if (!function_exists('flamingo_bridge_check_api_key')) {
    function flamingo_bridge_check_api_key(WP_REST_Request $request)
    {
        $provided = $request->get_header('x-api-key');
        $expected = defined('FLAMINGO_BRIDGE_API_KEY') ? FLAMINGO_BRIDGE_API_KEY : '';

        if (!$expected || $expected === 'replace-with-a-long-random-string') {
            return new WP_Error(
                'flamingo_bridge_not_configured',
                'FLAMINGO_BRIDGE_API_KEY has not been set to a real value yet.',
                ['status' => 500]
            );
        }

        if (!$provided || !hash_equals($expected, $provided)) {
            return new WP_Error(
                'flamingo_bridge_unauthorized',
                'Invalid or missing API key.',
                ['status' => 401]
            );
        }

        return true;
    }
}

if (!function_exists('flamingo_bridge_get_messages')) {
    function flamingo_bridge_get_messages(WP_REST_Request $request)
    {
        if (!class_exists('Flamingo_Inbound_Message')) {
            return new WP_Error(
                'flamingo_not_active',
                'The Flamingo plugin is not active on this site.',
                ['status' => 500]
            );
        }

        $limit = (int) $request->get_param('limit');
        if ($limit <= 0 || $limit > 100) {
            $limit = 20;
        }

        $query = new WP_Query([
            'post_type'      => 'flamingo_inbound',
            'post_status'    => 'publish', // excludes spam and trashed messages
            'posts_per_page' => $limit,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ]);

        $messages = [];

        foreach ($query->posts as $post) {
            $messages[] = [
                'id'        => $post->ID,
                'date'      => get_post_time('c', true, $post),
                'fromName'  => get_post_meta($post->ID, '_from_name', true),
                'fromEmail' => get_post_meta($post->ID, '_from', true),
                'subject'   => get_post_meta($post->ID, '_subject', true),
                'message'   => wp_strip_all_tags($post->post_content),
            ];
        }

        return rest_ensure_response($messages);
    }
}
