<?php
function __autoload($class_name) { include $class_name . '.php'; }
set_include_path('lib');

require 'config.php';

function fatal($message) {
  header('Content-type: text/json');
  print json_encode(array('error_msg' => $message));
  exit;
}

if (!isset($_GET['code'])) {
  fatal('No OAuth code');
}

$http = new HTTPClient();
$http->setOptions(array(CURLOPT_HTTPHEADER => array('Content-Type: application/x-www-form-urlencoded')));
$data = array(
  'client_id' => $config['Client ID'],
  'client_secret' => $config['Client secret'],
  'grant_type' => 'authorization_code',
  'code' => $_GET['code'],
  'redirect_uri' => $config['Redirect URI'],
  'scope' => 'identify email connections'
);
try {
  $response = $http->post($config['API endpoint'] . '/oauth2/token', http_build_query($data));
} catch (HTTPRequestException $e) {
  $response = json_decode($e->response, TRUE);
  if (isset($response['error_description'])) {
    fatal("OAuth token retrieval failed: " . $response['error_description']);
  } else {
    fatal("OAuth token retrieval failed: " . $e->response);
  }
}
$parsed = json_decode($response, TRUE);
if (! isset($parsed['access_token']) || ! isset($parsed['token_type'])) {
  fatal('No access_token or token_type in response');
}
$token = $parsed['access_token'];
$type = $parsed['token_type'];

$http->setOptions(array(CURLOPT_HTTPHEADER => array('Authorization: Bearer ' . $token)));
$response = $http->get($config['API endpoint'] . '/users/@me');
$parsed = json_decode($response, TRUE);
$userid = $parsed['id'];
$username = $parsed['username'];

$response = $http->get($config['API endpoint'] . '/users/@me/guilds');
$userguilds = json_decode($response, TRUE);

$db = new RaidAlertDatabase($config['Database user'],
 $config['Database password'], $config['Database name']);
$guilds = $db->getGuilds();

$filteredUserGuilds = array();
foreach($userguilds as $guild) {
  if (isset($guilds[$guild['id']])) {
    $filteredUserGuilds[$guild['id']] = $guilds[$guild['id']];
  }
}

if (count($filteredUserGuilds) < 1) {
  fatal('Not a member of any supported guilds');
}

# We got everything we need to log the user in
Session::start($config['Session cookie name'], FALSE);
$_SESSION['userid'] = $userid;
$_SESSION['username'] = $username;
$_SESSION['guilds'] = $filteredUserGuilds;
$_SESSION['current_guild'] = array_keys($filteredUserGuilds)[0];

header('Location: ' . $config['App URL']);
