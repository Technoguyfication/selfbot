// command manager that has everything to do with commands

const CommandScope = {
	ALL: 1,
	GUILD: 2,
	PRIVATE: 3
};
module.exports.CommandScope = CommandScope;

const builtinCommands = {
	'eval': {
		description: 'Evaluates a JavaScript expression.',
		usage: 'eval (expression)',
		permissions: {
			bot: Permissions.BotPermissions.ADMIN,
			discord: [],
			guild: Permissions.GuildPermissions.USER
		},
		scope: CommandScope.ALL
	},
	'exec': {
		description: 'Runs a command at the local command line.',
		usage: 'exec (command)',
		permissions: {
			bot: Permissions.BotPermissions.ADMIN,
			discord: [],
			guild: Permissions.GuildPermissions.USER
		},
		scope: CommandScope.ALL
	},
	'help': {
		description: 'Displays a list of commands or the help topic for a specific command.',
		usage: 'help [command]',
		permissions: {
			bot: Permissions.BotPermissions.USER,
			discord: [],
			guild: Permissions.GuildPermissions.USER
		},
		scope: CommandScope.ALL
	},
};
module.exports.builtinCommands = builtinCommands;

function isValidCommand(msg) {
	return new Promise((resolve, reject) => {
		Utility.getCommandPrefixes(msg).then(prefixes => {
			for (var i = 0; i < prefixes.length; i++) {
				if (msg.content.startsWith(prefixes[i]))
					return resolve({ isCommand: true, prefix: prefixes[i] });	// return prefix aswell so we don't have to find it twice
			}

			return resolve(false, null);
		}).catch(reject);
	});
}
module.exports.isValidCommand = isValidCommand;

function runCommand(msg, prefix) {
	return new Promise((resolve, reject) => {
		var command = parseCommand(msg.content, prefix);
		var executor = PluginManager.getCommandExecutor(command.cmd);

		if (!executor) {	// command does not exist
			logger.debug(`Command ${command.cmd} does not exist.`);
			return resolve();
		}

		let cmdInfo = PluginManager.getCommandInfo(command.cmd);

		switch (cmdInfo.scope) {
			case CommandScope.ALL:
				break;
			case CommandScope.GUILD:
				if (msg.guild)
					break;
				else {
					commandErrorResponse(msg, 'You can only run this command on a server.');
					return resolve();
				}
			case CommandScope.PRIVATE:
				if (msg.guild) {
					commandErrorResponse(msg, 'This command must be run in a direct message.');
					return resolve();
				} else
					break;
			default:
				commandError(msg, null);
				return resolve();
		}

		let commandDeny = Permissions.commandDenied(msg, cmdInfo);

		if (commandDeny) {
			commandErrorResponse(msg, `Permission error(s) running command \`${command.cmd}}\`: ${commandDeny}`);
			return resolve();
		}

		if (!cmdInfo) {
			logger.warn(`${command.cmd} has no info!`);
			commandErrorResponse(msg, 'Command info not found.');
			return resolve();
		}

		logger.info(`${msg.author.id} / ${msg.author.name} executed command ${command.cmd} with args "${command.args.join(' ')}"`);

		executor(command.cmd, command.args, msg).then(() => {
			logger.debug(`finished running command ${command.cmd}`);
			return resolve();
		}).catch(er => {
			logger.warn(`(${msg.author.id}) Unhandled exception running command ${command.cmd} ${command.args.join(' ')}\n${er.stack}`);
			commandErrorResponse(msg, null, er);
			return resolve();
		});
	});
}
module.exports.runCommand = runCommand;

function commandErrorResponse(msg, message = 'An error occured processing your command.', er = null) {
	return new Promise((resolve, reject) => {
		var extratext = "";
		if (response)
			extratext += response;

		if (er && Utility.isBotAdmin(msg.author)) {
			extratext += `\n\nError Details:\n\`${(er.message || er)}\``;
			if (er.stack)
				extratext += `\n\nStacktrace:\n\`\`\`\n${er.stack}\n\`\`\``;
		}
		msg.channel.send(message + (extratext || '')).then(resolve).catch(Utility.messageCatch);
	});
}

function internalCommandHandler(cmd, args, msg) {
	return new Promise((resolve, reject) => {
		switch (cmd) {
			case 'eval': {
				var evalString = args.join(' ');
				logger.info(`${msg.author.username} / ${msg.author.id} running EVAL: "${evalString}"`);
				var output;
				let startTime = Date.now();
				try {
					output = eval(evalString);	// jshint ignore: line
				} catch (er) {
					msg.channel.sendEmbed({
						title: `Unhandled Exception`,
						description: `\`\`\`${er.stack}\`\`\``
					}).catch(Utility.messageCatch);
					return resolve();
				}
				let elapsedTime = Date.now() - startTime;

				msg.channel.sendEmbed({
					title: `Evaluation Complete! | ${elapsedTime}ms`,
					description: `\`\`\`${output}\`\`\``
				}).catch(Utility.messageCatch);
				return resolve();
			}
			case 'exec': {
				let startTime = Date.now();
				child_process.exec(args.join(' '), processOutput);
				let elapsed = Date.now() - startTime;

				function processOutput(err, stdout, stderr) {
					if (err)
						return reject(err);

					var returnText = "";

					returnText += `STDOUT:\n\`\`\`\n${stdout}\n\`\`\``;

					if (stderr)
						returnText += `\n\nSTDERR:\n\`\`\`\n${stderr}\n\`\`\``;

					msg.channel.sendEmbed({
						title: `Execution Complete! | ${elapsed}ms`,
						description: returnText
					});
				}
				return resolve();
			}

			default:
				return reject(new Error('Command not implemented.'));
		}
	});
}
module.exports.internalCommandHandler = internalCommandHandler;

function parseCommand(text, prefix) {
	let cmdStr = text.substr(prefix.length, text.length);
	let splitCmd = cmdStr.split(" ");

	let command = splitCmd[0].toLowerCase();
	let args = splitCmd.splice(1);

	return { cmd: command, args: args };
}
