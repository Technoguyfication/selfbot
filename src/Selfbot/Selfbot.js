// main module for bot-related activities.

global.BotClient = new Discord.Client(Config.Discord.ClientOptions);
global.Utility = require('./Utility.js');
global.Commands = require('./Commands.js');

require('./Events.js');	// bot events established before client login
global.PluginManager = require('./PluginManager.js');

// start bot by logging in etc.
function botStart() {
	return new Promise((resolve, reject) => {

		PluginManager.Start().then(() => {
			logger.info('Connecting to Discord...');
			return BotClient.login(Config.Discord.Token);
		}).then((token) => {
			logger.debug(`Client login complete. Token: ${token}`);
			return resolve();
		}).catch(err => {
			logger.error(`Failed to start bot: ${err.stack}`);
			exit(1);
		});
	});
}
module.exports.botStart = botStart;
