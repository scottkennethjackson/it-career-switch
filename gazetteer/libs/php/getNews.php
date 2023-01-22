<?php

$executionStartTime = microtime(true);

$url="https://newsdata.io/api/1/news?apikey=pub_8774e2341db9a70a6c9ac98105ca4b933b03&country=" . $_REQUEST["param1"] . "&category=top&language=en";

$decode = curlNewsData($url);

function curlNewsData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result, true);
    return $decode;
}

if ($decode["status"] == "error") {
    $url="https://newsdata.io/api/1/news?apikey=pub_8774e2341db9a70a6c9ac98105ca4b933b03&q=" . $_REQUEST["param2"] . "&category=top&language=en";
    $decode = curlNewsData($url);
}

if ($decode["totalResults"] == 0) {
    $url="https://newsdata.io/api/1/news?apikey=pub_8774e2341db9a70a6c9ac98105ca4b933b03&category=top&language=en";
    $decode = curlNewsData($url);
}

$output["status"]["code"] = "200";
$output["status"]["name"] = "ok";
$output["status"]["description"] = "success";
$output["status"]["returnedIn"] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

$newsData = array();

$stories = $decode["results"];
for ($i=0; $i<sizeof($stories); $i++) {
    if (!$stories[$i]["image_url"]) {
        array_push($newsData, array($stories[$i]["title"], $stories[$i]["link"],"./libs/images/gazetteer-news.png"));
    } else {
    array_push($newsData, array($stories[$i]["title"], $stories[$i]["link"],$stories[$i]["image_url"]));
    }
}

$output["data"] = $newsData;

header("Content-Type: application/json; charset=UTF-8");

echo json_encode($output);

?>
