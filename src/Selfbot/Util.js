function Emojify(content)
{
	const numbers =
	[
		'zero',
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
	];
	
	var builder = "";
	for (let i = 0; i < content.length; i++)
	{
		if (content[i].toLowerCase() == 'b')
			builder += ":b:";
		else if (content[i].match(/[A-z]+/))	// character is a letter, substitute into regional indicator
			builder += `:regional_indicator_${content[i].toLowerCase()}:`;
		else if (content[i].match(/[0-9]/))	// character is a number, spell it out using array above
			builder += `:${numbers[content[i]]}:`;
		else	// idk, just put it in anyways											
			builder += content[i];
	}
	return builder;
}
module.exports.Emojify = Emojify;
