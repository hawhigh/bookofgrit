<?php
require_once __DIR__ . '/db_config.php';
$db = getDB();
echo "--- USERS TABLE ---\n";
$stmt = $db->query("SELECT id, email, is_admin FROM users");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
echo "\n--- DB CHECK DONE ---";
