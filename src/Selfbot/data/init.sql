SET sql_notes = 0;

CREATE TABLE IF NOT EXISTS `tags` (
	`id` INT NOT NULL AUTO_INCREMENT,	-- unique id for each tag
	`title` VARCHAR(50),	-- title of tag
	`text` TEXT,	-- tag content
	PRIMARY KEY (`id`),
	INDEX (`title`)
)

SET sql_notes = 1;
