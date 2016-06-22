// Check the configuration file for more details
var config = require('./config');

// Express.js stuff
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);

// Websockets with socket.io
var io = require('socket.io')(server);

console.log("Trying to start server with config:", config.serverip + ":" + config.serverport);

// Both port and ip are needed for the OpenShift, otherwise it tries 
// to bind server on IP 0.0.0.0 (or something) and fails
server.listen(config.serverport, config.serverip, function() {
	console.log("Server running @ http://" + config.serverip + ":" + config.serverport);
	//createTeams();
});

// Allow some files to be served over HTTP
app.use(express.static(__dirname + '/'));

// Serve GET on http://domain/
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Server GET on http://domain/api/config
// A hack to provide client the system config
app.get('/api/config', function(req, res) {
	res.send('var config = ' + JSON.stringify(config));
});

// And finally some websocket stuff
io.on('connection', function (socket) { // Incoming connections from clients
	   
	console.log( socket.id + ' connected' );   
	   
	//On click of board piece
	socket.on('clicked', function (value) {

	});
	
	// Handle reset event
	socket.on('reset', function () {

	});
	
	//Handle score event
	socket.on('score', function (teamName) {

	});
	
	//Handle clueGiven by spyMaster
	socket.on('clueGiven', function (data) {

	});
	
	//Handle switch
	socket.on('switch', function (data) {
		
	});
	
	// Handle getTeams event
	socket.on('getTeams', function (data) {

	});
	
	//Handle client disconnect event
	socket.on('disconnect', function(data) {
		
	});	
	
	socket.on('checkClue', function (data, callback) {

	});
 
	socket.on('disableGuessers', function () {
		
	}); 

	socket.on('enableGuessers', function () {
		
	}); 
	
  socket.on('getStatus', function (callback) {

  });
  
  
  //add player to team which has space
  socket.on('registerPlayer', function (data, playerNum, callback) {

  });
});