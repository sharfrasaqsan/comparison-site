<?php
// dbconn.php
// MySQLi database connection for backend manager classes

define('DB_HOST', 'localhost');
define('DB_NAME', 'conveyancing_compare');
define('DB_USER', 'root');
define('DB_PASS', '');

$objDb = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if (!$objDb) {
    die("Database connection failed: " . mysqli_connect_error());
}

mysqli_set_charset($objDb, "utf8mb4");
?>
