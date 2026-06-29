<?php
include("dbconn.php");

class SolicitorManager {

    // Convert array keys to lowercase
    public function array_keys_to_lower($array) {

        if (!is_array($array)) {
            return [];
        }

        return array_change_key_case($array, CASE_LOWER);
    }

    // Get all active solicitors
    public function getAllSolicitors() {

        global $objDb;

        $records = [];

        $selectSQL = "SELECT * FROM solicitors 
                      WHERE status = '1' 
                      ORDER BY id DESC";

        $result = mysqli_query($objDb, $selectSQL);

        while ($row = mysqli_fetch_assoc($result)) {
            $records[] = $row;
        }

        return $records;
    }

    // Get single solicitor
    public function getSolicitor($id) {

        global $objDb;

        $id = (int)$id;

        $sql = "SELECT * FROM solicitors 
                WHERE id = '$id' 
                LIMIT 1";

        $result = mysqli_query($objDb, $sql);

        return mysqli_fetch_assoc($result);
    }

    // Add solicitor
    public function addSolicitor($data, $file) {

        global $objDb;

        $name = mysqli_real_escape_string($objDb, trim($data['name']));
        $telephone = mysqli_real_escape_string($objDb, trim($data['telephone_number']));
        $address = mysqli_real_escape_string($objDb, trim($data['address']));

        // Check duplicate
        $checkQuery = "SELECT id 
                       FROM solicitors 
                       WHERE name = '$name' 
                       LIMIT 1";

        $checkResult = mysqli_query($objDb, $checkQuery);

        if (mysqli_num_rows($checkResult) > 0) {

            return [
                'status' => false,
                'message' => 'Solicitor already exists.'
            ];
        }

        // Upload logo
        $logo = '';

        if (!empty($file['logo']['name'])) {

            $uploadDir = "uploads/";

            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $filename = time() . "_" . basename($file['logo']['name']);

            $targetFile = $uploadDir . $filename;

            move_uploaded_file($file['logo']['tmp_name'], $targetFile);

            $logo = $filename;
        }

        // Insert
        $insertQuery = "INSERT INTO solicitors
                        (
                            name,
                            logo,
                            telephone_number,
                            address,
                            status
                        )
                        VALUES
                        (
                            '$name',
                            '$logo',
                            '$telephone',
                            '$address',
                            '1'
                        )";

        if (mysqli_query($objDb, $insertQuery)) {

            return [
                'status' => true,
                'message' => 'Solicitor added successfully.'
            ];

        } else {

            return [
                'status' => false,
                'message' => 'Error adding solicitor.'
            ];
        }
    }

    // Update solicitor
    public function updateSolicitor($id, $data, $file) {

        global $objDb;

        $id = (int)$id;

        $name = mysqli_real_escape_string($objDb, trim($data['name']));
        $telephone = mysqli_real_escape_string($objDb, trim($data['telephone_number']));
        $address = mysqli_real_escape_string($objDb, trim($data['address']));

        $updateLogo = "";

        // Upload new logo
        if (!empty($file['logo']['name'])) {

            $uploadDir = "uploads/";

            $filename = time() . "_" . basename($file['logo']['name']);

            $targetFile = $uploadDir . $filename;

            move_uploaded_file($file['logo']['tmp_name'], $targetFile);

            $updateLogo = ", logo = '$filename'";
        }

        $sql = "UPDATE solicitors SET
                    name = '$name',
                    telephone_number = '$telephone',
                    address = '$address'
                    $updateLogo
                WHERE id = '$id'";

        if (mysqli_query($objDb, $sql)) {

            return [
                'status' => true,
                'message' => 'Solicitor updated successfully.'
            ];

        } else {

            return [
                'status' => false,
                'message' => 'Error updating solicitor.'
            ];
        }
    }

    // Delete solicitor
    public function deleteSolicitor($id) {

        global $objDb;

        $id = (int)$id;

        $sql = "UPDATE solicitors 
                SET status = '0' 
                WHERE id = '$id'";

        mysqli_query($objDb, $sql);
    }

}
?>