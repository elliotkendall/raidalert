<?php
abstract class Database {
  abstract function __construct($dbuser, $dbpass, $dbname, $dbhost = NULL);

  abstract function error();

  abstract function parse($sql);
}
?>
