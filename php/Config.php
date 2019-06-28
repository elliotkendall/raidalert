<?php
class Config {
  public $config;

  function __construct($filename) {
    if (! ($this->config = json_decode(file_get_contents($filename, TRUE), TRUE))) {
      throw new Exception("Error parsing $filename");
    }
    # Per-host config override
    if (isset($_SERVER['HTTP_HOST'])
     && isset($this->config[$_SERVER['HTTP_HOST']])) {
      foreach($this->config[@$_SERVER['HTTP_HOST']] as $key => $val) {
        $this->config[$key] = $val;
      }
    }
  }

  function get($item) {
    if (! isset($this->config[$item])) {
      throw new Exception("Configuration does not include $item");
    }
    return $this->config[$item];
  }

  function exists($item) {
    return isset($this->config[$item]);
  }
}
?>
