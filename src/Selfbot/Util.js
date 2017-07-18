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
		if (content[i].match(/[A-z]+/))
			builder += `:regional_indicator_${content[i].toLowerCase()}:`;
		else if (content[i].match(/[0-9]/))
			builder += `:${numbers[content[i]]}:`;
		else
			builder += content[i];
	}
	return builder;
}
module.exports.Emojify = Emojify;
