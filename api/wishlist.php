<?php
include "db.php";
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['user_id'], $data['product_id'])) {
            echo json_encode(["status" => "error", "message" => "Missing fields"]);
            exit;
        }

        $user_id = $data['user_id'];
        $product_id = $data['product_id'];

        $stmt = $conn->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $user_id, $product_id);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Added to wishlist"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add to wishlist"]);
        }
        break;

    case "GET":
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        $stmt = $conn->prepare("
            SELECT w.*, p.* 
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $wishlist = [];
        while ($row = $result->fetch_assoc()) {
            $wishlist[] = $row;
        }

        echo json_encode(["status" => "success", "data" => $wishlist]);
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
            $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
            $stmt->bind_param("ii", $user_id, $product_id);
        } else {
            $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);
        }

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => $product_id ? "Item removed from wishlist" : "Wishlist cleared successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => $product_id ? "Failed to remove item" : "Failed to clear wishlist"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
