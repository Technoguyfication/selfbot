/*
	Tags
*/

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
			description: 'Lists all tags in this channel.',
			usage: 'None',
			scope: Commands.CommandScope.ALL
		},
		'createtag': {
			description: 'Creates a new tag. (Note: Accepts embeds aswell)',
			usage: 'createtag (tag name) (tag text)',
			scope: Commands.CommandScope.ALL
		},
		'deletetag': {
			description: 'Deletes a tag in this channel.',
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
			// perform db checks, etc. here
			this.message('Ready!');
			return resolve();
		});
	}

	message(msg) {
		logger.info(`[${this.intName}] ${msg}`);
	}
}
module.exports = Tags;
