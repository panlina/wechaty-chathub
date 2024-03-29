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
			if (req.params.name in chathub.app) {
				chathub.updateApp(req.params.name, req.body);
				res.status(204).end();
			} else {
				chathub.addApp(req.params.name, req.body);
				res.status(201).end();
			}
		});
		api.delete('/app/:name', (req, res) => {
			if (!(req.params.name in chathub.app)) {
				res.sendStatus(404);
				return;
			}
			chathub.deleteApp(req.params.name);
			res.status(204).end();
		});
		api.move('/app/:name', (req, res) => {
			if (!(req.params.name in chathub.app)) {
				res.sendStatus(404);
				return;
			}
			var destination = req.header('Destination');
			var newName = decodeURIComponent(destination.substr("/app/".length));
			if (req.header('Overwrite'))
				var overwrite = req.header('Overwrite') == 'T';
			var newNameExists = newName in chathub.app;
			try {
				chathub.renameApp(req.params.name, newName, overwrite);
				res.status(newNameExists ? 204 : 201);
				if (!newNameExists)
					res.header('Location', `/app/${newName}`);
				res.end();
			} catch (e) {
				res.status(412).contentType('text/plain').send(e.message);
			}
		});
		api.get('/app/:name/error', (req, res) => {
			res.json(
				chathub.app[req.params.name].error.map(
					({ time, error }) => {
						var source = error.program?.node.source;
						return {
							time: time,
							location: source ? { start: source.startIdx, end: source.endIdx } : undefined,
							message: error.message
						};
					}
				)
			);
		});
		chathub.start();
		var server = api.listen(config.port);
		return () => {
			server.close();
			chathub.stop();
		};
	};
};
