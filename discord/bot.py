#!/usr/bin/python3
import re
import sys
import os
from raidalertdb import raidalertdb
from fuzzywuzzy import fuzz
from config import config
import discord

def normalize(gym):
  # Remove exgym tag
  gym = re.sub(' *exgym *', '', gym)

  # Strip number endings
  gym = re.sub('([0-9]+)(st|nd|rd|th)', r'\1', gym)

  # Make sure ampersands and slashes are space padded
  gym = re.sub('([^ ])([&/])', r'\1 \2', gym)
  gym = re.sub('([&/])([^ ])', r'\1 \2', gym)

  # Replace ampersands with 'and'
  gym = gym.replace('&', 'and')

  return gym

def logMessage(message):
  import time
  print(time.asctime() + ' ' + message)

def getCurrentTime():
  import time
  t = time.localtime()
  if t.tm_wday == 5 or t.tm_wday == 6:
    return 'weekend'
  elif t.tm_hour > 17:
    return 'weekdayevening'
  else:
    return 'weekdaydaytime'

def getUsersToNotify(gid):
  now = getCurrentTime()
  toNotify = []
  for user, avail in radb.getAvailability(gid).items():
    if avail[now] == 1:
      toNotify.append(user)
  return toNotify

config = config(os.path.join(os.path.dirname(os.path.realpath(__file__)),
                             'config.json'))

radb = raidalertdb(config.get('Database username'),
                   config.get('Database password'),
                   config.get('Database name'),
                   config.get('Database host'))

gyms = radb.getGyms(config.get('Guild ID'))

gymsByChannel = {}
for gym in gyms:
  gym['name'] = normalize(gym['name'])
  for channel, coords in config.get('Channels').items():
    if coords[1][0] <= gym['lat'] <= coords[0][0] and coords[1][1] <= gym['lng'] <= coords[0][1]:
      if channel in gymsByChannel:
        gymsByChannel[channel].append(gym)
      else:
        gymsByChannel[channel] = [gym]

client = discord.Client()

@client.event
async def on_ready():
  logMessage('Bot ready')

@client.event
async def on_reaction_add(reaction, user):
  # If it's not our message, ignore it
  if reaction.message.author != client.user:
    return

  logMessage('Got reaction to ' + reaction.message.content)

  # Pull out the gym ID
  # 'Did you mean: ' + bestName + '?
  result = re.search('Did you mean: \*\*(.*?)\*\*.* \[([0-9]+)\]$', reaction.message.content)
  if not result:
    return

  toNotify = getUsersToNotify(result.group(2))
  message = 'Raid at ' + result.group(1) + ' '
  for user in toNotify:
    message = message + '<@' + str(user) + '> '
  if len(toNotify) > 0:
    logMessage(message)
    await reaction.message.channel.send(message)
    await reaction.message.delete()

@client.event
async def on_message(message):
  # If it's our message, ignore it
  if message.author == client.user:
    return

  # If it's not in an approved channel, ignore it
  if message.channel.name not in config.get('Channels').keys():
    return

  # Parse the location data out of the message
  location = None
  if message.content.startswith('!egg'):
    result = re.search('^\!egg +[0-9] +[0-9]{1,2} +(?:exgym )?(.*)', message.content)
    if result:
      location = result.group(1)
  elif message.content.startswith('!raid'):
    result = re.search('^\!raid +[a-zA-Z]{1,} +[0-9]{1,2} +(?:exgym )(.*)', message.content)
    if result:
      location = result.group(1)
  if not location:
    return
  normalized = normalize(location)
 
  # Try to guess which gym they mean
  best = 0
  bestGid = None
  bestName = ''
  for gym in gymsByChannel[message.channel.name]:
    ratio = fuzz.token_set_ratio(normalized, gym['name'])
    if ratio > best:
      best = ratio
      bestGid = gym['gid']
      bestName = gym['name']

  if best < config.get('Fuzzy match threshold'):
    logMessage('Best match below threshold: ' + str(best) + ' ' + normalized + ': ' + bestName)
    return

  toNotify = getUsersToNotify(bestGid)
  if len(toNotify) > 0:
    m = ('<@' + str(message.author.id) + '> Did you mean: **' + bestName
     + '**? If so, please ***react*** to this message to notify '
     + str(len(toNotify)) + ' users who signed up to receive messages about that gym. [' + str(bestGid) + ']')
    logMessage(m)
    await message.channel.send(m)
  else:
    logMessage('No users registered at ' + bestName)

logMessage('Initalizing bot...')
client.run(config.get('Bot token'))
