// permissions system

const BotPermissions = {
	USER: 1,
	ADMIN: 2
};
module.exports.BotPermissions = BotPermissions;

const GuildPermissions = {
	USER: 1,
	MODERATOR: 2,
	ADMIN: 3
};
module.exports.GuildPermissions = GuildPermissions;

// checks everything to see if command usage is denied
function commandDenied(msg, cmdInfo) {
	return new Promise((resolve, reject) => {
		var permissionErrors = [];

		getUserPermissionLevel(msg.author, msg.channel).then(userPerms => {
			if (cmdInfo.permissions.bot > userPerms.bot)
				permissionsErrors.push('User has inadequate bot permission levels');

			if (cmdInfo.permissions.guild > userPerms.guild)
				permissionErrors.push('User has inadequate server/channel permission levels');

			cmdInfo.permissions.discord.forEach(permission => {
				if (!(msg.channel.permissionsFor(BotClient.user).has(permission)))
					permissionErrors.push(`Bot lacks permission: ${permission}`);
			});

			if (permissionErrors.length == 0)
				return resolve(false);
			else
				return resolve(permissionErrors);
		});
	});
}
module.exports.commandDenied = commandDenied;

function getUserPermissionLevel(user, channel) {
	return new Promise((resolve, reject) => {
		var guild;
		guild = channel.guild;

		const cachename = `permissions_${user.id}-${guild.id}`;
		if (Cache[cachename])
			return resolve(Cache[cachename]);

		var perms = {};
		getBotPerms.then(botperms => {
			perms.bot = botperms;
			return getGuildPerms();
		}).then(guildperms => {
			perms.guild = guildperms;
			Cache.Add(cachename, perms);
			return resolve(perms);
		}).catch(reject);

		const getBotPerms = new Promise((resolve, reject) => {
			if (Utility.isBotAdmin(user))
				return resolve(BotPermissions.ADMIN);
			else
				return resolve(BotPermissions.USER);
		});

		const getGuildPerms = new Promise((resolve, reject) => {
			if (guild.ownerID == userid)
				return resolve(GuildPermissions.ADMIN);

			Database.Query('SELECT `userid` FROM `moderators` WHERE `guildid` = ?', guildid).then(results => {
				results.forEach((result) => {
					if (result.userid == userid)
						return resolve(GuildPermissions.MODERATOR);
				});

				return resolve(GuildPermissions.USER);
			}).catch(reject);
		});
	});
}
