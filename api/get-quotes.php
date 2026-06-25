<?php
// /api/get-quotes.php
// PHP calculates conveyancing quotes from MySQL database tables.

header('Content-Type: application/json');
require_once 'db.php';

// Accept JSON POST input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid JSON input data'
    ]);
    exit;
}

$transaction_type = isset($data['transaction_type']) ? intval($data['transaction_type']) : 2;
$buyers_count = isset($data['buyers_count']) ? intval($data['buyers_count']) : 1;
$sellers_count = isset($data['sellers_count']) ? intval($data['sellers_count']) : 1;

// Resolve property price depending on transaction type
$price = 0.00;
if ($transaction_type === 1) {
    $price = isset($data['sell_price']) ? floatval($data['sell_price']) : 0.00;
} elseif ($transaction_type === 2 || $transaction_type === 3) {
    $price = isset($data['purchase_price']) ? floatval($data['purchase_price']) : 0.00;
} elseif ($transaction_type === 4) {
    $price = isset($data['property_value']) ? floatval($data['property_value']) : 0.00;
}

// Resolve conditional flags robustly supporting various key names
$is_leasehold = (
    (isset($data['leasehold']) && $data['leasehold'] === 'yes') ||
    (isset($data['sell_leasehold']) && $data['sell_leasehold'] === 'yes') ||
    (isset($data['buy_leasehold']) && $data['buy_leasehold'] === 'yes') ||
    (isset($data['combo_sell_leasehold']) && $data['combo_sell_leasehold'] === 'yes') ||
    (isset($data['combo_buy_leasehold']) && $data['combo_buy_leasehold'] === 'yes') ||
    (isset($data['remortgage_leasehold']) && $data['remortgage_leasehold'] === 'yes')
);

$is_mortgage = (
    (isset($data['mortgage']) && $data['mortgage'] === 'yes') ||
    (isset($data['sell_mortgage']) && $data['sell_mortgage'] === 'yes') ||
    (isset($data['buy_mortgage']) && $data['buy_mortgage'] === 'yes') ||
    (isset($data['combo_sell_mortgage']) && $data['combo_sell_mortgage'] === 'yes') ||
    (isset($data['combo_buy_mortgage']) && $data['combo_buy_mortgage'] === 'yes')
);

$is_new_build = (
    (isset($data['new_build']) && $data['new_build'] === 'yes') ||
    (isset($data['buy_new_build']) && $data['buy_new_build'] === 'yes') ||
    (isset($data['combo_buy_new_build']) && $data['combo_buy_new_build'] === 'yes')
);

$is_company = (
    (isset($data['company_purchase']) && $data['company_purchase'] === 'yes') ||
    (isset($data['buy_company']) && $data['buy_company'] === 'yes') ||
    (isset($data['combo_buy_company']) && $data['combo_buy_company'] === 'yes') ||
    (isset($data['remortgage_company']) && $data['remortgage_company'] === 'yes')
);

$is_non_uk = (
    (isset($data['non_uk_resident']) && $data['non_uk_resident'] === 'yes') ||
    (isset($data['buy_non_uk']) && $data['buy_non_uk'] === 'yes') ||
    (isset($data['combo_buy_non_uk']) && $data['combo_buy_non_uk'] === 'yes')
);

$is_transfer = (
    (isset($data['transfer_of_ownership']) && $data['transfer_of_ownership'] === 'yes') ||
    (isset($data['remortgage_transfer']) && $data['remortgage_transfer'] === 'yes')
);

try {
    // 1. Fetch all active solicitors
    $stmt = $pdo->prepare("SELECT * FROM solicitors WHERE status = 1");
    $stmt->execute();
    $solicitors = $stmt->fetchAll();

    $quotes = [];

    foreach ($solicitors as $solicitor) {
        $solicitor_id = intval($solicitor['id']);

        // 2. Fetch base legal fee from ranges table matching price
        $fee_stmt = $pdo->prepare("
            SELECT legal_fee 
            FROM legal_fee_ranges 
            WHERE solicitor_id = :solicitor_id 
              AND transaction_type = :transaction_type 
              AND :price BETWEEN min_price AND max_price 
            LIMIT 1
        ");
        $fee_stmt->execute([
            ':solicitor_id' => $solicitor_id,
            ':transaction_type' => strval($transaction_type),
            ':price' => $price
        ]);
        $fee_row = $fee_stmt->fetch();

        // Fallback legal fee if range lookup is empty
        $legal_fee = $fee_row ? floatval($fee_row['legal_fee']) : 0.00;

        // 3. Fetch fee details from table (Combine types 1 & 2 for transaction type 3)
        if ($transaction_type === 3) {
            $fees_stmt = $pdo->prepare("
                SELECT ft.rates, fn.name, ft.fee_name_id, ft.transaction_type as row_transaction_type, fn.type_id
                FROM fees_table ft
                JOIN fees_name fn ON ft.fee_name_id = fn.id
                WHERE ft.solicitors_id = :solicitor_id 
                  AND ft.transaction_type IN (1, 2)
            ");
            $fees_stmt->execute([':solicitor_id' => $solicitor_id]);
        } else {
            $fees_stmt = $pdo->prepare("
                SELECT ft.rates, fn.name, ft.fee_name_id, ft.transaction_type as row_transaction_type, fn.type_id
                FROM fees_table ft
                JOIN fees_name fn ON ft.fee_name_id = fn.id
                WHERE ft.solicitors_id = :solicitor_id 
                  AND ft.transaction_type = :transaction_type
            ");
            $fees_stmt->execute([
                ':solicitor_id' => $solicitor_id,
                ':transaction_type' => $transaction_type
            ]);
        }
        $fees_rows = $fees_stmt->fetchAll();

        $supplements = [];
        $disbursements = [];

        foreach ($fees_rows as $row) {
            $fee_name_id = intval($row['fee_name_id']);
            $row_transaction_type = intval($row['row_transaction_type']);
            $base_rate = floatval($row['rates']);

            // Validate conditional rules
            $include = true;
            switch ($fee_name_id) {
                case 5: // Leasehold fee
                    $include = $is_leasehold;
                    break;
                case 6: // Mortgage Fee
                    $include = $is_mortgage;
                    break;
                case 7: // New Build Fee
                    $include = $is_new_build;
                    break;
                case 8: // Non-UK Resident Fee
                    $include = $is_non_uk;
                    break;
                case 4: // Company Purchase fee
                case 17: // Company Remortgage fee
                case 1: // Company Search
                case 2: // Winding Up Search
                case 3: // Company Registration Fee
                    $include = $is_company;
                    break;
                case 18: // Transfer of Ownership
                    $include = $is_transfer;
                    break;
            }

            if (!$include) {
                continue;
            }

            // Adjust rate with multiplier rules
            $amount = $base_rate;
            if ($fee_name_id === 15) { // ID Check
                $multiplier = 1;
                if ($row_transaction_type === 1) {
                    $multiplier = $sellers_count;
                } elseif ($row_transaction_type === 2) {
                    $multiplier = $buyers_count;
                }
                $amount = $base_rate * $multiplier;
            } elseif ($fee_name_id === 14) { // Bankruptcy fee
                $multiplier = 1;
                if ($row_transaction_type === 2) {
                    $multiplier = $buyers_count;
                }
                $amount = $base_rate * $multiplier;
            }

            // Classify as supplement or disbursement
            $is_supplement = in_array($fee_name_id, [4, 5, 6, 7, 8, 17, 18]);
            
            $fee_item = [
                'fee_name_id' => $fee_name_id,
                'name' => $row['name'],
                'type' => $is_supplement ? 'supplement' : 'disbursement',
                'amount' => $amount
            ];

            if ($is_supplement) {
                $supplements[] = $fee_item;
            } else {
                $disbursements[] = $fee_item;
            }
        }

        // 4. Totals calculations
        $supplements_total = array_sum(array_column($supplements, 'amount'));
        $disbursements_total = array_sum(array_column($disbursements, 'amount'));

        // Calculate VAT at 20% on Base Fee + Supplements
        $vat = round(($legal_fee + $supplements_total) * 0.20, 2);

        // Grand Total
        $total = $legal_fee + $supplements_total + $vat + $disbursements_total;

        $quotes[] = [
            'solicitor_id' => $solicitor_id,
            'solicitor_name' => $solicitor['name'],
            'solicitor_logo' => $solicitor['logo'],
            'telephone_number' => $solicitor['telephone_number'],
            'address' => $solicitor['address'],
            'legal_fee' => $legal_fee,
            'supplements' => $supplements,
            'disbursements' => $disbursements,
            'vat' => $vat,
            'total' => $total
        ];
    }

    echo json_encode([
        'success' => true,
        'quotes' => $quotes
    ]);

} catch (\PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database query failed: ' . $e->getMessage()
    ]);
}
