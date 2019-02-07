/* Transport facilitates communication between the library and the VidyoClient.js */
function VidyoClientTransport(plugInObj, onStatus, onCallback, plugInDivId){
	var contextObj = plugInObj;
	var onStatus = onStatus;
	var onCallback = onCallback;
	var plugIn;
	var plugInVersion;
	var status = "INITIALIZING";
	/* use a local namespace for jQuery */
	var $ = VCUtils.jQuery;
		
	var onStatus_ = function(event) {
		if (event.status != status && status != "UNREACHABLE") {
			status = event.status;
			if (onStatus) {
				onStatus(event);
			}
		}
	}
	
	var DEBUG = false;
	function randomString(length, chars) {
		var result = '';
		for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
		return result;
	}
	var plugInId = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

	this.AddPlugInIntoDOM = function(parentDivId, plugInDivId, type) {
		var html = '';
		if(DEBUG) {
			html += "<div id='VidyoClientPlugIn' class='VidyoClientPlugIn'></div>"
		} else {
			navigator.plugins.refresh(false);
			html += "<object type='" + VCUtils.mimeType + "' id='" + plugInDivId + "' vidyoclientplugin_id='" + plugInId + "' vidyoclientplugin_type='" + type + "' class='VidyoClientPlugIn' style='width: 100%; height: 100%;'>";
			html += "<param name='id' value='" + plugInDivId + "'>";
			html += "<param name='vidyoclientplugin_id' value='" + plugInId + "'>";
			html += "<param name='vidyoclientplugin_type' value='" + type + "'>";
			html += "</object>";
		}
		if (parentDivId) {
			$('#' + parentDivId).html(html);
		} else {
			$('body').html(html);
		}
		if(DEBUG) {
			var plugIn = new VidyoClientPlugInTest();
		} else {
			var plugIn = document.getElementById(plugInDivId);
		}
		return plugIn;
	}
	this.RemovePlugInFromDOM = function() {
		/* remove every element of VidyoClientPlugIn class */
		$('.VidyoClientPlugIn').remove();
	}
	
	plugIn = this.AddPlugInIntoDOM(plugInDivId, "VidyoPlugIn_" + plugInDivId, "MAIN");
	if(plugIn == null)
		return null;
	
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
		var parentDivId = args.hasOwnProperty('viewId') ? args.viewId : null;
		var uiEvent = args.hasOwnProperty('uiEvent') ? args.uiEvent : "";
		var x = args.hasOwnProperty('x') ? args.x : "";
		var y = args.hasOwnProperty('y') ? args.y : "";
		var w = args.hasOwnProperty('w') ? args.w : "";
		var h = args.hasOwnProperty('h') ? args.h : "";
		var displayCropped = args.hasOwnProperty('displayCropped') ? args.displayCropped : 0;
		var allowZoom = args.hasOwnProperty('allowZoom') ? args.allowZoom : 0;
		
		var plugInDivId = parentDivId ? plugInId + "_" + parentDivId : parentDivId;
		var type = "RENDERER";
		var html = '';
		navigator.plugins.refresh(false);
		if((uiEvent.indexOf("create") !== -1) || (uiEvent.indexOf("constructor") !== -1) || (uiEvent.indexOf("AssignView") !== -1)){
			/* check if ID aleady exists */
			var existingPlugInDivID = document.getElementById(plugInDivId);
			if(parentDivId && !existingPlugInDivID){
				html += "<object type='" + VCUtils.mimeType + "' id='" + plugInDivId + "' vidyoclientplugin_id='" + plugInId + "' vidyoclientplugin_type='" + type + "' class='VidyoClientPlugIn' style='width: 100%; height: 100%;'>";
				html += "<param name='id' value='" + plugInDivId + "'>";
				html += "<param name='vidyoclientplugin_id' value='" + plugInId + "'>";
				html += "<param name='vidyoclientplugin_type' value='" + type + "'>";
				html += "<param name='displayCropped' value='"+ displayCropped + "'>";
				html += "</object>";
				$('#' + parentDivId).html(html);
				var plugIn = document.getElementById(plugInDivId);
			}
		}
		else if (uiEvent.indexOf("ShowViewAt") !== -1){
			/* ShowViewAt is not applicable to Browser Plugin */
		}
		else if (uiEvent.indexOf("ShowView") !== -1){
			if(parentDivId){
				$('#' + parentDivId).css('left', x);
				$('#' + parentDivId).css('top', y);
				$('#' + parentDivId).css('width', w);
				$('#' + parentDivId).css('height', h);
			}
		}
		else if (uiEvent.indexOf("HideView") !== -1){
			if(parentDivId){
				$('#' + parentDivId).html('');
			}
		}
		
		return plugInDivId;
	}
	
	var SendMessage_ = function(data, OnSuccess, OnError, Async){
		var ret;
		var isAsync = Async ? true : false;
		
		try {
			var responseStr = plugIn.get("/VidyoClientAPI/" + data);
			var response = $.parseJSON(responseStr);
			
		} catch(err) {
			onStatus_({state: "FAILED", description: "Plugin failed to load or crashed", type: "METHOD"});
			if (isAsync)
				OnError(response);
			ret = null;
		}
		if (!response) {
			/* plugin response could not be parsed */
			onStatus_({state: "FAILED", description: "Invalid response from the plugin", type: "METHOD"});
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
		}
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
				window.console && console.log("CALLBACK ERROR: " + errorText);
			},
			true
		);
	}
	
	this.SendMessage = function(data, OnSuccess, OnError, Async){
		return SendMessage_(data, OnSuccess, OnError, Async);
	}
	var GetVersion = function() {
		response = SendMessage_("GetVersion");
		if (response && response.data){
			return response.data.version;
		} else {/* Server response is valid */
			return null;
		}
	}
	
	var OnReady_ = function () {
		StartCallbackPoll();
		onStatus_({state: "READY", description: "Plugin successfully loaded", type: "METHOD"});
	}
	
	plugInVersion = GetVersion();
	if (plugInVersion == VCUtils.version){
		/* run asynchronously since the client library needs to finish constructing before READY is called */
		setTimeout($.proxy(OnReady_, this), 10);
	} else {
		this.RemovePlugInFromDOM();
		onStatus_({state: "FAILEDVERSION", description: "Plugin(" + plugInVersion + ") and Javascript(" + VCUtils.version + ") versions do not match.", plugInVersion: plugInVersion, jsVersion: VCUtils.version, type: "METHOD"});
	}
}
