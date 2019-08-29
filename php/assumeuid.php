<?php
function __autoload($class_name) { include $class_name . '.php'; }
set_include_path('lib');

require 'config.php';
$db = new RaidAlertDatabase($config['Database user'],
 $config['Database password'], $config['Database name']);

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Content-type: text/json');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  header('Access-Control-Allow-Headers: Content-type');
  header('Access-Control-Allow-Methods: GET, POST, DELETE');
  exit;
}
Session::start($config['Session cookie name']);

Session::adminCheck();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $data = json_decode(file_get_contents('php://input'), true);
  $_SESSION['userid'] = $data['uid'];
  RaidAlert::printInfoBatch($db);
}
