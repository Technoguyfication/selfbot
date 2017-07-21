/*
	plugin manager copyright blah blah blah
*/

const Plugin = require('./Types/Plugin.js');
module.exports.Plugin = Plugin;

const pluginDir = './Plugins/';
// this is required because fs is relative to the main module, and require() is relative to this module
const fullPluginDir = `${__dirname}/${pluginDir}`;

const pluginExtension = '.js';

const PluginStatus = {
	DISABLED: 1,
	ENABLED: 2,

	STARTING: 3,
	STOPPING: 4
};
module.exports.PluginStatus = PluginStatus;

var pluginList = {};		// { 'Plugin_1.0.2': instanceof(Plugin) }
module.exports.pluginList = pluginList;

var pluginFileList = [];	// ['Plugin.js', 'Plugin2.js']

// starts loading stuff
function Start() {
	return new Promise((resolve, reject) => {
		logger.info(`Loading plugins..`);
		refreshPluginFiles().then(() => {
			logger.debug(`Loaded ${pluginFileList.length} plugin file entries.`);
			return loadAllPlugins();
		}).then(() => {
			logger.verbose(`Loaded ${Object.entries(pluginList).length} plugins into memory.`);
			return enableAllPlugins();
		}).then(() => {
			logger.info(`All plugins enabled.`);
			return resolve();
		}).catch(er => {
			return reject(`Error occured loading and enabling plugins:\n${er.stack||er}`);
		});
	});
}
module.exports.Start = Start;

function disablePlugin(plugin) {
	return new Promise((resolve, reject) => {
		logger.info(`Disabling ${plugin.intName}`);
		switch (plugin.status) {
			case PluginStatus.DISABLED:
				throw new Error('Plugin already disabled/loaded.');
			case PluginStatus.ENABLED:
				// timeout so if something goes wrong it doesn't hang endlessly.
				var disableTimout = setTimeout(() => {
					let pName = plugin.intName;
					unloadPlugin(plugin);
					return reject(`${pName} took too long to disable, unloading.`);
				}, 10 * 1000);	// 30s

				plugin.emit('stopping');
				plugin.onDisable().then(() => {
					clearTimeout(disableTimout);
					plugin.emit('disabled');
					Cache.Delete('commandList');
					logger.info(`${plugin.intName} disabled.`);
					return resolve();
				}).catch(er => {
					let pName = plugin.intName;
					unloadPlugin(plugin);
					return reject(`Error disabling ${pName}:\n${er.stack}`);
				});
				break;
			case PluginStatus.STARTING:
				plugin.once('enabled', () => {
					disablePlugin(plugin).then(resolve).catch(er => {
						logger.warn(`Failed to disable previous starting plugin`);
						return;
					});
				});
				break;
			case PluginStatus.STOPPING:
				throw new Error('Plugin already being disabled.');
			default:
				throw new Error(`Unaccounted for value: ${plugin.status}`);
		}
	});
}
module.exports.disablePlugin = disablePlugin;

function enablePlugin(plugin) {
	return new Promise((resolve, reject) => {
		logger.info(`Enabling ${plugin.intName}`);
		switch (plugin.status) {
			case PluginStatus.DISABLED:	// ready to enable
				plugin.emit('starting');
				plugin.onEnable().then(() => {
					plugin.emit('enabled');
					Cache.Delete('commandList');
					logger.info(`${plugin.intName} enabled.`);
					return resolve();
				}).catch(er => {
					let pName = plugin.intName;
					unloadPlugin(plugin);
					return reject(`Uncaught exception enabling ${pName}:\n${er.stack||er}`);
				});
				break;
			case PluginStatus.ENABLED:	// already enabled
				throw new Error('Plugin already enabled.');
			case PluginStatus.STARTING:	// already enabling
				throw new Error('Plugin already being enabled.');
			case PluginStatus.STOPPING:	// disabling, wait and then reenable it
				plugin.once('disabled', () => {
					enablePlugin(plugin).then(resolve).catch(er => {
						logger.warn('Failed to enable previous stopping plugin.');
						return;
					});
				});
				break;
			default:
				throw new Error(`Unaccounted for value: ${plugin.status}`);
		}
	});
}
module.exports.enablePlugin = enablePlugin;

function loadPlugin(plugin) {
	return new Promise((resolve, reject) => {
		logger.debug(`Loading plugin file ${plugin}..`);

		var _p = new (require(pluginDir + plugin))();

		_p.intName = internalPluginName(_p);		// give plugin int name
		_p.status = PluginStatus.DISABLED;			// set status to loaded

		_p.onDisable.bind(_p);

		if (pluginList[_p.intName])
			throw new Error('Plugin already loaded.');

		pluginList[_p.intName] = _p;				// add to list of loaded plugins
		logger.verbose(`Loaded plugin ${_p.intName}`);
		return resolve();
	});
}
module.exports.loadPlugin = loadPlugin;

function disableAllPlugins() {
	return new Promise((resolve, reject) => {
		logger.info('Disabling all plugins...');
		var disableQueue = [];
		for (var plugin in pluginList) {
			if (pluginList[plugin].status !== PluginStatus.DISABLED)
				disableQueue.push(disablePlugin(pluginList[plugin]).then(resolve, (err) => {
					logger.warn(err);
					return resolve();
				}));
		}
		Promise.all(disableQueue).then(resolve).catch(er => {
			logger.warn(er.stack||er);
			return resolve();
		});
	});
}
module.exports.disableAllPlugins = disableAllPlugins;

function enableAllPlugins() {
	return new Promise((resolve, reject) => {
		logger.verbose('Enabling all plugins..');
		var enableQueue = [];
		for (var plugin in pluginList) {
			if (pluginList[plugin].status !== PluginStatus.ENABLED)
				enableQueue.push(new Promise((resolve, reject) => {
					enablePlugin(pluginList[plugin]).then(resolve, (err) => {
						logger.warn(err);
						return resolve();
					});
				}));
		}
		Promise.all(enableQueue).then(resolve).catch(er => {
			logger.warn(`Failed enabling all plugins:\n${er.stack}`);
			return resolve();
		});
	});
}
module.exports.enableAllPlugins = enableAllPlugins;

function loadAllPlugins() {
	return new Promise((resolve, reject) => {
		logger.verbose('Loading all plugins...');
		var pluginLoadedList = [];
		for (var plugin in pluginList) {
			pluginLoadedList.push(pluginList[plugin].FileName);
		}

		var loadQueue = [];

		pluginFileList.forEach((plugin, index, arr) => {
			if (pluginLoadedList.includes(plugin)) {
				logger.debug(`${plugin} already loaded when trying to load all.`);
				return;
			}
			loadQueue.push(unrejectable(loadPlugin(plugin)));
		});

		Promise.all(loadQueue).then(resolve).catch(er => {
			logger.warn(`Error loading all plugins?\n${er.stack}`);
			return resolve();
		});
	});
}
module.exports.loadPlugin = loadPlugin;

// gets list of loadable plugin files
function refreshPluginFiles() {
	return new Promise((resolve, reject) => {
		var entries = fs.readdirSync(fullPluginDir, 'utf8');
		for (var i = 0; i < entries.length; i++) {
			logger.silly(`plugin file candidate found: ${entries[i]}`);

			// prune anything not ending with the extension
			if (!entries[i].endsWith(pluginExtension)) {
				entries.splice(i, 1);
				break;
			}

			// prune folders out
			if (!fs.statSync(fullPluginDir + entries[i]).isFile()) {
				entries.splice(i, 1);
				break;
			}
		}
		pluginFileList = entries;
		return resolve();
	});
}
module.exports.refreshPluginFiles = refreshPluginFiles;

function getPlugin(name) {
	for (var plugin in pluginList) {
		if (pluginList[plugin].name === name)
			return pluginList[plugin];
	}
	throw new Error(`Could not find plugin by name ${name}`);
}
module.exports.getPlugin = getPlugin;

function unloadPlugin(plugin) {
	logger.info(`Unloading plugin ${plugin.intName}`);
	delete pluginList[plugin.intName];
}
module.exports.unloadPlugin = unloadPlugin;

function internalPluginName(pl) {
	if (!(pl instanceof Plugin)) {
		logger.warn(`"Plugin" that does not extend instance of Plugin!`);
		logger.silly(pl);
	}

	if (!(pl.PluginInfo.name && pl.PluginInfo.version))
		throw new Error('Plugin does not contain name/version.');

	// "Plugin", "1.2.3" -> "Plugin_1.2.3"
	return `${pl.PluginInfo.name}_${pl.PluginInfo.version}`;
}

// retreives a command executor for the command string if possible
function getCommandExecutor(command) {
	if (Cache.commandList)
		if (Cache.commandList[command])
			return Cache.commandList[command];

	var commandRefs = {};

	// build internal command list first
	for (let cmd in Commands.builtinCommands) {
		addExecutor(cmd, Commands.internalCommandHandler);
	}

	// now add command from every plugin
	for (let plugin in pluginList) {
		for (let cmd in pluginList[plugin].PluginInfo.commands) {
			addExecutor(cmd, pluginList[plugin].onCommand);
		}
	}

	Cache.Add('commandList', commandRefs, 9e5);	// 15mins timeout

	if (commandRefs[command])
		return commandRefs[command];
	else
		return null;

	function addExecutor(cmd, exec) {
		if (commandRefs[cmd])
			logger.warn(`Duplicate command executor for ${cmd}`);

		commandRefs[cmd] = exec;
	}
}
module.exports.getCommandExecutor = getCommandExecutor;

function getCommandInfo(command) {
	if (Cache.commandInfo)
		if (Cache.commandInfo[command])
			return Cache.commandInfo[command];

	var commandInfo = {};
	var commandAliases = {};

	// populate list with builtin commands
	for (let cmd in Commands.builtinCommands) {
		addInfo(cmd, Commands.builtinCommands[cmd]);
	}

	// now add every command from every plugin
	for (let plugin in pluginList) {
		for (let cmd in pluginList[plugin].PluginInfo.commands) {
			addInfo(cmd, pluginList[plugin].PluginInfo.commands[cmd]);
		}
	}

	// now add all the aliases last
	for (let cmd in commandAliases) {
		if (!commandInfo[cmd]) {
			logger.warn(`Alias target ${cmd} nonexistent.`);
			return;
		}

		commandAliases[cmd].forEach((alias) => {
			commandInfo[alias] = commandInfo[cmd];
		});
	}

	Cache.Add('commandInfo', commandInfo, 9e5);	// 15 minutes

	if (commandInfo[command])
		return commandInfo[command];
	else
		return null;

	function addInfo(cmd, info) {
		info.cmd = cmd;
		if (info.alias) {
			if (commandAliases[info.alias]) {
				commandAliases[info.alias].push(cmd);
			} else {
				commandAliases[info.alias] = [cmd];
			}
			return;
		}

		if (commandInfo[cmd])
			logger.warn(`Duplicate command info for ${cmd}`);

		commandInfo[cmd] = info;
	}
}
module.exports.getCommandInfo = getCommandInfo;

function getAllCommands(includeAliases = false) {
	var commands = [];

	// populate list with builtin commands
	for (let cmd in Commands.builtinCommands) {
		addCommand(cmd);
	}

	// now add every command from every plugin
	for (let plugin in pluginList) {
		for (let cmd in pluginList[plugin].PluginInfo.commands) {
			addCommand(cmd);
		}
	}

	return commands;

	function addCommand(cmd) {
		if (getCommandInfo(cmd).alias && !includeAliases)
			return;

		commands.push(cmd);
	}
}
module.exports.getAllCommands = getAllCommands;

function unrejectable(_promise) {
	return new Promise((resolve, reject) => {
		_promise.then(() => {
			return resolve();
		}).catch(er => {
			logger.warn(`Rejected item:\n${er ? er.stack : '--Stacktrace Unavailable--\n' + er}`);
			return resolve();
		});
	});
}
