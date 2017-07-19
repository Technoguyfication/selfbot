/*
	handles all database operations
*/

const MySQLConfig = {
	host: Config.MySQL.Host,
	user: Config.MySQL.User,
	password: Config.MySQL.Password,
	database: Config.MySQL.Database,
	multipleStatements: true
};

var Connections;

const initScript = __dirname + '/./Data/init.sql';

function Init() {
	return new Promise((resolve, reject) => {
		Connections = MySQL.createPool(MySQLConfig);
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
		if (!Connections)
			return resolve();

		Connections.end(err => {
			if (err)
				return reject(err);
			else return resolve();
		});
	});
}
module.exports.Terminate = Terminate();

function initDb() {
	return new Promise((resolve, reject) => {
		fs.readFile(initScript, 'utf8', (err, data) => {
			if (err)
				return reject(err);

			Query(data, null).then(() => {
				logger.debug('Database structure initialized.');
				return resolve();
			}, reject);
		});
	});
}
