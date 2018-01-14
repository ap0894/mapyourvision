var TEAM_SIZE = 3;
var team = [];
var inProgress = false;
var BOARD_SIZE;
var trs = [];

// Check the configuration file for more details
var config = require('./config');

// Express.js stuff
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);

// Websockets with socket.io
var io = require('socket.io')(server);

var server_port = process.env.PORT || 5000
var server_ip_address = process.env.IP || '127.0.0.1'

console.log("Trying to start server with config:", server_ip_address + ":" + server_port);

 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
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
  socket.on('registerPlayer', function (data, callback) {
	console.log("received join game request from client:", data);
	console.log("Calling Create teams with values " + TEAM_SIZE + " " + NUM_TEAMS);
	
	var added = false;
	var left;
	
	var teamSize = team.players.length;
	
	var i=0;
	if (teamSize < TEAM_SIZE){
		// check name is not already in one of the teams
		if (isNameAvail(data))
		{
			socket.nickname = data;
			added = true;
			var player = {
				name : data,
				master : false,		
				id : socket.id
			};
			if(teams[i].players.length === 0) {
				console.log("Adding spymaster: " + data + " " + socket.id);
				player.master = true;
			}
			team.players.push(player);
			sendTeams();
			callback (true);
			teamSize++;
			left = (TEAM_SIZE*NUM_TEAMS) - teamSize;
			io.sockets.emit('teamSize', {teamSize : teamSize, left : left} );
			
			//If team size is reached the max
			if (teamSize == TEAM_SIZE) {
				
				// If no game in progress then create the board
				if(!inProgress) {
					createBoard();
				}
				
				//Show countdown timer then start game
				var secs;
				var duration = readyDuration;
				readyTimer = setInterval(function () {
					secs = parseInt(duration % 60, 10);
					io.sockets.emit('getReady', secs);
					duration--;
					
					if(duration < 0) {
						clearInterval(readyTimer);
						duration = readyDuration;
						console.log("Calling startGame()");
						startGame();
					}
					
				}, 1000);
			}
		} else {
			callback(false);
		}
	} else {
		//game is full
		console.log("Game Full");
		socket.emit('gameFull', teams);
	}
  });
});

function isNameAvail(data) {
	console.log("Checking if name " + data + " is available");
	var isAvail = true;
	if(team.players[data] != -1) {
		console.log("Player " + data + " already exists");
		isAvail = false;
	}
	return isAvail;
}

// Function to create a new board
function createBoard(){	

	//get seed and set the seed for randomizer
	//var gameHash = Math.floor((Math.random() * maxHash) + 1);
	
	//Math.seedrandom(gameHash);

	//reset state to pristine state
	//sessionData = data.slice(0);
	
	//Fill wordsSelected array & create 5 table rows with 5 element 
	var output = "<table><tbody>";
	if (!trs[i%5]){
		trs[i%5] = "";
	}
	for(var i = 0; i < BOARD_SIZE; i++){
		trs[i%5] += "<td><div class=\"imgDiv\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\"></div></td>";
	}
	output += trs;
	output +=  "</tbody></table>";
}