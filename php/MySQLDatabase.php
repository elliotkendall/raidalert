<?php
class MySQLDatabase extends Database {
  private $db;

  function __construct($dbuser, $dbpass, $dbname, $dbhost = NULL) {
    if ($dbhost === NULL) {
      $dbhost = '127.0.0.1';
    }
    $this->db = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
    if (mysqli_connect_error()) {
      throw new Exception('Connect Error (' . mysqli_connect_errno() . ') '
       . mysqli_connect_error());
    }
  }

  function error() {
    return $this->db->error;
  }

  function parse($sql) {
    $query = $this->db->prepare($sql);
    if (! $query) {
      throw new Exception('Failed to prepare query: '
       . $this->db->error);
    }
    return $query;
  }

}
?>
