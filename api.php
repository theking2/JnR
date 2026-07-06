<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbDir = __DIR__ . '/data';
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0777, true);
}

$dbPath = $dbDir . '/scores.sqlite';
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->exec("
    CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        score INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
");

$pdo->exec('CREATE INDEX IF NOT EXISTS idx_leaderboard_email ON leaderboard(email)');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT first_name, last_name, email, score FROM leaderboard ORDER BY score DESC, created_at ASC LIMIT 10');
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['entries' => $entries]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    $firstName = trim($payload['firstName'] ?? '');
    $lastName = trim($payload['lastName'] ?? '');
    $email = trim($payload['email'] ?? '');
    $score = (int)($payload['score'] ?? 0);

    if ($firstName === '' || $lastName === '' || $email === '' || $score <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid payload']);
        exit;
    }

    $existingStmt = $pdo->prepare('SELECT id FROM leaderboard WHERE email = :email LIMIT 1');
    $existingStmt->execute([':email' => $email]);

    if ($existingStmt->fetchColumn()) {
        http_response_code(409);
        echo json_encode(['error' => 'This email address has already been used for a completed game.']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO leaderboard (first_name, last_name, email, score) VALUES (:first_name, :last_name, :email, :score)');
    $stmt->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':email' => $email,
        ':score' => $score,
    ]);

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
