<?php
header('Content-Type: application/json');

// --- SECURE KEY LOADING ---
if (file_exists('stripe_secrets.php')) {
    include 'stripe_secrets.php';
} else {
    $stripe_secret_key = getenv('STRIPE_SECRET_KEY') ?: '';
}

if (empty($stripe_secret_key)) {
    echo json_encode(['error' => 'STRIPE_SECRET_KEY_MISSING. Please create stripe_secrets.php on server.']);
    exit;
}

$success_url_base = 'https://thebookofgrit.com/success';
$cancel_url = 'https://thebookofgrit.com/cancel';
// ---------------------

$input = json_decode(file_get_contents('php://input'), true);
$itemId = $input['itemId'] ?? '';
$success_url = $success_url_base . '?item_id=' . $itemId . '&session_id={CHECKOUT_SESSION_ID}';
$name = $input['name'] ?? 'Book of Grit Asset';
$priceStr = $input['price'] ?? '$3';
$img = $input['img'] ?? 'https://thebookofgrit.com/bookofgrit_logo_v3.png';

$amountInCents = intval(preg_replace('/[^0-9]/', '', $priceStr)) * 100;
$mode = (strpos($itemId, 'SUB_') !== false) ? 'subscription' : 'payment';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.stripe.com/v1/checkout/sessions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_USERPWD, $stripe_secret_key . ':');

$postfields = [
    'success_url' => $success_url,
    'cancel_url' => $cancel_url,
    'payment_method_types[0]' => 'card',
    'mode' => $mode,
    'line_items[0][price_data][currency]' => 'usd',
    'line_items[0][price_data][product_data][name]' => $name,
    'line_items[0][price_data][product_data][images][0]' => $img,
    'line_items[0][price_data][unit_amount]' => $amountInCents,
    'line_items[0][quantity]' => 1,
    'metadata[itemId]' => $itemId
];

if ($mode === 'subscription') {
    $postfields['line_items[0][price_data][recurring][interval]'] = 'month';
}

curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postfields));
$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    exit;
}
curl_close($ch);
echo $result;
?>