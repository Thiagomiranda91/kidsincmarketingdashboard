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
            $fields = get_post_meta($post->ID, '_fields', true);

            $messages[] = [
                'id'        => $post->ID,
                'date'      => get_post_time('c', true, $post),
                'fromName'  => get_post_meta($post->ID, '_from_name', true),
                'fromEmail' => get_post_meta($post->ID, '_from', true),
                'subject'   => get_post_meta($post->ID, '_subject', true),
                'message'   => flamingo_bridge_format_fields($fields),
            ];
        }

        return rest_ensure_response($messages);
    }
}

/**
 * Builds the formatted message body shown in the dashboard's "View message"
 * popup, from only the specific submitted form fields the dashboard cares
 * about (rather than the raw Flamingo message body).
 */
if (!function_exists('flamingo_bridge_field_to_string')) {
    function flamingo_bridge_field_to_string($value)
    {
        if (is_array($value)) {
            return implode(', ', array_filter(array_map('trim', $value)));
        }
        return trim((string) $value);
    }
}

if (!function_exists('flamingo_bridge_format_fields')) {
    function flamingo_bridge_format_fields($fields)
    {
        if (!is_array($fields)) {
            return '';
        }

        $county = isset($fields['county']) ? flamingo_bridge_field_to_string($fields['county']) : '';

        // Only one school-<county> field is actually filled in per submission
        // (the form shows a different dropdown depending on the county chosen) —
        // find whichever one has a value.
        $school = '';
        foreach ($fields as $key => $value) {
            if (strpos($key, 'school-') === 0) {
                $value_str = flamingo_bridge_field_to_string($value);
                if ($value_str !== '') {
                    $school = $value_str;
                    break;
                }
            }
        }

        // Same pattern for programme-standard vs. programme-dublin.
        $programme = '';
        foreach (['programme-standard', 'programme-dublin'] as $key) {
            if (!empty($fields[$key])) {
                $programme = flamingo_bridge_field_to_string($fields[$key]);
                break;
            }
        }

        $parent_name = isset($fields['parent-name']) ? flamingo_bridge_field_to_string($fields['parent-name']) : '';
        $phone       = isset($fields['phone-number']) ? flamingo_bridge_field_to_string($fields['phone-number']) : '';
        $email       = isset($fields['email-address']) ? flamingo_bridge_field_to_string($fields['email-address']) : '';
        $dob         = isset($fields['child-dob-formatted']) ? flamingo_bridge_field_to_string($fields['child-dob-formatted']) : '';
        $start_date  = isset($fields['ideal-start-date-formatted']) ? flamingo_bridge_field_to_string($fields['ideal-start-date-formatted']) : '';

        // Checkbox fields come through as an array of the selected day names —
        // list each one on its own line.
        $days_required = '';
        if (isset($fields['days-required'])) {
            $days_value = $fields['days-required'];
            if (is_array($days_value)) {
                $lines = array_map(function ($day) {
                    return '- ' . trim($day);
                }, array_filter($days_value));
                $days_required = implode("\n", $lines);
            } else {
                $days_required = flamingo_bridge_field_to_string($days_value);
            }
        }

        $breakfast_club = isset($fields['breakfast-club']) ? flamingo_bridge_field_to_string($fields['breakfast-club']) : '';
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
}
