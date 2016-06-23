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