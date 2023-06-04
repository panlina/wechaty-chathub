/** @typedef { import("wechaty").Wechaty } Wechaty */
/** @typedef { import("wechaty").WechatyPlugin } WechatyPlugin */
/** @typedef { ReturnType<import("wechaty").WechatyPlugin> } WechatyPluginReturn */
var fs = require('fs');
var path = require('path');
var WechatyChatscriptPlugin = require('wechaty-chatscript');
class Chathub {
	/**
	 * @param {Wechaty} bot
	 * @param {Object} config
	 * @param {string} config.dir working directory
	 */
	constructor(bot, config) {
		this.bot = bot;
		this.dir = config.dir;
		/** @type {{[name: string]: { installer: WechatyPlugin, uninstaller: WechatyPluginReturn }}} */
		this.app = {};
	}
	/** @returns {{[name: string]: string}} */
	getApp() {
		var file = path.join(this.dir, 'app.json');
		var app = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
		return app;
	}
	/**
	 * @param {string} name
	 * @param {string} app
	 */
	addApp(name, app) {
		this.startApp(name, app);
		{
			var file = path.join(this.dir, 'app.json');
			var data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
			data[name] = app;
			fs.writeFileSync(file, JSON.stringify(data, undefined, '\t'), 'utf8');
		}
	}
	/** @param {string} name */
	deleteApp(name) {
		this.stopApp(name);
		{
			var file = path.join(this.dir, 'app.json');
			var data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
			delete data[name];
			fs.writeFileSync(file, JSON.stringify(data, undefined, '\t'), 'utf8');
		}
	}
	/**
	 * @param {string} name
	 * @param {string} app
	 */
	updateApp(name, app) {
		this.stopApp(name);
		this.startApp(name, app);
		{
			var file = path.join(this.dir, 'app.json');
			var data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
			data[name] = app;
			fs.writeFileSync(file, JSON.stringify(data, undefined, '\t'), 'utf8');
		}
	}
	/**
	 * @param {string} name
	 * @param {string} newName
	 */
	renameApp(name, newName) {
		var app = this.app[name];
		delete this.app[name];
		this.app[newName] = app;
		{
			var file = path.join(this.dir, 'app.json');
			var data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
			var app = data[name];
			delete data[name];
			data[newName] = app;
			fs.writeFileSync(file, JSON.stringify(data, undefined, '\t'), 'utf8');
		}
	}
	/**
	 * @param {string} name
	 * @param {string} app
	 */
	startApp(name, app) {
		var installer = WechatyChatscriptPlugin(app);
		var uninstaller = installer(this.bot);
		this.app[name] = {
			installer: installer,
			uninstaller: uninstaller
		};
	}
	/** @param {string} name */
	stopApp(name) {
		var uninstaller = this.app[name].uninstaller;
		if (uninstaller)
			uninstaller();
		delete this.app[name];
	}
	start() {
		var file = path.join(this.dir, 'app.json');
		var app = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
		for (var name in app)
			this.startApp(name, app[name]);
	}
	stop() {
		for (var name in this.app)
			this.stopApp(name);
	}
}
module.exports = Chathub;
