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
			permissions: {
				bot: Permissions.BotPermissions.USER,
				discord: [],
				guild: Permissions.GuildPermissions.USER
			},
			scope: Commands.CommandScope.GUILD
		},
		'tags': {
			description: 'Lists all tags in this channel.',
			usage: 'None',
			permissions: {
				bot: Permissions.BotPermissions.USER,
				discord: [],
				guild: Permissions.GuildPermissions.USER
			},
			scope: Commands.CommandScope.GUILD
		},
		'createtag': {
			description: 'Creates a new tag. (Note: Accepts embeds aswell)',
			usage: 'createtag (tag name) (tag text)',
			permissions: {
				bot: Permissions.BotPermissions.USER,
				discord: [],
				guild: Permissions.GuildPermissions.MODERATOR
			},
			scope: Commands.CommandScope.GUILD
		},
		'deletetag': {
			description: 'Deletes a tag in this channel.',
			usage: 'deletetag (tag name)',
			permissions: {
				bot: Permissions.BotPermissions.USER,
				discord: [],
				guild: Permissions.GuildPermissions.MODERATOR
			},
			scope: Commands.CommandScope.GUILD
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
			this.message('Startup complete!');
			return resolve();
		});
	}

	message(msg) {
		logger.info(`[${this.intName}] ${msg}`);
	}
}
module.exports = Tags;
