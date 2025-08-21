<?php
include "db.php";
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id'], $data['product_id'], $data['quantity'])) {
            echo json_encode(["status" => "error", "message" => "Missing fields"]);
            exit;
        }

        $user_id = $data['user_id'];
        $product_id = $data['product_id'];
        $quantity = $data['quantity'];

        $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $user_id, $product_id, $quantity);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Added to cart"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add to cart"]);
        }
        break;

    case "GET":
        $user_id = $_GET['user_id'] ?? null;
        $product_id = $_GET['product_id'] ?? null;

        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        if (isset($product_id)) {
            $stmt = $conn->prepare("
                SELECT c.*, p.* 
                FROM cart c
                INNER JOIN products p ON c.product_id = p.id
                WHERE c.product_id = ? AND c.user_id = ?
            ");
            $stmt->bind_param("ii", $product_id, $user_id);
            $stmt->execute();
            $product = $stmt->get_result()->fetch_assoc();
            echo json_encode(["status" => "success", "data" => $product]);
            exit;
        }

        $stmt = $conn->prepare("
            SELECT c.*, p.* 
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $cart = [];
        while ($row = $result->fetch_assoc()) {
            $cart[] = $row;
        }

        echo json_encode(["status" => "success", "data" => $cart]);
        break;

    case "PUT":
         $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id'], $data['product_id'], $data['quantity'])) {
            echo json_encode(["status" => "error", "message" => "Missing fields"]);
            exit;
        }

        $user_id = $data['user_id'];
        $product_id = $data['product_id'];
        $quantity = $data['quantity'];

        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("iii", $quantity, $user_id, $product_id);
        $stmt->execute();

        $stmt = $conn->prepare("SELECT * FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $cart = [];
        while ($row = $result->fetch_assoc()) {
            $cart[] = $row;
        }

        echo json_encode(["status" => "success", "data" => $cart]);
        break;

    case "DELETE":
        $data = json_decode(file_get_contents("php://input"), true);
        $user_id = $data['user_id'] ?? null;
        $product_id = $data['product_id'] ?? null;

        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        if ($product_id) {
          $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
          $stmt->bind_param("ii", $user_id, $product_id);
        } else {
          $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
          $stmt->bind_param("i", $user_id);
        }

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => $product_id ? "Item removed from cart" : "Cart has been deeted successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => $product_id ? "Failed to remove item" : "Failed to delete cart"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}