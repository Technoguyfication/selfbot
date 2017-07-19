// event catcher and manager and stuff

// on message received
BotClient.on('message', msg => {
	if (!msg.author.equals(BotClient.user))
		return;

	let commandPrefix = Commands.isValidCommand(msg);

	if (commandPrefix) {
		Commands.runCommand(msg, commandPrefix).catch(er => {
			logger.warn(`Unhandled command run exception: ${er.stack}`);
		});
	} 
});
