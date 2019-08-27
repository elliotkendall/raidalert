# raidalert
Raidalert is a web app that lets Discord users advertise their availability
to raid at specific Pokemon Go gyms at particular times.

## Features

 - Lets users log in with Discord credentials via OAuth

 - Users can set availability one or more gyms at any of three pre-defined
   times: weekends, weekdays during the day, and weekday evenings

 - Creates notification messages ready to be pasted into Discord

## Installation

This app is mainly meant to be run as a single central instance to support
multiple Discord groups, but you can run your own if you like.

These instructions are pretty high leve and have not been well tested yet.

### Requirements

 - A workstation with node.js and npm.  I suppose you could do this on the
   server, but I'd recommend against it.

 - A web server configured to parse PHP

 - A MySQL server, optionally on the same host as the web server

### Making a React build

Log into https://discordapp.com/developers/applications/ and create an app. 
Enable OAuth and configure it to allow this redirect URL, based on where you
eventually want raidalert to be on your domain:
"https://your-site/path-to-raidalert/oauth.php".  Note this URL as well as
your client ID and secret.

On your workstation, change to the webapp directory and run "npm run build". 

Copy the contents of the resulting "build" directory into the location
inside the web server's document root where you want to host the app.

### Installing

Create a database on your MySQL server and load the "schema.sql" file into
it.  Create a MySQL user with full access to the database.

Copy the contents of the "php" directory of this distribution into the same
place as the files from the "build" directory above.

Edit the config.php file and specify the following:

 - API endpoint: You can leave this alone. Probably changing it would
   involve updating other code as well.

 - Client ID, Client secret, and Redirect URI: As noted in the first step
   above

 - App URL: The full URL where the app will reside

 - Database user/database password/database name: As created above

 - Session cookie name: Keep as-is or define your own

### Populating the database

Before the app will actually do anything useful, it needs to know about at
least one Discord server and some associated gyms.  You'll need to put that
data in the guild and gym tables, respectively. 

For a guild, you need to know its Discord ID, then pick a name, a starting
latitude/longitude/zoom level for the map, and an appropriate time zone. 
For example:

```
insert into guild (guildid, name, lat, lng, zoom, tz)
values
(327182560566444033, 'SF PoGo Raids Meetup', -122.449123, 37.770284, 13, 'America/Los_Angeles');
```

For a gym, you just need to know its latitude/longitude, associated guild
number, and give it a name:

```
insert into gym (name, lat, lng, guild)
values
('Lincoln & 2nd (Lin2/Nature in Art)', -122.45871, 37.766356, 327182560566444033);
```
