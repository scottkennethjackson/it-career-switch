<?php

$executionStartTime = microtime(true);

$url="http://api.geonames.org/earthquakesJSON?north=" . $_REQUEST["param1"] . "&south=" . $_REQUEST["param2"] . "&east=" . $_REQUEST["param3"] . "&west=" . $_REQUEST["param4"] . "&username=sk_jackson";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output["status"]["code"] = "200";
$output["status"]["name"] = "ok";
$output["status"]["description"] = "success";
$output["status"]["returnedIn"] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output["data"] = $decode["geonames"];

header("Content-Type: application/json; charset=UTF-8");

echo json_encode($output);

?>
