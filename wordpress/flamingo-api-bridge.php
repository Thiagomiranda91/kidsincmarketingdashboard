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
            'message'   => flamingo_bridge_format_fields($post->ID),
        ];
    }

    return rest_ensure_response($messages);
}

/**
 * Builds the formatted message body shown in the dashboard's "View message"
 * popup, from only the specific submitted form fields the dashboard cares
 * about.
 *
 * IMPORTANT: Flamingo does NOT keep usable data in the '_fields' post meta —
 * its own save() method blanks every value in that array to null right
 * before writing it (see class-inbound-message.php). The real per-field
 * values live in individual '_field_<name>' post meta entries instead,
 * which is what this reads.
 */
function flamingo_bridge_field_to_string($value)
{
    if (is_array($value)) {
        return implode(', ', array_filter(array_map('trim', $value)));
    }
    return trim((string) $value);
}

function flamingo_bridge_get_field($post_id, $key)
{
    $meta_key = '_field_' . sanitize_key($key);
    return get_post_meta($post_id, $meta_key, true);
}

function flamingo_bridge_format_fields($post_id)
{
    $county = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'county'));

    // Only one school-<county> field is actually filled in per submission
    // (the form shows a different dropdown depending on the county chosen) —
    // check each possible one and use whichever has a value.
    $school_counties = [
        'clare', 'cork', 'dublin', 'galway', 'kildare', 'limerick',
        'meath', 'sligo', 'waterford', 'westmeath', 'wexford', 'wicklow',
    ];
    $school = '';
    foreach ($school_counties as $county_slug) {
        $value = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'school-' . $county_slug));
        if ($value !== '') {
            $school = $value;
            break;
        }
    }

    // Same pattern for programme-standard vs. programme-dublin.
    $programme = '';
    foreach (['programme-standard', 'programme-dublin'] as $key) {
        $value = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, $key));
        if ($value !== '') {
            $programme = $value;
            break;
        }
    }

    $parent_name = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'parent-name'));
    $phone       = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'phone-number'));
    $email       = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'email-address'));
    $dob         = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'child-dob-formatted'));
    $start_date  = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'ideal-start-date-formatted'));

    // Checkbox fields come through as an array of the selected day names —
    // list each one on its own line.
    $days_value = flamingo_bridge_get_field($post_id, 'days-required');
    $days_required = '';
    if (is_array($days_value)) {
        $lines = array_map(function ($day) {
            return '- ' . trim($day);
        }, array_filter($days_value));
        $days_required = implode("\n", $lines);
    } else {
        $days_required = flamingo_bridge_field_to_string($days_value);
    }

    $breakfast_club = flamingo_bridge_field_to_string(flamingo_bridge_get_field($post_id, 'breakfast-club'));
    if ($breakfast_club === '') {
        $breakfast_club = 'No';
    }

    $lines = [
        'County: ' . $county,
        'School: ' . $school,
        'Programme: ' . $programme,
        'Parent Name: ' . $parent_name,
        'Phone Number: ' . $phone,
        'Email: ' . $email,
        'Child Date of Birth: ' . $dob,
        'Ideal Start Date: ' . $start_date,
        "Days Required:\n" . $days_required,
        'Breakfast Club: ' . $breakfast_club,
    ];

    return implode("\n", $lines);
}
