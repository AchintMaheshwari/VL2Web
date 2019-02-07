function VidyoClientTransport(plugInObj, onStatus, onCallback, plugInDivId){
	var contextObj = plugInObj;
	var onStatus = onStatus;
	var onCallback = onCallback;
	var status = "INITIALIZING";
	
	var onStatus_ = function(event) {
		if (event.status != status && status != "UNREACHABLE") {
			status = event.status;
			if (onStatus) {
				onStatus(event);
			}
		}
	}
	
	
	var SendMessage_ = function(data, OnSuccess, OnError, Async){
		var ret;
		this.nextEvent;
		var isAsync = Async ? true : false;
	
		$.ajax({
			url: "/VidyoClientAPI/" + data,
			async: isAsync,
			context: this,
			success: function(response) {
				if(!response) {
					/* Server responded but the data is Invalid */
					onStatus_({state: "FAILED", description: "Invalid response received from the server", type: "METHOD"});
					if (isAsync)
						OnError("Invalid response received from the server");
					else
						ret = null;
				} else {
					if (response.result == "ok") {
						if(isAsync)
							OnSuccess(response);
						else
							ret = response;
					} else {
						if (isAsync)
							OnError(response);
						else
							ret = response;
					}
					/* Server response is valid */
					onStatus_({state: "READY", description: "Plugin successfully loaded", type: "METHOD"});
					this.nextEvent = 1000; /* reset the retry timer since the call was sucessful */
				}
			},
			error: function(xhr, textStatus, thrownError) {
				if(this.nextEvent > 120000) {
					if(isAsync)
						OnError(textStatus);
					else
						ret = null;
						
					onStatus_({state: "FAILED", description: textStatus, type: "METHOD"});
				} else {
					if (!this.nextEvent) {
						this.nextEvent = 1000; /* start backoff from 1 sec */
					} else {
						this.nextEvent = this.nextEvent * 2; /* double the backoff time */
					}
					setTimeout($.proxy(SendMessage_, this), this.nextEvent, data, OnSuccess, OnError, Async);
					onStatus_({state: "RETRYING", description: textStatus, type: "METHOD", nextTimeout: this.nextEvent});
				}
			}
		});
		return ret;
	}
	
	var StartCallbackPoll = function() {
		var ret;
		SendMessage_("GetCallbacks",
			function(response) {
				onCallback(contextObj, response);
				setTimeout($.proxy(StartCallbackPoll, this), 1000);
			},
			function(errorText) {
				
			},
			true
		);
	}
	
	this.SendMessage = function(data, OnSuccess, OnError, Async){
		return SendMessage_(data, OnSuccess, OnError, Async);
	}
	
/* 
Possible args{}
({uiEvent:"create", viewId:viewId, viewStyle:viewStyle, remoteParticipants:remoteParticipants, userData:userData, consoleLogFilter:consoleLogFilter, fileLogFilter:fileLogFilter, fileLogName:fileLogName});
({uiEvent:"constructor", viewId:viewId, viewStyle:viewStyle, remoteParticipants:remoteParticipants, userData:userData, consoleLogFilter:consoleLogFilter, fileLogFilter:fileLogFilter, fileLogName:fileLogName});
({uiEvent:"CreateRendererFromViewId", viewId:viewId, x:x, y:y, width:width, height:height});
({uiEvent:"AssignViewToCompositeRenderer", viewId:viewId, viewStyle:viewStyle, remoteParticipants:remoteParticipants});
({uiEvent:"AssignViewToLocalCamera", viewId:viewId, localCamera:localCamera, displayCropped:displayCropped, allowZoom:allowZoom});
({uiEvent:"AssignViewToRemoteCamera", viewId:viewId, remoteCamera:remoteCamera, displayCropped:displayCropped, allowZoom:allowZoom});
({uiEvent:"AssignViewToRemoteWindowShare", viewId:viewId, remoteWindowShare:remoteWindowShare, displayCropped:displayCropped, allowZoom:allowZoom});
({uiEvent:"HideView", viewId:viewId});
({uiEvent:"SetViewAnimationSpeed", viewId:viewId, speedPercentage:speedPercentage});
({uiEvent:"SetViewBackgroundColor", viewId:viewId, red:red, green:green, blue:blue});
({uiEvent:"ShowAudioMeters", viewId:viewId, showMeters:showMeters});
({uiEvent:"ShowViewAt", viewId:viewId, x:x, y:y, width:width, height:height});
({uiEvent:"ShowViewLabel", viewId:viewId, showLabel:showLabel});
*/
	this.UpdateViewOnDOM = function(args){
		var plugInDivId = "VidyoPlugIn_" + args.viewId;
		var type = "RENDERER";
		var html = '';
		navigator.plugins.refresh(false);
		if((uiEvent == "create") || (uiEvent == "constructor"))
			html += "<div id='" + plugInDivId + "' class='VidyoClientPlugIn' style='width: 100%; height: 100%;'></object>"
		if (args.viewId) {
			$('#' + args.viewId).html(html);
		} else {
			$('body').html(html);
		}
		var plugIn = document.getElementById(plugInDivId);
		
		return plugInDivId;
	}
	
	setTimeout($.proxy(StartCallbackPoll, this), 1000);
}