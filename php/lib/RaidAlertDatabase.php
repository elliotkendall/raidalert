<?php
class RaidAlertDatabase extends MySQLDatabase {
  private $addQuery;

  function __construct($dbuser, $dbpass, $dbname, $dbhost = NULL) {
    parent::__construct($dbuser, $dbpass, $dbname, $dbhost);

    $this->updateAvailabilityQuery = new MySQLQuery($this, '
insert into availability (user, gid, weekend, weekdaydaytime, weekdayevening)
values (?, ?, ?, ?, ?)
on duplicate key update
weekend=?,
weekdaydaytime=?,
weekdayevening=?
');

    $this->deleteAvailabilityQuery = new MySQLQuery($this, '
delete from availability where user=? and gid=?');

    $this->gymQuery = new MySQLQuery($this, '
select user, weekend, weekdaydaytime, weekdayevening from availability where gid=?');

    $this->newGymQuery = new MySQLQuery($this, '
insert into gym (name, guild, lat, lng) values (?, ?, ?, ?)');

    $this->gymsByGuildQuery = new MySQLQuery($this, '
select gym.gid as gid, name, lat, lng, count(distinct user) as user
from gym
left join availability
 on gym.gid=availability.gid
 and user=?
where guild=?
group by gid');

    $this->guildsQuery = new MySQLQuery($this, '
select * from guild');
  }

  function updateAvailability($user, $gid, $weekend, $weekdaydaytime, $weekdayevening) {
    if ($weekend || $weekdaydaytime || $weekdayevening) {
      $this->updateAvailabilityQuery->bindParameters(array('types' => 'iiiiiiii',
       'values' => array($user, $gid, $weekend, $weekdaydaytime, $weekdayevening, $weekend, $weekdaydaytime, $weekdayevening)));
      $this->updateAvailabilityQuery->execute();
    } else {
      $this->deleteAvailabilityQuery->bindParameters(array('types' => 'ii',
       'values' => array($user, $gid)));
      $this->deleteAvailabilityQuery->execute();
    }
  }

  function getAvailability($gid, $uid) {
    $this->gymQuery->bindParameters(array('types' => 'i',
     'values' => array($gid)));

    if (in_array(date('l'), array('Saturday', 'Sunday'))) {
      $now = 'weekend';
    } else {
      if (date('H') >= 17) {
        $now = 'weekdayevening';
      } else {
        $now = 'weekdaydaytime';
      }
    }

    $users = array();
    $myavail = array(
     'weekend' => 0,
     'weekdaydaytime' => 0,
     'weekdayevening' => 0);
    foreach($this->gymQuery->execute() as $row) {
      if ($row['user'] == $uid) {
        $myavail = array(
         'weekend' => $row['weekend'],
         'weekdaydaytime' => $row['weekdaydaytime'],
         'weekdayevening' => $row['weekdayevening']);
        continue;
      }
      if ($row[$now] == 1) {
        $users[] = $row['user'];
      }
    }
    return array('availability' => $users, 'self' => $myavail);
  }

  function getGymsByGuild($guild, $uid) {
    $this->gymsByGuildQuery->bindParameters(array('types' => 'ii',
     'values' => array($uid, $guild)));
    $ret = array();
    foreach($this->gymsByGuildQuery->execute() as $gym) {
      $ret[$gym['gid']] = $gym;
    }
    return $ret;
  }

  function newGym($name, $guild, $lat, $lng) {
    $this->newGymQuery->bindParameters(array('types' => 'sidd',
     'values' => array($name, $guild, $lat, $lng)));
    $this->newGymQuery->execute();
  }

  function getGuilds() {
    $guilds = $this->guildsQuery->execute();
    $guildsById = array();
    foreach($guilds as $guild) {
      $guildsById[$guild['guildid']] = $guild;
    }
    return $guildsById;
  }

}
