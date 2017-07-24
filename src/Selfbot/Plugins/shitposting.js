/*
	Shitposting Util
*/

const pluginInfo = {
	name: 'Shitposting Util',
	author: 'Hayden Andreyka <haydenandreyka@gmail.com>',
	version: '1.0.0',
	commands: {
		'emoji': {
			description: 'Turns text into big emoji letters.',
			usage: 'emoji (text)',
			scope: Commands.CommandScope.ALL
		},
		'emojify': {
			alias: 'emoji'
		}
	}
};

// formal entry for plugin
class Shitposting extends PluginManager.Plugin {
	constructor() {
		super(pluginInfo);
		return this;
	}

	// override
	onEnable() {
		return new Promise((resolve, reject) => {
			return resolve();
		});
	}

	onCommand(cmd, args, msg) {
		return new Promise((resolve, reject) => {
			switch (cmd) {
				case 'emoji': {
					let text = args.join(' ');

					const numbers = [
						'zero',
						'one',
						'two',
						'three',
						'four',
						'five',
						'six',
						'seven',
						'eight',
						'nine'
					];

					let builder = "";
					for (let i = 0; i < text.length; i++) {
						if (text[i].toLowerCase() === 'b')			// B
							builder += ":b:";
						else if (text[i] === ' ')					// expand spaces to five characters
							builder += '     ';
						else if (text[i].match(/[A-z]+/))			// character is a letter, substitute into regional indicator
							builder += `:regional_indicator_${text[i].toLowerCase()}:`;
						else if (text[i].match(/[0-9]/))			// character is a number, spell it out using array above
							builder += `:${numbers[text[i]]}:`;
						else										// idk, just put it in anyways											
							builder += text[i];
					}

					msg.edit(builder).catch(Utility.messageCatch);
					return resolve();
				}
			}
		});
	}

	message(msg) {
		logger.info(`[${this.intName}] ${msg}`);
	}
}
module.exports = Shitposting;
