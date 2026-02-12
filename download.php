<?php
// Gatekeeper for secure PDF downloads
$target_dir = "uploads/";

$file = $_GET['file'] ?? '';
$uid = $_GET['uid'] ?? '';

if (empty($file)) {
    die("ACCESS_DENIED: NO_PAYLOAD_SPECIFIED");
}

// Security: Prevent directory traversal (only allow files in uploads/)
$filename = basename($file);
$filepath = $target_dir . $filename;

if (!file_exists($filepath)) {
    die("ACCESS_DENIED: ASSET_MISSING");
}

// --- FULFILLMENT VERIFICATION ---
// In a full production app, we would check a database here.
// For now, we assume the frontend only calls this after success verification.
// To make it more secure, we could pass a JWT or a verification token.

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . filesize($filepath));
readfile($filepath);
exit;
?>