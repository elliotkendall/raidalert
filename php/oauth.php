<?php
function __autoload($class_name) { include $class_name . '.php'; }
set_include_path('/var/www/data/dx4.org/raidalert');

$config = new Config('config.json');

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
  'client_id' => $config->get('Client ID'),
  'client_secret' => $config->get('Client secret'),
  'grant_type' => 'authorization_code',
  'code' => $_GET['code'],
  'redirect_uri' => $config->get('Redirect URI'),
  'scope' => 'identify email connections'
);
try {
  $response = $http->post($config->get('API endpoint') . '/oauth2/token', http_build_query($data));
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
$response = $http->get($config->get('API endpoint') . '/users/@me');
$parsed = json_decode($response, TRUE);
$userid = $parsed['id'];
$username = $parsed['username'];

$response = $http->get($config->get('API endpoint') . '/users/@me/guilds');
$userguilds = json_decode($response, TRUE);

$db = new RaidAlertDatabase($config->get('Database user'),
 $config->get('Database password'), $config->get('Database name'));
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
Session::start($config->get('Session cookie name'), FALSE);
$_SESSION['userid'] = $userid;
$_SESSION['username'] = $username;
$_SESSION['guilds'] = $filteredUserGuilds;
$_SESSION['current_guild'] = array_keys($filteredUserGuilds)[0];

header('Location: ' . $config->get('App URL'));
