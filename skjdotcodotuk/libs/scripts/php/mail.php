<?php

use PHPMailer\PHPMailer\PHPMailer;

if(isset($_POST['name']) && isset($_POST['email'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    require_once "PHPMailer/PHPMailer.php";
    require_once "PHPMailer/SMTP.php";
    require_once "PHPMailer/Exception.php";

    $mail = new PHPMailer();

    // SMTP Settings
    $mail->Host = "smtp.gmail.com";
    $mail->SMTPAuth = true;
    $mail->Username = "scottkennethjackson@gmail.com";
    $mail->Password = "nAvmi2-maqpev-viffon";
    $mail->Port = 465;
    $mail->SMTPSecure = "ssl";

    // Email Settings
    $mail->isHTML(true);
    $mail->setFrom($email, $name);
    $mail->addAddress("hello@scottkennethjackson.co.uk");
    $mail->Subject = ("Hello, Scott!");
    $mail->Body = $message;

    if($mail->send()) {
        $status = "success";
    } else {
        $status = "error";
    }

    exit(json_encode(array("status" => $status)));
};