// core utilities for "low-level" stuff

global.exit = function (code = 0) {
	console.log(`Exiting with code ${code}`);
	process.exit(code);
};

process.on('SIGTERM', Sigint);
process.on('SIGINT', Sigint);
var shutdownStart = false;

function Sigint() {
	if (shutdownStart) {
		console.log('--- Press Ctrl+C again to force kill program.');
		process.once('SIGINT', exit);
		process.once('SIGTERM', exit);
		return;
	} else
		shutdownStart = true;

	Shutdown();
}

function Shutdown() {
	new Promise((resolve, reject) => {
		logger.info('Stopping');
		if (PluginManager)
			return PluginManager.disableAllPlugins().then(resolve);
		else return resolve();
	}).then(() => {
		return new Promise((resolve, reject) => {
			if (Database)
				Database.Terminate().then(resolve);
			else return resolve();
		});
	}).then(() => {
		exit();
	}).catch(err => {
		logger.warn(`Error safely shutting down: ${err.stack||err}`);
		exit(1);
	});
}
global.Shutdown = Shutdown;
