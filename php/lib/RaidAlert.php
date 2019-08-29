<?php
class RaidAlert {
  static function printInfoBatch($db) {
    $gyms = $db->getGymsByGuild($_SESSION['current_guild'], $_SESSION['userid']);
    $guilds = $db->getGuilds();
    $guild = $guilds[$_SESSION['current_guild']];
    print json_encode(array(
     'gyms' => $gyms,
     'isadmin' => $_SESSION['guilds'][$_SESSION['current_guild']]['isadmin'],
     'lat' => $guild['lat'],
     'lng' => $guild['lng'],
     'zoom' => $guild['zoom']
    ));
  }
}