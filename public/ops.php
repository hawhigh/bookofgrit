<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Operator-Key");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Security Check
$operator_key = "protocol_omega_99_secure_vault";
$received_key = $_SERVER['HTTP_X_OPERATOR_KEY'] ?? $_REQUEST['key'] ?? '';

if (empty($received_key) && function_exists('apache_request_headers')) {
    $headers = apache_request_headers();
    $received_key = $headers['X-Operator-Key'] ?? '';
}

if ($received_key !== $operator_key) {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "UNAUTHORIZED_ACCESS"]);
    exit;
}

// Logic
$target_dir = __DIR__ . "/uploads/";
$action = $_REQUEST['action'] ?? '';

// Support JSON input too
if (empty($action)) {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? '';
}

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
} elseif ($action === 'upload' || (empty($action) && isset($_FILES["file"]))) {
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
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
        echo json_encode(["status" => "error", "message" => "No file received."]);
    }
} elseif ($action === 'read_logs') {
    $log_file = 'fulfillment_audit.log';
    if (file_exists($log_file)) {
        $logs = file_get_contents($log_file);
        echo json_encode(["status" => "success", "logs" => $logs]);
    } else {
        echo json_encode(["status" => "success", "logs" => "NO_LOGS_ON_DISK_CURRENTLY"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "INVALID_ACTION: " . $action]);
}
?>