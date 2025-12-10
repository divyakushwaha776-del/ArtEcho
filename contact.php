<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Sanitize input
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // Validate email
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Prepare data with timestamp
        $data = "[" . date("Y-m-d H:i:s") . "] Name: $name, Email: $email, Message: $message\n";

        // Append data to messages.txt
        file_put_contents("messages.txt", $data, FILE_APPEND);

        echo "Message saved successfully!";
    } else {
        echo "Invalid email!";
    }
}
?>