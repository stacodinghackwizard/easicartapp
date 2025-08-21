<?php
include "db.php";
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "GET":
        $productId = $_GET['product_id'] ?? null;
        $userId    = $_GET['user_id'] ?? null;

        if (!$userId) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        if ($productId) {
            // Single product + wishlist status
            $stmt = $conn->prepare("
                SELECT p.*, 
                      CASE WHEN w.product_id IS NOT NULL THEN 1 ELSE 0 END AS in_wishlist
                FROM products p
                LEFT JOIN wishlist w 
                  ON p.id = w.product_id AND w.user_id = ?
                WHERE p.id = ?
            ");
            $stmt->bind_param("ii", $userId, $productId);
            $stmt->execute();
            $product = $stmt->get_result()->fetch_assoc();

            echo json_encode(["status" => "success", "data" => $product]);
            exit;
        }

        // All products + wishlist status
        $stmt = $conn->prepare("
            SELECT p.*, 
                  CASE WHEN w.product_id IS NOT NULL THEN 1 ELSE 0 END AS in_wishlist
            FROM products p
            LEFT JOIN wishlist w 
              ON p.id = w.product_id AND w.user_id = ?
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }

        echo json_encode(["status" => "success", "data" => $products]);
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'] ?? null;
        $price = $data['price'] ?? null;

        if (!$name || !$price) {
            echo json_encode(["status" => "error", "message" => "Missing fields"]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO products (name, price) VALUES (?, ?)");
        $stmt->bind_param("sd", $name, $price);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Product added"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add product"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}