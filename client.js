// this block executes when page DOM is ready
$( document ).ready(function() {
	
	connect();	
	// Listener for click on Enter Game button
	$('#joinBtn').click(function(e){
		e.preventDefault();
		playerName = $('#pname').val();
		if (playerName == "" ) {
			console.log("Name was empty");
		} else {
			console.log("Registering Player: " + playerName);
			socket.emit('registerPlayer', playerName, function (data) {
				if (data) {
					$('#playerentry').hide();
					console.log("Player " + playerName + " registered");
				} else {
					console.log("Name " + playerName + " already taken");
					$("#errMsg").html("Sorry! Name is already taken, please try again");
				}
			});
			$('#waitMsg').html = "Please wait...";
		}
	});
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

// Connect event for web sockets
function connect() {
  
	var connString = config.protocol + config.domain + ':' + config.clientport;
	console.log("Websocket connection string:", connString, config.wsclientopts);
	socket = io.connect(connString, config.wsclientopts);

	// Handle error event
	socket.on('error', function (err) {  
	console.log("Websocket 'error' event:", err);
	});

	// Handle connection event
	socket.on('connect', function () { 
	console.log("Websocket 'connected' event with params:", socket);
	});

	// Handle disconnect event
	socket.on('disconnect', function () {
		console.log("Websocket client 'disconnect' event");
	});
}