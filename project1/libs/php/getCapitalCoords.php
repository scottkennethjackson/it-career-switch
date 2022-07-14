<?php

$executionStartTime = microtime(true);

$url="http://api.opencagedata.com/geocode/v1/json?q=" . $_REQUEST["param1"] . "+" . $_REQUEST["param2"] . "&key=777f761e5746414697e69cbf97b96341";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$timeoffset = $decode["results"]["0"]["annotations"]["timezone"]["offset_sec"];

$output["status"]["code"] = "200";
$output["status"]["name"] = "ok";
$output["status"]["description"] = "success";
$output["status"]["returnedIn"] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output["data"] = $decode["results"]["0"]["geometry"];
$output["data"] = ($decode["results"]["0"]["annotations"]["sun"]["rise"]["apparent"] + $timeoffset);
$output["timeoffset"] = $timeoffset;

header("Content-Type: application/json; charset=UTF-8");

echo json_encode($output);

?>
