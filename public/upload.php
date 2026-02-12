<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS, GET");
header("Access-Control-Allow-Headers: Content-Type, X-Operator-Key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$target_dir = __DIR__ . "/uploads/";
$operator_key = "protocol_omega_99_secure_vault";
$received_key = $_SERVER['HTTP_X_OPERATOR_KEY'] ?? $_REQUEST['key'] ?? '';

// Robust Header Check
if (empty($received_key) && function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $received_key = $headers['X-Operator-Key'] ?? '';
}

if ($received_key !== $operator_key) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "UNAUTHORIZED_PROTOCOL_ACCESS"]);
    exit;
}

// Read from ALL sources
$json_input = file_get_contents("php://input");
$data = json_decode($json_input);

$action = $_REQUEST['action'] ?? $data->action ?? '';

// DEBUG LOGGING
// file_put_contents('debug_action.txt', "Action received: " . $action . "\n", FILE_APPEND);

if ($action === 'delete') {
    $fileUrl = $_REQUEST['fileUrl'] ?? $data->fileUrl ?? '';

    if (empty($fileUrl)) {
        echo json_encode(["status" => "error", "message" => "NO_URL_PROVIDED"]);
        exit;
    }

    $filename = basename($fileUrl);
    $targetPath = $target_dir . $filename;

    if (file_exists($targetPath)) {
        if (unlink($targetPath)) {
            echo json_encode(["status" => "success", "message" => "ASSET_NEUTRALIZED"]);
        } else {
            echo json_encode(["status" => "error", "message" => "FS_DELETE_FAILED"]);
        }
    } else {
        echo json_encode(["status" => "success", "message" => "ASSET_ALREADY_GONE"]);
    }
    exit;
}

// --- HANDLE UPLOAD ---
if (!file_exists($target_dir)) {
    if (!mkdir($target_dir, 0777, true)) {
        echo json_encode(["status" => "error", "message" => "FAILED_TO_CREATE_UPLOAD_DIRECTORY"]);
        exit;
    }
}

if (isset($_FILES["file"])) {
    $file = $_FILES["file"];
    $file_extension = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

    $allowed_exts = ["pdf", "jpg", "jpeg", "png", "webp"];
    if (!in_array($file_extension, $allowed_exts)) {
        echo json_encode(["status" => "error", "message" => "File type not allowed."]);
        exit;
    }

    $file_name = "asset_" . time() . "_" . bin2hex(random_bytes(4)) . "." . $file_extension;
    $target_file = $target_dir . $file_name;

    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
        $host = $_SERVER['HTTP_HOST'];
        $url = $protocol . "://" . $host . "/uploads/" . $file_name;

        echo json_encode(["status" => "success", "url" => $url]);
    } else {
        echo json_encode(["status" => "error", "message" => "Moving file failed."]);
    }
} else {
    // DEBUG OUTPUT IN ERROR
    echo json_encode(["status" => "error", "message" => "No file received. Debug Action: [$action]"]);
}
?>