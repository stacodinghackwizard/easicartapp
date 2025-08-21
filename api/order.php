<?php
include "db.php";
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id'], $data['total'], $data['sub_total'], $data['shipping'], $data['tax'])) {
            echo json_encode(["status" => "error", "message" => "Missing fields"]);
            exit;
        }

        $user_id = $data['user_id'];
        $total   = $data['total'];
        $sub_total = $data['sub_total'];
        $shipping = $data['shipping'];
        $applied_coupon = $data['applied_coupon'] ?? "N/A";
        $tax = $data['tax'];

        try {
            $conn->begin_transaction();

            $stmt = $conn->prepare(
                "INSERT INTO orders (user_id, total, sub_total, shipping, tax, status, applied_coupon) 
                        VALUES (?, ?, ?, ?, ?, 'pending', ?)");
            $stmt->bind_param("idddds", $user_id, $total, $sub_total, $shipping, $tax, $applied_coupon);
            if (!$stmt->execute()) {
                throw new Exception("Failed to create order");
            }

            $order_id = $conn->insert_id;
            $sql = "
                INSERT INTO order_items (order_id, product_id, quantity)
                SELECT ?, c.product_id, c.quantity
                FROM cart c
                WHERE c.user_id = ?
            ";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $order_id, $user_id);
            if (!$stmt->execute()) {
                throw new Exception("Failed to add order items");
            }

            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);
            if (!$stmt->execute()) {
                throw new Exception("Failed to clear cart");
            }

            // Generate merchant ref
            $merchant_ref = "ORD_" . uniqid();

            // Save payment as pending
            $stmt = $conn->prepare("INSERT INTO payments (user_id, order_id, total, status, merchant_ref) VALUES (?, ?, ?, 'pending', ?)");
            $stmt->bind_param("iids", $user_id, $order_id, $total, $merchant_ref);

            if (!$stmt->execute()) {
                echo json_encode(["status" => "error", "message" => "Failed to create payment"]);
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
            $payload = json_encode([
                "data" => array(
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
                )
            ]);

            // Send to MarasoftPay
            $ch = curl_init("https://checkout.marasoftpay.live/initiate_transaction");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

            $response = curl_exec($ch);
            curl_close($ch);
            $res = json_decode($response);
            
            if ($res->status === "error") {
                throw new Exception("Error initiating payment");
            }

            $conn->commit();
            echo json_encode([
                "status" => "success",
                "url" => $res->url
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
        break;


    case "GET":
        $user_id = $_GET['user_id'] ?? null;
        $order_id = $_GET['order_id'] ?? null;
        if ($order_id) {
            $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? AND id = ?");
            $stmt->bind_param("ii", $user_id, $order_id);
            $stmt->execute();
            $order = $stmt->get_result()->fetch_assoc();

            echo json_encode(["status" => "success", "data" => $order]);
            exit;
        }

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