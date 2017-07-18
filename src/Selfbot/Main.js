global.BotClient = new Discord.Client();
global.Util = require('./Util.js');

function Start()
{
	global.logger = new Winston.Logger({
		level: Config.Logging.Level,
		transports: [
			new (Winston.transports.Console)(),
			new WDRF({
				filename: 'logs/',
				datePattern: '/' + Config.Logging.FilePattern,
				json: Config.Logging.UseJSON
			})
		]
	});
	
	logger.verbose("Starting database");
	global.Database = require('./Database.js');
	
	Database.Init().then(() => {
		require('./Events.js');
	
		BotClient.login(Config.Client.Token).then((token) => {
			logger.verbose(`Logged in with token ${token}`);
		}).catch((err) => {
			logger.error(`Failed to login: ${err}`);
		});
	}).catch((err) => {
		logger.error(`Database init error: ${err}`);
		Halt(1);
		return;
	});
}

function BotReady()
{
	logger.info("Bot ready!");
}

process.on("SIGINT", Halt);
process.on("SIGTERM", Halt);

function Halt(code = 0)
{
	console.log("Stopping...");
	process.exit(code);
}
global.Halt = Halt;

function SC(err)	// simple catch
{
	logger.warn(err);
}
global.SC = SC;

module.exports.Start = Start;
