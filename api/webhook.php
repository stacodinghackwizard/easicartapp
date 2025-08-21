<?php
include "db.php";
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$merchant_ref = $data['merchant_tx_ref'];
$status = $data['status'];

$stmt = $conn->prepare("UPDATE orders SET status=? WHERE merchant_ref=?");
$stmt->bind_param("ss", $status, $merchant_ref);
$stmt->execute();

echo json_encode(["status" => "ok"]);
?>
