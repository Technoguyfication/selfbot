// main module for bot-related activities.

global.BotClient = new Discord.Client(Config.Discord.ClientOptions);
global.Utility = require('./Utility.js');
global.Commands = require('./Commands.js');

require('./Events.js');	// bot events established before client login
global.PluginManager = require('./PluginManager.js');

// start bot by logging in etc.
function botStart() {
	return new Promise((resolve, reject) => {

		new Promise((resolve, reject) => {
			return PluginManager.Start();
		}).then(() => {
			return Botclient.login(Config.Discord.Token);
		}).then((token) => {
			return new Promise((resolve, reject) => {
				logger.info('Client login complete.');
				logger.debug(`Token: ${token}`);
				return resolve();
			});
		}).then(() => {
			return resolve();
		}).catch(err => {
			logger.error(`Failed to login to Discord: ${err.stack}`);
			exit(1);
		});
	});
}
module.exports.botStart = botStart;
