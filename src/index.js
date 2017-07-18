/*
	Technogyfication's Selfbot
	
	Idrc what you do with this... steal all the code you want it's not like i'm gonna come after you or anything
	
	it's all crappy code anyways
*/

try
{
	global.Discord = require('discord.js');
	global.Winston = require('winston');
	global.WDRF = require('winston-daily-rotate-file');
	global.Request = require('request');
	
	global.fs = require('fs');
	global.util = require('util');
	global.exec = require('child_process').exec;
	
	require('Selfbot/main.js').Start();
}
catch(err)
{
	console.error(`Error loading dependencies: ${err}`);
	process.exit(1);
}
