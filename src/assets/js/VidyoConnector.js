// // Run StartVidyoConnector when the VidyoClient is successfully loaded
// function StartVidyoConnector(VC) {
//     var vidyoConnector;
//     var cameras = {};
//     var microphones = {};
//     var speakers = {};
//     var cameraPrivacy = false;
//     var microphonePrivacy = false;
//     var callState = "IDLE"

//     VC.CreateVidyoConnector({
//         viewId: "renderer", // Div ID where the composited video will be rendered, see VidyoConnectorSample.html
//         viewStyle: "VIDYO_CONNECTORVIEWSTYLE_Default", // Visual style of the composited renderer
//         remoteParticipants: 16,     // Maximum number of participants
//         logFileFilter: "warning all@VidyoConnector info@VidyoClient",
//     }).then(function(vc) {
//         vidyoConnector = vc;
//         var autoJoin = parseUrlParameters();
//         registerDeviceListeners(vidyoConnector, cameras, microphones, speakers);
//         handleDeviceChange(vidyoConnector, cameras, microphones, speakers);

//         // Join the conference if the autoJoin URL parameter was enabled
//         if (autoJoin) {
//           join();
//         } else {
//           // Handle the join in the toolbar button being clicked by the end user.
//           $("#joinLeaveButton").one("click", join);
//         }
//     }).catch(function() {
//         console.error("CreateVidyoConnector Failed");
//     });

//     // Handle the camera privacy button, toggle between show and hide.
//     $("#cameraButton").click(function() {
//         // CameraPrivacy button clicked
//         cameraPrivacy = !cameraPrivacy;
//         vidyoConnector.SetCameraPrivacy({
//             privacy: cameraPrivacy,
//         }).then(function() {
//             if (cameraPrivacy) {
//                 $("#cameraButton").addClass("cameraOff").removeClass("cameraOn");
//             } else {
//                 $("#cameraButton").addClass("cameraOn").removeClass("cameraOff");
//             }
//             console.log("SetCameraPrivacy Success");
//         }).catch(function() {
//             console.error("SetCameraPrivacy Failed");
//         });
//     });

//     // Handle the microphone mute button, toggle between mute and unmute audio.
//     $("#microphoneButton").click(function() {
//         // MicrophonePrivacy button clicked
//         microphonePrivacy = !microphonePrivacy;
//         vidyoConnector.SetMicrophonePrivacy({
//             privacy: microphonePrivacy
//         }).then(function() {
//             if (microphonePrivacy) {
//                 $("#microphoneButton").addClass("microphoneOff").removeClass("microphoneOn");
//             } else {
//                 $("#microphoneButton").addClass("microphoneOn").removeClass("microphoneOff");
//             }
//             console.log("SetMicrophonePrivacy Success");
//         }).catch(function() {
//             console.error("SetMicrophonePrivacy Failed");
//         });
//     });

//     function join() {
//         $("#connectionStatus").html("Connecting...");
//         connectToConference(vidyoConnector);
//         $("#joinLeaveButton").removeClass("callStart").addClass("callEnd");
//         $('#joinLeaveButton').prop('title', 'Leave Conference');
//         $("#joinLeaveButton").one("click", leave);
//     }
//     function leave() {
//         vidyoConnector.Disconnect().then(function() {
//             console.log("Disconnect Success");
//         }).catch(function() {
//             console.error("Disconnect Failure");
//         });
//         $("#renderer").removeClass("rendererFullScreen").addClass("rendererWithOptions");
//         $("#joinLeaveButton").removeClass("callEnd").addClass("callStart");
//         $('#joinLeaveButton').prop('title', 'Join Conference');
//         $("#joinLeaveButton").one("click", join);
//     }

//     $("#options").removeClass("optionsHide");
// }

// function registerDeviceListeners(vidyoConnector, cameras, microphones, speakers) {
//     // Handle appearance and disappearance of camera devices in the system
//     vidyoConnector.RegisterLocalCameraEventListener({
//         onAdded: function(localCamera) {
//             // New camera is available
//             $("#cameras").append("<option value='" + window.btoa(localCamera.id) + "'>" + localCamera.name + "</option>");
//             cameras[window.btoa(localCamera.id)] = localCamera;
//         },
//         onRemoved: function(localCamera) {
//             // Existing camera became unavailable
//             $("#cameras option[value='" + window.btoa(localCamera.id) + "']").remove();
//             delete cameras[window.btoa(localCamera.id)];
//         },
//         onSelected: function(localCamera) {
//             // Camera was selected/unselected by you or automatically
// 			if(localCamera)
// 				$("#cameras option[value='" + window.btoa(localCamera.id) + "']").prop('selected', true);
//         },
//         onStateUpdated: function(localCamera, state) {
//             // Camera state was updated
//         }
//     }).then(function() {
//         console.log("RegisterLocalCameraEventListener Success");
//     }).catch(function() {
//         console.error("RegisterLocalCameraEventListener Failed");
//     });


//     // Handle appearance and disappearance of microphone devices in the system
//     vidyoConnector.RegisterLocalMicrophoneEventListener({
//         onAdded: function(localMicrophone) {
//             // New microphone is available
//             $("#microphones").append("<option value='" + window.btoa(localMicrophone.id) + "'>" + localMicrophone.name + "</option>");
//             microphones[window.btoa(localMicrophone.id)] = localMicrophone;
//         },
//         onRemoved: function(localMicrophone) {
//             // Existing microphone became unavailable
//             $("#microphones option[value='" + window.btoa(localMicrophone.id) + "']").remove();
//             delete microphones[window.btoa(localMicrophone.id)];
//         },
//         onSelected: function(localMicrophone) {
//             // Microphone was selected/unselected by you or automatically
// 			if(localMicrophone)
// 			    $("#microphones option[value='" + window.btoa(localMicrophone.id) + "']").prop('selected', true);
//         },
//         onStateUpdated: function(localMicrophone, state) {
//             // Microphone state was updated
//         }
//     }).then(function() {
//         console.log("RegisterLocalMicrophoneEventListener Success");
//     }).catch(function() {
//         console.error("RegisterLocalMicrophoneEventListener Failed");
//     });

//     // Handle appearance and disappearance of speaker devices in the system
//     vidyoConnector.RegisterLocalSpeakerEventListener({
//         onAdded: function(localSpeaker) {
//             // New speaker is available
//             $("#speakers").append("<option value='" + window.btoa(localSpeaker.id) + "'>" + localSpeaker.name + "</option>");
//             speakers[window.btoa(localSpeaker.id)] = localSpeaker;
//         },
//         onRemoved: function(localSpeaker) {
//             // Existing speaker became unavailable
//             $("#speakers option[value='" + window.btoa(localSpeaker.id) + "']").remove();
//             delete speakers[window.btoa(localSpeaker.id)];
//         },
//         onSelected: function(localSpeaker) {
//             // Speaker was selected/unselected by you or automatically
// 			if(localSpeaker)
// 			    $("#speakers option[value='" + window.btoa(localSpeaker.id) + "']").prop('selected', true);
//         },
//         onStateUpdated: function(localSpeaker, state) {
//             // Speaker state was updated
//         }
//     }).then(function() {
//         console.log("RegisterLocalSpeakerEventListener Success");
//     }).catch(function() {
//         console.error("RegisterLocalSpeakerEventListener Failed");
//     });
// }

// function handleDeviceChange(vidyoConnector, cameras, microphones, speakers) {
//     // Hook up camera selector functions for each of the available cameras
//     $("#cameras").change(function() {
//         // Camera selected form the drop-down menu
//         $("#cameras option:selected").each(function() {
//             camera = cameras[$(this).val()];
//             vidyoConnector.SelectLocalCamera({
//                 localCamera: camera
//             }).then(function() {
//                 console.log("SelectCamera Success");
//             }).catch(function() {
//                 console.error("SelectCamera Failed");
//             });
//         });
//     });

//     // Hook up microphone selector functions for each of the available microphones
//     $("#microphones").change(function() {
//         // Microphone selected form the drop-down menu
//         $("#microphones option:selected").each(function() {
//             microphone = microphones[$(this).val()];
//             vidyoConnector.SelectLocalMicrophone({
//                 localMicrophone: microphone
//             }).then(function() {
//                 console.log("SelectMicrophone Success");
//             }).catch(function() {
//                 console.error("SelectMicrophone Failed");
//             });
//         });
//     });

//     // Hook up speaker selector functions for each of the available speakers
//     $("#speakers").change(function() {
//         // Speaker selected form the drop-down menu
//         $("#speakers option:selected").each(function() {
//             speaker = speakers[$(this).val()];
//             vidyoConnector.SelectLocalSpeaker({
//                 localSpeaker: speaker
//             }).then(function() {
//                 console.log("SelectSpeaker Success");
//             }).catch(function() {
//                 console.error("SelectSpeaker Failed");
//             });
//         });
//     });

// }

// function getParticipantName(participant, cb) {
//     if (!participant) {
//         cb("Undefined");
//         return;
//     }

//     if (participant.name) {
//         cb(participant.name);
//         return;
//     }

//     participant.GetName().then(function(name) {
//         cb(name);
//     }).catch(function() {
//         cb("GetNameFailed");
//     });
// }

// function handleParticipantChange(vidyoConnector) {
//     vidyoConnector.RegisterParticipantEventListener({
//         onJoined: function(participant) {
//             getParticipantName(participant, function(name) {
//                 $("#participantStatus").html("" + name + " Joined");
//             });
//         },
//         onLeft: function(participant) {
//             getParticipantName(participant, function(name) {
//                 $("#participantStatus").html("" + name + " Left");
//             });
//         },
//         onDynamicChanged: function(participants, cameras) {
//             // Order of participants changed
//         },
//         onLoudestChanged: function(participant, audioOnly) {
//             getParticipantName(participant, function(name) {
//                 $("#participantStatus").html("" + name + " Speaking");
//             });
//         }
//     }).then(function() {
//         console.log("RegisterParticipantEventListener Success");
//     }).catch(function() {
//         console.err("RegisterParticipantEventListener Failed");
//     });
// }

// function parseUrlParameters() {
//     // Fill in the form parameters from the URI
//     var host = getUrlParameterByName("host");
//     if (host)
//         $("#host").val(host);
//     var token = getUrlParameterByName("token");
//     if (token)
//         $("#token").val(token);
//     var displayName = getUrlParameterByName("displayName");
//     if (displayName)
//         $("#displayName").val(displayName);
//     var resourceId = getUrlParameterByName("resourceId");
//     if (resourceId)
//         $("#resourceId").val(resourceId);
//     var autoJoin = getUrlParameterByName("autoJoin");
//     var hideConfig = getUrlParameterByName("hideConfig");

//     // If the parameters are passed in the URI, do not display options dialog,
//     // and automatically connect.
//     if (host && token && displayName && resourceId) {
//         $("#optionsParameters").addClass("optionsHidePermanent");
//     }

//     if (hideConfig=="1") {
//         $("#options").addClass("optionsHidePermanent"); 
//         $("#renderer").addClass("rendererFullScreenPermanent");
//     }

//     // Return whether autoJoin is enabled
//     return autoJoin=="1";
// }

// // Attempt to connect to the conference
// // We will also handle connection failures
// // and network or server-initiated disconnects.
// function connectToConference(vidyoConnector) {

//     // Clear messages
//     $("#error").html("");
//     $("#message").html("<h3 class='blink'>CONNECTING...</h3>");

//     vidyoConnector.Connect({
//         // Take input from options form
//         host: $("#host").val(),
//         token: $("#token").val(),
//         displayName: $("#displayName").val(),
//         resourceId: $("#resourceId").val(),

//         // Define handlers for connection events.
//         onSuccess: function() {
//             // Connected
//             $("#connectionStatus").html("Connected");
//             $("#options").addClass("optionsHide");
//             $("#renderer").addClass("rendererFullScreen").removeClass("rendererWithOptions");
//             $("#message").html("");
//             handleParticipantChange(vidyoConnector);
//         },
//         onFailure: function(reason) {
//             // Failed
//             $("#connectionStatus").html("Failed");
//             $("#joinLeaveButton").removeClass("callEnd").addClass("callStart");
//             $("#message").html("");
//             $("#error").html("<h3>Call Failed: " + reason + "</h3>");
//             $("#participantStatus").html("");
//         },
//         onDisconnected: function(reason) {
//             // Disconnected
//             $("#connectionStatus").html("Disconnected");
//             $("#message").html("Call Disconnected: " + reason);
//             $("#joinLeaveButton").removeClass("callEnd").addClass("callStart");
//             $("#options").removeClass("optionsHide");
//             $("#renderer").removeClass("rendererFullScreen").addClass("rendererWithOptions");
//             $("#participantStatus").html("");
//         }
//     }).then(function(status) {
//         if (status) {
//             console.log("ConnectCall Success");
//         } else {
//             console.error("ConnectCall Failed");
//         }
//     }).catch(function() {
//         console.error("ConnectCall Failed");
//     });
// }

// // Extract the desired parameter from the browser's location bar
// function getUrlParameterByName(name) {
//     var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
//     return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
// }
