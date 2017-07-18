var Commands = {
	"emoji": (msg, args) => {
		msg.edit(Util.Emojify(args)).catch(SC);
	},
	"emojify": () => { return Commands.emoji; },
	"stop": (msg, args) => {
		msg.delete().then(() => {
			Halt();
		}).catch(SC);
	},
	"eval": (msg, args) => {
		let startTime = Date.now();
		let endTime;
		var result;
		try {
			result = eval(args);	// jshint ignore: line
			endTime = Date.now();
		} catch (ex) {
			msg.edit(`Error evaluating \`${args}\`\n\`\`\`\n${ex}\n\`\`\``).catch(SC);
			return;
		}
		msg.edit(`Evaluated \`${args}\` in ${endTime-startTime}ms\n\`\`\`\n${result}\n\`\`\``).catch(SC);
	},
	"exec": (msg, args) => {
		let startTime = Date.now();
		child_process.exec(args, processOutput);
		let elapsed = Date.now() - startTime;

		function processOutput(err, stdout, stderr) {
			if (err)
				SC(err);

			var returnText = `:notepad_spiral: Executed \`${args}\` in ${elapsed}ms\n\n`;

			returnText += `STDOUT:\n\`\`\`\n${stdout||"None"}\n\`\`\``;

			if (stderr)
				returnText += `\nSTDERR:\n\`\`\`\n${stderr||"\n"}\n\`\`\``;
			
			if (returnText.length > 2000) {
				msg.edit(`\`${args}\`\n\nExecuted, but results are too big. Took ${elapsed}ms. Please check the console.`).catch(SC);
				logger.info(`Command results too big: ${args}`);
				logger.info(returnText);
				return;
			}
			
			msg.edit(returnText).catch(SC);
		}
	},
	"cowsay": (msg, args) => {
		if (!args) {
			Request.get("https://helloacm.com/api/fortune/", (err, res, body) =>
			{
				if (err)
					return SC(err);
				
				if (res.statusCode != 200) {
					msg.edit("Cowsay: Failed to retreive fortune.").catch(SC);
					return;
				}
				
				try {
					var content = JSON.parse(body).trim();
					say(content||"Wut");
				} catch(ex) {
					SC(ex);
				}
			});
		} else {
			say(args);
		}
		
		function say(content) {
			msg.edit(`\`\`\`${require('cowsay').say({text: content})}\n\`\`\``).catch(SC);
		}
	}
};
module.exports = Commands;
