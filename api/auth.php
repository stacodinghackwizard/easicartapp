<?php
include "db.php";
header('Content-Type: application/json');

// Signup
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'signup') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['full_name'];
    $email = $data['email'];
    $phone = $data['phone'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $password, $phone);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User registered"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Email already exists"]);
    }
}

// Login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if ($result && password_verify($password, $result['password'])) {
      unset($result['password']);
      echo json_encode(["status" => "success", "user" => $result]);
    } else {
      echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
}
?>