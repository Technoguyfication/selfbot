// command manager that has everything to do with commands

const CommandScope = {
	ALL: 1,
	GUILD: 2,
	PRIVATE: 3
};
module.exports.CommandScope = CommandScope;

const builtinCommands = {
	'help': {
		description: 'Displays a list of commands or the help topic for a specific command.',
		usage: 'help [command]',
		scope: CommandScope.ALL
	},
	'eval': {
		description: 'Evaluates a JavaScript expression.',
		usage: 'eval (expression)',
		scope: CommandScope.ALL
	},
	'exec': {
		description: 'Runs a command at the local command line.',
		usage: 'exec (command)',
		scope: CommandScope.ALL
	},
	'query': {
		description: 'Runs a query on the bot database.',
		usage: 'query (sql query)',
		scope: CommandScope.ALL
	},
	'update': {
		description: 'Updates the bot using it\'s git repo and shuts down.',
		usage: '(none)',
		scope: CommandScope.ALL
	},
	'shutdown': {
		description: 'Shuts down the bot.',
		usage: '(none)',
		scope: CommandScope.ALL
	},
	'stop': {
		alias: 'shutdown'
	}
};
module.exports.builtinCommands = builtinCommands;

function isValidCommand(msg) {
	var prefixes = Config.Bot.Prefixes;

	for (var i = 0; i < prefixes.length; i++) {
		if (msg.content.startsWith(prefixes[i]))
			return prefixes[i];
	}

	return false;
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
		command.cmd = cmdInfo.cmd;

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
				return resolve();
		}

		if (!cmdInfo) {
			logger.warn(`${command.cmd} has no info!`);
			commandErrorResponse(msg, 'Command info not found.');
			return resolve();
		}

		logger.info(`Running command "${command.cmd}" with args "${command.args.join(' ')}"`);

		executor(command.cmd, command.args, msg).then(() => {
			logger.debug(`finished running command ${command.cmd}`);
			return resolve();
		}).catch(er => {
			logger.warn(`(${msg.author.id}) Unhandled exception running command ${command.cmd} ${command.args.join(' ')}\n${er.stack}`);
			commandErrorResponse(msg, er);
			return resolve();
		});
	});
}
module.exports.runCommand = runCommand;

function commandErrorResponse(msg, message = 'An error occured processing your command.') {
	return new Promise((resolve, reject) => {
		msg.edit(`:no_entry:    ${message}`).then(resolve, reject);
	});
}

function internalCommandHandler(cmd, args, msg) {
	return new Promise((resolve, reject) => {
		switch (cmd) {
			case 'eval': {
				let evalString = args.join(' ');
				logger.info(`${msg.author.username} / ${msg.author.id} running EVAL: "${evalString}"`);
				let output;
				let startTime = Date.now();
				try {
					output = eval(evalString);	// jshint ignore: line
				} catch (er) {
					msg.edit(`\`Unhandled Exception\`  \`${evalString}\`\n\`\`\`\n${er}\n\`\`\``).catch(Utility.messageCatch);
					return resolve();
				}
				let elapsedTime = Date.now() - startTime;

				if (output.length > 1900) {
					Utility.uploadText(output).then((link) => {
						reply(`Output truncated due to length, see ${link}`);
						return resolve();
					}).catch((err) => {
						logger.warn(`Failed to upload eval results: ${err}`);
						reply(`Output truncated due to length. Link unavailable: ${err}`);
						return resolve();
					});
				} else {
					reply(output);
					return resolve();
				}

				function reply(outputText) {
					msg.edit(`Evaluated \`${evalString}\` in ${elapsedTime}ms\n\`\`\`\n${outputText}\n\`\`\``).catch(Utility.messageCatch);
				}
			}
			case 'exec': {
				let processOutput = function (err, stdout, stderr) {
					if (err)
						return reject(err);

					var returnText = `Processed \`${execString}\` in ${elapsed}ms\n\n`;

					returnText += `STDOUT:\n\`\`\`\n${stdout || "(None)"}\n\`\`\``;

					if (stderr)
						returnText += `\n\nSTDERR:\n\`\`\`\n${stderr}\n\`\`\``;

					msg.edit(returnText).catch(Utility.messageCatch);
				};

				let execString = args.join(' ');
				let startTime = Date.now();
				child_process.exec(execString, processOutput);
				let elapsed = Date.now() - startTime;

				return resolve();
			}
			case 'help': {
				let command = args[0];
				if (!command) {	// no command specified, list commands
					let builder = "**Commands**\nUse \`help (command name)\` for usage details.\n";
					let commands = PluginManager.getAllCommands(false);
					commands.forEach((command) => {
						let cmdInfo = PluginManager.getCommandInfo(command);
						builder += `\n**${command}** - ${cmdInfo.description}`;
					});

					msg.edit(builder).catch(Utility.messageCatch);
					return resolve();
				}

				let commandInfo = PluginManager.getCommandInfo(command);

				if (!commandInfo) {
					msg.edit(`Command info for \`${command}\` not found.`).catch(Utility.messageCatch);
					return resolve();
				}

				msg.edit(`**${commandInfo.cmd}**\n\n${commandInfo.description}\nUsage: \`${commandInfo.usage}\``).catch(Utility.messageCatch);
				return resolve();
			}
			case 'query': {
				let query = args.join(' ');
				Database.Query(query).then((results, fields) => {
					msg.edit(`Results of query \`${query}\`\n\`\`\`json\n${JSON.stringify(results, null, 4)}\n\`\`\``).catch(Utility.messageCatch);
					return resolve();
				}).catch((err) => {
					msg.edit(`Failed to run query: ${err}`);
					return resolve();
				});
				break;
			}
			case 'update': {
				const updateCommand = 'git pull';
				let startTime = Date.now();
				child_process.exec(updateCommand, (err, stdout, stderr) => {
					let elapsed = Date.now() - startTime;

					if (err) {
						let resp = `Error running update: ${err}`;
						logger.warn(resp);
						msg.edit(resp).catch(Utility.messageCatch);
						return resolve();
					}

					let builder = `Fetched update in ${elapsed}ms\n\`\`\`\n${stdout}\n\`\`\``;
					if (stderr)
						builder += `\nSTDERR:\n\`\`\`\n${stderr}\n\`\`\``;
					builder += '\nShutting down.';

					msg.edit(builder).catch(Utility.messageCatch).then(() => {
						Shutdown();
						return resolve();
					});
				});
				break;
			}
			case 'shutdown': {
				msg.delete().then(Shutdown, Shutdown);
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
