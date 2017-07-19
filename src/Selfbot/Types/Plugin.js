/*
	Plugin definition
	
	Usage: Base definition for plugins
	       All methods except ctor must return a promise
*/

class Plugin extends EventEmitter {
	///
	// Ctor requires an object containing plugin data.
	//
	/*
		e.g.
		{
			name: 'My Plugin',
			version: '1.2.3',
			author: 'John Doe <jdoe@example.com>',
			commands: {
				'top': {
					description: 'does stuff',
					usage: 'top (kek) [lel/lol]'
					scope: Commands.CommandScope.ALL,
					alias: null		// if not null this WILL alias another command no matter what
				},
				'kek': {
					//...,
					alias: 'top'	// this will always run command "top"
				}
		}
	*/
	///
	constructor(pluginInfo) {
		logger.silly(`Constructing base for ${pluginInfo.name} (v${pluginInfo.version})`);
		super();
		this.PluginInfo = pluginInfo;
		this.FileName = __filename;

		this.intName = null;
		this.status = null;

		this.on('disabled', () => {
			this.status = PluginManager.PluginStatus.LOADED;
		});
		this.on('enabled', () => {
			this.status = PluginManager.PluginStatus.ENABLED;
		});
		this.on('starting', () => {
			this.status = PluginManager.PluginStatus.STARTING;
		});
		this.on('stopping', () => {
			this.status = PluginManager.PluginStatus.STOPPING;
		});

		logger.silly(`Constructed base for ${this.PluginInfo.name}`);
	}

	// Entry point
	onEnable() {
		return new Promise((resolve, reject) => {
			logger.warn(`onEnable not implemented.`);
			return resolve();
		});
	}

	// Call for plugin to gracefully stop it's operations
	onDisable() {
		return new Promise((resolve, reject) => {
			logger.warn(`onDisable not implemented.`);
			return resolve();
		});
	}

	// command has been ran
	onCommand(command, args, msg) {
		return new Promise((resolve, reject) => {
			logger.warn(`onCommand not implemented.`);
			return resolve();
		});
	}
}
module.exports = Plugin;
