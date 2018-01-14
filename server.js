var TEAM_SIZE;
var NUM_TEAMS;
var maxHash = 999;
var NUMBER_OF_WORDS = 25;
var timerDuration = 60 * 2.5;
var readyDuration = 3;
var WORDS_PER_TEAM;
var teamNames = ["blues", "pinks", "oranges", "greens"];
var COLOR_BLUE = "#27aae0";
var COLOR_PINK = "#e85ba6";
var COLOR_ORANGE = "#f3ae2a"; 
var COLOR_BROWN = "#f3af2a";
var COLOR_GREEN = "#8dc53e";
var COLOR_BLACK = "#808080";
var teamsInitialised = false;
var teamColours = [COLOR_BLUE, COLOR_PINK, COLOR_ORANGE, COLOR_GREEN];
var BLANKS;

var sessionData = [];
var wordsSelected = [];
var teamWords = [];
var trs = [];
var teams = [];
var colours = [];

var myTimer;
var whoseGo = "";
var checked = true;
var inProgress = false;
var optionsAvailable = true;
var isPaused = false;
var activeTeamColour;

var data = require('./data.js');
var seedrandom = require('seedrandom');

// Check the configuration file for more details
var config = require('./config');

// Express.js stuff
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);

// Websockets with socket.io
var io = require('socket.io')(server);

//Function to capitalise first letter of a word
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// Function to initialise teams
function createTeams() {
	console.log("Initialising teams with values " + NUM_TEAMS + " " + TEAM_SIZE);
	for (i=0; i<NUM_TEAMS; i++) {
		teams.push ({
			name: teamNames[i],
			colour: teamColours[i],
			score: 0,
			target: WORDS_PER_TEAM,
			players: [],
			active: false
		});
		console.log("created team name: " + teams[i].name);
	}
	console.log("Total teams = " + teams.length);
}

// Function to get the number of players in the teams
function getTeamSize () {

	var teamSize = 0;
	for (i=0; i<NUM_TEAMS; i++) {
		teamSize = teamSize + teams[i].players.length;
	}
	return teamSize;
}

// Function to create a new board
function createBoard(){	

	//get seed and set the seed for randomizer
	var gameHash = Math.floor((Math.random() * maxHash) + 1);
	
	Math.seedrandom(gameHash);

	//reset state to pristine state
	sessionData = data.slice(0);
	wordsSelected = [];
	teamWords = [];
	
	//Fill wordsSelected array & create 5 table rows with 5 element 
	for(var i = 0; i < NUMBER_OF_WORDS; i++){
		/*if (!trs[i%5]){
			trs[i%5] = "";
		}*/
		var randomNumber = Math.floor(Math.random() * sessionData.length);
		var word = toTitleCase(sessionData[randomNumber]);
		//var word = sessionData[randomNumber];
		removeItem(sessionData, randomNumber);
		wordsSelected.push(word.toLowerCase());
		trs[i] = "<div class=\"square center\"><div class=\"content\"><div class=\"table\"><div class=\"table-cell\"id=\'"+ i +"\' onclick=\"clicked(\'" + i + "\')\"><a href=\"#\">" + word + "</a></div></div></div></div>";
		//trs[i] = "<div class=\"tile\" id=\'"+ i +"\' onclick=\"clicked(\'" + i + "\')\"><a href=\"#\">" + word + "</a></div>";
		//console.log("i: " + i + " " + trs[i] + ",");
	}
	
	//create the colours array
	for(var i = 0; i < WORDS_PER_TEAM; i++){
		for (j=0; j<NUM_TEAMS; j++) {
			colours.push(teamColours[j]);
			//console.log("Pushing colour " + teamColours[j]);
		}
	}
	
	// one extra for one of the teams
	/*var remainder = Math.floor(Math.random() * data.length) % 3;
	console.log("Math.floor(Math.random() * data.length) % 2: " + remainder);
	if(remainder === 0){
		colours.push(teamColours[0]);
		teams[0].target++;
		console.log("Incrementing target to " + teams[0].target);
		whoseGo = teamNames[0];
		teams[0].active = true;
		activeTeamColour = teamColours[0];
	}else if(remainder === 1){
		colours.push(teamColours[1]);
		teams[1].target++;
		whoseGo = teamNames[1];
		teams[1].active = true;
		activeTeamColour = teamColours[1];
	}else if(remainder === 2){
		colours.push(teamColours[2]);
		teams[2].target++;
		whoseGo = teamNames[2];
		teams[2].active = true;
		activeTeamColour = teamColours[2];
	}else {
		colours.push(teamColours[3]);
		teams[3].target++;
		whoseGo = teamNames[3];
		teams[3].active = true;
		activeTeamColour = teamColours[3];
	}*/	
	
	var extraIndex = Math.floor(Math.random() * NUM_TEAMS);	
	console.log("Extra team id: " + extraIndex);
	colours.push(teamColours[extraIndex]);
	teams[extraIndex].target++;
	whoseGo = teamNames[extraIndex];
	teams[extraIndex].active = true;
	activeTeamColour = teamColours[extraIndex];
	console.log("Active team colour: " + activeTeamColour);
	
	BLANKS = NUMBER_OF_WORDS - ((WORDS_PER_TEAM * NUM_TEAMS) + 1);
	// add neturals 
	for(var x = 0; x < BLANKS; x++){
		colours.push(COLOR_BROWN);
	}

	// push the assasin
	//colours.push(COLOR_BLACK)
	
	shuffle(colours);
	inProgress = true;
	isPaused = false;
	sendTeams();
}

//not used, but probably useful at some point
function removeItem(array, index){
	if (index > -1) {
		// console.log("index: " + index + ", word: " + array[index] + " removed.");
	    array.splice(index, 1);
	}
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

// Get the next team & emit turn
function switchTeam()
{
	var index = teamNames.indexOf(whoseGo);
	teams[index].active = false;
	//io.sockets.in(whoseGo).emit('disable');
	io.sockets.emit('disable');
	if (index == NUM_TEAMS-1) {
		index = 0;
	} else {
		index++;
	}
	activeTeamColour = teamColours[index];
	console.log("Active team colour: " + activeTeamColour);
	whoseGo = teamNames[index];
	teams[index].active = true;
	console.log(teams[index].name + " is now set to active");
	console.log("Switching team to", whoseGo);		
	io.sockets.emit('turn', { whoseGo : whoseGo, activeTeamColour : activeTeamColour });
	//sendTeams();
	sendScores();
}

function isNameAvail(data) {
	console.log("Checking if name " + data + " is available");
	var isAvail = true;
	for (i=0; i<NUM_TEAMS; i++) {
		var index = teams[i].players.map(function(e) { return e.name; }).indexOf(data);
		//console.log ("index: " + index);
		if(index != -1) {
			console.log("Player " + data + " already exists");
			isAvail = false;
		}
	}
	return isAvail;
}

function removePlayer(data) {

	// if player was a code master, pause the game
	if(teamsInitialised) {
		console.log("Looking for player" + data);
		for (i=0; i<NUM_TEAMS; i++) {
			var index = teams[i].players.map(function(e) { return e.name; }).indexOf(data);
			if(index != -1) {
				console.log("Found at index: " + index);
				teams[i].players.splice(index, 1);
				pauseTimer();
				return ;
			}
		}
	}
}

function sendTeams () {
	console.log("Server is sending the teams");
	io.sockets.emit('displayTeam', {teams:teams, NUM_TEAMS:NUM_TEAMS, TEAM_SIZE:TEAM_SIZE });
}

function sendScores () {
	console.log("Server is sending the scores");
	io.sockets.emit('displayScore', teams);
}

function pauseTimer() {
	isPaused = true;
}

startTimer = function() {
	if (myTimer) {
		clearInterval(myTimer);
	}
	duration = timerDuration;
	var minutes, seconds;
	myTimer = setInterval(function () {
        minutes = parseInt(duration / 60, 10);
        seconds = parseInt(duration % 60, 10);

        //minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

		io.sockets.emit('timer', { minutes: minutes, seconds: seconds, duration: duration });
		
		if(!isPaused) {
			duration--;
		}
        if (duration < 0) {
			// Time run out - need to change turns
            duration = timerDuration;
			console.log("Timeout, switching teams");
			switchTeam();
        }
    }, 1000);
};

function startGame() {

	//Show board, turn then send score
	io.sockets.emit('board', {trs: trs, colours: colours} );
	io.sockets.emit('turn', { whoseGo : whoseGo, activeTeamColour : activeTeamColour });
	sendScores();
	isPaused = false;
	startTimer();

}

function resumeGame() {

}

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

console.log("Trying to start server with config:", server_ip_address + ":" + server_port);

 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});



// Both port and ip are needed for the OpenShift, otherwise it tries 
// to bind server on IP 0.0.0.0 (or something) and fails
//server.listen(config.serverport, config.serverip, function() {
//	console.log("Server running @ http://" + config.serverip + ":" + config.serverport);
	//createTeams();
//});

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
		// Change colour
		io.sockets.emit('changeColour', {colours: colours, value: value, teams : teams });
	});
	
	// Handle reset event
	socket.on('reset', function () {
		// reset the server
		optionsAvailable = true;
		clearInterval(myTimer);
		console.log ("Resetting");

		sessionData = [];
		wordsSelected = [];
		teamWords = [];
		trs = [];
		teams = [];
		colours = [];
		
		checked = true;
		inProgress = false;
		isPaused = false;
		teamsInitialised = false;

		whoseGo = "";
		//createTeams();
		io.sockets.emit('reload');
	});
	
	//Handle score event
	socket.on('score', function (teamName) {
		// Increment teams score
		console.log("Incrementing score for team " + teamName);
		var index = teamNames.indexOf(teamName);
		teams[index].score++;
		if(teams[index].score == teams[index].target)
		{
			clearInterval(myTimer);
			io.sockets.emit('endGame', {teams:teams, NUM_TEAMS:NUM_TEAMS, TEAM_SIZE:TEAM_SIZE, teamName:teamName, colour:teams[index].colour });
		}
		//sendTeams();
		sendScores();
	});
	
	//Handle clueGiven by spyMaster
	socket.on('clueGiven', function (data) {
		console.log(data.clue + " " + data.num);
		data.whoseGo = whoseGo;
		data.teams = teams;
		io.sockets.emit('showClue', data);
	});
	
	//Handle switch
	socket.on('switch', function (data) {
		console.log("switching team");
		switchTeam();
		isPaused = false;
		startTimer();		
	});
	
	// Handle getTeams event
	socket.on('getTeams', function (data) {
		sendTeams();
	});
	
	//Handle client disconnect event
	socket.on('disconnect', function(data) {
		console.log(socket.id + " disconnected");
		if(socket.nickname) {
		
			console.log("Disconnect from " + socket.nickname + " resending teams");
			removePlayer(socket.nickname);
			sendTeams();
		} else {
			return;
		}
		
	});	
	
	socket.on('checkClue', function (data, callback) {
		if (wordsSelected.indexOf(data) > -1) {
			callback (false);
		} else {
			callback (true);
		}
	});
 
	socket.on('disableGuessers', function () {
		console.log("Received message to disable guessers");
		//io.sockets.in(whoseGo).emit('disable');
		io.sockets.emit('disable');
	}); 

	socket.on('enableGuessers', function () {
		console.log("Received message to enable guessers");
		//io.sockets.in(whoseGo).emit('enable');
		io.sockets.emit('enable');
		
	}); 
	
  socket.on('getStatus', function (callback) {
	if(optionsAvailable) {
		callback(true);
		console.log("options available");
	} else {
		console.log("options not available");
		callback(false);
	}
  });
  
  
  //add player to team which has space
  socket.on('registerPlayer', function (data, playerNum, callback) {
	console.log("received join game request from client:", data);
	if(playerNum) {
		console.log("Received player number parameter " + playerNum + " resetting all other clients");
		socket.broadcast.emit('reload');
		switch (parseInt(playerNum)) {
			case 4:
				TEAM_SIZE = 2;
				NUM_TEAMS = 2;
				WORDS_PER_TEAM = 8;
				break;
			case 6:
				TEAM_SIZE = 3;
				NUM_TEAMS = 2;
				WORDS_PER_TEAM = 8;
				break;
			case 8:
				TEAM_SIZE = 2;
				NUM_TEAMS = 4;
				WORDS_PER_TEAM = 6;
				break;
			case 9:
				TEAM_SIZE = 3;
				NUM_TEAMS = 3;
				WORDS_PER_TEAM = 8;
				break;
			case 12:
				TEAM_SIZE = 3;
				NUM_TEAMS = 4;
				WORDS_PER_TEAM = 6;
				break;
			case 16:
				TEAM_SIZE = 4;
				NUM_TEAMS = 4;
				WORDS_PER_TEAM = 6;
				break;
		}
		console.log("Calling Create teams with values " + TEAM_SIZE + " " + NUM_TEAMS);
		createTeams();
		teamsInitialised = true;
	}
	var added = false;
	var left;
	var teamSize = getTeamSize();
	var i=0;
	if (teamSize < TEAM_SIZE*NUM_TEAMS){
		// check name is not already in one of the teams
		if (isNameAvail(data))
		{
			while (!added && i<NUM_TEAMS) {
				if (teams[i].players.length < TEAM_SIZE) {
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
					//teams[i].players.push(data);
					teams[i].players.push(player);
					
					//Adding player into room
					//socket.join(teamNames[i]);
					socket.emit('teamAllocated', {roomId: teamNames[i], colour: teamColours[i], teams: teams, NUM_TEAMS:NUM_TEAMS, TEAM_SIZE:TEAM_SIZE });
					//io.sockets.in(teamNames[i]).emit('roomAllocated', {roomId: teamNames[i], colour: teamColours[i], teams: teams, NUM_TEAMS:NUM_TEAMS, TEAM_SIZE:TEAM_SIZE });
					sendTeams();
				}
				i++;
			}
			optionsAvailable = false;
			callback (true);
			teamSize++;
			left = (TEAM_SIZE*NUM_TEAMS) - teamSize;
			io.sockets.emit('teamSize', {teamSize : teamSize, left : left} );			
			
			//If team size is reached the max
			if (teamSize == TEAM_SIZE*NUM_TEAMS) {
				
				// If no game in progress then create the board
				if(!inProgress) {
					console.log("Calling createBoard()");
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
				
				//Show board, turn then send score
				/*io.sockets.emit('board', {trs: trs, colours: colours} );
				io.sockets.emit('turn', { whoseGo : whoseGo, activeTeamColour : activeTeamColour });
				sendScores();
				isPaused = false;
				startTimer();*/
			}
		} else {
			callback(false);
		}
	} else {
		//game is full
		socket.emit('gameFull', teams);
	}
  });
});