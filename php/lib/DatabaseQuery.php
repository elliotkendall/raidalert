<?php
abstract class DatabaseQuery {
  protected $query;

  function __construct($db, $sql) {
    $this->query = $db->parse($sql);
  }

  abstract function bindParameters($parameters);

  abstract function execute();
}
?>
