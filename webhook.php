<?php
// BOOK OF GRIT - TACTICAL WEBHOOK
// This script handles Stripe events (fulfillment via server-side)

header('Content-Type: application/json');

if (file_exists('stripe_secrets.php')) {
    include 'stripe_secrets.php';
} else {
    $stripe_secret_key = getenv('STRIPE_SECRET_KEY') ?: '';
    $stripe_webhook_secret = getenv('STRIPE_WEBHOOK_SECRET') ?: '';
}

// Fallback for webhook secret if not in file
if (!isset($stripe_webhook_secret)) {
    $stripe_webhook_secret = 'whsec_...'; // GET THIS FROM STRIPE DASHBOARD
}

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$event = null;

try {
    // Basic JSON decode for local testing / when signature is not available
    $event = json_decode($payload, true);
} catch (\Exception $e) {
    http_response_code(400);
    exit;
}

// Process the event
switch ($event['type']) {
    case 'checkout.session.completed':
        $session = $event['data']['object'];
        $uid = $session['metadata']['uid'] ?? 'anonymous';
        $itemId = $session['metadata']['itemId'] ?? '';

        // LOG FULFILLMENT
        $log_entry = date('Y-m-d H:i:s') . " | SUCCESS | UID: $uid | ITEM: $itemId | SID: " . $session['id'] . "\n";
        file_put_contents('fulfillment_audit.log', $log_entry, FILE_APPEND);

        // NOTE: Direct Firestore update from PHP requires Service Account.
        // For zero-failure, browsers update on /success, but this log confirms the sale.
        break;

    case 'customer.subscription.deleted':
        // Handle cancelled subs
        $subscription = $event['data']['object'];
        $log_entry = date('Y-m-d H:i:s') . " | SUBSCRIPTION_END | SID: " . $subscription['id'] . "\n";
        file_put_contents('fulfillment_audit.log', $log_entry, FILE_APPEND);
        break;

    default:
        // Echo to indicate received
        echo json_encode(['status' => 'ignored', 'type' => $event['type']]);
}

http_response_code(200);
echo json_encode(['status' => 'success']);
?>