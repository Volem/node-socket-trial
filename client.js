const logger = require('./basic-logger')('websocket-client');
var W3CWebSocket = require('websocket').w3cwebsocket;

var client = new W3CWebSocket('ws://localhost:8080/', 'echo-protocol');

client.onerror = function () {
	logger.trace('Connection Error');
};

client.onopen = function () {
	logger.trace('WebSocket Client Connected');

	function sendNumber() {
		if (client.readyState === client.OPEN) {
			var number = Math.round(Math.random() * 0xFFFFFF);
			client.send(number.toString());
			setTimeout(sendNumber, 1000);
		}
	}
	sendNumber();
};

client.onclose = function () {
	logger.trace('echo-protocol Client Closed');
};

client.onmessage = function (e) {
	if (typeof e.data === 'string') {
		logger.trace(`Received: ${e.data}`);
	}
};