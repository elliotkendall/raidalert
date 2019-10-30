import MySQLdb
import MySQLdb.cursors
import _mysql_exceptions

class raidalertdb:
  def __init__(self, user, password, dbname, host):
    self.user = user
    self.password = password
    self.dbname = dbname
    self.host = host
    self.dbconnect()

  def dbconnect(self):
    self.db=MySQLdb.connect(host=self.host,user=self.user,passwd=self.password,db=self.dbname,cursorclass=MySQLdb.cursors.DictCursor)
    self.cursor = self.db.cursor()

  def execute(self, sql, params):
    try:
      return self.cursor.execute(sql, params)
    except _mysql_exceptions.OperationalError:
      self.dbconnect()
      return self.cursor.execute(sql, params)

  def getGyms(self, guild):
    self.execute('select * from gym where guild=%s', (guild,))
    return self.cursor.fetchall()

  def getAvailability(self, gid):
    self.execute('select user, weekend, weekdaydaytime, weekdayevening from availability where gid=%s', (gid,))
    ret = {}
    for user in self.cursor.fetchall():
      ret[user['user']] = user
    return ret
