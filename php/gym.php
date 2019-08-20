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

try {
  if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    print json_encode($db->getAvailability($_GET['id'], $_SESSION['userid']));
  } else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $db->removeRecord(
     $_SESSION['userid'],
     intval($data['gid']),
     intval($data['start']),
     intval($data['stop']),
     $data['days']);
    print json_encode($db->getAvailability($data['gid'], $_SESSION['userid']));
  } else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $days = array();
    foreach ($data['days'] as $day => $bool) {
      if ($bool) {
        $days[] = $day;
      }
    }

    $db->addRecord(
     $_SESSION['userid'],
     intval($data['gid']),
     intval($data['start']),
     intval($data['stop']),
     $days);
    print json_encode($db->getAvailability($data['gid'], $_SESSION['userid']));
  } else {
    print json_encode($db->getGymsByGuild($_SESSION['current_guild'], $_SESSION['userid']));
  }
} catch (Exception $e) {
  http_response_code(403);
  print json_encode(array('error' => $e->getMessage()));
}
