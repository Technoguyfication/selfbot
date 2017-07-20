/*
	handles all database operations
*/

const mysqlConfig = {
	host: Config.MySQL.Hostname,
	user: Config.MySQL.Authentication.User,
	password: Config.MySQL.Authentication.Password,
	database: Config.MySQL.Database,
	multipleStatements: true
};

var Connections;

const initScript = __dirname + '/./Data/initdb.sql';

function Init() {
	return new Promise((resolve, reject) => {
		Connections = mysql.createPool(mysqlConfig);
		logger.silly('pool created');
		initDb().then(resolve, reject);
	});
}
module.exports.Init = Init;

function Query(sql, values) {
	return new Promise((resolve, reject) => {
		logger.silly(`Running database query: "${sql}" with values "${values ? values.join(", ") : "--None--"}"`);

		Connections.query(sql, values, processOutput);

		function processOutput(err, results, fields) {
			if (err)
				return reject(err);

			logger.silly(`Results from query: ${JSON.stringify(results)}`);
			return resolve(results, fields);
		}
	});
}
module.exports.Query = Query;

function Terminate() {
	return new Promise((resolve, reject) => {
		logger.info("Shutting down database");

		if (!Connections)
			return resolve();

		Connections.end(err => {
			if (err)
				return reject(err);
			else return resolve();
		});
	});
}
module.exports.Terminate = Terminate;

function initDb() {
	return new Promise((resolve, reject) => {
		fs.readFile(initScript, 'utf8', (err, data) => {
			if (err)
				return reject(err);

			Query(data, null).then(() => {
				logger.debug('Database initialized.');
				return resolve();
			}, reject);
		});
	});
}
