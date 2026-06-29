<?php
include("dbconn.php"); 

class StaffManager {

    public function array_keys_to_lower($array) {
        
        return $newArray;
        exit();
    }

        public function selectStaffMemeber() {

            global $objDb;
            $records = [];
            $selectSQL = "SELECT * FROM staff_members WHERE 1=1 AND status='1'";
            $selectSQL .= " ORDER BY id DESC";
            $result = mysqli_query($objDb, $selectSQL);
            
            while ($row = mysqli_fetch_assoc($result)) {
                $records[] = $row;
            }
            return $records;

        }

        public function getAllStaffMembers() {
            global $objDb;
            $records = [];
            $selectSQL = "SELECT * FROM staff_members WHERE 1=1 AND status='1'";
            $selectSQL .= " ORDER BY id DESC";
            $result = mysqli_query($objDb, $selectSQL);

            while ($row = mysqli_fetch_assoc($result)) {
                $records[] = $row;
            }
            return $records;
        }

    public function addStaffMember($name) {
        global $objDb;
        $name = mysqli_real_escape_string($objDb, trim($name));

        $checkQuery = "SELECT id FROM staff_members WHERE staff_name = '$name' LIMIT 1";
        $checkResult = mysqli_query($objDb, $checkQuery);

        if (mysqli_num_rows($checkResult) > 0) {            
            return ['status' => false, 'message' => 'Staff member already exists.'];
        }
        $insertQuery = "INSERT INTO staff_members (staff_name, status) VALUES ('$name', '1')";
        if (mysqli_query($objDb, $insertQuery)) {
            return ['status' => true, 'message' => 'Staff member added successfully.'];
        } else {
            return ['status' => false, 'message' => 'Error adding staff member.'];
        }
       
    }

    public function deleteStaffMember($id) {
        global $objDb;
        $id = (int)$id;
        $sql = "UPDATE staff_members SET status = '0' WHERE id = $id";
        mysqli_query($objDb, $sql);
    }

}

?> 