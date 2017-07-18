global.BotClient = new Discord.Client();
const Util = require('./Util.js');

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
	
	logger.debug("Winston started!");
	
	BotClient.on('message', HandleMessage);
	BotClient.on('ready', BotReady);
	
	BotClient.login(Config.Client.Token).then((token) => {
		logger.verbose(`Logged in with token ${token}`);
	}).catch((err) => {
		logger.error(`Failed to login: ${err}`);
	});
}

function BotReady()
{
	logger.info("Bot ready!");
}

function HandleMessage(msg)
{
	const Commands = {
		"emoji": (msg, args) => {
			msg.edit(Util.Emojify(args));
		}
	};
	
	if (!msg.author.equals(BotClient.user))
		return;
	
	logger.verbose(`Recv: ${msg.content}`);
	
	try
	{
		if (msg.content.startsWith(Config.Bot.Prefix))
		{
			var unprefixed = msg.content.slice(Config.Bot.Prefix.length);
			var command = unprefixed.split(/ (.+)/);
			for (var cmd in Commands)
			{
				if (cmd == command[0])
				{
					logger.info(`Running Command: ${command[0]}`);
					Commands[cmd](msg, command[1]);
				}
			}
		}
	}
	catch (ex)
	{
		logger.warn(`Error handling message: ${ex}`);
	}
}

process.on("SIGINT", Halt);
process.on("SIGTERM", Halt);

function Halt()
{
	console.log("Stopping...");
	process.exit(0);
}


module.exports.Start = Start;
