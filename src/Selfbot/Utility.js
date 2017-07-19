// general utility class

function resolveUserFromMention(string) {
	if (string instanceof Discord.Message)
		string = string.msg;

	if (string.match(Discord.MessageMentions.USERS_PATTERN)) {
		return string.replace(/\D/, '');	// replace non digits with empty
	}
}
module.exports.resolveUserFromMention = resolveUserFromMention;

function messageCatch(er) {
	logger.warn(`Error sending message:\n${er}`);
}
module.exports.messageCatch = messageCatch;
