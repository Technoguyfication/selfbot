const Commands = require('./Commands.js');

BotClient.on('message', (msg) => {
	if (!msg.author.equals(BotClient.user))
		return;
	
	if (msg.content.startsWith(Config.Bot.Prefix))
	{
		var unprefixed = msg.content.slice(Config.Bot.Prefix.length);
		var command = unprefixed.split(/ (.+)/);	// split on first space
		for (var cmd in Commands)
		{
			if (cmd == command[0])
			{
				logger.info(`Running Command: ${command[0]}`);
				try
				{
					Commands[cmd](msg, command[1]);
				}
				catch(ex)
				{
					logger.warn(`Unhandled exception in command: ${ex}`);
				}
				break;
			}
		}
	}
	
	switch(msg.content)
	{
		case "ok":
			msg.react("🆗").catch(SC);
			break;
	}
});
