<?php
class MySQLQuery extends DatabaseQuery {
  function bindParameters($parameters) {
    # bind_param now requires its parameters to be passed by reference, not
    # by value. I still don't quite have my head wrapped around this, but
    # the refValues function fixes up the parameters as necessary for it to
    # work

    $p = array_merge(array($parameters['types']), $parameters['values']);
    $ref = new ReflectionClass('mysqli_stmt'); 
    $method = $ref->getMethod('bind_param'); 
    if (! $method->invokeArgs($this->query, self::refValues($p))) {
      throw new Exception('Failed to bind parameters');
    }
  }

  # Needed for mysqli_stmt  - see bindParameters above
  static function refValues($a) {
    if (strnatcmp(phpversion(),'5.3') >= 0) {
      $refs = array();
      foreach($a as $key => $value)
        $refs[$key] = &$a[$key];
      return $refs;
    }
    return $arr;
  }

  function execute() {
    if (! $this->query->execute()) {
      throw new Exception('Could not execute query: '
       . $this->query->error); 
    }
    $md = $this->query->result_metadata();
    if (! $md) {
      if ($this->query->error == '') {
        # This request doesn't return data
        return NULL;
      }
      throw new Exception('Could not fetch result metadata: '
       . $this->query->error); 
    }
    $fields = $md->fetch_fields();
    if (! $fields) {
      throw new Exception('Could not fetch result fields: '
       . $this->query->error); 
    }

    $params = array();
    $row = array();
    foreach ($fields as $field) {
      $params[] = &$row[$field->name]; 
    }
    call_user_func_array(array($this->query, 'bind_result'), $params); 

    $ret = array();
    while ($this->query->fetch()) {
      # We can't just add $row to our result set, since that's just a
      # reference that gets modified in-place whenever fetch() gets called.
      # Instead, make a shallow copy
      $newrow = array();
      foreach($row as $key => $value) {
        $newrow[$key] = $value;
      }
      $ret[] = $newrow;
    }
    return $ret;
  }

  function reset() {
    $this->query->reset();
  }
}
?>
