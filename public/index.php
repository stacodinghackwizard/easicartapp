<?php
// Allow from any origin
header("Access-Control-Allow-Origin: *");

// Allow specific methods
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allow headers
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


require_once __DIR__ . "/config.php";

$action = $_GET['action'] ?? null;

switch ($action) {
    case "products":
        include __DIR__ . "/../api/products.php";
        break;

    case "cart":
        include __DIR__ . "/../api/cart.php";
        break;

    case "wishlist":
        include __DIR__ . "/../api/wishlist.php";
        break;

    case "orders":
        include __DIR__ . "/../api/order.php";
        break;

    case "webhook":
        include __DIR__ . "/../api/webhook.php";
        break;
    
    case "signup":
        include __DIR__ . "/../api/auth.php";
        break;

    case "login":
        include __DIR__ . "/../api/auth.php";
        break;

    case "logout":
        include __DIR__ . "/../api/auth.php";
        break;

    default:
        header("Content-Type: application/json");
        echo json_encode(["message" => "Welcome to Eazicart API"]);
}
