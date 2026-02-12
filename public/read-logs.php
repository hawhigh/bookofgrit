<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Operator-Key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// --- SECURITY HARDENING ---
$operator_key = "protocol_omega_99_secure_vault";
$received_key = $_SERVER['HTTP_X_OPERATOR_KEY'] ?? '';

if ($received_key !== $operator_key) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "UNAUTHORIZED_PROTOCOL_ACCESS"]);
    exit;
}

$log_file = 'fulfillment_audit.log';

if (file_exists($log_file)) {
    $logs = file_get_contents($log_file);
    echo json_encode(["status" => "success", "logs" => $logs]);
} else {
    echo json_encode(["status" => "success", "logs" => "NO_LOGS_ON_DISK_CURRENTLY"]);
}
?>