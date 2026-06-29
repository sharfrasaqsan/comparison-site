<?php
// api/get-quotes.php
// Thin API controller.

header('Content-Type: application/json');

require_once __DIR__ . '/../QuoteCalculatorManager.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method. POST required.'
    ]);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!is_array($data)) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON input data.'
    ]);
    exit;
}

try {
    $calculator = new QuoteCalculatorManager();
    $response = $calculator->calculateQuotes($data);

    echo json_encode($response);
    exit;
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Backend calculation failed: ' . $e->getMessage()
    ]);
    exit;
}
?>
