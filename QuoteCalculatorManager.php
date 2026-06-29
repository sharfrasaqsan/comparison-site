<?php
// QuoteCalculatorManager.php

require_once __DIR__ . '/FeesManager.php';

class QuoteCalculatorManager
{
    private $feesManager;

    public function __construct()
    {
        $this->feesManager = new FeesManager();
    }

    public function calculateQuotes($payload)
    {
        $transactionType = isset($payload['transaction_type']) ? (int)$payload['transaction_type'] : 0;

        if (!in_array($transactionType, [1, 2, 3, 4], true)) {
            throw new Exception('Invalid transaction type.');
        }

        $purchasePrice = isset($payload['purchase_price']) ? $this->toAmount($payload['purchase_price']) : 0.00;
        $sellPrice = isset($payload['sell_price']) ? $this->toAmount($payload['sell_price']) : 0.00;
        $propertyValue = isset($payload['property_value']) ? $this->toAmount($payload['property_value']) : 0.00;

        $legalFeePrice = $this->resolveLegalFeePrice($transactionType, $purchasePrice, $sellPrice, $propertyValue);

        if ($legalFeePrice <= 0) {
            throw new Exception('Invalid property price/value.');
        }

        // Selling values
        $sellingMortgage = $this->yesNo($payload['selling_mortgage'] ?? ($payload['mortgage'] ?? 'no'));
        $sellingLeasehold = $this->yesNo($payload['selling_leasehold'] ?? ($payload['leasehold'] ?? 'no'));
        $sellers = $this->positiveInt($payload['sellers'] ?? ($payload['sellers_count'] ?? 1));

        // Buying values
        $buyingMortgage = $this->yesNo($payload['buying_mortgage'] ?? ($payload['mortgage'] ?? 'no'));
        $buyingLeasehold = $this->yesNo($payload['buying_leasehold'] ?? ($payload['leasehold'] ?? 'no'));
        $firstTimeBuyer = $this->yesNo($payload['first_time_buyer'] ?? 'no');
        $letOrSecondHome = $this->yesNo($payload['let_or_2nd_home'] ?? ($payload['buy_to_let'] ?? 'no'));
        $newBuild = $this->yesNo($payload['new_build'] ?? 'no');
        $isCompany = $this->yesNo($payload['is_a_company'] ?? ($payload['company_purchase'] ?? 'no'));

        // Kasun's FeesManager parameter name is $is_an_uk_resident,
        // but his condition includes Non-UK Resident Fee when this value is 1.
        // So we pass 1 when the frontend says non_uk_resident = yes.
        $nonUkResident = $this->yesNo($payload['non_uk_resident'] ?? 'no');

        $buyers = $this->positiveInt($payload['buyers'] ?? ($payload['buyers_count'] ?? 1));

        // Remortgage values
        $remortgageLeasehold = $this->yesNo($payload['remortgage_leasehold'] ?? ($payload['leasehold'] ?? 'no'));
        $transferOfOwnership = $this->yesNo($payload['transfer_of_ownership'] ?? 'no');
        $registeredToCompany = $this->yesNo($payload['registered_to_a_company'] ?? ($payload['company_purchase'] ?? 'no'));

        $solicitors = $this->feesManager->getAllSolicitors();
        $quotes = [];

        foreach ($solicitors as $solicitor) {
            $solicitorId = (int)$solicitor['id'];

            // Legal fee uses the actual selected transaction type.
            // For buying & selling, use transaction_type = 3 legal fee range.
            $legalFeeRow = $this->feesManager->getLegalFeeByPrice(
                $solicitorId,
                $legalFeePrice,
                $transactionType
            );

            $legalFee = $legalFeeRow ? $this->toAmount($legalFeeRow['legal_fee']) : 0.00;

            /*
             * IMPORTANT:
             * We do NOT call Kasun's getFeesBySolicitorAndTypeFilter() with type 3 directly.
             * His type 3 branch combines type 1 and type 2 fee rows, but applies both selling and buying filters together.
             * To avoid changing his file, we call it separately:
             * - type 1 for selling-side fees
             * - type 2 for buying-side fees
             */
$fees = $this->getFeesUsingKasunProcess(
    $solicitorId,
    $transactionType,
    $sellingMortgage,
    $sellingLeasehold,
    $sellers,
    $buyingMortgage,
    $buyingLeasehold,
    $firstTimeBuyer,
    $letOrSecondHome,
    $newBuild,
    $isCompany,
    $nonUkResident,
    $purchasePrice,
    $sellPrice,
    $propertyValue,
    $buyers,
    $remortgageLeasehold,
    $transferOfOwnership,
    $registeredToCompany
);

            $supplements = [];
            $disbursements = [];

            foreach ($fees as $fee) {
                $feeNameId = isset($fee['fee_name_id']) ? (int)$fee['fee_name_id'] : 0;
                $amount = isset($fee['rates']) ? $this->toAmount($fee['rates']) : 0.00;

                $item = [
                    'fee_name_id' => $feeNameId,
                    'name' => $fee['fee_name'] ?? '',
                    'type' => $this->isSupplementFee($fee) ? 'supplement' : 'disbursement',
                    'amount' => round($amount, 2)
                ];

                if (isset($fee['quantity'])) {
                    $item['quantity'] = (int)$fee['quantity'];
                }

                if ($item['type'] === 'supplement') {
                    $supplements[] = $item;
                } else {
                    $disbursements[] = $item;
                }
            }

            $supplementsTotal = $this->sumAmounts($supplements);
            $disbursementsTotal = $this->sumAmounts($disbursements);

            // Current process: VAT on legal fee + supplements only.
            $vat = round(($legalFee + $supplementsTotal) * 0.20, 2);
            $total = round($legalFee + $supplementsTotal + $vat + $disbursementsTotal, 2);

            $quotes[] = [
                'solicitor_id' => $solicitorId,
                'solicitor_name' => $solicitor['name'] ?? '',
                'solicitor_logo' => $solicitor['logo'] ?? '',
                'telephone_number' => $solicitor['telephone_number'] ?? '',
                'address' => $solicitor['address'] ?? '',
                'legal_fee' => round($legalFee, 2),
                'supplements' => $supplements,
                'disbursements' => $disbursements,
                'vat' => $vat,
                'total' => $total
            ];
        }

        return [
            'success' => true,
            'quotes' => $quotes
        ];
    }

private function getFeesUsingKasunProcess(
    $solicitorId,
    $transactionType,
    $sellingMortgage,
    $sellingLeasehold,
    $sellers,
    $buyingMortgage,
    $buyingLeasehold,
    $firstTimeBuyer,
    $letOrSecondHome,
    $newBuild,
    $isCompany,
    $nonUkResident,
    $purchasePrice,
    $sellPrice,
    $propertyValue,
    $buyers,
    $remortgageLeasehold,
    $transferOfOwnership,
    $registeredToCompany
) {
        if ($transactionType === 1) {
            return $this->feesManager->getFeesBySolicitorAndTypeFilter(
                $solicitorId,
                1,
                $sellingMortgage,
                $sellingLeasehold,
                $sellers,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                $sellPrice,
                1,
                0,
                0,
                0
            );
        }

        if ($transactionType === 2) {
            return $this->feesManager->getFeesBySolicitorAndTypeFilter(
                $solicitorId,
                2,
                0,
                0,
                1,
                $buyingMortgage,
                $buyingLeasehold,
                $firstTimeBuyer,
                $letOrSecondHome,
                $newBuild,
                $isCompany,
                $nonUkResident,
                $purchasePrice,
                $buyers,
                0,
                0,
                0
            );
        }

        if ($transactionType === 3) {
            $sellingFees = $this->feesManager->getFeesBySolicitorAndTypeFilter(
                $solicitorId,
                1,
                $sellingMortgage,
                $sellingLeasehold,
                $sellers,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                $sellPrice,
                1,
                0,
                0,
                0
            );

            $buyingFees = $this->feesManager->getFeesBySolicitorAndTypeFilter(
                $solicitorId,
                2,
                0,
                0,
                1,
                $buyingMortgage,
                $buyingLeasehold,
                $firstTimeBuyer,
                $letOrSecondHome,
                $newBuild,
                $isCompany,
                $nonUkResident,
                $purchasePrice,
                $buyers,
                0,
                0,
                0
            );

            return array_merge($sellingFees, $buyingFees);
        }

        if ($transactionType === 4) {
            return $this->feesManager->getFeesBySolicitorAndTypeFilter(
                $solicitorId,
                4,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                $propertyValue,
                1,
                $remortgageLeasehold,
                $transferOfOwnership,
                $registeredToCompany
            );
        }

        return [];
    }

    private function resolveLegalFeePrice($transactionType, $purchasePrice, $sellPrice, $propertyValue)
    {
        if ($transactionType === 1) {
            return $sellPrice;
        }

        if ($transactionType === 2 || $transactionType === 3) {
            return $purchasePrice;
        }

        if ($transactionType === 4) {
            return $propertyValue;
        }

        return 0.00;
    }

    private function isSupplementFee($fee)
    {
        $feeNameId = isset($fee['fee_name_id']) ? (int)$fee['fee_name_id'] : 0;
        $feeTypeId = isset($fee['type']) ? (int)$fee['type'] : 0;
        $typeName = strtolower(trim($fee['type_name'] ?? ''));

        if (strpos($typeName, 'supplement') !== false) {
            return true;
        }

        if ($feeTypeId === 2) {
            return true;
        }

        // Conditional legal supplement fee IDs from the supplied fee names.
        return in_array($feeNameId, [4, 5, 6, 7, 8, 17, 18], true);
    }

    private function yesNo($value)
    {
        if ($value === true || $value === 1 || $value === '1') {
            return 1;
        }

        $value = strtolower(trim((string)$value));

        return in_array($value, ['yes', 'y', 'true', 'on'], true) ? 1 : 0;
    }

    private function positiveInt($value)
    {
        $value = (int)$value;
        return $value > 0 ? $value : 1;
    }

    private function toAmount($value)
    {
        if (is_string($value)) {
            $value = str_replace(',', '', $value);
        }

        return round((float)$value, 2);
    }

    private function sumAmounts($items)
    {
        $total = 0.00;

        foreach ($items as $item) {
            $total += isset($item['amount']) ? (float)$item['amount'] : 0.00;
        }

        return round($total, 2);
    }
}
?>
