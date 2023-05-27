# wechaty-chathub

A Wechaty plugin of chathub, a place to create and manage chat functionalities.

## Usage

```js
var { Wechaty } = require('wechaty');
var WechatyChathubPlugin = require('wechaty-chathub');
var bot = new Wechaty();
bot.use(
	WechatyChathubPlugin({
		port: 3000,
		dir: '.'
	})
);
```
