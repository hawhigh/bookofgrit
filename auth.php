<?php
// ================================================================
// AUTH API — Register, Login, Logout, Me
// ================================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db_config.php';

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// ── JWT Helpers ────────────────────────────────────────────────
function base64url_encode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode($data)
{
    return base64_decode(strtr($data, '-_', '+/'));
}
function createJWT($payload)
{
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode(json_encode(array_merge($payload, ['exp' => time() + 86400 * 30])));
    $sig = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}
function verifyJWT($token)
{
    $parts = explode('.', $token);
    if (count($parts) !== 3)
        return null;
    [$header, $payload, $sig] = $parts;
    $expected = base64url_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    if (!hash_equals($expected, $sig))
        return null;
    $data = json_decode(base64url_decode($payload), true);
    if (!$data || $data['exp'] < time())
        return null;
    return $data;
}
function getAuthUser()
{
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/', $auth, $m))
        return verifyJWT($m[1]);
    return null;
}
function generateUID()
{
    return 'u_' . bin2hex(random_bytes(12));
}

// ── Actions ────────────────────────────────────────────────────
switch ($action) {

    case 'register':
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $callsign = strtoupper(trim($input['callsign'] ?? ''));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['error' => 'INVALID_EMAIL']);
            exit;
        }
        if (strlen($password) < 6) {
            echo json_encode(['error' => 'PASSWORD_TOO_SHORT']);
            exit;
        }

        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'EMAIL_ALREADY_REGISTERED']);
            exit;
        }

        $uid = generateUID();
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare("INSERT INTO users (uid, email, password_hash, callsign) VALUES (?,?,?,?)");
        $stmt->execute([$uid, $email, $hash, $callsign]);

        $token = createJWT(['uid' => $uid, 'email' => $email, 'callsign' => $callsign, 'isAdmin' => false]);
        echo json_encode(['token' => $token, 'uid' => $uid, 'email' => $email, 'callsign' => $callsign, 'purchased' => [], 'isSubscriber' => false, 'isAdmin' => false]);
        break;

    case 'login':
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        // Support admin shorthand: if no @, append domain
        if (!str_contains($email, '@'))
            $email .= '@bookofgrit.com';

        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'INVALID_CREDENTIALS']);
            exit;
        }

        // Get purchased items
        $stmt = $db->prepare("SELECT item_id FROM purchases WHERE uid = ?");
        $stmt->execute([$user['uid']]);
        $purchased = array_column($stmt->fetchAll(), 'item_id');

        $token = createJWT([
            'uid' => $user['uid'],
            'email' => $user['email'],
            'callsign' => $user['callsign'],
            'isAdmin' => (bool) $user['is_admin']
        ]);

        echo json_encode([
            'token' => $token,
            'uid' => $user['uid'],
            'email' => $user['email'],
            'callsign' => $user['callsign'],
            'purchased' => $purchased,
            'isSubscriber' => (bool) $user['is_subscriber'],
            'isAdmin' => (bool) $user['is_admin']
        ]);
        break;

    case 'me':
        $u = getAuthUser();
        if (!$u) {
            http_response_code(401);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }

        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE uid = ?");
        $stmt->execute([$u['uid']]);
        $user = $stmt->fetch();
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'USER_NOT_FOUND']);
            exit;
        }

        $stmt = $db->prepare("SELECT item_id FROM purchases WHERE uid = ?");
        $stmt->execute([$user['uid']]);
        $purchased = array_column($stmt->fetchAll(), 'item_id');

        echo json_encode([
            'uid' => $user['uid'],
            'email' => $user['email'],
            'callsign' => $user['callsign'],
            'purchased' => $purchased,
            'isSubscriber' => (bool) $user['is_subscriber'],
            'isAdmin' => (bool) $user['is_admin']
        ]);
        break;

    case 'update_callsign':
        $u = getAuthUser();
        if (!$u) {
            http_response_code(401);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }
        $callsign = strtoupper(trim($input['callsign'] ?? ''));
        if (empty($callsign)) {
            echo json_encode(['error' => 'CALLSIGN_REQUIRED']);
            exit;
        }

        $db = getDB();
        $stmt = $db->prepare("UPDATE users SET callsign = ? WHERE uid = ?");
        $stmt->execute([$callsign, $u['uid']]);
        echo json_encode(['ok' => true, 'callsign' => $callsign]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'UNKNOWN_ACTION: ' . $action]);
}
