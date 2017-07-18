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
	"restart": (msg, args) => {
		msg.delete().then(() => {
			Restart();
		}).catch(SC);
	}
};
module.exports = Commands;
