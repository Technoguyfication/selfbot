-- tag system db init

CREATE TABLE IF NOT EXISTS `tags` (
	`id` INT NOT NULL AUTO_INCREMENT,	-- unique id for each tag
	`server` VARCHAR(25) NOT NULL, -- server snowflake that created the tag
	`channel` VARCHAR(25) NOT NULL,	-- same as above; both used to delete the tag if it's orphaned
	`title` VARCHAR(50),	-- title of tag
	`text` TEXT,	-- tag content
	PRIMARY KEY (`id`),
	INDEX (`title`)
);
