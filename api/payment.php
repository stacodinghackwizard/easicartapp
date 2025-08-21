<?php
include "db.php";
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "POST":
        // Create new order + initialize payment
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id'], $data['total'])) {
            echo json_encode(["status" => "error", "message" => "Missing fields"]);
            exit;
        }

        $user_id = $data['user_id'];
        $total   = $data['total'];

        // Generate merchant ref
        $merchant_ref = "ORD_" . uniqid();

        // Save order as pending
        $stmt = $conn->prepare("INSERT INTO orders (user_id, total, status, merchant_ref) VALUES (?, ?, 'pending', ?)");
        $stmt->bind_param("ids", $user_id, $total, $merchant_ref);

        if (!$stmt->execute()) {
            echo json_encode(["status" => "error", "message" => "Failed to create order"]);
            exit;
        }

        // Load env values
        $publicKey   = $_ENV['PAY_PUBLIC_KEY'];
        $requestType = $_ENV['PAY_REQUEST_TYPE'];
        $redirectUrl = $_ENV['PAY_REDIRECT_URL'];

        $stmt = $conn->prepare("SELECT full_name, email, phone FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        // Payment integration payload
        $payload = [
            "public_key"       => $publicKey,
            "request_type"     => $requestType,
            "merchant_tx_ref"  => $merchant_ref,
            "redirect_url"     => $redirectUrl,
            "name"             => $user['full_name'],
            "email_address"    => $user['email'],
            "phone_number"     => $user['phone'],
            "amount"           => $total * 100, // in kobo
            "currency"         => "NGN",
            "user_bear_charge" => "no",
            "description"      => "Order payment"
        ];

        // Send to MarasoftPay
        $ch = curl_init("https://checkout.marasoftpay.live/initiate_transaction");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

        $response = curl_exec($ch);
        curl_close($ch);

        echo $response; // returns JSON with payment link
        break;

    case "GET":
        // Fetch user orders
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }

        echo json_encode(["status" => "success", "data" => $orders]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}