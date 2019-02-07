VidyoMediaBridge = function (server_uri) {
	var SERVER_URI = "http://" + server_uri + "/";

	var ACTIONS = {
		connect: "makeCall",
		status: "getCallStatus",
		participants: "getParticipants",
		disconnect: "terminateCall"
	};
	var SETTINGS = {
		call_status_update: 2
	};

	var current_caller_id = null;
	var current_call_participants = null;

	//timeouts
	var updateCallStatus = null;
	var updatePatnerInfo = null;
	
	// callbacks
	var onConnected = null;
	var onDisconnected = null;
	var onCallStatusUpdate = null;
	var onParticipantListUpdate = null;

	var call_disconnect = function (error) {
		clearInterval(updateCallStatus);
		clearInterval(updatePatnerInfo);
		if (onParticipantListUpdate)
			onParticipantListUpdate(null);
		if (onDisconnected)
			onDisconnected(error);
		current_caller_id = null;
		current_call_participants = [];
		// callbacks
		onConnected = null;
		onDisconnected = null;
		onCallStatusUpdate = null;
		onParticipantListUpdate = null;
	};

	var call_status = function () {
		var json_request = {
			"requests": [{
				"request": ACTIONS.status,
				"callId": current_caller_id
			}]
		};

		REST.post(SERVER_URI, json_request, function (response) {
			if (response == null || response.responses == null) {
				call_disconnect(null);
				return;
			}
			response.responses.forEach(function(response) {
				if (response.error) {
					call_disconnect(response.error);
				} else {
					onCallStatusUpdate(response.status.call);
				}
			});
		});

	};

	var call_participants = function () {
		var json_request = {
			"requests": [{
				"protocol": "xmpp",
				"callId": current_caller_id,
				"request": ACTIONS.participants
			}]
		};

		REST.post(SERVER_URI, json_request, function (response) {
			if (response == null || response.responses == null) {
				call_disconnect(null);
				return;
			} 
			
			response.responses.forEach(function(response) {
				if (response.error) {
					call_disconnect(response.error);
				} else {
					var participants = response.responses[0].participants;
					if (current_call_participants == null) {
						current_call_participants = participants;
						onParticipantListUpdate(participants);
					} else {
						var foundNew = false;
						participants.forEach(function (eachNew) {
							var matchOnce = false;
							current_call_participants.forEach(function (eachOld) {
								if (eachNew.id == eachOld.id)
									matchOnce = true;
							});

							if (!matchOnce)
								foundNew = true;
						});
						if (foundNew) {
							current_call_participants = participants;
							onParticipantListUpdate(participants);
						}
					}
				}
			});
		});
	};

	var REST = {
		post: function (server_uri, data, success) {
			var xhr = new XMLHttpRequest();
			xhr.open('POST', server_uri,true);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader("Accept","application/json, text/javascript, */*; q=0.01");
			xhr.onload = function() {
				if (xhr.status == 200) {
					success(JSON.parse(xhr.responseText));
				}
			};
			xhr.send(JSON.stringify(data));
		}
	};

	this.connect = function (host, token, displayName, destination, resourceId, endPointName, onConnected_, onDisconnected_, onCallStatusUpdate_, onParticipantListUpdate_) {

		var json_request = {
			"requests": [{
				"endpoint": endPointName,
				"destination": destination,
				"displayName": displayName,
				"token": token,
				"room": resourceId,
				"server": host,
				"request": ACTIONS.connect
			}]
		};
		
		onConnected = onConnected_;
		onDisconnected = onDisconnected_;
		onCallStatusUpdate = onCallStatusUpdate_;
		onParticipantListUpdate = onParticipantListUpdate_;
		
		REST.post(SERVER_URI, json_request, function (response) {
			if (response == null || response.responses == null) {
				call_disconnect(null);
				return;
			} 
			
			response.responses.forEach(function(response) {
				if (response.error) {
					call_disconnect(response.error);
				} else {
					onConnected();
					
					current_caller_id = response.callId;

					updateCallStatus = window.setInterval(function () {
						call_status();
					}, SETTINGS.call_status_update * 1000);

					updatePatnerInfo = window.setInterval(function () {
						call_participants();
					}, SETTINGS.call_status_update * 1000);
				}
			});
		});

	};

	this.disconnect = function () {
		var json_request = {
			"requests": [{
				"request": ACTIONS.disconnect,
				"callId": current_caller_id
			}]
		};

		REST.post(SERVER_URI, json_request, function (response) {
			call_disconnect(null);
		});
	}

};
