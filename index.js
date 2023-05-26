/** @typedef { import("wechaty").Wechaty } Wechaty */
var http = require('http');

/**
 * @param {Object} config
 * @param {number} config.port web page port
 */
module.exports = function WechatyChathubPlugin(config) {
	return function (/** @type {Wechaty} */bot) {
		var server = http.createServer((req, res) => {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'text/html');
			res.end('<h1>Welcome to Chathub!</h1>');
		});
		server.listen(config.port);
		return () => {
			server.close();
		};
	};
};
