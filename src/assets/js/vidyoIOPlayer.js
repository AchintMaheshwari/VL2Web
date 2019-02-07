var VidyoIOPlayer = VidyoIOPlayer || {};

VidyoIOPlayer = {
    m_token: "",
    init: function(token) {
        //Comment code due to make unwanted connection for Video calling. When its more optimize then we will uncomment it
        
        // console.log("VideoIO token :" + token);
        // this.rendr = $("#renderer");
        // this.contnt = $(".content");
        // this.lastP = GetRendererPosition();
        // this.m_token = token;
        // StartLesson();
    }

};

function StartLesson() {
    // $("#Chat").hide();
    // $(".LessonContainer").show();

    window.setTimeout(function() {
        StartLessonVidyo();
    }, 2000);

    window.setTimeout(function() {
        PositionRenderer('StartLesson 200 ms setTimeout');
    }, 200);
}



var fullScreen = false;
var rendr = null; //$("#renderer");
var contnt = null; // $(".content");
var rendrH = 0;
var lastP = null; // GetRendererPosition();
var recordingToggle = false;
var recordTime = 0;
var vidyoConnector = null;
var recordingCount = 0;

var roomKey = localStorage.getItem('roomKey'); //"3jd-5io-e15"; //'@ViewBag.RoomKey';
//var m_token = "";//"cHJvdmlzaW9uAHVzZXIxQDdkZGY5OS52aWR5by5pbwA2MzY5Nzg1NjI2NwAAMDU1OTNlMDcwYjE0YTgxYmY5ZWJiY2UwMTUzZjExMjQzNzEyNzAzMjBhMjBkOTg3MWVjZDQwODc0NDZmMTk4NjdmMDMyODU0ZDU2NTM0Y2E3ZGNjNDIxOGFjNTE4NDZk"; //$('input[name="__RequestVerificationToken"]').val();
var m_host = 'prod.vidyo.io';
var m_displayName = localStorage.getItem("UserName");
var m_resourceId = roomKey;


/*$(window).on('mouseout', function () {
    console.log('### mouseout');
});

$(window).on('mousein', function () {
    console.log('### mousein');
});*/

$("#openKeysApp").click(function() {
    window.resizeTo(screen.width + 15, parseInt(screen.height * 0.739));

    var executablePath = "";
    var mac = false;
    if (navigator.platform.indexOf('Mac') >= 0) {
        mac = true;
    }
    console.log("check platform type and truth value " + navigator.platform + " " + mac);
    if (mac) {
        var child = require('child_process').exec('open /Applications/VoiceLessons/Keys.app/', function(err, data) {
            if (err) {
                alert("Unable to launch Keys on MAC.");
                return;
            }
        });
    } else {
        executablePath = "C:\\Program Files (x86)\\VoiceLessons\\Keys.exe";
        var child = require('child_process').execFile;

        child(executablePath, {
            cwd: 'C:\\Program Files (x86)\\VoiceLessons\\'
        }, function(err, data) {
            if (err) {
                alert("Unable to launch Keys.");
                return;
            }
        });
    }
});

$("#optionsButtonClose").click(function() {
    ShowRenderer(vidyoConnector);
});

function PositionRenderer(caller) {
    //console.log('PositionRenderer caller = '+caller+ ' date = ' , Date())
    var newP = GetRendererPosition();
    lastP = newP;
    if (lastP.offsetLeft != newP.offsetLeft ||
        lastP.offsetTop != newP.offsetTop ||
        lastP.width != newP.width ||
        lastP.height != newP.height) {

        if (typeof contnt === 'undefined') {
            contnt = $(".content");
            console.log('*** contnt was undefined');
        }

        var contentHeight = contnt.height();
        var newHeight = contentHeight * .6;
        if (newHeight < 378) newHeight = 378;
        newP.height = newHeight;
        rendr.height(0, newHeight).css({ 'height': newHeight + 'px' });
        rendrH = newHeight;
        lastP = newP;
        HideRenderer(vidyoConnector);
        ShowRenderer(vidyoConnector, newP);
    }

    window.setTimeout(function() {
        PositionRenderer('500 ms setTimeout');
    }, 500);
}

function GetRendererPosition() {
    if (typeof rendr === 'undefined' || rendr === null) {
        rendr = $("#renderer");
        console.log('*** rendr was undefined');
    }

    var offset = rendr.offset();
    //console.log("left: " + offset.left + ", top: " + offset.top + ' ~~ offset = ', offset);

    var width = rendr.width();
    var height = rendr.height();
    height = rendrH;
    //console.log("width: " + width + ", height: " + height);

    var position = {
        offsetLeft: offset.left,
        offsetTop: offset.top + 21,
        width: width,
        height: height
    }

    //console.log('*** position = ', position);
    return position;
}

function ToggleRenderer() {

    if ($("#renderer").hasClass("hidden")) {
        console.log('show rendered');
        $("#renderer").removeClass("hidden");
        ShowRenderer(vidyoConnector);
    } else {
        console.log('hide rendered');
        $("#renderer").addClass("hidden");
        HideRenderer(vidyoConnector);
    }
}

function LeaveLesson() {
    if (typeof vidyoConnector !== 'undefined') {
        HideRenderer(vidyoConnector);
        vidyoConnector.Disconnect().then(function() {
            //alert('Disconnect Success');
            console.log("Disconnect Success");
        }).catch(function() {
            alert('Disconnect Failure');
            console.error("Disconnect Failure");
        });
        vidyoConnector.Disable().then(function() {
            //alert('Disconnect Success');
            console.log("Disable Success");
        }).catch(function() {
            alert('Disable Failure');
            console.error("Disable Failure");
        });
    }
}

function EndLesson() {
    console.log("leaving lesson");
    console.log("Recording toggle truth value: " + recordingToggle);
    if (typeof vidyoConnector !== 'undefined') {
        if (recordingToggle) {
            console.log("Recording toggle was on while exiting lesson");
            recordTime = 0;
            recordingToggle = !recordingToggle;
            $("#recordButton i").removeClass("pulse");
            ToggleRecording(recordingToggle, roomKey, recordingCount);
            //alert("Recording toggle is on");
        }
        HideRenderer(vidyoConnector);
        vidyoConnector.Disconnect().then(function() {
            //alert('Disconnect Success');
            console.log("Disconnect Success");
        }).catch(function() {
            alert('Disconnect Failure');
            console.error("Disconnect Failure");
        });
        vidyoConnector.Disable().then(function() {
            console.log("Disable Success");
        }).catch(function() {
            alert('Disable Failure');
            console.error("Disable Failure");
        });
        //vidyoConnector.Destruct();
    } else {
        console.log('*** vidyoConnector is undefined');
    }
}

function ShowRenderer(vidyoConnector) {
    var newP = GetRendererPosition();
    console.log('**!!** newP = ', newP);
    ShowRenderer(vidyoConnector, newP);
}

function ShowRenderer(vidyoConnector, position) {
    if (typeof position === 'undefined') {
        position = GetRendererPosition();
    }
    var rndr = document.getElementById('renderer');
    console.log('*** ShowRenderer = ', position);
    vidyoConnector.ShowViewAt("renderer", position.offsetLeft, position.offsetTop, position.width, position.height);
}

function HideRenderer(vidyoConnector) {
    var rndr = document.getElementById('renderer');
    vidyoConnector.HideView("renderer");
}

// Run StartVidyoConnector when the VidyoClient is successfully loaded
function StartVidyoConnector(VC, webrtc) {

    //var vidyoConnector;
    var cameras = {};
    var microphones = {};
    var speakers = {};
    var cameraPrivacy = false;
    var microphonePrivacy = false;
    var configParams = {};


    $("#options").removeClass("hidden");
    $("#optionsVisibilityButton").removeClass("hidden");
    $("#renderer").removeClass("hidden");

    window.onresize = function() {
        HideRenderer(vidyoConnector);
        ShowRenderer(vidyoConnector);
    };

    window.onbeforeunload = function() {
        HideRenderer(vidyoConnector);
    }

    window.onmove = function() {
        HideRenderer(vidyoConnector);
        ShowRenderer(vidyoConnector);
    }

    VC.CreateVidyoConnector({
        viewId: "renderer", // Div ID where the composited video will be rendered, see VidyoConnector.html;
        viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default", // Visual style of the composited renderer
        remoteParticipants: 16, // Maximum number of participants to render
        logFileFilter: "warning info@VidyoClient info@VidyoConnector",
        logFileName: "",
        userData: ""
    }).then(function(vc) {
        vidyoConnector = vc;
        var position = {
            offsetLeft: 0,
            offsetTop: 0,
            width: 0,
            height: 0
        }
        console.log('**!!** CreateVidyoConnector ShowRenderer(vidyoConnector)');
        ShowRenderer(vidyoConnector, position);
        parseUrlParameters(configParams);
        registerDeviceListeners(vidyoConnector, cameras, microphones, speakers);
        handleDeviceChange(vidyoConnector, cameras, microphones, speakers);
        handleParticipantChange(vidyoConnector);
        handleSharing(vidyoConnector, webrtc);

        // Populate the connectionStatus with the client version
        vidyoConnector.GetVersion().then(function(version) {
            $("#clientVersion").html("v " + version);
        }).catch(function() {
            console.error("GetVersion failed");
        });


        // If enableDebug is configured then enable debugging
        if (configParams.enableDebug === "1") {
            vidyoConnector.EnableDebug({ port: 7776, logFilter: "warning info@VidyoClient info@VidyoConnector" }).then(function() {
                console.log("EnableDebug success");
            }).catch(function() {
                console.error("EnableDebug failed");
            });
        }

        //always autojoin
        joinLeave();

        // Join the conference if the autoJoin URL parameter was enabled
        //if (configParams.autoJoin === "1") {
        //    joinLeave();
        //} else {
        //    // Handle the join in the toolbar button being clicked by the end user.
        //    $("#joinLeaveButton").one("click", joinLeave);
        //}
    }).catch(function(err) {
        console.error("CreateVidyoConnector Failed " + err);
    });
    // Handle the record function to toggle recording
    $("#recordButton").click(function() {
        var temp = new Date() / 1000 | 0;
        if (recordingToggle) {
            if (temp - recordTime > 30) {
                document.getElementById("rec").style.display = "none";
                $("#recordingStatus").html();
                recordTime = temp;
                recordingToggle = !recordingToggle;
                $("#recordButton i").removeClass("pulse");
                console.log('BEFORE recordingCount = ', recordingCount);
                ToggleRecording(recordingToggle, roomKey, recordingCount);
                console.log('AFTER recordingCount = ', recordingCount);

                console.log('recording toggle = ', recordingToggle);
            } else {
                alert("Recording should last for at least 30 seconds");
            }
        } else {
            if (temp - recordTime > 15) {
                document.getElementById("rec").style.display = "block";
                $("#recordingStatus").html("Recording");
                recordTime = new Date() / 1000 | 0;
                recordingToggle = !recordingToggle;
                $("#recordButton i").addClass("pulse");
                console.log('BEFORE recordingCount = ', recordingCount);
                ToggleRecording(recordingToggle, roomKey, recordingCount);
                console.log('AFTER recordingCount = ', recordingCount);

                console.log('recording toggle = ', recordingToggle);
            } else {
                alert("Please keep 15 seconds in between pressing record.");
            }
        }

    });
    // Handle the camera privacy button, toggle between show and hide.
    $("#cameraButton").click(function() {
        // CameraPrivacy button clicked
        cameraPrivacy = !cameraPrivacy;
        vidyoConnector.SetCameraPrivacy({
            privacy: cameraPrivacy
        }).then(function() {
            if (cameraPrivacy) {
                $("#cameraButton").addClass("cameraOff").removeClass("cameraOn");
            } else {
                $("#cameraButton").addClass("cameraOn").removeClass("cameraOff");
            }
            console.log("SetCameraPrivacy Success");
        }).catch(function() {
            console.error("SetCameraPrivacy Failed");
        });
    });

    $("#fullScreenButtonTeacher").click(function() {
        // FullScreen button clicked

        var position = {
            offsetLeft: 0,
            offsetTop: 0,
            width: $(window).width(),
            height: $(window).height() - 60
        };
        document.getElementById("fullScreenButtonClose").style.display = "block";
        //console.log("check")
        //console.log(document.getElementById("fullScreenButtonClose").style.display);
        ShowRenderer(vidyoConnector, position);

    });

    //$("#fullScreenButtonStudent").click(function () {
    //    // FullScreen button clicked
    //    var elem = document.getElementById("vidyoConnector");
    //    if (elem.requestFullscreen)
    //        elem.requestFullscreen();
    //    else if (elem.webkitRequestFullscreen)
    //        elem.webkitRequestFullscreen();

    //    document.getElementById("fullScreenButtonClose").style.display = "block";
    //    //console.log("check")
    //    //console.log(document.getElementById("fullScreenButtonClose").style.display);
    //    //ShowRenderer(vidyoConnector, position);

    //});

    $("#fullScreenButtonClose").click(function() {
        // FullScreen button clicked

        document.getElementById("fullScreenButtonClose").style.display = "none";
        //console.log("check");
        //console.log(document.getElementById("fullScreenButtonClose").style.display);
        ShowRenderer(vidyoConnector);


    });
    // Handle the microphone mute button, toggle between mute and unmute audio.
    $("#microphoneButton").click(function() {
        // MicrophonePrivacy button clicked
        microphonePrivacy = !microphonePrivacy;
        vidyoConnector.SetMicrophonePrivacy({
            privacy: microphonePrivacy
        }).then(function() {
            if (microphonePrivacy) {
                $("#microphoneButton").addClass("microphoneOff").removeClass("microphoneOn");
            } else {
                $("#microphoneButton").addClass("microphoneOn").removeClass("microphoneOff");
            }
            console.log("SetMicrophonePrivacy Success");
        }).catch(function() {
            console.error("SetMicrophonePrivacy Failed");
        });
    });

    // Handle the options visibility button, toggle between show and hide options.
    $("#optionsVisibilityButton").click(function() {
        // OptionsVisibility button clicked
        if ($("#optionsVisibilityButton").hasClass("hideOptions")) {
            $("#options").addClass("hidden");
            $("#optionsVisibilityButton").addClass("showOptions").removeClass("hideOptions");
            $("#renderer").addClass("rendererFullScreen").removeClass("rendererWithOptions");
        } else {
            $("#options").removeClass("hidden");
            $("#optionsVisibilityButton").addClass("hideOptions").removeClass("showOptions");
            $("#renderer").removeClass("rendererFullScreen").addClass("rendererWithOptions");
        }
    });

    $("#optionsButton").click(function() {
        HideRenderer(vidyoConnector);
    });

    $("#shareScreenButton").click(function() {
        HideRenderer(vidyoConnector);
    });

    $("#shareScreenButtonClose").click(function() {
        ShowRenderer(vidyoConnector);
    });

    function joinLeave() {
        // join or leave dependent on the joinLeaveButton, whether it
        // contains the class callStart of callEnd.
        if ($("#joinLeaveButton").hasClass("callStart")) {
            $("#connectionStatus").html("Connecting...");
            $("#joinLeaveButton").removeClass("callStart").addClass("callEnd");
            $('#joinLeaveButton').prop('title', 'Leave Conference');
            connectToConference(vidyoConnector);
        } else {
            $("#connectionStatus").html("Disconnecting...");
            vidyoConnector.Disconnect().then(function() {
                console.log("Disconnect Success");
            }).catch(function() {
                console.error("Disconnect Failure");
            });
        }
        $("#joinLeaveButton").one("click", joinLeave);
    }

}

function ToggleRecording(status, roomKey, rc) {
    console.log('post ToggleRecording ', status, roomKey, rc);
    $.post("/Room/ToggleRecording", {
            Status: status,
            RoomKey: roomKey,
            RecordingCount: rc,
            __RequestVerificationToken: VidyoIOPlayer.m_token
        },
        function(response) {
            console.log('recordingCount = ', recordingCount);
            console.log('success response = ', response);
            recordingCount = response.RecordingCount;
        });
}

function GetMaxRecordingCountByRoomKey(roomKey) {
    console.log('get GetMaxRecordingCountByRoomKey =', roomKey);
    $.get("/Room/GetMaxRecordingCountByRoomKey", {
            RoomKey: roomKey,
            __RequestVerificationToken: VidyoIOPlayer.m_token
        },
        function(response) {
            console.log('success response = ', response);
            console.log('recordingCount = ', recordingCount);
            recordingCount = response.count;
            console.log('recordingCount = ', recordingCount);
        });
}

function registerDeviceListeners(vidyoConnector, cameras, microphones, speakers) {
    // Map the "None" option (whose value is 0) in the camera, microphone, and speaker drop-down menus to null since
    // a null argument to SelectLocalCamera, SelectLocalMicrophone, and SelectLocalSpeaker releases the resource.
    cameras[0] = null;
    microphones[0] = null;
    speakers[0] = null;

    // Handle appearance and disappearance of camera devices in the system
    vidyoConnector.RegisterLocalCameraEventListener({
        onAdded: function(localCamera) {
            // New camera is available
            $("#cameras").append("<option value='" + window.btoa(localCamera.id) + "'>" + localCamera.name + "</option>");
            cameras[window.btoa(localCamera.id)] = localCamera;
        },
        onRemoved: function(localCamera) {
            // Existing camera became unavailable
            $("#cameras option[value='" + window.btoa(localCamera.id) + "']").remove();
            delete cameras[window.btoa(localCamera.id)];
        },
        onSelected: function(localCamera) {
            // Camera was selected/unselected by you or automatically
            if (localCamera) {
                $("#cameras option[value='" + window.btoa(localCamera.id) + "']").prop('selected', true);
            }
        },
        onStateUpdated: function(localCamera, state) {
            // Camera state was updated
        }
    }).then(function() {
        console.log("RegisterLocalCameraEventListener Success");
    }).catch(function() {
        console.error("RegisterLocalCameraEventListener Failed");
    });

    // Handle appearance and disappearance of microphone devices in the system
    vidyoConnector.RegisterLocalMicrophoneEventListener({
        onAdded: function(localMicrophone) {
            // New microphone is available
            $("#microphones").append("<option value='" + window.btoa(localMicrophone.id) + "'>" + localMicrophone.name + "</option>");
            microphones[window.btoa(localMicrophone.id)] = localMicrophone;
        },
        onRemoved: function(localMicrophone) {
            // Existing microphone became unavailable
            $("#microphones option[value='" + window.btoa(localMicrophone.id) + "']").remove();
            delete microphones[window.btoa(localMicrophone.id)];
        },
        onSelected: function(localMicrophone) {
            // Microphone was selected/unselected by you or automatically
            if (localMicrophone)
                $("#microphones option[value='" + window.btoa(localMicrophone.id) + "']").prop('selected', true);
        },
        onStateUpdated: function(localMicrophone, state) {
            // Microphone state was updated
        }
    }).then(function() {
        console.log("RegisterLocalMicrophoneEventListener Success");
    }).catch(function() {
        console.error("RegisterLocalMicrophoneEventListener Failed");
    });

    // Handle appearance and disappearance of speaker devices in the system
    vidyoConnector.RegisterLocalSpeakerEventListener({
        onAdded: function(localSpeaker) {
            // New speaker is available
            $("#speakers").append("<option value='" + window.btoa(localSpeaker.id) + "'>" + localSpeaker.name + "</option>");
            speakers[window.btoa(localSpeaker.id)] = localSpeaker;
        },
        onRemoved: function(localSpeaker) {
            // Existing speaker became unavailable
            $("#speakers option[value='" + window.btoa(localSpeaker.id) + "']").remove();
            delete speakers[window.btoa(localSpeaker.id)];
        },
        onSelected: function(localSpeaker) {
            // Speaker was selected/unselected by you or automatically
            if (localSpeaker)
                $("#speakers option[value='" + window.btoa(localSpeaker.id) + "']").prop('selected', true);
        },
        onStateUpdated: function(localSpeaker, state) {
            // Speaker state was updated
        }
    }).then(function() {
        console.log("RegisterLocalSpeakerEventListener Success");
    }).catch(function() {
        console.error("RegisterLocalSpeakerEventListener Failed");
    });
}

function handleDeviceChange(vidyoConnector, cameras, microphones, speakers) {
    // Hook up camera selector functions for each of the available cameras
    $("#cameras").change(function() {
        // Camera selected from the drop-down menu
        $("#cameras option:selected").each(function() {
            camera = cameras[$(this).val()];
            vidyoConnector.SelectLocalCamera({
                localCamera: camera
            }).then(function() {
                console.log("SelectCamera Success");
            }).catch(function() {
                console.error("SelectCamera Failed");
            });
        });
    });

    // Hook up microphone selector functions for each of the available microphones
    $("#microphones").change(function() {
        // Microphone selected from the drop-down menu
        $("#microphones option:selected").each(function() {
            microphone = microphones[$(this).val()];
            vidyoConnector.SelectLocalMicrophone({
                localMicrophone: microphone
            }).then(function() {
                console.log("SelectMicrophone Success");
            }).catch(function() {
                console.error("SelectMicrophone Failed");
            });
        });
    });

    // Hook up speaker selector functions for each of the available speakers
    $("#speakers").change(function() {
        // Speaker selected from the drop-down menu
        $("#speakers option:selected").each(function() {
            speaker = speakers[$(this).val()];
            vidyoConnector.SelectLocalSpeaker({
                localSpeaker: speaker
            }).then(function() {
                console.log("SelectSpeaker Success");
            }).catch(function() {
                console.error("SelectSpeaker Failed");
            });
        });
    });
}

function handleSharing(vidyoConnector, webrtc) {
    var monitorShares = {};
    var windowShares = {};
    var isSharingWindow = false; // Flag indicating whether a window is currently being shared
    var webrtcMode = (webrtc === "true"); // Whether the app is running in plugin or webrtc mode

    // The monitorShares & windowShares associative arrays hold a handle to each window/monitor that are available for sharing.
    // The element with key "0" contains a value of null, which is used to stop sharing.
    monitorShares[0] = null;
    windowShares[0] = null;

    // Check if app is running in plugin or webrtc mode
    if (webrtcMode === false) {
        // In plugin mode, start window and monitor sharing
        StartWindowShare();
        StartMonitorShare();
    } else {
        // In webrtc mode, start window sharing only.
        // StartWindowShare needs to be called each time a new share is initiated
        // so perform this action when the "Window Share" drop-down list is clicked.
        $("#windowShares").click(function() {
            console.log("*** Window Share drop-down clicked. isSharingWindow = " + isSharingWindow);

            // Initiate the share selection process only if not already sharing
            if (isSharingWindow === false) {
                // Re-initialize the windowShares array
                windowShares = {};
                windowShares[0] = null;

                // Clear all of the drop-down items other than the first ("None"), which is used to stop sharing
                $("#windowShares").find('option').not(':first').remove();

                // Start window sharing (in WebRTC mode, this includes monitors)
                StartWindowShare();
            }
        });
    }

    function StartWindowShare() {
        // Register for window share status updates, which operates differently in plugin vs webrtc:
        //    plugin: onAdded and onRemoved callbacks are received for each available window
        //    webrtc: a popup is displayed (an extension to Firefox/Chrome) which allows the user to
        //            select a share; once selected, that share will trigger an onAdded event
        vidyoConnector.RegisterLocalWindowShareEventListener({
            onAdded: function(localWindowShare) {
                // In webrtc mode, select the share which triggered this callback
                if (webrtcMode) {
                    vidyoConnector.SelectLocalWindowShare({
                        localWindowShare: localWindowShare
                    }).then(function() {
                        console.log("SelectLocalWindowShare Success");
                    }).catch(function() {
                        console.error("SelectLocalWindowShare Failed");
                    });
                }

                // New share is available so add it to the windowShares array and the drop-down list
                if (localWindowShare.name != "") {
                    var shareVal;
                    if (webrtcMode) {
                        shareVal = "Selected Share";
                    } else {
                        shareVal = localWindowShare.applicationName + " : " + localWindowShare.name;
                    }
                    $("#windowShares").append("<option value='" + window.btoa(localWindowShare.id) + "'>" + shareVal + "</option>");
                    windowShares[window.btoa(localWindowShare.id)] = localWindowShare;
                    console.log("Window share added, name : " + localWindowShare.name + " | id : " + window.btoa(localWindowShare.id));
                }
            },
            onRemoved: function(localWindowShare) {
                // Existing share became unavailable
                $("#windowShares option[value='" + window.btoa(localWindowShare.id) + "']").remove();
                delete windowShares[window.btoa(localWindowShare.id)];
            },
            onSelected: function(localWindowShare) {
                // Share was selected/unselected by you or automatically
                if (localWindowShare) {
                    $("#windowShares option[value='" + window.btoa(localWindowShare.id) + "']").prop('selected', true);
                    isSharingWindow = true;
                    console.log("Window share selected : " + localWindowShare.name);
                } else {
                    isSharingWindow = false;
                }
            },
            onStateUpdated: function(localWindowShare, state) {
                // localWindowShare state was updated
            }
        }).then(function() {
            console.log("RegisterLocalWindowShareEventListener Success");
        }).catch(function() {
            console.error("RegisterLocalWindowShareEventListener Failed");
        });
    }

    function StartMonitorShare() {
        // Register for monitor share status updates
        vidyoConnector.RegisterLocalMonitorEventListener({
            onAdded: function(localMonitorShare) {
                // New share is available so add it to the monitorShares array and the drop-down list
                if (localMonitorShare.name != "") {
                    $("#monitorShares").append("<option value='" + window.btoa(localMonitorShare.id) + "'>" + localMonitorShare.name + "</option>");
                    monitorShares[window.btoa(localMonitorShare.id)] = localMonitorShare;
                    console.log("Monitor share added, name : " + localMonitorShare.name + " | id : " + window.btoa(localMonitorShare.id));
                }
            },
            onRemoved: function(localMonitorShare) {
                // Existing share became unavailable
                $("#monitorShares option[value='" + window.btoa(localMonitorShare.id) + "']").remove();
                delete monitorShares[window.btoa(localMonitorShare.id)];
            },
            onSelected: function(localMonitorShare) {
                // Share was selected/unselected by you or automatically
                if (localMonitorShare) {
                    $("#monitorShares option[value='" + window.btoa(localMonitorShare.id) + "']").prop('selected', true);
                    console.log("Monitor share selected : " + localMonitorShare.name);
                }
            },
            onStateUpdated: function(localMonitorShare, state) {
                // localMonitorShare state was updated
            }
        }).then(function() {
            console.log("RegisterLocalMonitorShareEventListener Success");
        }).catch(function() {
            console.error("RegisterLocalMonitorShareEventListener Failed");
        });
    }

    // A monitor was selected from the "Monitor Share" drop-down list (plugin mode only).
    $("#monitorShares").change(function() {
        console.log("*** Monitor shares change called");

        // Find the share selected from the drop-down list
        $("#monitorShares option:selected").each(function() {
            share = monitorShares[$(this).val()];

            // Select the local monitor
            vidyoConnector.SelectLocalMonitor({
                localMonitor: share
            }).then(function() {
                console.log("SelectLocalMonitor Success");
            }).catch(function() {
                console.error("SelectLocalMonitor Failed");
            });
        });
    });

    // A window was selected from the "Window Share" drop-down list.
    // Note: in webrtc mode, this is only called for the "None" option (to stop the share) since
    //       the share is selected in the onAdded callback of the LocalWindowShareEventListener.
    $("#windowShares").change(function() {
        console.log("*** Window shares change called");

        // Find the share selected from the drop-down list
        $("#windowShares option:selected").each(function() {
            share = windowShares[$(this).val()];

            // Select the local window share
            vidyoConnector.SelectLocalWindowShare({
                localWindowShare: share
            }).then(function() {
                console.log("SelectLocalWindowShare Success");
            }).catch(function() {
                console.error("SelectLocalWindowShare Failed");
            });
        });
    });
}

function getParticipantName(participant, cb) {
    if (!participant) {
        cb("Undefined");
        return;
    }

    if (participant.name) {
        cb(participant.name);
        return;
    }

    participant.GetName().then(function(name) {
        cb(name);
    }).catch(function() {
        cb("GetNameFailed");
    });
}

function handleParticipantChange(vidyoConnector) {
    vidyoConnector.RegisterParticipantEventListener({
        onJoined: function(participant) {
            getParticipantName(participant, function(name) {
                if (name.indexOf('Recorder') == -1) { // don't show recorder / streamer
                    $("#participantStatus").html("" + name + " Joined");
                }
            });
        },
        onLeft: function(participant) {
            getParticipantName(participant, function(name) {
                if (name.indexOf('Recorder') == -1) { // don't show recorder / streamer
                    $("#participantStatus").html("" + name + " Left");
                }
            });
        },
        onDynamicChanged: function(participants, cameras) {
            // Order of participants changed
        },
        onLoudestChanged: function(participant, audioOnly) {
            getParticipantName(participant, function(name) {
                $("#participantStatus").html("" + name + " Speaking");
            });
        }
    }).then(function() {
        console.log("RegisterParticipantEventListener Success");
    }).catch(function() {
        console.err("RegisterParticipantEventListener Failed");
    });
}

function parseUrlParameters(configParams) {
    // Fill in the form parameters from the URI
    var host = getUrlParameterByName("host");
    if (host)
        $("#host").val(host);
    var token = getUrlParameterByName("token");
    if (token)
        $("#token").val(token);
    var displayName = getUrlParameterByName("displayName");
    if (displayName)
        $("#displayName").val(displayName);
    var resourceId = getUrlParameterByName("resourceId");
    if (resourceId)
        $("#resourceId").val(resourceId);
    configParams.autoJoin = getUrlParameterByName("autoJoin");
    configParams.enableDebug = getUrlParameterByName("enableDebug");
    var hideConfig = getUrlParameterByName("hideConfig");

    //// If the parameters are passed in the URI, do not display options dialog
    //if (host && token && displayName && resourceId) {
    //    $("#optionsParameters").addClass("hiddenPermanent");
    //}

    //if (hideConfig == "1") {
    //    $("#options").addClass("hiddenPermanent");
    //    $("#optionsVisibilityButton").addClass("hiddenPermanent");
    //    $("#renderer").addClass("rendererFullScreenPermanent");
    //}

    return;
}

// Attempt to connect to the conference
// We will also handle connection failures
// and network or server-initiated disconnects.
function connectToConference(vidyoConnector) {

    // Abort the Connect call if resourceId is invalid. It cannot contain empty spaces or "@@".
    //if ($("#resourceId").val().indexOf(" ") != -1 || $("#resourceId").val().indexOf('@@') != -1) {
    //if ($("#resourceId").val().indexOf(" ") != -1) {
    if (this.m_resourceId == "") {
        console.error("Connect call aborted due to invalid Resource ID");
        connectorDisconnected(rendererSlots, remoteCameras, "Disconnected", "");
        $("#error").html("<h3>Failed due to invalid Resource ID" + "</h3>");
        return;
    }

    // Clear messages
    $("#error").html("");
    $("#message").html("<h3 class='blink'>CONNECTING...</h3>");

    vidyoConnector.Connect({
        // Take input from options form
        host: m_host,
        token: VidyoIOPlayer.m_token,
        displayName: m_displayName,
        resourceId: m_resourceId,

        // Define handlers for connection events.
        onSuccess: function() {
            // Connected
            console.log("vidyoConnector.Connect : onSuccess callback received");
            $("#connectionStatus").html("Connected");
            $("#options").addClass("hidden");
            $("#optionsVisibilityButton").addClass("showOptions").removeClass("hideOptions");
            $("#renderer").addClass("rendererFullScreen").removeClass("rendererWithOptions");
            ShowRenderer(vidyoConnector);
            $("#message").html("");
        },
        onFailure: function(reason) {
            // Failed
            console.error("vidyoConnector.Connect : onFailure callback received");
            connectorDisconnected("Failed", "");
            $("#error").html("<h3>Call Failed: " + reason + "</h3>");
        },
        onDisconnected: function(reason) {
            // Disconnected
            console.log("vidyoConnector.Connect : onDisconnected callback received");
            connectorDisconnected("Disconnected", "Call Disconnected: " + reason);

            $("#options").removeClass("hidden");
            $("#optionsVisibilityButton").addClass("hideOptions").removeClass("showOptions");
            $("#renderer").removeClass("rendererFullScreen").addClass("rendererWithOptions");
            ShowRenderer(vidyoConnector);
        }
    }).then(function(status) {
        if (status) {
            console.log("Connect Success");
        } else {
            console.error("Connect Failed");
            connectorDisconnected("Failed", "");
            $("#error").html("<h3>Call Failed" + "</h3>");
        }
    }).catch(function() {
        console.error("Connect Failed");
        connectorDisconnected("Failed", "");
        $("#error").html("<h3>Call Failed" + "</h3>");
    });
}

// Connector either fails to connect or a disconnect completed, update UI elements
function connectorDisconnected(connectionStatus, message) {
    $("#connectionStatus").html(connectionStatus);
    $("#message").html(message);
    $("#participantStatus").html("");
    $("#joinLeaveButton").removeClass("callEnd").addClass("callStart");
    $('#joinLeaveButton').prop('title', 'Join Conference');
}

// Extract the desired parameter from the browser's location bar
function getUrlParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}



function onVidyoClientLoaded(status) {

    console.log("Status: " + status.state + "Description: " + status.description);
    switch (status.state) {
        case "READY": // The library is operating normally
            $("#connectionStatus").html("Ready to Connect");
            $("#helper").addClass("hidden");
            // After the VidyoClient is successfully initialized a global VC object will become available
            // All of the VidyoConnector gui and logic is implemented in VidyoConnector.js
            StartVidyoConnector(VC, VCUtils.params.webrtc);
            break;
        case "RETRYING": // The library operating is temporarily paused
            $("#connectionStatus").html("Temporarily unavailable retrying in " + status.nextTimeout / 1000 + " seconds");
            break;
        case "FAILED": // The library operating has stopped
            ShowFailed(status);
            $("#connectionStatus").html("Failed: " + status.description);
            break;
        case "FAILEDVERSION": // The library operating has stopped
            UpdateHelperPaths(status);
            ShowFailedVersion(status);
            $("#connectionStatus").html("Failed: " + status.description);
            break;
        case "NOTAVAILABLE": // The library is not available
            UpdateHelperPaths(status);
            $("#connectionStatus").html(status.description);
            break;
    }
    return true; // Return true to reload the plugins if not available
}

function UpdateHelperPaths(status) {
    $("#helperPlugInDownload").attr("href", status.downloadPathPlugIn);
    $("#helperAppDownload").attr("href", status.downloadPathApp);
}

function ShowFailed(status) {
    var helperText = '';
    // Display the error
    helperText += '<h2>An error occurred, please reload</h2>';
    helperText += '<p>' + status.description + '</p>';

    $("#helperText").html(helperText);
    $("#failedText").html(helperText);
    $("#failed").removeClass("hidden");
}

function ShowFailedVersion(status) {
    var helperText = '';
    // Display the error
    helperText += '<h4>Please Download a new plugIn and restart the browser</h4>';
    helperText += '<p>' + status.description + '</p>';

    $("#helperText").html(helperText);
}

function loadVidyoClientLibrary(webrtc, plugin) {
    // If webrtc, then set webrtcLogLevel
    var webrtcLogLevel = "";
    if (webrtc) {
        // Set the WebRTC log level to either: 'info' (default), 'error', or 'none'
        webrtcLogLevel = '&webrtcLogLevel=info';
    }

    //We need to ensure we're loading the VidyoClient library and listening for the callback.
    var script = document.createElement('script');
    script.type = 'text/javascript';
    //script.src = 'VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded&webrtc=' + webrtc + '&plugin=' + plugin + webrtcLogLevel;
    //script.src = 'https://static.vidyo.io/4.1.15.7/javascript/VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded&webrtc=' + webrtc + '&plugin=' + plugin + webrtcLogLevel;
    script.src = 'https://static.vidyo.io/4.1.22.9/javascript/VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded&webrtc=' + webrtc + '&plugin=' + plugin + webrtcLogLevel;

    //script.src = 'https://vlweb-vlwebdevmobile1.azurewebsites.net/Scripts/vidyo/javascript/VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded&webrtc=' + webrtc + '&plugin=' + plugin + webrtcLogLevel;
    //script.src = 'https://beta.voicelessons.com/javascript/VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded&webrtc=' + webrtc + '&plugin=' + plugin + webrtcLogLevel;
    //script.src = '/assets/js/VidyoClient/VidyoClient.js?onload=onVidyoClientLoaded&webrtc=' + webrtc + '&plugin=' + plugin + webrtcLogLevel;

    document.getElementsByTagName('head')[0].appendChild(script);
}

function joinViaBrowser() {
    $("#helperText").html("Loading...");
    $("#helperPicker").addClass("hidden");
    $("#monitorShareParagraph").addClass("hidden");
    loadVidyoClientLibrary(true, false);
}

function joinViaPlugIn() {
    $("#helperText").html("Don't have the PlugIn?");
    $("#helperPicker").addClass("hidden");
    $("#helperPlugIn").removeClass("hidden");
    loadVidyoClientLibrary(false, true);
}

function joinViaElectron() {
    $("#helperText").html("Electron...");
    $("#helperPicker").addClass("hidden");
    loadVidyoClientLibrary(false, true);
}

function joinViaApp() {
    $("#helperText").html("Don't have the app?");
    $("#helperPicker").addClass("hidden");
    $("#helperApp").removeClass("hidden");
    var protocolHandlerLink = 'vidyoconnector://' + window.location.search;
    /* launch */
    $("#helperAppLoader").attr('src', protocolHandlerLink);
    loadVidyoClientLibrary(false, false);
}

function joinViaOtherApp() {
    $("#helperText").html("Don't have the app?");
    $("#helperPicker").addClass("hidden");
    $("#helperOtherApp").removeClass("hidden");
    var protocolHandlerLink = 'vidyoconnector://' + window.location.search;
    /* launch */
    $("#helperOtherAppLoader").attr('src', protocolHandlerLink);
    loadVidyoClientLibrary(false, false);
}

function loadHelperOptions() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Opera 8.0+
    var isOpera = (userAgent.indexOf("Opera") || userAgent.indexOf('OPR')) != -1;
    // Firefox
    var isFirefox = userAgent.indexOf("Firefox") != -1;
    // Chrome 1+
    var isChrome = userAgent.indexOf("Chrome") != -1;
    // Safari
    var isSafari = !isChrome && userAgent.indexOf("Safari") != -1;
    // AppleWebKit
    var isAppleWebKit = !isSafari && !isChrome && userAgent.indexOf("AppleWebKit") != -1;
    // Internet Explorer 6-11
    var isIE = (userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true);
    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;
    // Check if Mac
    var isMac = navigator.platform.indexOf('Mac') > -1;
    // Check if Windows
    var isWin = navigator.platform.indexOf('Win') > -1;
    // Check if Linux
    var isLinux = navigator.platform.indexOf('Linux') > -1;
    // Check if Android
    var isAndroid = userAgent.indexOf("android") > -1;

    if (!isMac && !isWin && !isLinux) {
        /* Mobile App*/
        if (isAndroid) {
            $("#joinViaApp").removeClass("hidden");
        } else {
            $("#joinViaOtherApp").removeClass("hidden");
        }
        if (isChrome) {
            /* Supports WebRTC */
            $("#joinViaBrowser").removeClass("hidden");
        }
    } else {
        /* Desktop App */
        $("#joinViaApp").removeClass("hidden");

        if (isChrome || isFirefox) {
            /* Supports WebRTC */
            $("#joinViaBrowser").removeClass("hidden");
        }
        if (isSafari || isFirefox || (isAppleWebKit && isMac) || (isIE && !isEdge)) {
            /* Supports Plugins */
            $("#joinViaPlugIn").removeClass("hidden");
        }
    }
}



// $(function () {

function StartLessonVidyo() {
    console.log('*** navigator.userAgent = ', navigator.userAgent);

    var connectorType = getUrlParameterByName("connectorType");
    //var isElectron = navigator.userAgent.indexOf('Electron') > 0;
    var isElectron = (typeof process === 'object') && process.versions && (process.versions.electron !== undefined);

    console.log('*** isElectron = ', isElectron);
    console.log('*** connectorType = ', connectorType);

    if (connectorType == "app") {
        joinViaApp();
        console.log('*** joinViaApp');
    } else if (connectorType == "browser") {
        joinViaBrowser();
        console.log('*** joinViaBrowser');
    } else if (connectorType == "plugin") {
        joinViaPlugIn();
        console.log('*** joinViaPlugIn');
    } else if (connectorType == "other") {
        joinViaOtherApp();
        console.log('*** joinViaOtherApp');
    } else {
        if (isElectron) {
            joinViaElectron();
            console.log('*** joinViaElectron');
        } else {
            loadHelperOptions();
            console.log('*** loadHelperOptions');
            joinViaBrowser();
            console.log('*** joinViaBrowser');
        }
    }

    //loadHelperOptions();
    //joinViaBrowser();
    window.setTimeout(function() {
        var preview = $("video").siblings(".label").css("display", "none").hide();
    }, 5000);
    //});

}

// var token = $('input[name="__RequestVerificationToken"]').val();
// var user = '@ViewBag.Local';
// var userName = '@ViewBag.LocalName';
// var userFirstName = '@ViewBag.LocalFirstName';
// var inviteTo = '@ViewBag.Remote';
// var inviteToName = '@ViewBag.RemoteName';
// var usertype = '@ViewBag.UserType';
// var lessonGuid = '@ViewBag.LessonGuid';
// var lessonId = '@ViewBag.LessonId';
// var keyboardId = '@ViewBag.KeyboardId';
// var roomKey = '@ViewBag.RoomKey';