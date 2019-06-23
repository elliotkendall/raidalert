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
start tinyint(4) unsigned NOT NULL,
stop tinyint(4) unsigned NOT NULL,
days tinyint(7) DEFAULT 0,
key user(user),
key gid(gid)
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
primary key(guildid)
);
insert into guild (guildid, name, lat, lng, zoom)
values
(327182560566444033, 'SF PoGo Raids Meetup', -122.449123, 37.770284, 13);

grant select on raidalert.guild to oauth;
grant insert on raidalert.session to oauth;
