/* Transport facilitates communication between the library and the VidyoClient.js */

function GetElectronWindowHandle()
{
    const { remote, BrowserWindow } = require('electron');
    const currentWindow = remote.getCurrentWindow();
    return currentWindow.getNativeWindowHandle();
}

function VidyoClientTransport(plugInObj, onStatus, onCallback, plugInDivId){

	var contextObj = plugInObj;
	var onStatus = onStatus;
	var onCallback = onCallback;
	var plugInVersion;
	var status = "INITIALIZING";
	/* use a local namespace for jQuery */
	var $ = VCUtils.jQuery;
	const remote = require('electron').remote;
	const VidyoAddon = remote.require(remote.process.env.VIDYO_MODULE || './build/Release/VidyoAddon');
	VidyoAddon.VidyoAddonInit();	

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
		var electronViewId = args.viewId ? GetElectronWindowHandle().toString('hex') + "_" + args.viewId : args.viewId;
		return electronViewId;
	}
	
	var SendMessage_ = function(data, OnSuccess, OnError, Async){
		var ret;
		var isAsync = Async ? true : false;
		try {
			var responseStr = VidyoAddon.VidyoAddonDispatch("/VidyoClientAPI/" + data);
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
		onStatus_({state: "FAILEDVERSION", description: "Plugin(" + plugInVersion + ") and Javascript(" + VCUtils.version + ") versions do not match.", plugInVersion: plugInVersion, jsVersion: VCUtils.version, type: "METHOD"});
	}
}
