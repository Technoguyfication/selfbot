/*
	Technogyfication's Selfbot
	
	Idrc what you do with this... steal all the code you want it's not like i'm gonna come after you or anything
	
	it's all crappy code anyways
*/

var main;

try
{
	global.Discord = require('discord.js');
	global.Winston = require('winston');
	global.WDRF = require('winston-daily-rotate-file');
	global.Request = require('request');
	
	global.fs = require('fs');
	global.util = require('util');
	global.child_process = require('child_process');
	global.path = require('path');
	
	global.Config = require('./cfg/config.json');
	
	main = require('./Selfbot/Main.js');
}
catch(err)
{
	console.error(`Error loading dependencies: ${err}`);
	console.log("Try running \"npm update\" or make a config file.");
	process.exit(1);
}

main.Start();
