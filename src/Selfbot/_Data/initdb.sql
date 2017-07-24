/*
	init script for the bot
	runs every startup, and ensures the database is up to spec
	
	other database operations can be managed independently by plugins
	however, some basic statistics and information are logged by the base code
*/

SET sql_notes = 0;	-- disable table already exists warnings

/*
	I'll figure out something later, but for now
	I'm gonna leave on table check for reference
*/

/*
-- stats table
CREATE TABLE IF NOT EXISTS `stats` (
	`id` VARCHAR(25) NOT NULL,	-- snowflake of item being recorded (user, guild, channel, "global", etc.)
	`messages` INT,	-- messages sent
	`commands` INT,	-- commands run
	`errors` INT,	-- number of exceptions generated
	PRIMARY KEY (`id`)
);*/

SET sql_notes = 1;
