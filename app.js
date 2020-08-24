var express = require('express'),
	app = express();

var port = process.env.PORT || 8081;


var io = require('socket.io').listen(app.listen(port));

require('./config')(app, io);
require('./routes')(app, io);

console.log('Your application is running on http://localhost:' + port);