<?php
/**
 * Plugin Name: Flamingo API Bridge
 * Description: Exposes recent Flamingo (Contact Form 7) submissions via a secured, read-only REST API endpoint, for use by the marketing dashboard. Requires the Flamingo plugin to be active.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit; // no direct access
}

add_action('rest_api_init', function () {
    register_rest_route('flamingo-bridge/v1', '/messages', [
        'methods'             => 'GET',
        'callback'            => 'flamingo_bridge_get_messages',
        'permission_callback' => 'flamingo_bridge_check_api_key',
    ]);
});

/**
 * Checks the X-API-Key request header against a secret defined in wp-config.php.
 *
 * Add this line to wp-config.php (above the "That's all, stop editing!" line),
 * with your own long random string in place of the example value:
 *
 *   define('FLAMINGO_BRIDGE_API_KEY', 'replace-with-a-long-random-string');
 *
 * Defining it in wp-config.php (rather than in this file) keeps the real
 * secret out of anything that might get shared, copied, or version-controlled
 * alongside the plugin file.
 */
function flamingo_bridge_check_api_key(WP_REST_Request $request)
{
    $provided = $request->get_header('x-api-key');
    $expected = defined('FLAMINGO_BRIDGE_API_KEY') ? FLAMINGO_BRIDGE_API_KEY : '';

    if (!$expected) {
        return new WP_Error(
            'flamingo_bridge_not_configured',
            'FLAMINGO_BRIDGE_API_KEY is not defined in wp-config.php.',
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

function flamingo_bridge_get_messages(WP_REST_Request $request)
{
    if (!class_exists('Flamingo_Inbound_Message')) {
        return new WP_Error(
            'flamingo_not_active',
            'The Flamingo plugin is not active on this site.',
            ['status' => 500]
        );
    }

    $since = $request->get_param('since'); // 'YYYY-MM-DD', optional
    $until = $request->get_param('until'); // 'YYYY-MM-DD', optional

    $args = [
        'post_type'      => 'flamingo_inbound',
        'post_status'    => 'publish', // excludes spam and trashed messages
        'posts_per_page' => -1, // return every match in the range, not just a page of them
        'orderby'        => 'date',
        'order'          => 'DESC',
    ];

    if ($since || $until) {
        $range = ['inclusive' => true];
        if ($since) {
            $range['after'] = $since;
        }
        if ($until) {
            $range['before'] = $until;
        }
        $args['date_query'] = [$range];
    }

    $query = new WP_Query($args);

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
