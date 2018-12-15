const WebSocketServer = require('websocket').server;
const http = require('http');
const logger = require('./basic-logger')('websocket-server');

const server = http.createServer(function (request, response) {
	logger.trace((new Date()) + ' Received request for ' + request.url);
	response.writeHead(404);
	response.end();
});

server.listen(8080, function () {
	logger.trace((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
	httpServer: server,
	// You should not use autoAcceptConnections for production
	// applications, as it defeats all standard cross-origin protection
	// facilities built into the protocol and the browser.  You should
	// *always* verify the connection's origin and decide whether or not
	// to accept it.
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	return origin || true;
}

wsServer.on('request', function (req) {
	if (!originIsAllowed(req.origin)) {
		req.reject();
		logger.trace((new Date()) + ' Connection from origin ' + req.origin + ' rejected.');
		return;
	}
	const connection = req.accept('echo-protocol', req.origin);
	logger.trace((new Date()) + ' Connection accepted.');
	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			logger.trace('Received Message: ' + message.utf8Data);
			connection.sendUTF(message.utf8Data);
		}
		else if (message.type === 'binary') {
			logger.trace('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes(message.binaryData);
		}
	});
	connection.on('close', function (reasonCode, description) {
		logger.trace((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. Reason :' + description);
	});
});