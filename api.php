<?php
// ================================================================
// MAIN DATA API — Chapters, Enlistments, Purchases, Support, Ticker
// ================================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Operator-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db_config.php';

// ── JWT helper (same as auth.php) ──────────────────────────────
function base64url_decode($data)
{
    return base64_decode(strtr($data, '-_', '+/'));
}
function base64url_encode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function verifyJWT($token)
{
    $parts = explode('.', $token ?? '');
    if (count($parts) !== 3)
        return null;
    [$h, $p, $s] = $parts;
    if (!hash_equals(base64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true)), $s))
        return null;
    $data = json_decode(base64url_decode($p), true);
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
function isAdmin()
{
    // Check JWT
    $u = getAuthUser();
    if ($u && !empty($u['isAdmin']))
        return true;
    // Check operator key header
    $key = $_SERVER['HTTP_X_OPERATOR_KEY'] ?? '';
    if (empty($key) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $key = $headers['X-Operator-Key'] ?? '';
    }
    return $key === ADMIN_OPERATOR_KEY;
}

$method = $_SERVER['REQUEST_METHOD'];
$resource = $_GET['resource'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$db = getDB();

// ── CHAPTERS ──────────────────────────────────────────────────
if ($resource === 'chapters') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM chapters ORDER BY sort_order ASC, id ASC");
        $rows = $stmt->fetchAll();
        $chapters = array_map(function ($r) {
            return [
                'id' => $r['chapter_id'],
                'firestoreId' => (string) $r['id'],
                'name' => $r['name'],
                'price' => $r['price'],
                'description' => $r['description'],
                'content' => $r['content'],
                'img' => $r['img'],
                'pdfUrl' => $r['pdf_url'],
                'borderClass' => $r['border_class'],
                'colorClass' => $r['color_class'],
                'glow' => $r['glow'],
            ];
        }, $rows);
        echo json_encode($chapters);

    } elseif ($method === 'POST') {
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }
        $ch = $input;
        $stmt = $db->prepare("INSERT INTO chapters (chapter_id,name,price,description,content,img,pdf_url,border_class,color_class,glow,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->execute([
            $ch['id'] ?? 'CH_' . time(),
            $ch['name'] ?? '',
            $ch['price'] ?? '$3',
            $ch['description'] ?? '',
            $ch['content'] ?? '',
            $ch['img'] ?? '',
            $ch['pdfUrl'] ?? $ch['pdf_url'] ?? '',
            $ch['borderClass'] ?? 'border-primary',
            $ch['colorClass'] ?? 'text-primary',
            $ch['glow'] ?? 'glow-cyan',
            $ch['sort_order'] ?? 0,
        ]);
        echo json_encode(['ok' => true, 'id' => $db->lastInsertId()]);

    } elseif ($method === 'DELETE') {
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }
        $id = $_GET['id'] ?? $input['id'] ?? '';
        if (empty($id)) {
            echo json_encode(['error' => 'ID_REQUIRED']);
            exit;
        }
        // id can be the db row id OR chapter_id string
        if (is_numeric($id)) {
            $stmt = $db->prepare("DELETE FROM chapters WHERE id = ?");
        } else {
            $stmt = $db->prepare("DELETE FROM chapters WHERE chapter_id = ?");
        }
        $stmt->execute([$id]);
        echo json_encode(['ok' => true]);

    } elseif ($method === 'PUT') {
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }
        $id = $_GET['id'] ?? $input['id'] ?? '';
        $stmt = $db->prepare("UPDATE chapters SET name=?,price=?,description=?,content=?,img=?,pdf_url=?,border_class=?,color_class=?,glow=?,sort_order=? WHERE chapter_id=?");
        $stmt->execute([
            $input['name'] ?? '',
            $input['price'] ?? '$3',
            $input['description'] ?? '',
            $input['content'] ?? '',
            $input['img'] ?? '',
            $input['pdfUrl'] ?? '',
            $input['borderClass'] ?? 'border-primary',
            $input['colorClass'] ?? 'text-primary',
            $input['glow'] ?? 'glow-cyan',
            $input['sort_order'] ?? 0,
            $id
        ]);
        echo json_encode(['ok' => true]);
    }
    exit;
}

// ── TICKER ────────────────────────────────────────────────────
if ($resource === 'ticker') {
    if ($method === 'GET') {
        $stmt = $db->query("SELECT text FROM ticker WHERE active=1 ORDER BY sort_order ASC");
        $phrases = array_column($stmt->fetchAll(), 'text');
        echo json_encode($phrases);
    } elseif ($method === 'POST') {
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }
        $text = $input['text'] ?? '';
        $order = $input['sort_order'] ?? 99;
        $stmt = $db->prepare("INSERT INTO ticker (text, sort_order) VALUES (?,?)");
        $stmt->execute([$text, $order]);
        echo json_encode(['ok' => true]);
    } elseif ($method === 'DELETE') {
        if (!isAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'UNAUTHORIZED']);
            exit;
        }
        $id = $_GET['id'] ?? '';
        $stmt = $db->prepare("DELETE FROM ticker WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['ok' => true]);
    }
    exit;
}

// ── ENLISTMENT ────────────────────────────────────────────────
if ($resource === 'enlistment' && $method === 'POST') {
    $email = trim($input['email'] ?? '');
    $callsign = trim($input['callsign'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['error' => 'INVALID_EMAIL']);
        exit;
    }
    $stmt = $db->prepare("INSERT IGNORE INTO enlistments (email, callsign) VALUES (?,?)");
    $stmt->execute([$email, $callsign]);
    echo json_encode(['ok' => true]);
    exit;
}

// ── SUPPORT / CONTACT ─────────────────────────────────────────
if ($resource === 'support' && $method === 'POST') {
    $email = trim($input['email'] ?? '');
    $message = trim($input['message'] ?? '');
    if (empty($email) || empty($message)) {
        echo json_encode(['error' => 'MISSING_FIELDS']);
        exit;
    }
    $stmt = $db->prepare("INSERT INTO support_signals (email, message) VALUES (?,?)");
    $stmt->execute([$email, $message]);
    echo json_encode(['ok' => true]);
    exit;
}

// ── PURCHASE RECORD ──────────────────────────────────────────
// Called from verify-session.php after Stripe webhook or success verification
if ($resource === 'purchase' && $method === 'POST') {
    $uid = $input['uid'] ?? '';
    $itemId = $input['item_id'] ?? '';
    $sessionId = $input['session_id'] ?? '';

    if (empty($uid) || empty($itemId)) {
        echo json_encode(['error' => 'MISSING_UID_OR_ITEM']);
        exit;
    }

    // Insert purchase (ignore duplicates)
    $stmt = $db->prepare("INSERT IGNORE INTO purchases (uid, item_id, stripe_session_id) VALUES (?,?,?)");
    $stmt->execute([$uid, $itemId, $sessionId]);

    // If subscription, update user flag
    if ($itemId === 'SUB_MONTHLY') {
        $stmt = $db->prepare("UPDATE users SET is_subscriber=1 WHERE uid=?");
        $stmt->execute([$uid]);
    }

    echo json_encode(['ok' => true]);
    exit;
}

// ── USER DATA ─────────────────────────────────────────────────
if ($resource === 'user' && $method === 'GET') {
    $u = getAuthUser();
    if (!$u) {
        http_response_code(401);
        echo json_encode(['error' => 'UNAUTHORIZED']);
        exit;
    }

    $stmt = $db->prepare("SELECT * FROM users WHERE uid=?");
    $stmt->execute([$u['uid']]);
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'USER_NOT_FOUND']);
        exit;
    }

    $stmt = $db->prepare("SELECT item_id FROM purchases WHERE uid=?");
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
    exit;
}

// ── ADMIN: List all users / enlistments / support ─────────────
if ($resource === 'admin' && isAdmin()) {
    $type = $_GET['type'] ?? 'users';
    if ($type === 'users') {
        $stmt = $db->query("SELECT uid,email,callsign,is_subscriber,is_admin,created_at FROM users ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($type === 'enlistments') {
        $stmt = $db->query("SELECT * FROM enlistments ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($type === 'support') {
        $stmt = $db->query("SELECT * FROM support_signals ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($type === 'purchases') {
        $stmt = $db->query("SELECT p.*, u.email, u.callsign FROM purchases p LEFT JOIN users u ON p.uid=u.uid ORDER BY p.purchased_at DESC");
        echo json_encode($stmt->fetchAll());
    }
    exit;
}

// ── Fallback ──────────────────────────────────────────────────
http_response_code(400);
echo json_encode(['error' => 'UNKNOWN_RESOURCE: ' . $resource]);
