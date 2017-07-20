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
			description: 'Displays a tag. Use `tags` to get started.',
			usage: 'tag (tag name)',
			scope: Commands.CommandScope.ALL
		},
		'tags': {
			description: 'Lists all tags.',
			usage: 'None',
			scope: Commands.CommandScope.ALL
		},
		'createtag': {
			description: 'Creates a new tag. (Note: Accepts embeds aswell)',
			usage: 'createtag (tag name) (tag text)',
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

	message(msg) {
		logger.info(`[${this.intName}] ${msg}`);
	}
}
module.exports = Tags;
