-- tag system db init

CREATE TABLE IF NOT EXISTS `tags` (
	`id` INT NOT NULL AUTO_INCREMENT,	-- unique id for each tag
	`title` VARCHAR(50) UNIQUE,	-- title of tag
	`text` TEXT,	-- tag content
	PRIMARY KEY (`id`),
	INDEX (`title`)
);
