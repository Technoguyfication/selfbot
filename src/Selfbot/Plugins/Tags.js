/*
	Tags
*/

const dbInit = __dirname + '/Tags/init.sql';

const pluginInfo = {
	name: 'Tags',
	author: 'Hayden Andreyka <haydenandreyka@gmail.com>',
	version: '1.0.0',
	commands: {
		'tag': {
			description: 'Displays a tag or lists available tags.',
			usage: 'tag [tag name]',
			scope: Commands.CommandScope.ALL
		},
		'tags': {
			alias: 'tag'
		},
		'createtag': {
			description: 'Creates a new tag. (Note: Accepts embeds aswell)',
			usage: 'createtag (tag name) (tag content)',
			scope: Commands.CommandScope.ALL
		},
		'deletetag': {
			description: 'Deletes a tag.',
			usage: 'deletetag (tag name)',
			scope: Commands.CommandScope.ALL
		},
		'addtag': {
			alias: 'createtag'
		},
		'deltag': {
			alias: 'deletetag'
		}
	}
};

// formal entry for plugin
class Tags extends PluginManager.Plugin {
	constructor() {
		super(pluginInfo);
		return this;
	}

	// override
	onEnable() {
		return new Promise((resolve, reject) => {
			this.message('Initializing...');
			fs.readFile(dbInit, 'utf8', (err, data) => {
				if (err)
					return reject(`Failed to read database script: ${err}`);

				Database.Query(data).then(() => {
					this.message(`Database linked`);
					this.message(`Done`);
					return resolve();
				}, reject);
			});
		});
	}

	onCommand(cmd, args, msg) {
		return new Promise((resolve, reject) => {
			switch (cmd) {
				case 'tag': {
					if (!args[0]) {
						Database.Query('SELECT `title` FROM `tags`').then((results, fields) => {
							var builder = "Tags:\n```\n";
							results.forEach((result) => {
								builder += `${result.title} `;
							});
							builder += '```';	// close code pen
							msg.edit(builder).catch(Utility.messageCatch);
							return resolve();
						}).catch((err) => {
							msg.edit(`Error getting tags: ${err}`);
							return resolve();
						});
						break;
					}

					var tag = args[0];

					Database.Query('SELECT `text` FROM `tags` WHERE `title` = ?', [tag]).then((results, fields) => {
						if (results.length < 1) {
							msg.edit(`Tag not found: \`${tag}\``).catch(Utility.messageCatch);
							return resolve();
						}

						msg.edit(results[0].text).catch(Utility.messageCatch);
						return resolve();
					}).catch((err) => {
						msg.edit(`Failed to retreive tag \`${tag}\`: ${err}`);
						return resolve();
					});
					break;
				}
				case 'createtag': {
					if (args.length < 2 && !(args.length <= 1 && msg.attachments.size > 0)) {	// not enough args AND there are no attachments to fill content arg
						msg.edit(`Usage: \`${pluginInfo.commands.createtag.usage}\`\nPlease see the help article for more information.`).catch(Utility.messageCatch);
						return resolve();
					}

					var tagName = args.shift();
					var tagContent = args.join(' ');

					msg.attachments.forEach((attachment) => {
						tagContent += ` ${attachment.url}`;
					});

					Database.Query('INSERT INTO `tags` (`title`, `text`) VALUES (?, ?)', [tagName, tagContent]).then((results, fields) => {
						msg.edit(`Tag \`${tagName}\` added!`).catch(Utility.messageCatch);
						return resolve();
					}).catch((err) => {
						if (err.code == 'ER_DUP_ENTRY') {
							msg.edit(`Tag \`${tagName}\` already exists. Please delete it or specify a different name.`).catch(Utility.messageCatch);
							return resolve();
						} else {
							msg.edit(`Error adding tag \`${tagName}\`: ${err.code}: ${err.sqlMessage}`).catch(Utility.messageCatch);
							return resolve();
						}
						});
					break;
				}
				case 'deletetag': {
					break;
				}
			}
		});
	}

	message(msg) {
		logger.info(`[${this.intName}] ${msg}`);
	}
}
module.exports = Tags;
