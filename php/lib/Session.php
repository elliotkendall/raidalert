<?php
class Session {
  static function start($name, $requireSession = TRUE) {
    session_start(array('name' => $name,
                        'cookie_secure' => TRUE,
                        'use_strict_mode' => TRUE,
                        'cookie_httponly' => TRUE
                        ));
    if ($requireSession) {
      if ($_SESSION['userid'] == '') {
        http_response_code(403);
        header('Content-type: text/json');
        print json_encode(array('error' => 'Not logged in'));
        exit;
      }
      date_default_timezone_set($_SESSION['guilds'][$_SESSION['current_guild']]['tz']);
    }
  }
}
