const Commands = require('./Commands.js');

BotClient.on('message', (msg) => {
	if (!msg.author.equals(BotClient.user))
		return;
	
	if (msg.content.startsWith(Config.Bot.Prefix))
	{
		var unprefixed = msg.content.slice(Config.Bot.Prefix.length);
		var command = unprefixed.split(/ (.+)/);	// split on first space
		try
		{
			if (Commands.Run(command[0], msg, command[1]))
				logger.info(`Running: ${command[0]} ${command[1]||""}`);
		}
		catch(ex)
		{
			logger.warn(`Unhandled exception in command: ${ex}`);
		}
	}
	
	switch(msg.content.toLowerCase())
	{
		case "ok":
			msg.react("🆗").catch(SC);
			break;
		case "america":
		case "murica":
		case "usa":
			msg.react("🇺🇸").catch(SC);
			break;
		case "succ":
		case "good succ":
			msg.react("🍆").catch(SC);
	}
});
