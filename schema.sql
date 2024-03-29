CREATE TABLE gym (
gid int(11) unsigned NOT NULL AUTO_INCREMENT,
name varchar(256) NOT NULL,
lat double NOT NULL,
lng double NOT NULL,
guild bigint unsigned not null,
KEY guild(guild),
PRIMARY KEY (gid));

CREATE TABLE availability (
user bigint unsigned not null,
gid bigint unsigned not null,
weekend tinyint(4) DEFAULT 0,
weekdaydaytime tinyint(4) DEFAULT 0,
weekdayevening tinyint(4) DEFAULT 0,
key user(user),
key gid(gid),
primary key (user, gid)
);

CREATE TABLE session (
sid int(11) unsigned not null,
user bigint unsigned not null,
guild bigint unsigned not null,
created timestamp not null default CURRENT_TIMESTAMP,
primary key(sid)
);

CREATE TABLE guild (
guildid bigint unsigned not null,
name varchar(255) not null,
lat double not null,
lng double not null,
zoom tinyint unsigned not null,
tz varchar(255) not null,
primary key(guildid)
);
