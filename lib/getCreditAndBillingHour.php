<?php
include 'DB.php';

$db = new DB();
$subject = $db->get('subjectCode');
$courseNumber = $db->get('courseNumber');
$query = "CALL getCreditAndBillingHour('$subject', '$courseNumber')";
$result = $db->query($query);
$db->return_json(200, $result);