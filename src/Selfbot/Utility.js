// general utility class

function getCommandPrefixes(msg) {
	return new Promise((resolve, reject) => {
		if (msg.guild)
			if (Cache[`prefixes-${msg.guild.id}`])
				return resolve(Cache[`prefixes-${msg.guild.id}`]);

		var prefixes = [];

		Config.Discord.Prefix.Prefixes.forEach(p => {
			prefixes.push(p);
		});

		if (Config.Discord.Prefix.Mention)
			prefixes.push(BotClient.user.toString() + " ");	// "<@123456789> "

		if (msg.guild) {
			Database.Query('SELECT `chatprefixes` FROM `guilds` WHERE `id` = ?', [msg.guild.id]).then(results => {
				results.forEach(result => {
					if (!result.chatprefixes) return;

					let r = JSON.parse(result.chatprefixes);
					r.forEach(p => {
						prefixes.push(p);
					});
				});

				done(prefixes);
			}).catch(er => {
				logger.warn(`Error fetching guild prefixes for ${msg.guild.id}:\n${er.stack}`);
				done(prefixes);
			});
		} else
			done(prefixes);


		function done(p) {
			if (msg.guild)
				Cache.Add(`prefixes-${msg.guild.id}`, p);

			return resolve(p);
		}
	});
}
module.exports.getCommandPrefixes = getCommandPrefixes;

function resolveUserFromMention(string) {
	if (string instanceof Discord.Message)
		string = string.msg;

	if (string.match(Discord.MessageMentions.USERS_PATTERN)) {
		return string.replace(/\D/, '');
	}
}
module.exports.resolveUserFromMention = resolveUserFromMention;

function messageCatch(er) {
	logger.warn(`Error sending message:\n${er}`);
}
module.exports.messageCatch = messageCatch;

function isBotAdmin(user) {
	var userid;
	if (user instanceof Discord.User)
		userid = user.id;
	else
		userid = user;

	return Config.Bot.Admins.includes(userid);
}
module.exports.isBotAdmin = isBotAdmin;
