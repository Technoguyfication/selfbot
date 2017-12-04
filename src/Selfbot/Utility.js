// general utility class

function resolveUserFromMention(string) {
	if (string instanceof Discord.Message)
		string = string.msg;

	if (string.match(Discord.MessageMentions.USERS_PATTERN)) {
		return string.replace(/\D/, '');	// replace non digits with empty
	}
}
module.exports.resolveUserFromMention = resolveUserFromMention;

/**
 * A simple catch-all handler for message sending promise rejection
 * @param {string} er Error message
 */
function messageCatch(er) {
	logger.warn(`Error sending message:\n${er}`);
}
module.exports.messageCatch = messageCatch;

/**
 * Uploads text to Pastebin
 * @param {string} text Text to upload
 * @param {boolean} [unlisted] Whether the paste is unlisted or not
 * @param {string} [title] Title of the paste
 * @returns {Promise} Promise object with the url of the paste
 */
function uploadText(text, unlisted = true, title = "Discord Paste") {
	/*
		https://pastebin.com/api#2
	*/
	return new Promise((resolve, reject) => {
		Request.post("https://pastebin.com/api/api_post.php", {
			form: {
				api_paste_private: unlisted ? 1 : 0,
				api_paste_name: title,
				api_paste_code: text,
				api_option: "paste",
				api_dev_key: Config.pastebinDevKey
			}
		}, (err, response, body) => {
			if (err)
				return reject(err);

			// check http response
			if (response.statusCode !== 200)
				return reject(`Unknown response: ${response.statusCode}`);

			// check for api error
			if (body.startsWith("Bad API request"))
				return reject(body);
			else
				return resolve(body);
		});
	});
}
module.exports.uploadText = uploadText;
