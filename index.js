/** @typedef { import("wechaty").Wechaty } Wechaty */
var express = require('express');
var Chathub = require("./Chathub");

/**
 * @param {Object} config
 * @param {number} config.port web api port
 * @param {string} config.dir working directory
 */
module.exports = function WechatyChathubPlugin(config) {
	return function (/** @type {Wechaty} */bot) {
		var chathub = new Chathub(bot, config);
		var api = express();
		api.use(express.json({ strict: false }));
		api.get('/app', (req, res) => {
			res.json(chathub.getApp());
		});
		api.put('/app/:name', (req, res) => {
			chathub.addApp(req.params.name, req.body);
			res.status(201).end();
		});
		api.delete('/app/:name', (req, res) => {
			chathub.deleteApp(req.params.name);
			res.status(204).end();
		});
		chathub.start();
		var server = api.listen(config.port);
		return () => {
			server.close();
			chathub.stop();
		};
	};
};
