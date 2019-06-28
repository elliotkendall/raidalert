<?php
class RaidAlertDatabase extends MySQLDatabase {
  private $addQuery;

  function __construct($dbuser, $dbpass, $dbname, $dbhost = NULL) {
    parent::__construct($dbuser, $dbpass, $dbname, $dbhost);

    $this->addRecordQuery = new MySQLQuery($this, '
insert into availability (user, gid, start, stop, days) values (?, ?, ?, ?, ?)');

    $this->removeRecordQuery = new MySQLQuery($this, '
delete from availability where user=? and gid=? and start=? and stop=? and days=?');

    $this->gymQuery = new MySQLQuery($this, '
select user, start, stop, days from availability where gid=?');

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

  function addRecord($user, $gid, $begin, $end, $days) {
    $this->addRecordQuery->bindParameters(array('types' => 'iiiii',
     'values' => array($user, $gid, $begin, $end, self::daysArrayToInt($days))));
    $this->addRecordQuery->execute();
  }

  function removeRecord($user, $gid, $begin, $end, $days) {
    $this->removeRecordQuery->bindParameters(array('types' => 'iiiii',
     'values' => array($user, $gid, $begin, $end, self::daysArrayToInt($days))));
    $this->removeRecordQuery->execute();
  }

  static function daysArrayToInt($days) {
    $i=0;
    $ret=0;
    foreach(array('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') as $day) {
      if (in_array($day, $days)) {
        $ret += pow(2, $i);
      }
      $i++;
    }
    return $ret;
  }

  static function daysIntToArray($int) {
    $i=0;
    $ret=array();
    foreach(array('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') as $day) {
      $pow = pow(2, $i);
      if (($int & $pow) == $pow) {
        $ret[] = $day;
      }
      $i++;
    }
    return $ret;
  
  }

  function getAvailability($gid, $uid) {
    $this->gymQuery->bindParameters(array('types' => 'i',
     'values' => array($gid)));
    $today = strtolower(date('l'));
    $availnow = array();
    $availnext = array();
    $myrows = array();
    $now = date('H');
    $next = date('H', time() + 3600);
    foreach($this->gymQuery->execute() as $row) {
      if ($row['user'] == $uid) {
        $row['days'] = self::daysIntToArray($row['days']);
        $myrows[] = $row;
        continue;
      }
      $days = self::daysIntToArray($row['days']);
      if (in_array($today, $days)) {
        if ($row['start'] <= $now && $now <= $row['stop']) {
          $availnow[] = strval($row['user']);
        }
        if ($row['start'] <= $next && $next <= $row['stop']) {
          $availnext[] = strval($row['user']);
        }
      }
    }
    return array('now' => $availnow, 'next' => $availnext, 'user' => $myrows);
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

  function getGuilds() {
    $guilds = $this->guildsQuery->execute();
    $guildsById = array();
    foreach($guilds as $guild) {
      $guildsById[$guild['guildid']] = $guild;
    }
    return $guildsById;
  }

}
