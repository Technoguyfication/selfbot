function Run(cmd, msg, args) {
	return new Promise((resolve, reject) => {
		switch(cmd.toLowerCase()) {
			case "emojify":
			case "emoji": {
				msg.edit(Util.Emojify(args)).then(() => {
					return resolve(true);
				}).catch(reject);
				break;
			}
			case "stop": {
				msg.delete().then(() => {
					Halt();
					return resolve(true);
				}).catch(SC);
				break;
			}
			case "eval": {
				let startTime = Date.now();
				let endTime;
				let result;
				try {
					result = eval(args);	// jshint ignore: line
					endTime = Date.now();
				} catch (ex) {
					msg.edit(`Error evaluating \`${args}\`\n\`\`\`\n${ex}\n\`\`\``).then(() => {
						return resolve(true);
					}).catch(reject);
					break;
				}
				msg.edit(`Evaluated \`${args}\` in ${endTime-startTime}ms\n\`\`\`\n${result}\n\`\`\``).then(() => {
					return resolve(true);
				}).catch(reject);
				break;
			}
			case "exec": {
				let startTime = Date.now();
				child_process.exec(args, processOutput);
				let elapsed = Date.now() - startTime;

				var processOutput = (err, stdout, stderr) => {
					if (err)
						return reject(err);

					var returnText = `:notepad_spiral: Executed \`${args}\` in ${elapsed}ms\n\n`;

					returnText += `STDOUT:\n\`\`\`\n${stdout||"None"}\n\`\`\``;

					if (stderr)
						returnText += `\nSTDERR:\n\`\`\`\n${stderr||"\n"}\n\`\`\``;
					
					if (returnText.length > 2000) {
						msg.edit(`\`${args}\`\n\nExecuted, but results are too big. Took ${elapsed}ms. Please check the console.`).catch(SC);
						logger.info(`Command results too big: ${args}`);
						logger.info(returnText);
						return resolve(true);
					}
					
					msg.edit(returnText).then(() => {
						return resolve(true);
					}).catch(reject);
				};
				break;
			}
			case "cowsay": {
				var say = (content) => {
					msg.edit(`\`\`\`${require('cowsay').say({text: content})}\n\`\`\``).then(() => {
						return resolve(true);
					}).catch(reject);
				};
					
				if (!args) {				
					Request.get("https://helloacm.com/api/fortune/", (err, res, body) =>
					{
						if (err)
							return reject(err);
						
						if (res.statusCode != 200) {
							msg.edit("Cowsay: Failed to retreive fortune.").then(() => {
								return resolve(true);
							}).catch(SC);
							return;
						}
						
						try {
							var content = JSON.parse(body).trim();
							say(content||"Wut");
						} catch(ex) {
							return reject(ex);
						}
					});
				} else {
					say(args);
				}
				break;
			}
			case "query": {
				Database.Query(args).then((results, fields) => {
					let builder = "";
					builder += JSON.stringify(results, null, 4);
					msg.edit(`\`\`\`\n${builder}\n\`\`\``).then(() => {
						return resolve(true);
					}).catch(reject);
				}).catch((err) => {
					msg.edit(`Error running \`${args}\`\n\`\`\`\n${err}\n\`\`\``).then(() => {
						return resolve(true);
					}, reject);
				});
				break;
			}
			case "tag": {
				Database.Query("SELECT `text` FROM `tags` WHERE `title` = ?", [args]).then((results, fields) => {
					if (results.length < 1) {
						msg.edit(`Tag \`${args}\` not found`).then(() => {
							return resolve(true);
						}, reject);
						return;
					}
					
					msg.edit(results[0].text).then(() => {
						return resolve(true);
					}, reject);
					return resolve(true);
				}, reject);
				break;
			}
			case "addtag": {
				
				break;
			}
			default:
				return resolve(false);
		}
	});
}
module.exports.Run = Run;
