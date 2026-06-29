<?php
// classes/FeesManager.php

include("dbconn.php");


class FeesManager {

    // =========================================
    // GET SOLICITORS
    // =========================================
    public function getAllSolicitors() {

        global $objDb;

        $records = [];

        $sql = "SELECT *
                FROM solicitors
                WHERE status='1'
                ORDER BY name ASC";

        $result = mysqli_query($objDb, $sql);

        while($row = mysqli_fetch_assoc($result)) {

            $records[] = $row;
        }

        return $records;
    }

    // =========================================
    // GET FEE TYPES
    // =========================================
    public function getAllFeeTypes() {

        global $objDb;

        $records = [];

        $sql = "SELECT *
                FROM fees_type
                ORDER BY id ASC";

        $result = mysqli_query($objDb, $sql);

        while($row = mysqli_fetch_assoc($result)) {

            $records[] = $row;
        }

        return $records;
    }



    
    // =========================================
    // GET FEE NAMES BY TYPE
    // =========================================
    public function getFeeNamesByType($typeId) {

        global $objDb;

        $records = [];

        $typeId = (int)$typeId;

        $sql = "SELECT *
                FROM fees_name
                WHERE type_id = '$typeId'
                ORDER BY name ASC";

        $result = mysqli_query($objDb, $sql);

        while($row = mysqli_fetch_assoc($result)) {

            $records[] = $row;
        }

        return $records;
    }

    // =========================================
    // SAVE FULL CALCULATOR
    // =========================================
    public function saveFees($postData) {

        global $objDb;

        $solicitorId = (int)$postData['solicitors_id'];

        // =====================================
        // REMOVE OLD STANDARD FEES
        // =====================================
        mysqli_query(
            $objDb,
            "DELETE FROM fees_table
             WHERE solicitors_id = '$solicitorId' AND transaction_type = '".$postData['transaction_type']."'"
        );

        // =====================================
        // REMOVE OLD LEGAL FEES
        // =====================================
        mysqli_query(
            $objDb,
            "DELETE FROM legal_fee_ranges
             WHERE solicitor_id = '$solicitorId' AND transaction_type = '".$postData['transaction_type']."'"
        );

        // =====================================
        // SAVE STANDARD FEES
        // =====================================
        if(isset($postData['fee_type'])) {

            foreach($postData['fee_type'] as $key => $typeId) {

                $typeId = (int)$typeId;

                $feeNameId = (int)$postData['fee_name'][$key];

                $rates = trim($postData['rates'][$key]);

                $transactionType = trim($postData['transaction_type']);

                if(
                    $typeId > 0 &&
                    $feeNameId > 0 &&
                    $rates != ''
                ) {

                    $rates = mysqli_real_escape_string(
                        $objDb,
                        $rates
                    );

                    $sql = "INSERT INTO fees_table
                            (
                                solicitors_id,
                                type,
                                fee_name_id,
                                transaction_type,
                                rates
                            )
                            VALUES
                            (
                                '$solicitorId',
                                '$typeId',
                                '$feeNameId',
                                '$transactionType',
                                '$rates'
                            )";

                    mysqli_query($objDb, $sql);
                }
            }
        }

        // =====================================
        // SAVE LEGAL FEES
        // =====================================
        if(isset($postData['min_price'])) {

            foreach($postData['min_price'] as $key => $value) {

                $minPrice = trim(
                    $postData['min_price'][$key]
                );

                $maxPrice = trim(
                    $postData['max_price'][$key]
                );

                $legalFee = trim(
                    $postData['legal_fee'][$key]
                );

                if(
                    $minPrice != '' &&
                    $maxPrice != '' &&
                    $legalFee != ''
                ) {

                    $minPrice = mysqli_real_escape_string(
                        $objDb,
                        $minPrice
                    );

                    $maxPrice = mysqli_real_escape_string(
                        $objDb,
                        $maxPrice
                    );

                    $legalFee = mysqli_real_escape_string(
                        $objDb,
                        $legalFee
                    );

                    $sql = "INSERT INTO legal_fee_ranges
                            (
                                solicitor_id,
                                min_price,
                                max_price,
                                transaction_type,
                                legal_fee
                            )
                            VALUES
                            (
                                '$solicitorId',
                                '$minPrice',
                                '$maxPrice',
                                '$transactionType',
                                '$legalFee'
                            )";

                    mysqli_query($objDb, $sql);
                }
            }
        }

        return [
            'status' => true,
            'message' => 'Calculator saved successfully.'
        ];
    }

    // =========================================
    // GET ALL FEES
    // =========================================
    public function getAllFees() {

        global $objDb;

        $records = [];

        $sql = "SELECT ft.*,
                       s.name AS solicitor_name,
                       t.name AS type_name,
                       fn.name AS fee_name

                FROM fees_table ft

                LEFT JOIN solicitors s
                ON s.id = ft.solicitors_id

                LEFT JOIN fees_type t
                ON t.id = ft.type

                LEFT JOIN fees_name fn
                ON fn.id = ft.fee_name_id

                ORDER BY ft.id DESC";

        $result = mysqli_query($objDb, $sql);

        while($row = mysqli_fetch_assoc($result)) {

            $records[] = $row;
        }

        return $records;
    }

    // =========================================
    // GET LEGAL FEES
    // =========================================
    public function getLegalFees($solicitorId) {

        global $objDb;

        $records = [];

        $solicitorId = (int)$solicitorId;

        $sql = "SELECT *
                FROM legal_fee_ranges
                WHERE solicitor_id = '$solicitorId'
                ORDER BY min_price ASC";

        $result = mysqli_query($objDb, $sql);

        while($row = mysqli_fetch_assoc($result)) {

            $records[] = $row;
        }

        return $records;
    }

    // =========================================
    // GET LEGAL FEE BY PROPERTY VALUE
    // =========================================
    public function getLegalFeeByPrice(
        $solicitorId,
        $propertyPrice,
        $type
    ) {

        global $objDb;

        $solicitorId = (int)$solicitorId;

        $propertyPrice = (float)$propertyPrice;

        $sql = "SELECT *
                FROM legal_fee_ranges
                WHERE solicitor_id = '$solicitorId'
                AND transaction_type = '$type'
                AND '$propertyPrice'
                BETWEEN min_price AND max_price
                LIMIT 1";

        $result = mysqli_query($objDb, $sql);

        return mysqli_fetch_assoc($result);
    }


    public function getSolicitorById($id){

    global $objDb;

    $id = (int)$id;

    $sql = "SELECT * FROM solicitors WHERE id='$id'";

    $result = mysqli_query($objDb,$sql);

    return mysqli_fetch_assoc($result);
}

public function getFeesBySolicitorAndType($sid,$type){

    global $objDb;

    $sid = (int)$sid;

    $type = mysqli_real_escape_string($objDb,$type);

    $sql = "SELECT ft.*,
                   fn.name AS fee_name,
                   t.name AS type_name

            FROM fees_table ft

            LEFT JOIN fees_name fn ON fn.id = ft.fee_name_id
            LEFT JOIN fees_type t ON t.id = ft.type

            WHERE ft.solicitors_id='$sid'
            AND ft.transaction_type='$type'";

    $result = mysqli_query($objDb,$sql);

    $data = [];

    while($row = mysqli_fetch_assoc($result)){
        $data[] = $row;
    }

    return $data;
}

public function getFullFees($solicitorId, $type)
{
    global $objDb;

    $solicitorId = (int)$solicitorId;
    $type = mysqli_real_escape_string($objDb, $type);

    // =========================
    // LEGAL FEES
    // =========================
    $legal = [];
    $sql1 = "SELECT * FROM legal_fee_ranges 
             WHERE solicitor_id = $solicitorId 
             AND transaction_type = '$type'
             ORDER BY min_price ASC";

    $res1 = mysqli_query($objDb, $sql1);

    while($row = mysqli_fetch_assoc($res1)){
        $legal[] = $row;
    }

    // =========================
    // DISBURSEMENTS
    // =========================
    $items = [];

    $sql2 = "SELECT f.*, t.name as type_name, fn.name as fee_name
             FROM fees_table f
             LEFT JOIN fees_type t ON t.id = f.type
             LEFT JOIN fees_name fn ON fn.id = f.fee_name_id
             WHERE f.solicitors_id = $solicitorId
             AND f.transaction_type = '$type'
             ORDER BY f.id DESC";

    $res2 = mysqli_query($objDb, $sql2);

    while($row = mysqli_fetch_assoc($res2)){
        $items[] = $row;
    }

    return [
        'legal' => $legal,
        'items' => $items
    ];
}


public function updateFees($data)
{
    global $objDb;

    $sid  = (int)$data['solicitors_id'];
    $type = mysqli_real_escape_string($objDb, $data['transaction_type']);

    // =====================================
    // DELETE OLD DATA
    // =====================================
    mysqli_query($objDb, "
        DELETE FROM fees_table
        WHERE solicitors_id = '$sid'
        AND transaction_type = '$type'
    ");

    mysqli_query($objDb, "
        DELETE FROM legal_fee_ranges
        WHERE solicitor_id = '$sid'
        AND transaction_type = '$type'
    ");

    // =====================================
    // INSERT LEGAL FEES
    // =====================================
    if(!empty($data['min_price'])){

        foreach($data['min_price'] as $i => $min){

            $min = mysqli_real_escape_string($objDb, $min);
            $max = mysqli_real_escape_string($objDb, $data['max_price'][$i]);
            $fee = mysqli_real_escape_string($objDb, $data['legal_fee'][$i]);

            if($min != '' && $max != '' && $fee != ''){

                mysqli_query($objDb, "
                    INSERT INTO legal_fee_ranges
                    (solicitor_id, transaction_type, min_price, max_price, legal_fee)
                    VALUES
                    ('$sid', '$type', '$min', '$max', '$fee')
                ");
            }
        }
    }

    // =====================================
    // INSERT FEES
    // =====================================
    if(!empty($data['fee_type'])){

        foreach($data['fee_type'] as $i => $ft){

            $ft   = (int)$ft;
            $name = mysqli_real_escape_string($objDb, $data['fee_name'][$i]);
            $rate = mysqli_real_escape_string($objDb, $data['rates'][$i]);

            if($ft > 0 && $name != '' && $rate != ''){

                mysqli_query($objDb, "
                    INSERT INTO fees_table
                    (solicitors_id, type, fee_name_id, transaction_type, rates)
                    VALUES
                    ('$sid', '$ft', '$name', '$type', '$rate')
                ");
            }
        }
    }

    return true;
}




public function getFeesBySolicitorAndTypeFilter(
    $sid,
    $type,
    $mortgage,
    $leasehold,
    $sellers,
    $buying_mortgage,
    $buying_leasehold,
    $first_time_buyer,
    $let_or_2nd_home,
    $new_build,
    $is_a_company,
    $is_an_uk_resident,
    $property_purchase_price,
    $buyers,
    $remortgage_leasehold,
    $transfer_of_ownership,
    $registered_to_a_company
    ){

    global $objDb;

    $sid = (int)$sid;

    $type = mysqli_real_escape_string($objDb,$type);

    if($type == 3){

     $sql = "SELECT ft.*,
                   fn.name AS fee_name,
                   t.name AS type_name

            FROM fees_table ft

            LEFT JOIN fees_name fn ON fn.id = ft.fee_name_id
            LEFT JOIN fees_type t ON t.id = ft.type

            WHERE ft.solicitors_id='$sid'
            AND ft.transaction_type IN ('1', '2')";

    }else{

        $sql = "SELECT ft.*,
                   fn.name AS fee_name,
                   t.name AS type_name

            FROM fees_table ft

            LEFT JOIN fees_name fn ON fn.id = ft.fee_name_id
            LEFT JOIN fees_type t ON t.id = ft.type

            WHERE ft.solicitors_id='$sid'
            AND ft.transaction_type='$type'";

    }



    $result = mysqli_query($objDb,$sql);

    $data = [];

    while ($row = mysqli_fetch_assoc($result)) {

        // default include all
        $include = true;

        if($type ==1 || $type == 3){

            if ($mortgage != 1 && $row['fee_name'] == 'Mortgage Fee (inc vat)') {
                $include = false;
            }

            if ($leasehold != 1 && $row['fee_name'] == 'Leasehold fee (inc Vat)') {
                $include = false;
            }
            
            if ($row['fee_name'] == 'ID Check') {
                $row['quantity'] = (int)$sellers;
                $row['rates'] = (float)$row['rates'] * $sellers;
            }

        }       


        if($type ==2 || $type == 3){

            if ($buying_mortgage != 1 && $row['fee_name'] == 'Mortgage Fee (inc vat)') {
                $include = false;
            }

            if ($buying_leasehold != 1 && $row['fee_name'] == 'Leasehold fee (inc Vat)') {
                $include = false;
            }

            if ($is_a_company != 1 && $row['fee_name'] == 'Company Search') {
                $include = false;
            }

            if ($is_a_company != 1 && $row['fee_name'] == 'Company Registration Fee') {
                $include = false;
            }

            if ($is_a_company != 1 && $row['fee_name'] == 'Company Purchase fee (inc Vat)') {
                $include = false;
            }

            if ($is_a_company != 1 && $row['fee_name'] == 'Winding Up Search') {
                $include = false;
            }

            if ($new_build != 1 && $row['fee_name'] == 'New Build Fee (inc vat)') {
                $include = false;
            }
            
            if ($is_an_uk_resident != 1 && $row['fee_name'] == 'Non-UK Resident Fee') {
                $include = false;
            }


            
            if ($row['fee_name'] == 'ID Check') {
                $row['quantity'] = (int)$buyers;
                $row['rates'] = (float)$row['rates'] * $buyers;
            }

        } 

        if($type ==4){

            if ($remortgage_leasehold != 1 && $row['fee_name'] == 'Leasehold fee (inc Vat)') {
                $include = false;
            }

            if ($transfer_of_ownership != 1 && $row['fee_name'] == 'Transfer of Ownership (inc Vat)') {
                $include = false;
            }

            if ($registered_to_a_company != 1 && $row['fee_name'] == 'Company Registration Fee') {
                $include = false;
            }

            if ($registered_to_a_company != 1 && $row['fee_name'] == 'Company Search') {
                $include = false;
            }

            if ($registered_to_a_company != 1 && $row['fee_name'] == 'Winding Up Search') {
                $include = false;
            }

            if ($registered_to_a_company != 1 && $row['fee_name'] == 'Company Remortgage fee (inc Vat)') {
                $include = false;
            }


        } 



          
        if ($include) {
            $data[] = $row;
        }
    }

    return $data;
}


}
?>