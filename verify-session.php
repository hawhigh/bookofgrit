<?php
header('Content-Type: application/json');

// --- SECURE KEY LOADING ---
if (file_exists('stripe_secrets.php')) {
    include 'stripe_secrets.php';
} else {
    $stripe_secret_key = getenv('STRIPE_SECRET_KEY') ?: '';
}

if (empty($stripe_secret_key)) {
    echo json_encode(['error' => 'STRIPE_SECRET_KEY_MISSING']);
    exit;
}

$sessionId = $_GET['session_id'] ?? '';

if (empty($sessionId)) {
    echo json_encode(['error' => 'SESSION_ID_MISSING']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/checkout/sessions/" . $sessionId);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERPWD, $stripe_secret_key . ':');

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    exit;
}
curl_close($ch);

$session = json_decode($result, true);

if (isset($session['payment_status']) && $session['payment_status'] === 'paid') {
    echo json_encode([
        'status' => 'paid',
        'itemId' => $session['metadata']['itemId'] ?? '',
        'uid' => $session['metadata']['uid'] ?? ''
    ]);
} else {
    echo json_encode(['status' => 'unpaid', 'error' => 'SESSION_NOT_VALID_OR_UNPAID']);
}
?>