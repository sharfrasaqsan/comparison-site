<?php


        include("dbconn.php"); 


class ExcellUploadManager {

    public function array_keys_to_lower($array) {
        
        return $newArray;
        exit();
    }

    
    public function excellUpload($data_array,$staff_name) {

        global $objDb;

        $updatestatusSQL = "UPDATE purchase_reports SET
                status='ARCHIVED'
                WHERE status='UPDATED' OR status = 'CURRENT' AND staff_id='$staff_name'";

        mysqli_query($objDb, $updatestatusSQL);


        foreach ($data_array as $row) {
            if (!isset($row['Ref']) || empty($row['Ref'])) continue;

            $staff_name       = sanitize(mysqli_real_escape_string($objDb, $staff_name ?? ''));
            $ref_no           = sanitize(mysqli_real_escape_string($objDb, $row['Ref'] ?? ''));
            $client           = sanitize(mysqli_real_escape_string($objDb, $row['Client'] ?? ''));
            $address          = sanitize(mysqli_real_escape_string($objDb, $row['Address'] ?? ''));
            $tenure           = sanitize(mysqli_real_escape_string($objDb, $row['Tenure'] ?? ''));
            $latest           = sanitize(mysqli_real_escape_string($objDb, $row['Latest'] ?? ''));
            $lpe1             = sanitize(mysqli_real_escape_string($objDb, $row['LPE1'] ?? ''));
            $mortgage_report  = sanitize(mysqli_real_escape_string($objDb, $row['Mortgage report'] ?? ''));
            $search_report    = sanitize(mysqli_real_escape_string($objDb, $row['Search report'] ?? ''));
            $title_report     = sanitize(mysqli_real_escape_string($objDb, $row['title report '] ?? ''));
            $signed_docs      = sanitize(mysqli_real_escape_string($objDb, $row['Signed Docs'] ?? ''));
            $precomp_searches = sanitize(mysqli_real_escape_string($objDb, $row['Pre-Comp searches'] ?? ''));
            $mo_expiry        = sanitize(mysqli_real_escape_string($objDb, $row['MO Expiry'] ?? ''));
            $cot_submitted    = sanitize(mysqli_real_escape_string($objDb, $row['COT submitted?'] ?? ''));
            $completed        = sanitize(mysqli_real_escape_string($objDb, $row['Completed'] ?? ''));
            $notes            = sanitize(mysqli_real_escape_string($objDb, $row['Notes'] ?? ''));
            $sdlt             = sanitize(mysqli_real_escape_string($objDb, $row['SDLT'] ?? ''));
            $ap1_manco        = sanitize(mysqli_real_escape_string($objDb, $row['AP1  & Manco'] ?? ''));
        

            $created_at       = date("Y-m-d H:i:s");
            
            $checkSQL = "SELECT id FROM purchase_reports WHERE ref_no = '$ref_no' LIMIT 1";
            $result = mysqli_query($objDb, $checkSQL);

            if (mysqli_num_rows($result) > 0) {
                // Update existing record
                $existing = mysqli_fetch_assoc($result);
                $id = $existing['id'];

                $updateSQL = "UPDATE purchase_reports SET
                    staff_id='$staff_name',
                    client='$client',
                    address='$address',
                    tenure='$tenure',
                    latest='$latest',
                    lpe1='$lpe1',
                    mortgage_report='$mortgage_report',
                    search_report='$search_report',
                    title_report='$title_report',
                    signed_docs='$signed_docs',
                    precomp_searches='$precomp_searches',
                    mo_expiry='$mo_expiry',
                    cot_submitted='$cot_submitted',
                    completed='$completed',
                    notes='$notes',
                    sdlt='$sdlt',
                    ap1_manco='$ap1_manco',
                    status='UPDATED',
                    created_at='$created_at'
                    WHERE id=$id";

                mysqli_query($objDb, $updateSQL);
                $action = "updated";
            } else {            
                $insertSQL = "INSERT INTO purchase_reports
                    (staff_id, ref_no, client, address, tenure, latest, lpe1, mortgage_report, search_report, title_report, signed_docs, precomp_searches, mo_expiry, cot_submitted, completed, notes, sdlt, ap1_manco, status, created_at)
                    VALUES
                    ('$staff_name','$ref_no','$client','$address','$tenure','$latest','$lpe1','$mortgage_report','$search_report','$title_report','$signed_docs','$precomp_searches','$mo_expiry','$cot_submitted','$completed','$notes','$sdlt','$ap1_manco','CURRENT','$created_at')";

                mysqli_query($objDb, $insertSQL);
                $id = mysqli_insert_id($objDb);
                $action = "inserted";
            }

        }
        
    }

    public function getAllPurchaseRecords($staff_name, $record_status) {
        global $objDb;

        $staff_name = sanitize(mysqli_real_escape_string($objDb, $staff_name ?? ''));
        $record_status = sanitize(mysqli_real_escape_string($objDb, $record_status ?? ''));

        $records = [];

        $selectSQL = "SELECT pr.*, sm.staff_name AS staff_name
            FROM purchase_reports pr
            LEFT JOIN staff_members sm ON pr.staff_id = sm.id
            WHERE 1=1
        ";

        if (!empty($staff_name)) {
            $staff_name = mysqli_real_escape_string($objDb, $staff_name);
            $selectSQL .= " AND pr.staff_id = '$staff_name'";
        }

        if (!empty($record_status)) {
            $record_status = mysqli_real_escape_string($objDb, $record_status);
            $selectSQL .= " AND pr.status = '$record_status'";
        }
     
        $selectSQL .= " ORDER BY sm.staff_name ASC";

        $result = mysqli_query($objDb, $selectSQL);
        while ($row = mysqli_fetch_assoc($result)) {
            $records[] = $row;
        }
        return $records;
    }

}

?> 