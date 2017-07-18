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

			var returnText = `Executed \`${args}\` in ${elapsed}ms\n\n`;

			returnText += `STDOUT:\n\`\`\`\n${stdout}\n\`\`\``;

			if (stderr)
				returnText += `\n\nSTDERR:\n\`\`\`\n${stderr}\n\`\`\``;
			
			if (returnText.length > 2000) {
				msg.edit(`\`${args}\`\n\nExecuted, but results are too big. Took ${elapsed}ms. Please check the console.`).catch(SC);
				logger.info(`Command results too big: ${args}`);
				logger.info(returnText);
				return;
			}
			
			msg.edit(returnText).catch(SC);
		}
	}
};
module.exports = Commands;
