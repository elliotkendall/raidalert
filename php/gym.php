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
  } else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['gid']) && isset($data['weekend'])
     && isset($data['weekdaydaytime']) && isset($data['weekdayevening'])) {
      $db->updateAvailability(
       $_SESSION['userid'],
       $data['gid'],
       $data['weekend'],
       $data['weekdaydaytime'],
       $data['weekdayevening']
      );
      if (is_array($data['gid'])) {
        # We're updating a bunch of gyms, so return all the gym info
        RaidAlert::printInfoBatch($db);
      } else {
        # Just return info for this gym
        print json_encode($db->getAvailability($data['gid'], $_SESSION['userid']));
      }
    } else if (isset($data['name']) && isset($data['latlng'])) {
      Session::adminCheck();
      $db->newGym(
       $data['name'],
       $_SESSION['current_guild'],
       $data['latlng'][0],
       $data['latlng'][1]
      );
      RaidAlert::printInfoBatch($db);
    } else {
      print json_encode(array('error' => 'unknown POST operation'));
    }
  } else {
    RaidAlert::printInfoBatch($db);
  }
} catch (Exception $e) {
  print json_encode(array('error' => $e->getMessage()));
}
