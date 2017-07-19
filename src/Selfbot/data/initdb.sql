/*
	init script for the bot
	runs every startup, and ensures the database is up to spec
	
	other database operations can be managed independently by plugins
	however, some basic statistics and information are logged by the base code
*/

SET sql_notes = 0;	-- disable table already exists warnings

-- guilddata table
CREATE TABLE IF NOT EXISTS `guilds` (
	`id` VARCHAR(25) NOT NULL,
	`chatprefixes` TEXT,	-- serialized JSON
	`disabled` TINYINT DEFAULT '0',	-- bool; guild disallowed from using bot
	PRIMARY KEY (`id`)
);

-- users table
CREATE TABLE IF NOT EXISTS `users` (
	`id` VARCHAR(25) NOT NULL,
	`lastseen` BIGINT,	-- last time seen online
	`lasttalked` BIGINT,	-- last time sent a message visible to the bot
	`disabled` TINYINT DEFAULT '0',	-- bool; user disallowed from using bot
	PRIMARY KEY (`id`)
);

-- moderators table
CREATE TABLE IF NOT EXISTS `moderators` (
	`guildid` VARCHAR(25) NOT NULL,
	`userid` VARCHAR(25) NOT NULL,
	PRIMARY KEY (`guildid`)
);

-- stats table
CREATE TABLE IF NOT EXISTS `stats` (
	`id` VARCHAR(25) NOT NULL,	-- snowflake of item being recorded (user, guild, channel, "global", etc.)
	`messages` INT,	-- messages sent
	`commands` INT,	-- commands run
	`errors` INT,	-- number of exceptions generated
	PRIMARY KEY (`id`)
);

SET sql_notes = 1;
