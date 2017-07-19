// ultra simple object that caches stuff

const Cache = {
	Add: (name, data, timeout = 3000 * 1000) => {
		Cache[name] = data;

		logger.silly(`Added ${name} to cache: ${JSON.stringify(data)}`);

		setTimeout(() => {
			if (Cache[name])
				Cache.Delete(name);
		}, timeout);
	},
	Delete: (name) => {
		logger.silly(`Deleting ${name} from cache.`);
		delete Cache[name];
	}
};
module.exports = Cache;
