
var SocketBridge = SocketBridge || {};

SocketBridge = {

    conn: Object,
    player: Object,
    VF: Object,
    mdata: null,
    museSvgs: [],
    startPlayer: false,
    transposesDiv: null,
    nextTransposeDiv: null,
    lastKey: null,
    startKey: null,
    chordMidi: null,
    endExerciseChord: null,
    origEndExerciseChord: null,
    debug: true,
    SeqCommandId: 0,
    midiNotes: null,
    origMidiNotes: null,
    uiNotePlayed: null,
    chatRoomCurrentUsers: {},
    exerciseCount: 0,

    init: function () {

        //setup xsocket
        conn = new xsockets.client('wss://ws-dev-vl2.voicelessons.com:4503');
        conn.autoReconnect(true, 3000);
        conn.autoHeartbeat(true, 30000);

        conn.onOpen = function (e) {
            //var ths = this;
            if (SocketBridge.debug) { console.log("SocketBridge Connection Open", e); }

            //conn.controller("sequencer").setProperty("LessonGuid", lessonGuid);
            //if (usertype == "Teacher" && keyboardId != "") {
            //    conn.controller("sequencer").setProperty("KeyboardId", keyboardId);
            //}

            //console.log("subscribe to chat messages on roomKey", roomKey);
            conn.controller("message").setProperty("RoomKey", roomKey);

            conn.controller("message").subscribe("chatmessage", function (data) {

                var dateSent = '';
                if (data.DateSent.indexOf('Z') > 0) {
                    dateSent = new Date(data.DateSent);
                } else {
                    var epochSec = parseInt(data.DateSent / 1000);
                    dateSent = new Date(0);
                    dateSent.setSeconds(epochSec);
                }

                var ampm = "am";
                var hour = dateSent.getHours();
                //if (hour < 10) hour = "0" + hour;
                if (hour == 12) { ampm = "pm"; }
                else if (hour > 12) { hour -= 12; ampm = "pm"; }
                var min = dateSent.getMinutes();
                if (min < 10) { min = "0" + min; }
                var time = hour + ":" + min + " " + ampm;

                if (data.Type == "info") {
                    //<p><time datetime="01-01">6:24</time><strong class="name">allison C</strong> <strong class="info">has entered the channel.</strong></p>
                    $("#chatLog").append('<div class="item"><p><time datetime="01-01">' + time + '</time><strong class="name">' + data.From + '</strong><strong class="info">' + data.Content + '</strong></p></div>');
                } else {
                    $("#chatLog").append('<div class="item"><p><time datetime="01-01">' + time + '</time><strong class="name">' + data.From + "</strong>" + data.Content + "</p></div>");
                }

                var height1 = $("#chatLog").height();
                $("#lobbyChatLogScroller").scrollTop(height1);
            });

            $("#currentUsers li").each(function (index, value) {
                var cu_userid = $(this).attr("id");
                var cu_usertype = $(this).attr("data-usertype");
                //console.log("div" + index + ":" + cu_userid);
                SocketBridge.chatRoomCurrentUsers[cu_userid] = cu_usertype;
            });

            //console.log("Object.keys = "+Object.keys(SocketBridge.chatRoomCurrentUsers));

            conn.controller("message").subscribe("changeuserroomstatus", function (data) {
                var uid = data.UserId.toString().replace(/\-/g, "");
                //console.log("uid = " + uid);
                var cu_userid = "user_" + uid;
                console.log("changeuserroomstatus = " + cu_userid + " SocketBridge.chatRoomCurrentUsers[cu_userid] = "+ SocketBridge.chatRoomCurrentUsers[cu_userid]);
                //if (cu_userid in SocketBridge.chatRoomCurrentUsers) {
                if(SocketBridge.chatRoomCurrentUsers[cu_userid] != undefined) {
                    $("#" + cu_userid).attr("class", data.Status);
                } else {
                    $("#currentUsers").append('<li class="' + data.Status + '" id="user_"' + cu_userid + ' data-usertype='+data.UserType+'><a>' + data.UserFirstName + '</a></li>');
                    SocketBridge.chatRoomCurrentUsers[cu_userid] = data.UserType;
                }
                var hasTeacher = false;
                var hasAtLeastOneStudent = false;
                for (var key in SocketBridge.chatRoomCurrentUsers) {
                    if (SocketBridge.chatRoomCurrentUsers[key] == "Teacher") { hasTeacher = true; }
                    else if (SocketBridge.chatRoomCurrentUsers[key] == "Student") { hasAtLeastOneStudent = true; }
                }
                console.log("hasTeacher = ", hasTeacher);
                console.log("hasAtLeastOneStudent = ", hasAtLeastOneStudent);
                if (hasTeacher && hasAtLeastOneStudent) {
                    console.log("hasTeacher && hasAtLeastOneStudent - show start Lesson button");
                    //start Lesson button
                    //$("#statusWaiting").attr("class","hidden");
                    //$("#statusReady").attr("class", "show");

                    $("#msgarea").removeClass('height100');
                }
            });

            SocketBridge.sendChatMessage(" HAS ENTERED THE CHANNEL.", "info");
            SocketBridge.changeUserRoomStatus("in");

            //conn.controller("sequencer").subscribe("channelmessage", function (data) {
            //    if (usertype == "Teacher") {
            //        SocketBridge.midiNotePlayed(data);
            //    }
            //});

            //conn.controller("sequencer").subscribe("sec", function (data) {

            //    $("#history-music").prepend("<div class=\"music-descr\"><div class=\"tools-line\">" + $("#current-music").html() + "</div></div>");

            //    SocketBridge.exerciseCount++;
            //    if (SocketBridge.exerciseCount > 1) {
            //        $("#lesson-history-container").css("display", "block");
            //    }

            //    //console.log("~~~~~~~~~~ sec = ", data);

            //    startKey = data.StartKey;
            //    SocketBridge.endExerciseChord = data.EndExerciseChord.split(",");
            //    SocketBridge.origEndExerciseChord = JSON.parse(JSON.stringify(SocketBridge.endExerciseChord));
            //    keysInsertedMore = false;

            //    if (usertype == "Student") {
            //        SocketBridge.playMidi(data, true);
            //    } else if (usertype == "Teacher") {
            //        player.mute = !data.User1KeyboardSound;
            //        SocketBridge.playMidi(data, true);
            //        //SocketBridge.playMidi(data, false);
            //    }

            //    SocketBridge.midiNotes = SocketBridge.readNotesFromMidi();
            //    SocketBridge.origMidiNotes = JSON.parse(JSON.stringify(SocketBridge.midiNotes));
            //    if (SocketBridge.debug) console.log("SocketBridge.midiNotes = ", SocketBridge.midiNotes);

            //    if (data.Resume) {
            //        if (SocketBridge.debug) console.log("Data RESUME = "+data.Resume + " ~~ update midiNotes before drawing...");
            //        //update transpose on notes
            //        SocketBridge.updateMidiNotesForTranspose();
            //    }

            //    SocketBridge.drawTempo(data.Tempo);
            //    SocketBridge.drawVexflow(SocketBridge.midiNotes, SocketBridge.endExerciseChord);
            //    SocketBridge.updateTranposeUI(SocketBridge.midiToMajorKey[parseInt(startKey + player.transpose)], "start");

            //    if (usertype == "Teacher") {
            //        var MidiData = JSON.stringify(data);
            //        SequencerCommand_Save(lessonId, "sequencer", "sec", MidiData, function (data) {

            //            if (SocketBridge.debug) console.log("SequencerCommand_Save response data", data);
            //            if (data.success) {
            //                SocketBridge.SeqCommandId = data.seqCommandId;
            //                if (SocketBridge.debug) console.log("SocketBridge.SeqCommandId = ", SocketBridge.SeqCommandId);
            //            }
            //        });
            //    }
            //});

            conn.onClose = function () {
                console.log("CLOSED, will reconnect in 3 seconds");
                //Lost connection, try to reconnect in x seconds.
                //setTimeout(function () {
                //    console.log("timed out - run init")
                //    SocketBridge.init();
                //}, 3000);
            };

            conn.onError = function (err) {
                console.log("ERROR", err);
            };

            //conn.controller("sequencer").subscribe("set", function (data) {
            //    SocketBridge.setTranspose(data);

            //    if (usertype == "Teacher") {
            //        if (SocketBridge.SeqCommandId > 0) {
            //            var MidiData = JSON.stringify(data);
            //            SequencerSubCommand_Save(SocketBridge.SeqCommandId, "sequencer", "set", MidiData, function (data) {
            //                if (SocketBridge.debug) console.log("SequencerSubCommand_Save = ", data);
            //                if (data.success) { }
            //            });
            //        }
            //    }
            //});

            //conn.controller("sequencer").subscribe("ses", function (data) {
            //    SocketBridge.stopMidi(data);
            //    if (SocketBridge.SeqCommandId > 0) {
            //        var MidiData = JSON.stringify(data);
            //        SequencerSubCommand_Save(SocketBridge.SeqCommandId, "sequencer", "ses", MidiData, function (data) {
            //            if (SocketBridge.debug) console.log("SequencerSubCommand_Save = ", data);
            //            if (data.success) { }
            //        });
            //    }
            //});

            //if (usertype == "Teacher") {
            //    var msg = { "KeyboardId": keyboardId, "LessonGuid": lessonGuid };
            //    conn.controller("sequencer").invoke("UpdateLessonGuidByKeyboardId", msg);
            //}
        }
        conn.open();

        ////setup midi
        //MIDI.loadPlugin({
        //    soundfontUrl: "/Scripts/MidiJS/examples/soundfont/",
        //    instrument: "acoustic_grand_piano",
        //    onprogress: function (state, progress) {
        //        if (SocketBridge.debug) console.log("midi onprogress -- " + state, progress);
        //    },
        //    onsuccess: function () {
        //        console.log("ready!");
        //    }
        //});
        //player = MIDI.Player;

        //MIDI.Player.addListener(function (data) { // set it to your own function!
        //    //var now = data.now; // where we are now
        //    //var end = data.end; // time when song ends
        //    //var channel = data.channel; // channel note is playing on
        //    var message = data.message; // 128 is noteOff, 144 is noteOn
        //    //var note = data.note; // the note
        //    //var velocity = data.velocity; // the velocity of the note
        //    // then do whatever you want with the information!

        //    if (SocketBridge.uiNotePlayed != null) {
        //        SocketBridge.uiNotePlayed(data);
        //    }

        //    if (MIDI.Player.firstRepeat) {
        //        if (message == 144 && SocketBridge.chordNoteCount < SocketBridge.endExerciseChord.length) {
        //            SocketBridge.chordNoteCount++;
        //            //console.log("INCREASE SocketBridge.chordNoteCount++ =", SocketBridge.chordNoteCount);
        //        } else if (message == 144 && SocketBridge.chordNoteCount >= SocketBridge.endExerciseChord.length) {

        //            SocketBridge.colorNoteN();
        //        }
        //    } else {
        //        if (message == 144) {
        //            SocketBridge.colorNoteN();
        //        }
        //    }
        //});

        //MIDI.Player.onRedraw = function () {

        //    if (SocketBridge.debug) console.log("========= MIDI.Player.onRedraw");

        //    //update transpose on notes
        //    SocketBridge.updateMidiNotesForTranspose();

        //    //redraw vexflow
        //    SocketBridge.drawVexflow(SocketBridge.midiNotes, SocketBridge.endExerciseChord);

        //    //reset next transpose div
        //    SocketBridge.nextTransposeDiv = null;

        //    //update Transpose to blank
        //    SocketBridge.updateTranposeUI(SocketBridge.lastKey, "set");
        //}

        //MIDI.Player.onStart = function() {
        //    if (SocketBridge.debug) console.log("WE STARTED - RESET note Index to 0!")
        //    SocketBridge.noteIndex = 0;
        //    SocketBridge.chordNoteCount = 0;
        //    if (SocketBridge.debug) console.log("end chord length = ", SocketBridge.endExerciseChord.length);
        //};

        ////setup vexflow
        //VF = Vex.Flow;
    },

    //drawTempo: function(tempo) {
    //    $("#current-tempo").html("<li><label class=\"tempo\"><i class=\"icon-tempo\"></i><input type=\"tel\" placeholder=\"= "+tempo.toString()+"\" maxlength=\"3\" /></label></li>");
    //},

    //updateMidiNotesForTranspose: function() {

    //    if (SocketBridge.debug) console.log("MIDI.Player.transpose = ", MIDI.Player.transpose);
    //    if (SocketBridge.debug) console.log("SocketBridge.midiNotes = ", SocketBridge.midiNotes);
    //    if (SocketBridge.debug) console.log("SocketBridge.midiNotes.length = ", SocketBridge.midiNotes.length);

    //    //update transpose on notes
    //    for (var i = 0; i < SocketBridge.midiNotes.length; i++) {
    //        SocketBridge.midiNotes[i] = parseInt(SocketBridge.origMidiNotes[i]) + parseInt(MIDI.Player.transpose);
    //        if (SocketBridge.debug) console.log("orig midi note = " + SocketBridge.origMidiNotes[i] + " ~~ new midi note = " + SocketBridge.midiNotes[i]);
    //    }
    //    for (var i = 0; i < SocketBridge.endExerciseChord.length; i++) {
    //        SocketBridge.endExerciseChord[i] = parseInt(SocketBridge.origEndExerciseChord[i]) + parseInt(MIDI.Player.transpose);
    //        if (SocketBridge.debug) console.log("orig endchord note = " + SocketBridge.origEndExerciseChord[i] + " ~~ new endchord note = " + SocketBridge.endExerciseChord[i]);
    //    }
    //},

    sendChatMessage: function (msg, type) {
        var msg = { RoomKey: roomKey, From: userFirstName, FromUserId: user, Content: msg, Attachment: null, DateSent: Date.now().toString(), Type: type };
        conn.controller("message").publish("sendchatmessage", msg);
        if (SocketBridge.debug) console.log("SocketBridge sendChatMessage", msg);
    },

    changeUserRoomStatus: function(status) {
        var urs = { UserId: user, UserFirstName: userFirstName, Status: status, UserType: usertype };
        conn.controller("message").publish("changeuserroomstatus", urs);
        if (SocketBridge.debug) console.log("SocketBridge changeuserroomstatus", urs);
    },

    //midiNotePlayed: function (data) {
    //    if (SocketBridge.debug) console.log("midi = ", data);
    //    if (data.Data2 > 0) {
    //        MIDI.noteOn(data.MidiChannel, data.Data1, data.Data2, 0);
    //    } else {
    //        MIDI.noteOff(data.MidiChannel, data.Data1, 0);
    //    }
    //},

    //noteIndex: 0,
    //chordNoteCount: 0,
    //midiNotesLength: function () { return SocketBridge.midiNotes.length; },
    //vfStaveNotesLength: 0,

    //colorLastNote: function () {
    //    var lastNote = $(".vf-stavenote").eq(SocketBridge.midiNotesLength);
    //    lastNote.first().children().children().children().attr("fill", "#fff");
    //    lastNote.first().children().children().children().attr("stroke", "#fff");
    //    lastNote.children().eq(1).children().attr("fill", "#fff");
    //    lastNote.children().eq(1).children().attr("stroke", "#fff");
    //    var lastNote = $(".vf-stavenote").eq(SocketBridge.midiNotesLength-1);
    //    lastNote.first().children().children().children().attr("fill", "#fff");
    //    lastNote.first().children().children().children().attr("stroke", "#fff");
    //    lastNote.children().eq(1).children().attr("fill", "#fff");
    //    lastNote.children().eq(1).children().attr("stroke", "#fff");
    //    var lastNote = $(".vf-stavenote").eq(SocketBridge.vfStaveNotesLength - 1);
    //    lastNote.first().children().children().children().attr("fill", "#fff");
    //    lastNote.first().children().children().children().attr("stroke", "#fff");
    //    lastNote.children().eq(1).children().attr("fill", "#fff");
    //    lastNote.children().eq(1).children().attr("stroke", "#fff");
    //},

    //colorNoteN: function () {
    //    var n = SocketBridge.noteIndex;

    //    var vfStaveNotesJq = $(".vf-stavenote").toArray();
    //    SocketBridge.vfStaveNotesLength = vfStaveNotesJq.length;

    //    if (n == 0) {
    //        var lastNote = $(".vf-stavenote").eq(SocketBridge.midiNotesLength() - 1);
    //        lastNote.first().children().children().children().attr("fill", "#fff");
    //        lastNote.first().children().children().children().attr("stroke", "#fff");
    //        lastNote.children().eq(1).children().attr("fill", "#fff");
    //        lastNote.children().eq(1).children().attr("stroke", "#fff");
    //    }
    //    else if (n > 0) {
    //        var lastNote = $(".vf-stavenote").eq(n - 1);
    //        lastNote.first().children().children().children().attr("fill", "#fff");
    //        lastNote.first().children().children().children().attr("stroke", "#fff");
    //        lastNote.children().eq(1).children().attr("fill", "#fff");
    //        lastNote.children().eq(1).children().attr("stroke", "#fff");
    //    }

    //    var obj = $(".vf-stavenote").eq(n);
    //    obj.first().children().children().children().attr("fill", "#e90688");
    //    obj.first().children().children().children().attr("stroke", "#e90688");

    //    var mod = obj.children().eq(1);
    //    mod.children().attr("fill", "#e90688");
    //    mod.children().attr("stroke", "#e90688");

    //    SocketBridge.noteIndex++;
    //},

    //playMidi: function (data, startPlayer) {

    //    $("#tranposeRepetitions").empty();

    //    if (SocketBridge.debug) console.log("sequencer sec = ", data);
    //    if (SocketBridge.debug) console.log("startPlayer = " + startPlayer);
    //    if (SocketBridge.debug) console.log("data.User1KeyboardSound = " + data.User1KeyboardSound);
    //    player.timeWarp = 1;
    //    player.repeat = data.Repeat;

    //    if (SocketBridge.debug) console.log("Resume = ", data.Resume);
    //    if (data.Resume) {
    //        if (SocketBridge.debug) console.log("Resume ------ keep transpose where its at....");
    //    } else {
    //        player.newTranpose = 0;
    //        player.transpose = 0;
    //    }
    //    player.chordMidi = data.ChordMidi;
    //    player.firstRepeat = false;
    //    this.startPlayer = startPlayer || data.User1KeyboardSound;

    //    mdata = player.loadFile(data.Midi);

    //    if (this.startPlayer) {
    //        if (SocketBridge.debug) console.log("loadFile midi and play");
    //        //mdata = player.loadFile(data.Midi, player.start);
    //        player.start();
    //    }
    //    else {
    //        if (SocketBridge.debug) console.log("loadFile midi - dont play");
    //        //mdata = player.loadFile(data.Midi);
    //    }
    //},

    //readNotesFromMidi: function () {
    //    var notes = [];
    //    if (SocketBridge.debug) console.log("mdata = ", mdata);
    //    for (var n = 0; n < mdata.length; n++) {
    //        var event = mdata[n][0].event;
    //        if (event.type !== "channel") {
    //            continue;
    //        }
    //        switch (event.subtype) {
    //            case "noteOn":
    //                notes.push(event.noteNumber);
    //                break;
    //        }
    //    }
    //    if (SocketBridge.debug) console.log("notes = ", notes);
    //    return notes;
    //},

    //keysInsertedMore: false,
    //updateTranposeUI: function (key, cmd) {

    //    SocketBridge.lastKey = key;

    //    //update UI
    //    transposesDiv = document.getElementById("tranposeRepetitions");
    //    if (SocketBridge.debug) console.log("transposesDiv = ", transposesDiv);
    //    if (transposesDiv != null) {
    //        var tDiv = document.createElement("li");
    //        tDiv.id = "key-" + SocketBridge.getRandomInt(1111111, 9999999);
    //        tDiv.innerHTML = "<a class=\"pointer\">" + SocketBridge.replaceKeySpecialChars(key) + "</a>";
    //        if (cmd == "set") {
    //            if (SocketBridge.nextTransposeDiv == null) {
    //                SocketBridge.nextTransposeDiv = tDiv;
    //                transposesDiv.appendChild(tDiv);
    //            }
    //            else {
    //                SocketBridge.nextTransposeDiv.innerHTML = "<a class=\"pointer\">" + SocketBridge.replaceKeySpecialChars(key) + "</a>";
    //            }
    //        } else {
    //            transposesDiv.appendChild(tDiv);
    //        }
    //    }

    //    var transposeRepLength = $("#tranposeRepetitions").children().length;

    //    $("#tranposeRepetitions").children().each(function (index) {
    //        if (SocketBridge.debug) console.log(index + ": " + $(this).text());

    //        if (index == 0) { $(this).attr("class", "first"); }
    //        else if (index > 0 && index < (transposeRepLength - 1) && transposeRepLength <= 7) { $(this).attr("class", "inactive"); }
    //        else if (index > 1 && index < (transposeRepLength - 1) && transposeRepLength > 7) { $(this).attr("class", "inactive"); }
    //        else if (index == (transposeRepLength - 1)) { $(this).attr("class", "active"); }

    //        if (transposeRepLength > 7) {
    //            if (index == 0 && !keysInsertedMore) {
    //                $(this).after($("<li id=\"tdiv-more\" class=\"more-then-5\"><a class=\"pointer\">...</a></li>"));
    //                keysInsertedMore = true;
    //            }
    //            else if (index > 1 && index < (transposeRepLength - 6)) {
    //                $(this).attr("style", "display:none;");
    //            }
    //        }
    //    });
    //},

    //replaceKeySpecialChars: function (key) {

    //    if (key.indexOf("#") > 0) {
    //        return key.replace("#", "♯");
    //    } else if (key == "Bb" || key == "Eb" || key == "Ab") {
    //        return key.replace("b", "♭");
    //    } else {
    //        return key;
    //    }
    //},

    //setTranspose: function (data) {
    //    if (SocketBridge.debug) console.log("sequencer set = ", data);

    //    var newTranspose = data.Transpose;
    //    player.newTranspose = newTranspose;

    //    var key = SocketBridge.midiToMajorKey[parseInt(startKey + data.Transpose)];
    //    SocketBridge.updateTranposeUI(key, "set");

    //    //check if
    //    if (!player.playing) {

    //        //reset to begining
    //        player.currentTime = 0;

    //        if (player.newTranspose != -100) {

    //            if (SocketBridge.debug) console.log("newTranspose = ", newTranspose);
    //            player.transpose = player.newTranspose;
    //            player.newTranpose = -100;
    //        }

    //        if (this.startPlayer) {
    //            player.start();
    //        }
    //    } else {

    //        //increase repeat by 1
    //        player.repeat++;
    //    }
    //},

    //stopMidi: function (data) {
    //    if (SocketBridge.debug) console.log("sequencer ses = ", data);

    //    if (data.Immediately) {
    //        if (SocketBridge.debug) console.log("stop midi player");
    //        player.stop();
    //    }
    //    else {
    //        if (SocketBridge.debug) console.log("stop not immediate -- set repeat = 0");
    //        player.repeat = 0; //stop at the end of exercise, don't repeat
    //    }
    //    player.newTranpose = 0;
    //    SocketBridge.nextTransposeDiv = null;
    //},

    //drawVexflow: function (midinotes, chordnotes) {
    //    // Create an SVG renderer and attach it to the DIV element named "boo".
    //    $("#exercise").empty();

    //    var div = document.getElementById("exercise");
    //    var newDiv = document.createElement("div");
    //    newDiv.id = "muse-" + SocketBridge.getRandomInt(1111111, 9999999);
    //    div.insertBefore(newDiv, div.firstChild);

    //    $("#" + newDiv.id).slideDown(600);

    //    //transposesDiv = document.createElement("div");
    //    //transposesDiv.id = "tranposeRepitions";
    //    ///newDiv.insertBefore(transposesDiv, newDiv.firstChild);
    //    //newDiv.class = "eatshit";

    //    var renderer = new VF.Renderer(newDiv, VF.Renderer.Backends.SVG);

    //    // Configure the rendering context.
    //    renderer.resize(700, 180);
    //    var context = renderer.getContext();
    //    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    //    // Create a stave of width 400 at position 10, 40 on the canvas.
    //    var stave = new VF.Stave(20, 5, 800);

    //    var lowestNote = 0;
    //    var clef = "treble";
    //    var midiNoteOctaves = {};
    //    midiNoteOctaves["treble"] = 0;
    //    midiNoteOctaves["bass"] = 0;
    //    for (var i = 0; i < midinotes.length; i++) {

    //        if (midinotes[i] >= 60) {
    //            midiNoteOctaves["treble"]++;
    //        } else if (midinotes[i] < 60) {
    //            midiNoteOctaves["bass"]++;
    //        }
    //        //find the lowest note set to the tonic key
    //        if (midinotes[i] < lowestNote || lowestNote == 0)
    //            lowestNote = midinotes[i];
    //    }
    //    if (SocketBridge.debug) console.log("lowestNote = " + lowestNote);
    //    if (SocketBridge.debug) console.log("midiNoteOctaves[\"treble\"] = " + midiNoteOctaves["treble"]);
    //    if (SocketBridge.debug) console.log("midiNoteOctaves[\"bass\"] = " + midiNoteOctaves["bass"]);

    //    chordKey = {};
    //    chordKey[lowestNote] = 1;
    //    for (var i = 0; i < chordnotes.length; i++) {
    //        chordKey[chordnotes[i]] = 1;
    //    }
    //    if (SocketBridge.debug) console.log("chordKey = ", chordKey);

    //    var sortable = [];
    //    for (var note in chordKey) {
    //        sortable.push([note, chordKey[note]]);
    //    }
    //    sortable.sort(function (a, b) {
    //        return a[1] - b[1];
    //    });
    //    if (SocketBridge.debug) console.log("sortable = ", sortable);

    //    //check for minor chord tonality
    //    var tonality = "";
    //    var tonalitycal = parseInt(sortable[1]) - parseInt(sortable[0]);
    //    if (SocketBridge.debug) console.log("tonalitycal = ", tonalitycal);
    //    if (tonalitycal == 3) { tonality = "m"; }
    //    if (SocketBridge.debug) console.log("tonality = ", tonality);

    //    //override tonality by scale type -- maybe move this from JS to keys
    //    var scales = {
    //        "blues": [0, 3, 5, 6, 7, 10, 12, 10, 7, 6, 5, 3, 0],
    //        "natural minor": [0, 2, 3, 5, 7, 8, 10, 12, 10, 8, 7, 5, 3, 2, 0],
    //        "harmonic minor": [0, 2, 3, 5, 7, 8, 11, 12, 11, 8, 7, 5, 3, 2, 0],
    //        "jazz melodic minor": [0, 2, 3, 5, 7, 9, 11, 12, 11, 9, 7, 5, 3, 2, 0],
    //        "classical melodic minor": [0, 2, 3, 5, 7, 9, 11, 12, 10, 8, 7, 5, 3, 2, 0],
    //    };

    //    var midiInScaleDegrees = SocketBridge.convertMidiNotesToScaleDegrees(lowestNote, midinotes);
    //    if (SocketBridge.debug) console.log("midiInScaleDegrees = " + midiInScaleDegrees);

    //    var scale = "";
    //    for (var scaleN in scales) {
    //        if (scales.hasOwnProperty(scaleN)) {
    //            //console.log("Key is " + scaleN + ", value is", scales[scaleN]);
    //            if (scales[scaleN].equals(midiInScaleDegrees) === true) {
    //                if (SocketBridge.debug) console.log("MATCH -- Key is " + scaleN + ", value is", scales[scaleN]);
    //                scale = scaleN;
    //            }
    //        }
    //    }

    //    if (midiNoteOctaves["treble"] >= midiNoteOctaves["bass"]) {
    //        clef = "treble";

    //        for (var i = 0; i < midinotes.length; i++) {
    //            midinotes[i] = parseInt(midinotes[i]) + 12;
    //        }
    //        for (var i = 0; i < chordnotes.length; i++) {
    //            chordnotes[i] = parseInt(chordnotes[i]) + 12;
    //        }

    //    } else {
    //        clef = "bass";
    //    }
    //    var key = SocketBridge.midiToMajorKey[lowestNote] + tonality;
    //    stave.addClef(clef).addKeySignature(key);  //.addTimeSignature("4/4")

    //    // Connect it to the rendering context and draw!
    //    stave.setContext(context).draw();

    //    var notes = [];
    //    var midi = [];

    //    for (var i = 0; i < midinotes.length; i++) {
    //        var vfStaveNote = SocketBridge.convertMidiToKeyNote(lowestNote, midinotes, i, clef, key, tonality, scale);
    //        if (SocketBridge.debug) console.log("vfStaveNote = " , vfStaveNote);
    //        midi.push(vfStaveNote);
    //    }
    //    for (var i = 0; i < midi.length; i++) {
    //        if (SocketBridge.debug) console.log("midi[i] = ", midi[i]);

    //        if (midi[i].accidentalPosition !== undefined && midi[i].accidentalValue !== undefined) {
    //            if (SocketBridge.debug) console.log("add accidental");
    //            notes.push(new VF.StaveNote({ keys: [midi[i].keynote], duration: "8", clef: clef }).addAccidental(midi[i].accidentalPosition, new VF.Accidental(midi[i].accidentalValue)));
    //        } else {
    //            notes.push(new VF.StaveNote({ keys: [midi[i].keynote], duration: "8", clef: clef }));
    //        }
    //    }

    //    var chordarray = [];
    //    chordnotes = chordnotes.sort();
    //    for (var i = 0; i < chordnotes.length; i++) {
    //        //chordarray.push(SocketBridge.convertMidiToKeyNote(lowestNote, chordnotes, i, clef, key, tonality, scale));
    //        var vfStaveNote = SocketBridge.convertMidiToKeyNote(lowestNote, chordnotes, i, clef, key, tonality, scale);
    //        if (SocketBridge.debug) console.log("vfStaveNote = ", vfStaveNote);
    //        chordarray.push(vfStaveNote.keynote);
    //    }

    //    if (SocketBridge.debug) console.log("chordnotes = " + chordnotes);
    //    if (SocketBridge.debug) console.log("chordarray = " + chordarray);
    //    notes.push(new VF.StaveNote({ keys: chordarray, duration: "8", clef: clef }));

    //    var num_beats = notes.length / 2;
    //    var format_length = notes.length * 20;

    //    // Create a voice in 4/4 and add above notes
    //    var voice = new VF.Voice({ num_beats: num_beats, beat_value: 4 });
    //    if (SocketBridge.debug) console.log("voice.addTickables(notes) = ", notes);

    //    voice.addTickables(notes);

    //    // Format and justify the notes to 400 pixels.
    //    var formatter = new VF.Formatter().joinVoices([voice]).format([voice], format_length);

    //    // Render voice
    //    voice.draw(context, stave);

    //    Array.prototype.extend = function (other_array) {
    //        // you should include a test to check whether other_array really is an array
    //        other_array.forEach(function (v) { this.push(v) }, this);
    //    }

    //    try {
    //        //var panZoom = window.panZoom
    //        var panZoom = svgPanZoom(newDiv.childNodes[0], {
    //            zoomEnabled: false,
    //            controlIconsEnabled: false,
    //            fit: 1,
    //            center: 1
    //        });

    //        //panZoom.zoomAtPoint(1.7, { x: 8, y: 76 })
    //        panZoom.zoomAtPoint(1.4, { x: 0, y: 70 })
    //        SocketBridge.museSvgs.push(panZoom);
    //    }
    //    catch (ex) {
    //        if (SocketBridge.debug) console.log("exception = ", ex);
    //    }
    //},

    //getRandomInt: function (min, max) {
    //    min = Math.ceil(min);
    //    max = Math.floor(max);
    //    return Math.floor(Math.random() * (max - min)) + min;
    //},

    //convertMidiNotesToScaleDegrees: function(lowestNote, midinotes) {
    //    var midiScaleDegrees = [];
    //    for (var i = 0; i < midinotes.length; i++) {
    //        midiScaleDegrees.push(midinotes[i] - lowestNote);
    //    }
    //    return midiScaleDegrees;
    //},

    //convertMidiToKeyNote: function (firstnote, midinotes, i, clef, key, tonality, scale) {
    //    var vfStaveNoteReturnObj = {};
    //    var accidentalPosition, accidentalValue;

    //    if (SocketBridge.debug) console.log("i = " + i);
    //    if (SocketBridge.debug) console.log("midinotes[i] = " + midinotes[i]);
    //    var octave = parseInt(midinotes[i] / 12);
    //    if (SocketBridge.debug) console.log("octave = " + octave);
    //    if (SocketBridge.debug) console.log("firstnote = " + firstnote);
    //    if (SocketBridge.debug) console.log("key = " + key);

    //    var mm = midinotes[i] - firstnote;
    //    if (SocketBridge.debug) console.log("mm = " + mm);
    //    //if (mm > 12) {
    //    while (mm > 12) {
    //        mm -= 12;
    //        if (SocketBridge.debug) console.log("octave = " + octave);
    //        if (SocketBridge.debug) console.log("mm = " + mm);
    //    };

    //    octave -= 2;

    //    if (clef == "bass") octave++;

    //    if ((key == "Abm" || key == "Ebm") && midinotes[i] == 47) octave++;
    //    if ((key == "Abm" || key == "Ebm") && midinotes[i] == 59) octave++;
    //    if ((key == "Abm" || key == "Ebm") && midinotes[i] == 71) octave++;
    //    if ((key == "Abm" || key == "Ebm") && midinotes[i] == 83) octave++;
    //    if ((key == "Abm" || key == "Ebm") && midinotes[i] == 95) octave++;
    //    if ((key == "Abm" || key == "Ebm") && midinotes[i] == 107) octave++;

    //    if ((key == "C#m") && midinotes[i] == 48) octave--;
    //    if ((key == "C#m") && midinotes[i] == 60) octave--;
    //    if ((key == "C#m") && midinotes[i] == 72) octave--;
    //    if ((key == "C#m") && midinotes[i] == 84) octave--;
    //    if ((key == "C#m") && midinotes[i] == 96) octave--;
    //    if ((key == "C#m") && midinotes[i] == 108) octave--;

    //    if ((key == "C#") && midinotes[i] == 48) octave--;
    //    if ((key == "C#") && midinotes[i] == 60) octave--;
    //    if ((key == "C#") && midinotes[i] == 72) octave--;
    //    if ((key == "C#") && midinotes[i] == 84) octave--;
    //    if ((key == "C#") && midinotes[i] == 96) octave--;
    //    if ((key == "C#") && midinotes[i] == 108) octave--;

    //    //if (clef == "bass" && key == "Abm" && midinotes[i] == 47) octave++;
    //    //if (clef == "treble" && key == "Abm" && midinotes[i] == 59) octave++;
    //    //  if (key == "Abm" && midinotes[i] == 47) octave += 2;

    //    var note, pos, val;
    //    if (tonality == "m") { //minor
    //        note = SocketBridge.minorKeyNotes[key][mm];
    //    } else { //major
    //        note = SocketBridge.majorKeyNotes[key][mm];
    //    }

    //    if (scale == "blues") {
    //        note = Object.keys(SocketBridge.scaleKeyNotesBlues[key][mm])[0];
    //        pos = SocketBridge.scaleKeyNotesBlues[key][mm][note][0];
    //        val = SocketBridge.scaleKeyNotesBlues[key][mm][note][1];
    //    } else if (scale == "natural minor") {
    //        note = Object.keys(SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm])[0];
    //        pos = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm][note][0];
    //        val = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm][note][1];
    //    }
    //    else if (scale == "harmonic minor") {
    //        note = Object.keys(SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm])[0];
    //        pos = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm][note][0];
    //        val = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm][note][1];
    //    }
    //    else if (scale == "jazz melodic minor") {
    //        note = Object.keys(SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm])[0];
    //        pos = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm][note][0];
    //        val = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodic[key][mm][note][1];
    //    }
    //    else if (scale == "classical melodic minor") {
    //        note = Object.keys(SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodicClassical[key][mm])[0];
    //        pos = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodicClassical[key][mm][note][0];
    //        val = SocketBridge.scaleKeyNotesMinorNaturalHarmonicMelodicClassical[key][mm][note][1];
    //    }

    //    if (val != "") {
    //        accidentalPosition = pos;
    //        accidentalValue = val;
    //    }

    //    if (SocketBridge.debug) console.log("note = " + note);
    //    var keynote = note + "/" + octave;
    //    if (SocketBridge.debug) console.log(keynote);

    //    vfStaveNoteReturnObj.keynote = keynote;
    //    vfStaveNoteReturnObj.accidentalPosition = accidentalPosition;
    //    vfStaveNoteReturnObj.accidentalValue = accidentalValue;

    //    return vfStaveNoteReturnObj;

    //   // return keynote;
    //},

    //sharpNote(note) {
    //    var noteReturn = {};

    //    if (SocketBridge.debug) console.log("sharpNote note " + note + " note length = " + note.length);

    //    if (note.indexOf("#") > 0) {
    //        noteReturn.note = note.replace("#", "##");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "##";
    //    }
    //    else if (note.length > 1 && note.endsWith("b")) {
    //        if (note == "bb") {
    //            noteReturn.note = "b";
    //        } else {
    //            noteReturn.note = note.replace("b", "");
    //        }
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "n";
    //    }
    //    else {
    //        noteReturn.note = note.concat("#");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "#";
    //    }

    //    return noteReturn;
    //},

    //flatNote(note) {
    //    var noteReturn = {};

    //    if (note.indexOf("#") > 0) {
    //        noteReturn.note = note.replace("#", "");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "n";
    //    }
    //    else if (note.length > 1 && note.endsWith("b")) {
    //        noteReturn.note = note.replace("b", "bb");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "bb";
    //    }
    //    else {
    //        noteReturn.note = note.concat("b");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "b";
    //    }

    //    return noteReturn;
    //},

    //naturalNote(note) {
    //    var noteReturn = {};

    //    if (note.indexOf("#") > 0) {
    //        noteReturn.note = note.replace("#", "");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "n";
    //    }
    //    else if (note.length > 1 && note.endsWith("b")) {
    //        noteReturn.note = note.replace("b", "");
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "n";
    //    }
    //    else {
    //        noteReturn.note = note;
    //        noteReturn.accidentalPosition = 0;
    //        noteReturn.accidentalValue = "n";
    //    }

    //    return noteReturn;
    //},

    //scaleKeyNotesBlues: {
    //    "Am": [{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g#":[0,""]},{"a":[0,""]}],
    //    "Bbm": [{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]}],
    //    "Bm": [{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]}],
    //    "Cm": [{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,""]},{"c":[0,""]}],
    //    "Dbm": [{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"a":[0,"bb"]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]}],
    //    "C#m": [{"c#":[0,""]},{"c##":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"f#":[0,"##"]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"b#":[0,""]},{"c#":[0,""]}],
    //    "Dm": [{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]}],
    //    "Ebm": [{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]}],
    //    "Em": [{"e":[0,""]},{"e#":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]},{"b#":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]}],
    //    "Fm": [{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]}],
    //    "F#m": [{"f#":[0,""]},{"f##":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,"n"]},{"c":[0,"#"]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e#":[0,""]},{"f#":[0,""]}],
    //    "Gbm": [{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]}],
    //    "Gm": [{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"c":[0,"#"]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]}],
    //    "Abm": [{"ab":[0,""]},{"bbb":[0,""]},{"bb":[0,""]},{"c":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]}],
    //},

    //majorKeyNotes: {
    //    "A": ["a", "a#", "b", "c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a"],
    //    "Bb": ["bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb", "g", "ab", "a", "bb"],
    //    "B": ["b", "c", "c#", "d", "d#", "e", "e#", "f#", "g", "g#", "a", "a#", "b"],
    //    "C": ["c", "c#", "d", "eb", "e", "f", "f#", "g", "g#", "a", "a#", "b", "c"],
    //    "Db": ["db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "cb", "c", "db"],
    //    "C#": ["c#", "c##", "d#", "e", "e#", "f#", "f##", "g#", "a", "a#", "b", "b#", "c#"],
    //    "D": ["d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b", "b#", "c#", "d"],
    //    "Eb": ["eb", "e", "f", "gb", "g", "ab", "a", "bb", "cb", "c", "db", "d", "eb"],
    //    "E": ["e", "e#", "f#", "g", "g#", "a", "a#", "b", "b#", "c#", "d", "d#", "e"],
    //    "F": ["f", "gb", "g", "ab", "a", "bb", "b", "c", "db", "d", "eb", "e", "f"],
    //    "Gb": ["gb", "g", "ab", "a", "bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb"],
    //    "F#": ["f#", "f##", "g#", "g##", "a#", "b", "b#", "c#", "c##", "d#", "d##", "e#", "f#"],
    //    "G": ["g", "g#", "a", "a#", "b", "c", "c#", "d", "d#", "e", "f", "f#", "g"],
    //    "Ab": ["ab", "a", "bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb", "g", "ab"]
    //},

    //minorKeyNotes: {
    //    "Am": ["a", "bb", "b", "c", "db", "d", "eb", "e", "f", "f", "g", "g", "a"],
    //    "Bbm": ["bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb", "g", "ab", "a", "bb"],
    //    "Bm": ["b", "c", "c#", "d", "d#", "e", "e#", "f#", "g", "g#", "a", "a#", "b"],
    //    "Cm": ["c", "db", "d", "eb", "e", "f", "f#", "g", "ab", "ab", "bb", "bb", "c"],
    //    "Dbm": ["db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "cb", "c", "db"],
    //    "C#m": ["c#", "c##", "d#", "e", "e#", "f#", "f##", "g#", "a", "a#", "b", "b#", "c#"],
    //    "Dm": ["d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "bb", "c", "c", "d"],
    //    "Ebm": ["eb", "e", "f", "gb", "g", "ab", "a", "bb", "c", "c", "d", "d", "eb"],
    //    "Em": ["e", "e#", "f#", "g", "g#", "a", "a#", "b", "b#", "c#", "d", "d#", "e"],
    //    "Fm": ["f", "gb", "g", "ab", "a", "bb", "b", "c", "db", "d", "eb", "e", "f"],
    //    "F#m": ["f#", "f##", "g#", "a", "a#", "b", "b#", "c#", "d", "d#", "e", "e#", "f#"],
    //    "Gbm": ["gb", "g", "ab", "a", "bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb"],
    //    "Gm": ["g", "ab", "a", "bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb", "g"],
    //    "Abm": ["ab", "bbb", "bb", "cb", "c", "db", "d", "eb", "fb", "f", "gb", "g", "ab"]
    //},

    //scaleKeyNotesMinorNaturalHarmonicMelodic: {
    //    "Am": [{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]}],
    //    "Bbm": [{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,"n"]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]}],
    //    "Bm": [{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]}],
    //    "Cm": [{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]}],
    //    "Dbm": [{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"a":[0,"bb"]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]}],
    //    "C#m": [{"c#":[0,""]},{"c##":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"f#":[0,"##"]},{"g#":[0,""]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]},{"b":[0,"#"]},{"c#":[0,""]}],
    //    "Dm": [{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]}],
    //    "Ebm": [{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]}],
    //    "Em": [{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]}],
    //    "Fm": [{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]}],
    //    "F#m": [{"f#":[0,""]},{"f##":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,"n"]},{"c#":[0,""]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]}],
    //    "Gbm": [{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]}],
    //    "Gm": [{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]}],
    //    "Abm": [{"ab":[0,""]},{"b":[0,"bb"]},{"bb":[0,""]},{"cb":[0,""]},{"d":[0,"bb"]},{"db":[0,""]},{"e":[0,"bb"]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,"n"]},{"gb":[0,""]},{"g":[0,"n"]},{"ab":[0,""]}],
    //},

    //scaleKeyNotesMinorNaturalHarmonicMelodicClassical: {
    //    "Am": [{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]},{"f":[0,"n"]},{"f":[0,"#"]},{"g":[0,"n"]},{"g":[0,"#"]},{"a":[0,""]}],
    //    "Bbm": [{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]},{"g":[0,"b"]},{"g":[0,"n"]},{"a":[0,"b"]},{"a":[0,"n"]},{"bb":[0,""]}],
    //    "Bm": [{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,"n"]},{"g":[0,"#"]},{"a":[0,"n"]},{"a":[0,"#"]},{"b":[0,""]}],
    //    "Cm": [{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]},{"a":[0,"b"]},{"a":[0,"n"]},{"b":[0,"b"]},{"b":[0,"n"]},{"c":[0,""]}],
    //    "Dbm": [{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"a":[0,"bb"]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]}],
    //    "C#m": [{"c#":[0,""]},{"c##":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"f#":[0,"##"]},{"g#":[0,""]},{"a":[0,"n"]},{"a":[0,"#"]},{"b":[0,"n"]},{"b":[0,"#"]},{"c#":[0,""]}],
    //    "Dm": [{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"b":[0,"b"]},{"b":[0,"n"]},{"c":[0,"n"]},{"c":[0,"#"]},{"d":[0,""]}],
    //    "Ebm": [{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]},{"c":[0,"b"]},{"c":[0,"n"]},{"d":[0,"b"]},{"d":[0,"n"]},{"eb":[0,""]}],
    //    "Em": [{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]},{"c":[0,"n"]},{"c":[0,"#"]},{"d":[0,"n"]},{"d":[0,"#"]},{"e":[0,""]}],
    //    "Fm": [{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]},{"d":[0,"b"]},{"d":[0,"n"]},{"e":[0,"b"]},{"e":[0,"n"]},{"f":[0,""]}],
    //    "F#m": [{"f#":[0,""]},{"f##":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,"n"]},{"c#":[0,""]},{"d":[0,"n"]},{"d":[0,"#"]},{"e":[0,"n"]},{"e":[0,"#"]},{"f#":[0,""]}],
    //    "Gbm": [{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]}],
    //    "Gm": [{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"e":[0,"b"]},{"e":[0,"n"]},{"f":[0,"n"]},{"f":[0,"#"]},{"g":[0,""]}],
    //    "Abm": [{"ab":[0,""]},{"bbb":[0,""]},{"bb":[0,""]},{"c":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]},{"f":[0,"b"]},{"f":[0,"n"]},{"g":[0,"b"]},{"g":[0,"n"]},{"ab":[0,""]}],
    //},

    ////scaleKeyNotesMinorNatural: {
    ////    "Am": [{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g#":[0,""]},{"a":[0,""]}],
    ////    "Bbm": [{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]}],
    ////    "Bm": [{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]}],
    ////    "Cm": [{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,""]},{"c":[0,""]}],
    ////    "Dbm": [{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"a":[0,"bb"]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]}],
    ////    "C#m": [{"c#":[0,""]},{"c##":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"f#":[0,"##"]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"b#":[0,""]},{"c#":[0,""]}],
    ////    "Dm": [{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]}],
    ////    "Ebm": [{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]}],
    ////    "Em": [{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]}],
    ////    "Fm": [{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]}],
    ////    "F#m": [{"f#":[0,""]},{"f##":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,"n"]},{"c":[0,"#"]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e#":[0,""]},{"f#":[0,""]}],
    ////    "Gbm": [{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]}],
    ////    "Gm": [{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]}],
    ////    "Abm": [{"ab":[0,""]},{"bbb":[0,""]},{"bb":[0,""]},{"c":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]}],
    ////},

    ////scaleKeyNotesMinorHarmonic: {
    ////    "Am": [{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]}],
    ////    "Bbm": [{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]}],
    ////    "Bm": [{"b":[0,""]},{"c":[0,""]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]}],
    ////    "Cm": [{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]}],
    ////    "Dbm": [{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"a":[0,"bb"]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]}],
    ////    "C#m": [{"c#":[0,""]},{"c##":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"f#":[0,"##"]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"b":[0,"#"]},{"c#":[0,""]}],
    ////    "Dm": [{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"f":[0,""]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]}],
    ////    "Ebm": [{"eb":[0,""]},{"e":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,"n"]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]}],
    ////    "Em": [{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]},{"g":[0,""]},{"g":[0,"#"]},{"a":[0,""]},{"a":[0,"#"]},{"b":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"d":[0,"#"]},{"e":[0,""]}],
    ////    "Fm": [{"f":[0,""]},{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"b":[0,"n"]},{"c":[0,""]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"e":[0,"n"]},{"f":[0,""]}],
    ////    "F#m": [{"f#":[0,""]},{"f##":[0,""]},{"g#":[0,""]},{"a":[0,""]},{"a#":[0,""]},{"b":[0,""]},{"c":[0,"n"]},{"c#":[0,""]},{"d":[0,""]},{"d#":[0,""]},{"e":[0,""]},{"e":[0,"#"]},{"f#":[0,""]}],
    ////    "Gbm": [{"gb":[0,""]},{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,"n"]},{"db":[0,""]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]}],
    ////    "Gm": [{"g":[0,""]},{"ab":[0,""]},{"a":[0,""]},{"bb":[0,""]},{"cb":[0,""]},{"c":[0,""]},{"c":[0,"#"]},{"d":[0,""]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"f":[0,"#"]},{"g":[0,""]}],
    ////    "Abm": [{"ab":[0,""]},{"bbb":[0,""]},{"bb":[0,""]},{"c":[0,""]},{"c":[0,""]},{"db":[0,""]},{"d":[0,"n"]},{"eb":[0,""]},{"fb":[0,""]},{"f":[0,""]},{"gb":[0,""]},{"g":[0,"n"]},{"ab":[0,""]}],
    ////},

    //midiToMajorKey: {
    //    21: "A",
    //    22: "Bb",
    //    23: "B",
    //    24: "C",
    //    25: "C#",
    //    26: "D",
    //    27: "Eb",
    //    28: "E",
    //    29: "F",
    //    30: "F#",
    //    31: "G",
    //    32: "Ab",
    //    33: "A",
    //    34: "Bb",
    //    35: "B",
    //    36: "C",
    //    37: "C#",
    //    38: "D",
    //    39: "Eb",
    //    40: "E",
    //    41: "F",
    //    42: "F#",
    //    43: "G",
    //    44: "Ab",
    //    45: "A",
    //    46: "Bb",
    //    47: "B",
    //    48: "C",
    //    49: "C#",
    //    50: "D",
    //    51: "Eb",
    //    52: "E",
    //    53: "F",
    //    54: "F#",
    //    55: "G",
    //    56: "Ab",
    //    57: "A",
    //    58: "Bb",
    //    59: "B",
    //    60: "C",
    //    61: "C#",
    //    62: "D",
    //    63: "Eb",
    //    64: "E",
    //    65: "F",
    //    66: "F#",
    //    67: "G",
    //    68: "Ab",
    //    69: "A",
    //    70: "Bb",
    //    71: "B",
    //    72: "C",
    //    73: "C#",
    //    74: "D",
    //    75: "Eb",
    //    76: "E",
    //    77: "F",
    //    78: "F#",
    //    79: "G",
    //    80: "Ab",
    //    81: "A",
    //    82: "Bb",
    //    83: "B",
    //    84: "C",
    //    85: "C#",
    //    86: "D",
    //    87: "Eb",
    //    88: "E",
    //    89: "F",
    //    90: "F#",
    //    91: "G",
    //    92: "Ab",
    //    93: "A",
    //    94: "Bb",
    //    95: "B",
    //    96: "C",
    //    97: "C#",
    //    98: "D",
    //    99: "Eb",
    //    100: "E",
    //    101: "F",
    //    102: "F#",
    //    103: "G",
    //    104: "Ab",
    //    105: "A",
    //    106: "Bb",
    //    107: "B",
    //    108: "C"
    //},
};

$(document).ready(function () {
    SocketBridge.init();

    // Only Chrome & Opera pass the error object.
    window.onerror = function (message, file, line, col, error) {
        //console.log(message, "from", error.stack, line, col);
        // You can send data to your server
        // sendData(data);
    };
    // Only Chrome & Opera have an error attribute on the event.
    window.addEventListener("error", function (e) {
        //console.log(e.error.message, "from", e.error.stack);
        // You can send data to your server
        // sendData(data);
    })
});


// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });