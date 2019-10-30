class config:
  
  def __init__(self, file):
    import json
    f = open(file, 'r')
    c = f.read()
    self.config = json.loads(c)

  def get(self, var):
    return self.config[var]
