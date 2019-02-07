var musicDataArray = [];
var musicDataHash = null;
var playerPlaying = false;
var autoplay = true;
var idScroll = -1;
var keysClickedToggle = false;

function UpdateName(Id) {
    var value = $("#exNameInput-" + Id).val();
    SequencerCommand_UpdateName(Id, value, function(data) {
        if (data.success) {
            $("#exNameTxt-" + Id).html(value);
            $('#nameInput-' + Id).toggle('slow');
            $('#exSaveButton-' + Id).toggle('slow');
        }
    });
}

function NameToggle(Id) {
    $('#NameBtn-' + Id).click(function() {
        $(this).toggleClass("active")
        $('#nameInput-' + Id).toggle('slow');
        $('#exSaveButton-' + Id).toggle('slow');
    });
}

function GetMyNote(SeqCommandId) {
    _GetMyNote(SeqCommandId, function(data) {
        if (data) {
            $("#textarea-my-notes-" + SeqCommandId).html(data.Text);
        }
    });
}

function GetStudentNote(SeqCommandId, StudentId) {
    _GetStudentNote(SeqCommandId, StudentId, function(data) {
        if (data) {
            $("#textarea-student-notes-" + SeqCommandId).html(data.Text);
        }
    });
}

function SetPopup(Id) {
    $('#AnnotationsButton-' + Id).click(function() {
        $(this).toggleClass("active")
        $('#annotations-' + Id).toggle('slow');
        $('#LyricsInput-' + Id).focus();
        $('#LyricsInput-' + Id).select();
    });
}

function LogPlayClick() {
    ExceriseButtonColor('play');
    //console.log("Play button (data-id=" + id + ")")
    var data = VoiceLessonsExercisePlayer.obj; //musicDataHash;
    console.log('VoiceLessons data = ', data);
    VoiceLessonsExercisePlayer.autoplayToggle = true;
    autoplay = true;
    //var obj = JSON.parse(data);
    //VoiceLessonsExercisePlayer.obj = obj[VoiceLessonsExercisePlayer.currentExercise];
    //if (playerPlaying) { VoiceLessonsExercisePlayer.player.stop(); }
    VoiceLessonsExercisePlayer.obj = data;
    VoiceLessonsExercisePlayer.playMusic(data);
    playerPlaying = true;
    //idScroll = id;
}

function autoPlayToggle(id) {
    //if (autoplay) { $("#autoplay-" + id + " > a").removeClass("activebutton"); }
    //else { $("#autoplay-" + id + " > a").addClass("activebutton"); }
    //autoplay = !autoplay;
    if (keysClickedToggle) {
        $("#autoplay-" + id + " > a").removeClass("activebutton");
        $("#autoplay-" + id + " > a").addClass("deactivebutton");

        autoplay = !autoplay;
        VoiceLessonsExercisePlayer.autoplayToggle = autoplay;
        VoiceLessonsExercisePlayer.toggleAutoPlay();
    }
}

function keysClick(count, id, autoplay) {
    // add color on clicked button
    clearExceriseButtonColor();
    $('.fa-play').parent().addClass('activeBtn');
    $('#tranposeRepitions li:eq(' + count + ')').addClass('activeBtn');

    $("#autoplay > a").addClass("activebutton");
    $("#autoplay > a").removeClass("deactivebutton");
    //var listObj = document.getElementById('tranposeRepitions').childNodes;
    keysClickedToggle = true;
    var data = VoiceLessonsExercisePlayer.obj; //musicDataHash;
    var obj = data; //JSON.parse(data);
    VoiceLessonsExercisePlayer.autoplayToggle = false;
    VoiceLessonsExercisePlayer.obj = obj;
    VoiceLessonsExercisePlayer.keyPressed = true;
    autoplay = false;
    VoiceLessonsExercisePlayer.playKeyPressed(9386, data, count);
    playerPlaying = true;
    //idScroll = id;
}

function StopClick(id) {
    ExceriseButtonColor('stop')
    console.log("Stop button (data-id=" + id + ")")
    idScroll = -1;
    keysClickedToggle = false;
    //if (playerPlaying) { VoiceLessonsExercisePlayer.player.stop(); }
    VoiceLessonsExercisePlayer.stopMusic();
}

function UpdateLyrics(SeqCommandId, Id) {
    var value = $("#LyricsInput-" + Id).val();
    SequencerCommand_UpdateLyrics(SeqCommandId, value, function(data) {
        if (data.success) {
            console.log(data);
            $('#annotations-' + Id).toggle('slow');
            $('#AnnotationsButton-' + Id).removeClass('active');
        }
    });
}

function stopOnScroll() {
    if (idScroll > 0) {
        StopClick(idScroll);
    }
}

function playNextExirese() {
    window.angularComponentReference.zone.run(() => { window.angularComponentReference.playNextItem(); });
    return;
    if (VoiceLessonsExercisePlayer.currentExercise < Object.keys(VoiceLessonsExercisePlayer.exerciseList).length - 1)
        VoiceLessonsExercisePlayer.currentExercise = VoiceLessonsExercisePlayer.currentExercise + 1;
    else if (VoiceLessonsExercisePlayer.currentExercise == Object.keys(VoiceLessonsExercisePlayer.exerciseList).length - 1)
        VoiceLessonsExercisePlayer.currentExercise = 0;

    VoiceLessonsExercisePlayer.drawFirstCall[9386] = undefined;
    $('#tranposeRepitions').remove();
    var data = VoiceLessonsExercisePlayer.exerciseList[VoiceLessonsExercisePlayer.currentExercise];
    //$('#lblExceriseItemId').html(data.name); $('#exceriseItemId').val(data.name);
    console.log('VoiceLessons data = ', data);
    VoiceLessonsExercisePlayer.autoplayToggle = true;
    autoplay = true;
    VoiceLessonsExercisePlayer.obj = data;
    //VoiceLessonsExercisePlayer.playMusic(data, null, null);
    $('svg').remove();
    $('#tempo').html('');
    VoiceLessonsExercisePlayer.drawMusic(9386, data, null, null);
    VoiceLessonsExercisePlayer.playMusic(data);

    playerPlaying = true;
}

function playPreviousExirese() {
    window.angularComponentReference.zone.run(() => { window.angularComponentReference.playPreviousItem(); });
    return;
    VoiceLessonsExercisePlayer.drawFirstCall[9386] = undefined;
    $('#tranposeRepitions').remove();
    if (VoiceLessonsExercisePlayer.currentExercise > 0)
        VoiceLessonsExercisePlayer.currentExercise = VoiceLessonsExercisePlayer.currentExercise - 1;
    else if (VoiceLessonsExercisePlayer.currentExercise == 0)
        VoiceLessonsExercisePlayer.currentExercise = Object.keys(VoiceLessonsExercisePlayer.exerciseList).length - 1;
    var data = VoiceLessonsExercisePlayer.exerciseList[VoiceLessonsExercisePlayer.currentExercise];
    $('#lblExceriseItemId').html(data.name);
    $('#exceriseItemId').val(data.name);
    console.log('VoiceLessons data = ', data);
    VoiceLessonsExercisePlayer.autoplayToggle = true;
    autoplay = true;

    VoiceLessonsExercisePlayer.obj = data;
    $('svg').remove();
    $('#tempo').html('');
    VoiceLessonsExercisePlayer.drawMusic(9386, data, null, null);
    VoiceLessonsExercisePlayer.playMusic(data);
    playerPlaying = true;
}

function initExcerisePlayer(element) {
    //debugger;
    var obj = JSON.parse(VoiceLessonsExercisePlayer.exceriseList);
    if (obj[0].name == 'Keys-Exercise') {
        var stringJson = JSON.stringify(obj[0].data);
        obj[0].data = stringJson;
    }
    var jsonObject = obj[0];
    musicDataArray = [];
    musicDataArray.push(jsonObject);
    musicDataHash = jsonObject;
    VoiceLessonsExercisePlayer.exerciseList = obj;
    drawExcerisePlayerTool(element);
    if (VoiceLessonsExercisePlayer.obj == null) {
        VoiceLessonsExercisePlayer.init();
        VoiceLessonsExercisePlayer.exerciseList = obj;
        VoiceLessonsExercisePlayer.obj = obj[VoiceLessonsExercisePlayer.currentExercise];
        VoiceLessonsExercisePlayer.drawMusic(9386, obj[VoiceLessonsExercisePlayer.currentExercise], null, null);
        LogPlayClick();
        $('#lblExceriseItemId').html(VoiceLessonsExercisePlayer.obj.name);
        $('#exceriseItemId').val(VoiceLessonsExercisePlayer.obj.name);
    } else {
        var obj = JSON.parse(VoiceLessonsExercisePlayer.exceriseList);
        VoiceLessonsExercisePlayer.obj = obj[VoiceLessonsExercisePlayer.currentExercise];
        VoiceLessonsExercisePlayer.drawFirstCall[9386] = undefined;
        $('#tranposeRepitions').remove();
        var data = VoiceLessonsExercisePlayer.exerciseList[VoiceLessonsExercisePlayer.currentExercise];
        console.log('VoiceLessons data = ', data);
        VoiceLessonsExercisePlayer.autoplayToggle = true;
        autoplay = true;
        VoiceLessonsExercisePlayer.obj = data;
        $('svg').remove();
        $('#tempo').html('');
        VoiceLessonsExercisePlayer.drawMusic(9386, data, null, null);
        VoiceLessonsExercisePlayer.playMusic(data);
        $('#lblExceriseItemId').html(data.name);
        $('#exceriseItemId').val(data.name);
        playerPlaying = true;
    }
    ExceriseButtonColor('play');
}

function findCss(fileName) {
    var finderRe = new RegExp(fileName + '.*?\.css', "i");
    var linkElems = document.getElementsByTagName("link");
    for (var i = 0, il = linkElems.length; i < il; i++) {
        if (linkElems[i].href && finderRe.test(linkElems[i].href)) {
            return true;
        }
    }
    return false;
}

function checkExceriseDependency(element) {

    if (!window.jQuery) {
        var jqueryScript = document.createElement("script");
        jqueryScript.type = "text/javascript";
        jqueryScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js";
        document.head.appendChild(jqueryScript);

        initDrawPlayerTool = setInterval(() => {
            try {
                initExcerisePlayer(element);
                clearInterval(initDrawPlayerTool);
            } catch (e) {}
        }, 200);
    } else {
        initExcerisePlayer(element);
    }

    if (!findCss("font-awesome") && !findCss("font-awesome.min")) {
        var fontAwesome = document.createElement("link");
        fontAwesome.type = "text/css";
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css";
        fontAwesome.media = 'all';
        document.head.appendChild(fontAwesome);
    }
}


function drawExcerisePlayerTool(element) {
    var strHtml = '<div class="exercisePlayer"><div class="playerTrack"><ul><li><span class="prev"><a href="javascript:void(0);" onclick="playPreviousExirese();"><i class="fa fa-angle-left"></i></a></span><div class="trackDetail" style="color: floralwhite; text-align:center;">';
    strHtml += '<label id="lblExceriseItemId" onclick="exceriseItemClick();" style="width: calc(100% - 80px); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"> </label>';
    strHtml += '<input maxlength="50" id="exceriseItemId" class="editLibLabel" onchange="exceriseItemNameChanged();" type="text" value="" /> ';
    strHtml += '</div><span class="next"><a href="javascript:void(0);" onclick="playNextExirese();"><i class="fa fa-angle-right"></i></a></span></li></ul></div><div><div id="tools-line" class="tools-line">';
    strHtml += '<ul class="tools"><li id="tempo"></li><li><a class="pointer" onclick="LogPlayClick()"><i class="fa fa-play"></i></a></li><li id="stop"><a class="pointer" onclick="StopClick()"><i class="fa fa-stop"></i></a></li><li id="autoplay"><a class="pointer" onclick="autoPlayToggle()"><i class="fa fa-repeat"></i></a></li></ul></div><div class="music-descr" data-id="123"><div id="exercises"></div></div></div></div>';
    // strHtml += '<link href="https://vlapp2.azurewebsites.net/assets/css/excerisePlayer.css" type="text/css" rel="stylesheet">'
    $(element).html(strHtml);
}

function exceriseItemNameChanged() {
    if (localStorage.getItem('userRole') == 'Teacher') {
        var itemName = $('#exceriseItemId').val();
        window.angularComponentReference.zone.run(() => { window.angularComponentReference.renameItems(itemName); });
    }
}

function exceriseItemClick() {
    if (localStorage.getItem('userRole') == 'Teacher') {
        $('#lblExceriseItemId').hide();
        $('#exceriseItemId').show();
    }
}

var VoiceLessons = VoiceLessons || {};

VoiceLessonsExercisePlayer = {

    player: Object,
    obj: null,
    mdata: null,
    startPlayer: false,
    transposesDiv: null,
    nextTransposeDiv: null,
    lastKey: null,
    startKey: null,
    chordMidi: null,
    endExerciseChord: null,
    origEndExerciseChord: null,
    debug: false,
    SeqCommandId: 0,
    midiNotes: null,
    origMidiNotes: null,
    uiNotePlayed: null,
    chatRoomCurrentUsers: {},
    exerciseCount: 0,
    midiNotesLength: function() { return VoiceLessonsExercisePlayer.midiNotes.length; },
    vfStaveNotesLength: 0,
    currentSeqCommandId: 0,
    musicTransposeHash: null, //{},
    drawFirstCall: {},
    keyPressed: false,
    autoplayToggle: false,
    repArrLength: 0,
    repArrKeyPress: "",
    keyPressTranspose: 0,
    exerciseList: null,
    currentExercise: 0,
    exceriseList: null,
    exceriseCallback: null,
    itemGuid: null,
    initPlayer: function(data, itemGuid, callback, element) {
        this.exceriseCallback = callback;
        this.exceriseList = data;
        this.itemGuid = itemGuid;
        checkExceriseDependency(element);
    },
    init: function() {
        //setup midi
        MIDI.loadPlugin({
            soundfontUrl: "/assets/MidiJS/examples/soundfont/",
            instrument: "acoustic_grand_piano",
            onprogress: function(state, progress) {
                if (VoiceLessonsExercisePlayer.debug) console.log("midi onprogress -- " + state, progress);
            },
            onsuccess: function() {
                console.log("ready!");
            }
        });
        player = MIDI.Player;

        MIDI.Player.addListener(function(data) { // set it to your own function!
            //var now = data.now; // where we are now
            //var end = data.end; // time when song ends
            //var channel = data.channel; // channel note is playing on
            var message = data.message; // 128 is noteOff, 144 is noteOn
            //var note = data.note; // the note
            //var velocity = data.velocity; // the velocity of the note
            // then do whatever you want with the information!

            if (VoiceLessonsExercisePlayer.uiNotePlayed != null) {
                VoiceLessonsExercisePlayer.uiNotePlayed(data);
            }

            if (MIDI.Player.firstRepeat) {
                if (message == 144 && VoiceLessonsExercisePlayer.chordNoteCount < VoiceLessonsExercisePlayer.endExerciseChord.length) {
                    VoiceLessonsExercisePlayer.chordNoteCount++;
                    //console.log("INCREASE VoiceLessonsExercisePlayer.chordNoteCount++ =", VoiceLessonsExercisePlayer.chordNoteCount);
                } else if (message == 144 && VoiceLessonsExercisePlayer.chordNoteCount >= VoiceLessonsExercisePlayer.endExerciseChord.length) {
                    VoiceLessonsExercisePlayer.colorNoteN();
                }
            } else {
                if (message == 144) {
                    VoiceLessonsExercisePlayer.colorNoteN();
                }
            }
        });

        MIDI.Player.onCompleted = function() {
            //VoiceLessonsExercisePlayer.exceriseCallback(VoiceLessonsExercisePlayer.itemGuid);
            window.angularComponentReference.zone.run(() => { window.angularComponentReference.exceriseCallback(VoiceLessonsExercisePlayer.itemGuid); });
        }

        MIDI.Player.onRedraw = function() {

            if (VoiceLessonsExercisePlayer.debug) console.log("========= MIDI.Player.onRedraw");

            //update transpose on notes
            VoiceLessonsExercisePlayer.updateMidiNotesForTranspose();

            //redraw vexflow
            VoiceLessonsExercisePlayer.drawVexflow(VoiceLessonsExercisePlayer.midiNotes, VoiceLessonsExercisePlayer.endExerciseChord);

            //reset next transpose div
            VoiceLessonsExercisePlayer.nextTransposeDiv = null;

            //update Transpose to blank
            if (!VoiceLessonsExercisePlayer.keyPressed) {
                VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.lastKey, "set");
            }
        }

        MIDI.Player.onStart = function() {
            if (VoiceLessonsExercisePlayer.debug) console.log("WE STARTED - RESET note Index to 0!")
            VoiceLessonsExercisePlayer.noteIndex = 0;
            VoiceLessonsExercisePlayer.chordNoteCount = 0;
            if (VoiceLessonsExercisePlayer.debug) console.log("end chord length = ", VoiceLessonsExercisePlayer.endExerciseChord.length);
        };

        VF = Vex.Flow;
        //SeqCmdId = id;
    },

    exName: function() {
        //$(".exname").click(function () {
        //    var dataid = $(this).parents(".exercise").attr('data-id');

        //    console.log('dataid = ' + dataid);

        //    $("#annotations-" + dataid).show();

        //    //var name = $("#exNameDiv-" + dataid).html();

        //    //console.log('$(#exNameDiv-" + dataid).html() = ' + name);

        //    $("#exNameInput-" + dataid).val(name);

        //    $("#exNameBtn-" + dataid).click(function () {


        //        var ExerciseName = $("#exNameDiv-" + dataid).html();

        //       console.log('SequencerCommand_UpdateName dataid = ', dataid);
        //        //console.log('SequencerCommand_UpdateName ExerciseName = ', ExerciseName);

        //        //SequencerCommand_UpdateName(dataid, ExerciseName, function (data) {

        //        //    //console.log('SequencerCommand_UpdateName data', data);

        //        //    if (data.success) {
        //        //        console.log('SequencerCommand_UpdateName success');
        //        //    }
        //        //});
        //    });
        //});
    },

    colorNoteN: function() {
        var n = VoiceLessonsExercisePlayer.noteIndex;

        console.log('currentSeqCommandId = ', currentSeqCommandId);

        var cm = "#muse-" + currentSeqCommandId.toString() + " > ";
        //console.log('cm = ', cm);

        var rm = $("#muse-" + currentSeqCommandId.toString());
        //console.log('rm = ' + rm);

        var sn = rm.find(".vf-stavenote");
        //console.log('sn = ' + sn);

        var vfStaveNotesJq = sn.toArray();
        //console.log('vfStaveNotesJq = ' + vfStaveNotesJq);

        VoiceLessonsExercisePlayer.vfStaveNotesLength = vfStaveNotesJq.length;

        if (n == 0) {
            var lastNote = sn.eq(VoiceLessonsExercisePlayer.midiNotesLength() - 1);
            lastNote.first().children().children().children().attr("fill", "#fff");
            lastNote.first().children().children().children().attr("stroke", "#fff");
            lastNote.children().eq(1).children().attr("fill", "#fff");
            lastNote.children().eq(1).children().attr("stroke", "#fff");
        } else if (n > 0) {
            var lastNote = sn.eq(n - 1);
            lastNote.first().children().children().children().attr("fill", "#fff");
            lastNote.first().children().children().children().attr("stroke", "#fff");
            lastNote.children().eq(1).children().attr("fill", "#fff");
            lastNote.children().eq(1).children().attr("stroke", "#fff");
        }

        var obj = sn.eq(n);
        obj.first().children().children().children().attr("fill", "#e90688");
        obj.first().children().children().children().attr("stroke", "#e90688");

        var mod = obj.children().eq(1);
        mod.children().attr("fill", "#e90688");
        mod.children().attr("stroke", "#e90688");

        VoiceLessonsExercisePlayer.noteIndex++;
    },

    updateMidiNotesForTranspose: function() {

        if (VoiceLessonsExercisePlayer.debug) console.log("MIDI.Player.transpose = ", MIDI.Player.transpose);
        if (VoiceLessonsExercisePlayer.debug) console.log("VoiceLessonsExercisePlayer.midiNotes = ", VoiceLessonsExercisePlayer.midiNotes);
        if (VoiceLessonsExercisePlayer.debug) console.log("VoiceLessonsExercisePlayer.midiNotes.length = ", VoiceLessonsExercisePlayer.midiNotes.length);

        //update transpose on notes
        for (var i = 0; i < VoiceLessonsExercisePlayer.midiNotes.length; i++) {
            VoiceLessonsExercisePlayer.midiNotes[i] = parseInt(VoiceLessonsExercisePlayer.origMidiNotes[i]) + parseInt(MIDI.Player.transpose);
            if (VoiceLessonsExercisePlayer.debug) console.log("orig midi note = " + VoiceLessonsExercisePlayer.origMidiNotes[i] + " ~~ new midi note = " + VoiceLessonsExercisePlayer.midiNotes[i]);
        }
        for (var i = 0; i < VoiceLessonsExercisePlayer.endExerciseChord.length; i++) {
            VoiceLessonsExercisePlayer.endExerciseChord[i] = parseInt(VoiceLessonsExercisePlayer.origEndExerciseChord[i]) + parseInt(MIDI.Player.transpose);
            if (VoiceLessonsExercisePlayer.debug) console.log("orig endchord note = " + VoiceLessonsExercisePlayer.origEndExerciseChord[i] + " ~~ new endchord note = " + VoiceLessonsExercisePlayer.endExerciseChord[i]);
        }
    },

    stopMusic: function(data) {
        try {
            if (player != null) {
                if (data == null) {
                    player.stop();
                    return;
                }
                if (data.Immediately) {
                    player.stop();
                } else {
                    player.repeat = 0; //stop at the end of exercise, don't repeat
                }
                player.newTranpose = 0;

                player.repetitionIndex = 0;
                player.firstRepeat = false;
                player.repetitionArray = null;
            }
        } catch (ex) {}
    },

    toggleAutoPlay: function() {
        console.log("toggleautoplay = ", VoiceLessonsExercisePlayer.toggleAutoPlay);
        if (VoiceLessonsExercisePlayer.keyPressed) {
            player.repeat = VoiceLessonsExercisePlayer.repArrLength;
            player.repetition = VoiceLessonsExercisePlayer.repArrKeyPress;
            VoiceLessonsExercisePlayer.keyPressed = false;
            player.transpose = VoiceLessonsExercisePlayer.keyPressTranspose;
        }
    },

    playMusic: function(i) {
        VoiceLessonsExercisePlayer.keyPressed = false;
        VoiceLessonsExercisePlayer.autoplayToggle = true;

        currentSeqCommandId = 9386; //id;

        var data;
        if (typeof i.data !== 'object') {
            data = JSON.parse(i.data);
        } else {
            data = i.data;
        }

        //var data = JSON.parse(i.data);

        console.log('playMusic data = ', data);

        var midi = data.Midi;
        var tempo = data.Tempo;
        var startkey = data.StartKey;
        var count = 0;

        VoiceLessonsExercisePlayer.LivePlay = i.LivePlay;
        VoiceLessonsExercisePlayer.endExerciseChord = null;
        if (data.EndExerciseChord1 != null) VoiceLessonsExercisePlayer.endExerciseChord = data.EndExerciseChord1.split(",");
        else VoiceLessonsExercisePlayer.endExerciseChord = data.EndExerciseChord.split(",");
        VoiceLessonsExercisePlayer.origEndExerciseChord = JSON.parse(JSON.stringify(VoiceLessonsExercisePlayer.endExerciseChord));
        VoiceLessonsExercisePlayer.mdata = player.loadFile(midi);
        VoiceLessonsExercisePlayer.midiNotes = VoiceLessonsExercisePlayer.readNotesFromMidi(data.ExerciseNotes);
        VoiceLessonsExercisePlayer.origMidiNotes = JSON.parse(JSON.stringify(VoiceLessonsExercisePlayer.midiNotes));
        VoiceLessonsExercisePlayer.startKey = data.StartKey;

        console.log("$$$ VoiceLessonsExercisePlayer.LivePlay = ", VoiceLessonsExercisePlayer.LivePlay);

        //player.repetition = "-1,-1,-1,1,1,1";
        player.repetition = VoiceLessonsExercisePlayer.musicTransposeHash;
        player.timeWarp = 1;
        player.restart = 0;
        player.repeat = VoiceLessonsExercisePlayer.musicTransposeHash.split(",").length;
        player.currentTime = 0;

        if (VoiceLessonsExercisePlayer.LivePlay) {
            player.repeat = data.Repeat;
        }

        console.log("Resume = ", data.Resume);
        //if (data.Resume) {
        //    console.log("Resume ------ keep transpose where its at....");
        //} else {
        player.newTranpose = 0;
        player.transpose = 0;
        //}
        player.chordMidi = data.ChordMidi;
        player.firstRepeat = false;

        //update transpose on notes
        VoiceLessonsExercisePlayer.updateMidiNotesForTranspose();

        //redraw vexflow
        VoiceLessonsExercisePlayer.drawVexflow(VoiceLessonsExercisePlayer.midiNotes, VoiceLessonsExercisePlayer.endExerciseChord);

        //reset next transpose div
        VoiceLessonsExercisePlayer.nextTransposeDiv = null;

        console.log('player.repetition = ', player);

        player.start();
    },

    playKeyPressed: function(id, i, count) {
        player.stop();
        player.repetitionIndex = 0;
        player.firstRepeat = false;
        player.repetitionArray = null;
        currentSeqCommandId = id;
        //var data = JSON.parse(i.data);

        var data;
        if (typeof i.data !== 'object') {
            data = JSON.parse(i.data);
        } else {
            data = i.data;
        }

        console.log('playKeyPressed data = ', data);
        console.log('playKeyPressed id = ', id);
        console.log('playKeyPressed i = ', i);
        console.log('playKeyPressed count = ', count);

        var subCmds = i.sub;
        var absoluteMidiNotes = [];
        var relativeMidiNotes = [];
        var transposeArray = [];
        absoluteMidiNotes.push(data.StartKey);
        transposeArray.push(0);
        for (var j = 0; j < subCmds.length; j++) {
            var transpose = JSON.parse(subCmds[j].subdata).Transpose;
            if (typeof(transpose) !== 'undefined') {
                console.log('playKeyPressed = transpose', transpose);
                absoluteMidiNotes.push(data.StartKey + transpose);
                transposeArray.push(transpose);
                if (j == 0) {
                    relativeMidiNotes.push(transpose);
                } else {
                    relativeMidiNotes.push(transpose - transposeArray[j]);
                }
            }
        }
        console.log('playKeyPressed absoluteMidiNotes = ', absoluteMidiNotes);
        console.log('playKeyPressed relativeMidiNotes = ', relativeMidiNotes);
        console.log('playKeyPressed transposeArray = ', transposeArray);

        var midi = data.Midi;
        var tempo = data.Tempo;
        var startkey = absoluteMidiNotes[count];
        //var count = 0;
        console.log('playKeyPressed startkey = ', startkey);

        //populate repetitions
        var repetitionArray = [];
        for (var j = count; j < relativeMidiNotes.length; j++) {
            repetitionArray.push(relativeMidiNotes[j]);
        }
        console.log('playKeyPressed repetitionArray = ', repetitionArray);

        VoiceLessonsExercisePlayer.endExerciseChord = null;
        if (data.EndExerciseChord1 != null) VoiceLessonsExercisePlayer.endExerciseChord = data.EndExerciseChord1.split(",");
        else VoiceLessonsExercisePlayer.endExerciseChord = data.EndExerciseChord.split(",");
        VoiceLessonsExercisePlayer.origEndExerciseChord = JSON.parse(JSON.stringify(VoiceLessonsExercisePlayer.endExerciseChord));
        VoiceLessonsExercisePlayer.mdata = player.loadFile(midi);
        VoiceLessonsExercisePlayer.midiNotes = VoiceLessonsExercisePlayer.readNotesFromMidi(data.ExerciseNotes);
        VoiceLessonsExercisePlayer.origMidiNotes = JSON.parse(JSON.stringify(VoiceLessonsExercisePlayer.midiNotes));

        console.log('playKeyPressed VoiceLessonsExercisePlayer.midiNotes = ', VoiceLessonsExercisePlayer.midiNotes);
        console.log('playKeyPressed VoiceLessonsExercisePlayer.origMidiNotes = ', VoiceLessonsExercisePlayer.origMidiNotes);

        player.repetition = repetitionArray.join(',');
        console.log('playKeyPressed player.repetition', player.repetition);
        player.timeWarp = 1;
        player.restart = 0;
        VoiceLessonsExercisePlayer.repArrKeyPress = player.repetition;
        VoiceLessonsExercisePlayer.repArrLength = repetitionArray.length;
        if (VoiceLessonsExercisePlayer.autoplayToggle) {
            player.repeat = repetitionArray.length;
        } else {
            player.repeat = 999;
            player.repetition = 0;
        }
        player.currentTime = 0;
        player.newTranpose = 0;

        /*if (count >= relativeMidiNotes.length) {
            player.transpose = relativeMidiNotes[count-2];
        } else {
            player.transpose = relativeMidiNotes[count-1];
        }*/
        player.transpose = transposeArray[count];
        VoiceLessonsExercisePlayer.keyPressTranspose = player.transpose;
        player.chordMidi = data.ChordMidi;

        /* if (count == 0) {
             player.firstRepeat = true;
         }
         else {
             player.firstRepeat = false;
         }*/
        player.firstRepeat = false;

        //update transpose on notes
        VoiceLessonsExercisePlayer.updateMidiNotesForTranspose();

        //redraw vexflow
        VoiceLessonsExercisePlayer.drawVexflow(VoiceLessonsExercisePlayer.midiNotes, VoiceLessonsExercisePlayer.endExerciseChord);

        //reset next transpose div
        VoiceLessonsExercisePlayer.nextTransposeDiv = null;

        //update Transpose to blank
        //VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.lastKey, "set");

        console.log('playKeyPressed VoiceLessonsExercisePlayer.midiNotes = ', VoiceLessonsExercisePlayer.midiNotes);
        console.log('playKeyPressed VoiceLessonsExercisePlayer.origMidiNotes = ', VoiceLessonsExercisePlayer.origMidiNotes);

        player.start();
    },

    drawMusic: function(id, i, newLyrics, div) {
        console.log("$$$ drawMusic data = ", i);
        var d;
        if (typeof i.data !== 'object') {
            d = JSON.parse(i.data);
        } else {
            d = i.data;
        }
        var midi = d.Midi;
        var endExerciseChord = null;
        if (d.EndExerciseChord1 != null) endExerciseChord = d.EndExerciseChord1.split(',');
        else endExerciseChord = d.EndExerciseChord.split(',');
        var tempo = d.Tempo;
        var startkey = d.StartKey;
        var count = 0;
        VoiceLessonsExercisePlayer.mdata = player.loadFile(midi);
        VoiceLessonsExercisePlayer.midiNotes = VoiceLessonsExercisePlayer.readNotesFromMidi(d.ExerciseNotes);
        var Lyrics = VoiceLessonsExercisePlayer.readTextLyricsFromMidi()
        VoiceLessonsExercisePlayer.drawVexflowDM2(9386, i, VoiceLessonsExercisePlayer.readNotesFromMidi(d.ExerciseNotes), endExerciseChord, d.Tempo, Lyrics, div);
        /////////////////////////////////////////////////////////////////////////////////////////////
        /*for (var j = 0; j < i.sub.length; j++) {   josh codes...
            count++;
            if (count < 7)
            {
                var subdata = JSON.parse(VoiceLessonsExercisePlayer.obj.sub[j].subdata);
                if (typeof (subdata.Transpose) != 'undefined') {
                    VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], count);
                }
            }
        }*/

        console.log('@@@ VoiceLessonsExercisePlayer.obj = ', VoiceLessonsExercisePlayer.obj);
        if (VoiceLessonsExercisePlayer.obj.sub != undefined) {
            console.log('@@@ VoiceLessonsExercisePlayer.obj.sub[j] = ', VoiceLessonsExercisePlayer.obj.sub[j]);
            console.log('@@@ i.sub.length = ', i.sub.length);

            /*  partially working 
            for (var j = i.sub.length - 1; j >= 0; j--) {
                count++;
                if (count < 7) {
                    var subdata = JSON.parse(VoiceLessonsExercisePlayer.obj.sub[j].subdata);
                    if (typeof (subdata.Transpose) != 'undefined') {
                        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], j + 1, i.sub.length - 1);
                    }
                }
            }
            */

            var transposeLength = i.sub.length - 1;
        }

        var kkey = VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey)];
        console.log("$$$ kkey =", kkey);
        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(kkey, 0, 'first', null, id);

        var transposeIndexArray = [];
        var lastTranspose = 0;
        var maxKeysToShow = 70;

        if (VoiceLessonsExercisePlayer.obj.sub != undefined) {
            for (var j = 0; j < transposeLength; j++) {
                count++;
                var subdata = JSON.parse(VoiceLessonsExercisePlayer.obj.sub[j].subdata);
                console.log('j = ', j);
                console.log('subdata = ', subdata);

                transposeIndexArray.push(subdata.Transpose - lastTranspose);
                lastTranspose = subdata.Transpose;

                if (((j + 1) == (transposeLength - (maxKeysToShow - 1))) && transposeLength > (maxKeysToShow - 1)) {
                    VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)],
                        j + 1, null, "<a class=\"more\">...</a>", id);
                } else if ((j + 1) == transposeLength) {
                    VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)],
                        j + 1, 'active', null, id);
                } else if (count >= (transposeLength - (maxKeysToShow - 1))) {
                    VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)],
                        j + 1, null, null, id);
                }

                //if (count < 6 && (count != transposeLength)) {
                /*
                if (count < 6 && count < (transposeLength - 1)) {
                    if (typeof (subdata.Transpose) != 'undefined') {
                        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], j + 1, transposeLength);
                    }
                } else if (count == (transposeLength - 1)) {
                    if (typeof (subdata.Transpose) != 'undefined') {
                        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], count, transposeLength);
                    }
                } else if (count == transposeLength) {
                    if (typeof (subdata.Transpose) != 'undefined') {
                        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], count, transposeLength);
                    }
                }
                */

                /*
                if (count > 6 && count < (transposeLength - 6)) {
                    if (typeof (subdata.Transpose) != 'undefined') {
                        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], j + 1, transposeLength);
                    }
                } else {
                    if (typeof (subdata.Transpose) != 'undefined') {
                        VoiceLessonsExercisePlayer.updateTranposeUI_Playback(VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(d.StartKey + subdata.Transpose)], j + 1, transposeLength);
                    }
                }
                */
            }
        }

        var transposeIndexString = transposeIndexArray.join(',');
        //musicDataHash[id].transpose = transposeIndexString;
        VoiceLessonsExercisePlayer.musicTransposeHash = transposeIndexString;

        console.log('transposeIndexString = ', transposeIndexString);
        console.log('VoiceLessonsExercisePlayer.musicTransposeHash[id] = ', VoiceLessonsExercisePlayer.musicTransposeHash);

        /////////////////////////////////////////////////////////////////////////////////////////////

        var lyricsInput = document.getElementById("LyricsInput");
        $(lyricsInput).val(Lyrics);
    },

    embellishMusicAllPage: function() {
        $('.exercise').each(function(i, obj) {
            var max = 0;
            $(this).find(".vf-modifiers > text").each(function(j, objj) {
                var y = $(this).attr('y');
                if (y > max) max = y;
            });
            $(this).find(".vf-modifiers > text").attr('y', max);
            VoiceLessonsExercisePlayer.embellishMusic($(this).attr('id'));
        });
        VoiceLessonsExercisePlayer.exName();
    },
    embellishMusic: function(id) {

        var max = 0;

        $('#' + id).find(".vf-modifiers > text").each(function(j, objj) {
            var y = $(this).attr('y');
            if (y > max) max = y;
            //console.log('   y = ' + y);

        });

        //console.log('   max = ' + max);
        $('#' + id).find(".vf-modifiers > text").attr('y', max);
        $('#' + id).find(".vf-modifiers > text").click(
            function() {

                var lyrics = [];

                $(this).parents(".exercise").find(".vf-modifiers > text").each(function(j, objj) {
                    console.log("text = " + $(this).text())
                    lyrics.push($(this).text());
                });

                lyricstext = lyrics.join(" ");
                console.log('lyricstext = ', lyricstext);

                var dataid = $(this).parents(".exercise").attr('data-id');
                var index = $(this).parents(".exercise").attr('data-index');
                var lyricsInputText = "#lyricsInputText-" + dataid;
                //var lyricsInput = "#LyricsInput-" + dataid;
                var lyricsInput = document.getElementById("LyricsInput-" + dataid);
                var lyricsBtn = document.getElementById("#LyricsBtn-" + dataid);

                $(lyricsInputText).show();

                console.log('id = ' + dataid);
                console.log('lyricsInput = ' + lyricsInput);

                /////////////////////////////////////////////////////////////////////////////////////////////
                //save lyrics
                //$(lyricsBtn).click(function () {

                //    var newLyrics = $(lyricsInput).val();
                //    console.log('newLyrics = ' + newLyrics);
                //    $(this).parents(".exercise").empty();
                //    console.log('dataid = ' + dataid);

                //    //save to db
                //    //var MidiData = JSON.stringify(VoiceLessonsExercisePlayer.obj[index].data);
                //    //var ExerciseName = $("#exNameDiv-" + dataid).html();

                //    console.log('SequencerCommand_UpdateLyrics dataid = ', dataid);
                //    ////console.log('SequencerCommand_Update MidiData = ', MidiData);
                //    console.log('SequencerCommand_UpdateLyrics newLyrics = ', newLyrics);
                //    ////console.log('SequencerCommand_Update data = ', data);
                //    SequencerCommand_UpdateLyrics(dataid, newLyrics, function (data) {

                //        console.log('SequencerCommand_UpdateLyrics data', data);
                //        if (data.success) {

                //            console.log('new data.midiData', data.midiData);

                //            VoiceLessonsExercisePlayer.obj.data = data.midiData;

                //            var d = JSON.parse(VoiceLessonsExercisePlayer.obj.data);
                //            var midi = d.Midi;
                //            VoiceLessonsExercisePlayer.mdata = player.loadFile(midi);

                //            VoiceLessonsExercisePlayer.drawMusic(VoiceLessonsExercisePlayer.obj.id, index, VoiceLessonsExercisePlayer.readTextLyricsFromMidi(), document.getElementById('muse-' + dataid));
                //            VoiceLessonsExercisePlayer.embellishMusic('muse-' + dataid);
                //            $(lyricsInputText).hide();

                //            console.log('SequencerCommand_UpdateLyrics success');
                //        }
                //    });

                //});
                /////////////////////////////////////////////////////////////////////////////////////////////
                $(lyricsInput).val(lyricstext);
                $(lyricsInput).focus();

            });
        VoiceLessonsExercisePlayer.exName();
    },

    setTranspose: function(data) {
        console.log("VoiceLessonsExercisePlayer setTranspose set = ", data);

        var newTranspose = data.Transpose;
        player.newTranspose = newTranspose;

        console.log("$$$ VoiceLessonsExercisePlayer.midiToMajorKey = ", VoiceLessonsExercisePlayer.midiToMajorKey);
        console.log("$$$ VoiceLessonsExercisePlayer.startKey = ", VoiceLessonsExercisePlayer.startKey);

        var key = VoiceLessonsExercisePlayer.midiToMajorKey[parseInt(VoiceLessonsExercisePlayer.startKey + data.Transpose)];

        console.log("$$$ setTranspose = ", key);

        if (VoiceLessonsExercisePlayer.LivePlay) {

            VoiceLessonsExercisePlayer.updateTranposeUI_Liveplay(key, "set");

            //check if
            if (!player.playing) {

                //reset to begining
                player.currentTime = 0;

                if (player.newTranspose != -100) {

                    if (LivePlayer.debug) console.log("newTranspose = ", newTranspose);
                    player.transpose = player.newTranspose;
                    player.newTranpose = -100;
                }

                if (this.startPlayer) {
                    player.start();
                }
            } else {

                //increase repeat by 1
                player.repeat++;
            }

        } else {
            VoiceLessonsExercisePlayer.updateTranposeUI_Playback(key, "set");
        }
    },

    getParameterByName: function(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    readNotesFromMidi: function(notes) {
        return notes.split(',');
    },

    readNotesFromMidi_Old: function() {
        var notes = [];
        if (VoiceLessonsExercisePlayer.debug) console.log('VoiceLessonsExercisePlayer.mdata = ', VoiceLessonsExercisePlayer.mdata);
        for (var n = 0; n < VoiceLessonsExercisePlayer.mdata.length; n++) {
            var event = VoiceLessonsExercisePlayer.mdata[n][0].event;
            if (event.type !== 'channel') {
                continue;
            }
            switch (event.subtype) {
                case 'noteOn':
                    notes.push(event.noteNumber);
                    break;
            }
        }
        return notes;
    },

    readTextLyricsFromMidi: function() {
        var texts = [];
        for (var n = 0; n < VoiceLessonsExercisePlayer.mdata.length; n++) {
            var event = VoiceLessonsExercisePlayer.mdata[n][0].event;
            if (event.type !== 'meta') {
                continue;
            }
            switch (event.subtype) {
                case 'text':
                    texts.push(event.text);
                    break;
            }
        }
        return texts;
    },

    updateTranposeUI_Playback: function(key, count, className, innerHTML, id) {
        if (typeof(VoiceLessonsExercisePlayer.transposesDiv) !== 'undefined' && VoiceLessonsExercisePlayer.transposesDiv != null && typeof(innerHTML) !== 'undefined') {
            var tDiv = document.createElement('li');
            //tDiv.innerHTML = "<a href=\"#\" data-count=\"" + count + "\">" + key + "</a>";
            tDiv.innerHTML = "<a class=\"pointer\" onclick=\"keysClick(" + count + "," + id + ")\" data-count=\"" + count + "\">" + VoiceLessonsExercisePlayer.replaceKeySpecialChars(key) + "</a>";

            if (className) tDiv.className = className;
            if (innerHTML) tDiv.innerHTML = innerHTML;

            /*
            if (count == totalCount) //set to last
            {
                tDiv.className = "active";
            } else if (count == 0) {
                tDiv.className = "first";
            } else if (count == 1 && totalCount > 6) {
                tDiv.innerHTML = "<a class=\"more\">...</a>";
            }
            //else if (count == (totalCount - 7) && totalCount > 6) {
            //    tDiv.innerHTML = "<a class=\"more\">...</a>";
            //}
            //else if (count == 6) { //if (count == (totalCount-1)) {
            //    tDiv.innerHTML = "<a class=\"more\">...</a>";
            //}
            */

            tDiv.id = "tdiv-" + VoiceLessonsExercisePlayer.getRandomInt(1111111, 9999999);
            VoiceLessonsExercisePlayer.transposesDiv.appendChild(tDiv);
        }
    },

    updateTranposeUI_Liveplay: function(key, cmd) {

        //debugger;

        if (typeof(VoiceLessonsExercisePlayer.transposesDiv) !== 'undefined' && VoiceLessonsExercisePlayer.transposesDiv != null) {
            VoiceLessonsExercisePlayer.lastKey = key;

            var tDiv = document.createElement("li");
            tDiv.id = "key-" + LivePlayer.getRandomInt(1111111, 9999999);
            tDiv.innerHTML = "<a class=\"pointer\">" + LivePlayer.replaceKeySpecialChars(key) + "</a>";
            if (cmd == "set") {
                if (VoiceLessonsExercisePlayer.nextTransposeDiv == null) {
                    VoiceLessonsExercisePlayer.nextTransposeDiv = tDiv;
                    VoiceLessonsExercisePlayer.transposesDiv.appendChild(tDiv);
                } else {
                    VoiceLessonsExercisePlayer.nextTransposeDiv.innerHTML = "<a class=\"pointer\">" + VoiceLessonsExercisePlayer.replaceKeySpecialChars(key) + "</a>";
                }
            } else {
                VoiceLessonsExercisePlayer.transposesDiv.appendChild(tDiv);
            }

            var transposeRepLength = $("#tranposeRepetitions").children().length;

            $("#tranposeRepetitions").children().each(function(index) {
                if (VoiceLessonsExercisePlayer.mobile) { var maxKeysToShow = 70; } else { var maxKeysToShow = 7; }
                if (VoiceLessonsExercisePlayer.debug) console.log(index + ": " + $(this).text());

                if (index == 0) { $(this).attr("class", "first"); } else if (index > 0 && index < (transposeRepLength - 1) && transposeRepLength <= maxKeysToShow) { $(this).attr("class", "inactive"); } else if (index > 1 && index < (transposeRepLength - 1) && transposeRepLength > maxKeysToShow) { $(this).attr("class", "inactive"); } else if (index == (transposeRepLength - 1)) { $(this).attr("class", "active"); }

                if (transposeRepLength > 7 && !VoiceLessonsExercisePlayer.mobile) {
                    if (index == 0 && !keysInsertedMore) {
                        $(this).after($("<li id=\"tdiv-more\" class=\"more-then-5\"><a class=\"pointer\">...</a></li>"));
                        keysInsertedMore = true;
                    } else if (index > 1 && index < (transposeRepLength - 6)) {
                        $(this).attr("style", "display:none;");
                    }
                }
                if (transposeRepLength > maxKeysToShow && VoiceLessonsExercisePlayer.mobile) {
                    if (index == 0 && !keysInsertedMore) {
                        $(this).after($("<li id=\"tdiv-more\" class=\"more-then-5\"><a class=\"pointer\">...</a></li>"));
                        keysInsertedMore = true;
                    } else if (index > 1 && index < (transposeRepLength - (maxKeysToShow - 1))) {
                        $(this).attr("style", "display:none;");
                    }
                }
            });
        }
    },

    replaceKeySpecialChars: function(key) {

        try {
            if (key.indexOf("#") > 0) {
                return key.replace("#", "♯");
            } else if (key == "Bb" || key == "Eb" || key == "Ab") {
                return key.replace("b", "♭");
            } else {
                return key;
            }
        } catch (e) {}
    },

    drawVexflow: function(midinotes, chordnotes) {
        var div = document.getElementById("muse-" + currentSeqCommandId);
        console.log('find the div = ', div);
        console.log('midinotes = ', midinotes);
        console.log('chordnotes = ', chordnotes);

        $("#muse-" + currentSeqCommandId + " > svg").remove();

        VoiceLessonsExercisePlayer.drawVexflowDM2(currentSeqCommandId, 0, midinotes, chordnotes, null, null, div);
    },

    drawVexflowDM2: function(id, index, midinotes, chordnotes, tempo, newLyrics, div) {

        if (VoiceLessonsExercisePlayer.midiNotes !== 'undefined') {
            var width = 175 + (35 * (VoiceLessonsExercisePlayer.midiNotes + 1));
            var height = 180;
            var drawSvgHeight = 5;
        }

        var lyrics = [];
        for (var i = 0; i < VoiceLessonsExercisePlayer.midiNotes; i++) {
            lyrics.push('-');
        }
        if (newLyrics != null) {
            console.log('newLyrics = ', newLyrics);
            lyrics = newLyrics;
        }

        console.log('div = ', div);
        var newDiv;

        if (div == null) {
            newDiv = document.createElement('div');
            newDiv.id = "muse-" + id;
            newDiv.setAttribute("data-id", id);
            newDiv.setAttribute("data-index", index);
            newDiv.className = "music-descr";

            div = document.getElementById("exercises");
            div.insertBefore(newDiv, div.firstChild);
        } else {

            newDiv = div;
        }

        console.log('newDiv = ', newDiv);

        var tools = document.getElementById("tools-line");

        var toolsTempo = document.getElementById("tempo");
        console.log('### toolsTempo = ', toolsTempo);

        if (typeof(VoiceLessonsExercisePlayer.drawFirstCall[id]) === 'undefined') {
            var toolsTempoLabel = document.createElement('label');
            toolsTempoLabel.className = "tempo";

            var toolsTempoIcon = document.createElement('i');
            toolsTempoIcon.className = "icon-tempo";

            toolsTempoLabel.appendChild(toolsTempoIcon);

            var toolsTempoInput = document.createElement('input');
            toolsTempoInput.type = "tel";
            toolsTempoInput.placeholder = " = " + tempo;
            toolsTempoInput.maxLength = 3;
            toolsTempoLabel.appendChild(toolsTempoInput);

            VoiceLessonsExercisePlayer.transposesDiv = document.createElement('ul');
            VoiceLessonsExercisePlayer.transposesDiv.id = "tranposeRepitions";
            VoiceLessonsExercisePlayer.transposesDiv.className = "keys";

            newDiv.appendChild(tools);
            toolsTempo.appendChild(toolsTempoLabel);
            tools.appendChild(VoiceLessonsExercisePlayer.transposesDiv);

            VoiceLessonsExercisePlayer.drawFirstCall[id] = true;
        }

        var renderer = new VF.Renderer(newDiv, VF.Renderer.Backends.SVG);

        //renderer.resize(width, height);
        renderer.resize(430, 100);

        var context = renderer.getContext();
        context.setFont("Verdana", 10, "").setBackgroundFillStyle("#eed");

        // Create a stave of width 400 at position 10, 40 on the canvas.
        //var stave = new VF.Stave(0, drawSvgHeight, width);
        var stave = new VF.Stave(0, 0, 430);

        var lowestNote = 0;
        var highestNote = 0;
        var clef = "treble";
        var midiNoteOctaves = {};
        midiNoteOctaves["treble"] = 0;
        midiNoteOctaves["bass"] = 0;
        for (var i = 0; i < midinotes.length; i++) {

            if (midinotes[i] >= 60) {
                midiNoteOctaves["treble"]++;
            } else if (midinotes[i] < 60) {
                midiNoteOctaves["bass"]++;
            }
            if (midinotes[i] > highestNote || highestNote == 0)
                highestNote = midinotes[i];
            //find the lowest note set to the tonic key
            if (midinotes[i] < lowestNote || lowestNote == 0)
                lowestNote = midinotes[i];
        }
        if (VoiceLessonsExercisePlayer.debug) console.log('lowestNote = ' + lowestNote);
        //console.log("lowest note = " + lowestNote);
        //console.log("highest note = " + highestNote);

        if (lowestNote < 40 && highestNote > 60) {
            var padTop = highestNote - 40;
            $("#tools-line-" + id).next().css("padding-top", padTop + "px");
            renderer.resize(430, 112 + Math.abs(lowestNote) + padTop);
        } else if (highestNote >= 60) {
            var padTop = highestNote - 40;
            $("#tools-line-" + id).next().css("padding-top", padTop + "px");
            renderer.resize(430, 112 + padTop);
        } else if (lowestNote < 40) {
            renderer.resize(430, 112 + Math.abs(lowestNote));
        } else {

        }

        if (midiNoteOctaves["treble"] >= midiNoteOctaves["bass"]) {
            clef = "treble";
            stave.addClef(clef)
                .addKeySignature(VoiceLessonsExercisePlayer.midiToMajorKey[lowestNote])
                .setTempo({ duration: '8', dots: 0 }, -20);
        } else {
            clef = "bass";
            lowestNote = parseInt(lowestNote) + 8;
            for (var i = 0; i < midinotes.length; i++) {
                midinotes[i] = parseInt(midinotes[i]) + 8;
            }
            for (var i = 0; i < chordnotes.length; i++) {
                chordnotes[i] = parseInt(chordnotes[i]) + 8;
            }
            var key = VoiceLessonsExercisePlayer.midiToMajorKey[lowestNote + 4];
            if (key.indexOf('b') > 0) {
                lowestNote = parseInt(lowestNote) + 1;
                for (var i = 0; i < midinotes.length; i++) {
                    midinotes[i] = parseInt(midinotes[i]) + 1;
                }
                for (var i = 0; i < chordnotes.length; i++) {
                    chordnotes[i] = parseInt(chordnotes[i]) + 1;
                }
            }
            stave.addClef(clef)
                .addKeySignature(key)
                .setTempo({ duration: '8', dots: 0 }, -20);
        }

        // Connect it to the rendering context and draw!
        stave.setContext(context).draw();

        var notes = [];
        var midi = [];

        for (var i = 0; i < midinotes.length; i++) {
            midi.push(VoiceLessonsExercisePlayer.convertMidiToKeyNote(lowestNote, midinotes, i, clef));
        }

        for (var i = 0; i < midi.length; i++) {
            notes.push(new VF.StaveNote({ keys: [midi[i]], duration: "8" })
                /* hide annontations for this build
                .addAnnotation(0,
                    VoiceLessonsExercisePlayer.newAnnotation(lyrics[i], 2, VF.Annotation.VerticalJustify.BOTTOM)
                ) */
            );
        }

        var chordarray = [];
        for (var i = 0; i < chordnotes.length; i++) {
            chordarray.push(VoiceLessonsExercisePlayer.convertMidiToKeyNote(lowestNote, chordnotes, i, clef));
        }

        if (VoiceLessonsExercisePlayer.debug) console.log('chordnotes = ' + chordnotes);
        if (VoiceLessonsExercisePlayer.debug) console.log('chordarray = ' + chordarray);
        //notes.push(new VF.StaveNote({ keys: chordarray, duration: "8" }));

        var num_beats = notes.length / 2;
        var format_length = notes.length * 20;

        // Create a voice in 4/4 and add above notes
        var voice = new VF.Voice({ num_beats: num_beats, beat_value: 4 });
        voice.addTickables(notes);

        // Format and justify the notes to 400 pixels.
        var formatter = new VF.Formatter().joinVoices([voice]).format([voice], format_length);

        // Render voice
        voice.draw(context, stave);

        Array.prototype.extend = function(other_array) {
            // you should include a test to check whether other_array really is an array 
            other_array.forEach(function(v) { this.push(v) }, this);
        }

        try {

            //var panZoom = window.panZoom = 
            var panZoom = svgPanZoom(newDiv.childNodes[0], {
                zoomEnabled: false,
                controlIconsEnabled: false,
                fit: 1,
                center: 1
            });
            if (format_length <= 330) {
                panZoom.zoomAtPoint(1.7, { x: 0, y: 70 });
                //console.log("%%%%%%%%%%%format length " + format_length + " zoom: 1.7");
            } else {
                var sc = 330 / format_length;
                console.log("sc " + sc);
                var round = Math.round(sc * 10) / 10;
                var temp = round * 1.7;
                //console.log("temp " + temp);
                var rounded = Math.round(temp * 10) / 10;
                rounded = rounded - 0.1;
                rounded = rounded.toFixed(1);
                panZoom.zoomAtPoint(rounded, { x: 0, y: 70 });
                //console.log("%%%%%%%%%%%format length " + format_length + " rounded scale: " + rounded);
            }
            //panZoom.zoomAtPoint(1.7, { x: 0, y: 120 })
            //panZoom.zoomAtPoint(1.4, { x: 0, y: 70 })
            museSvgs.push(panZoom);
        } catch (ex) {
            if (VoiceLessonsExercisePlayer.debug) console.log('exception = ', ex);
        }
    },

    newAnnotation: function(text, hJustifcation, vJustifcation) {
        return (
                new VF.Annotation(text))
            .setFont('Verdana', 10)
            .setJustification(hJustifcation)
            .setVerticalJustification(vJustifcation);
    },

    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    convertMidiToKeyNote: function(firstnote, midinotes, i, clef) {
        if (VoiceLessonsExercisePlayer.debug) console.log('i = ' + i);
        var octave = parseInt(midinotes[i] / 12);
        if (VoiceLessonsExercisePlayer.debug) console.log('octave = ' + octave);
        var key = VoiceLessonsExercisePlayer.midiToMajorKey[firstnote];
        if (VoiceLessonsExercisePlayer.debug) console.log('key = ' + key);

        var mm = midinotes[i] - firstnote;
        if (VoiceLessonsExercisePlayer.debug) console.log('mm = ' + mm);
        if (mm > 12) {
            mm -= 12;
            if (VoiceLessonsExercisePlayer.debug) console.log('octave = ' + octave);
            if (VoiceLessonsExercisePlayer.debug) console.log('mm = ' + mm);
        };

        octave--;

        if (clef == "bass") {
            octave += 1;
        }

        if ((key == "Abm" || key == "Ebm") && midinotes[i] == 47) octave++;
        if ((key == "Abm" || key == "Ebm") && midinotes[i] == 59) octave++;
        if ((key == "Abm" || key == "Ebm") && midinotes[i] == 71) octave++;
        if ((key == "Abm" || key == "Ebm") && midinotes[i] == 83) octave++;
        if ((key == "Abm" || key == "Ebm") && midinotes[i] == 95) octave++;
        if ((key == "Abm" || key == "Ebm") && midinotes[i] == 107) octave++;

        if ((key == "C#m") && midinotes[i] == 48) octave--;
        if ((key == "C#m") && midinotes[i] == 60) octave--;
        if ((key == "C#m") && midinotes[i] == 72) octave--;
        if ((key == "C#m") && midinotes[i] == 84) octave--;
        if ((key == "C#m") && midinotes[i] == 96) octave--;
        if ((key == "C#m") && midinotes[i] == 108) octave--;

        if ((key == "C#") && midinotes[i] == 48) octave--;
        if ((key == "C#") && midinotes[i] == 60) octave--;
        if ((key == "C#") && midinotes[i] == 72) octave--;
        if ((key == "C#") && midinotes[i] == 84) octave--;
        if ((key == "C#") && midinotes[i] == 96) octave--;
        if ((key == "C#") && midinotes[i] == 108) octave--;

        var note = VoiceLessonsExercisePlayer.majorKeyNotes[key][mm];
        if (VoiceLessonsExercisePlayer.debug) console.log('note = ' + note);
        var keynote = note + '/' + octave;
        if (VoiceLessonsExercisePlayer.debug) console.log(keynote);
        return keynote;
    },

    // variables
    majorKeyNotes: {
        'A': ['a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a'],
        'Bb': ['bb', 'cb', 'c', 'db', 'd', 'eb', 'fb', 'f', 'gb', 'g', 'ab', 'a', 'bb'],
        'B': ['b', 'c', 'c#', 'd', 'd#', 'e', 'e#', 'f#', 'g', 'g#', 'a', 'a#', 'b'],
        'C': ['c', 'c#', 'd', 'eb', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b', 'c'],
        'Db': ['db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'cb', 'c', 'db'],
        'C#': ['c#', 'c##', 'd#', 'e', 'e#', 'f#', 'f##', 'g#', 'a', 'a#', 'b', 'b#', 'c#'],
        'D': ['d', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b', 'b#', 'c#', 'd'],
        'Eb': ['eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'cb', 'c', 'db', 'd', 'eb'],
        'E': ['e', 'e#', 'f#', 'g', 'g#', 'a', 'a#', 'b', 'b#', 'c#', 'd', 'd#', 'e'],
        'F': ['f', 'gb', 'g', 'ab', 'a', 'bb', 'b', 'c', 'db', 'd', 'eb', 'e', 'f'],
        'Gb': ['gb', 'g', 'ab', 'a', 'bb', 'cb', 'c', 'db', 'd', 'eb', 'fb', 'f', 'gb'],
        'F#': ['f#', 'f##', 'g#', 'g##', 'a#', 'b', 'b#', 'c#', 'c##', 'd#', 'd##', 'e#', 'f#'],
        'G': ['g', 'g#', 'a', 'a#', 'b', 'c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g'],
        'Ab': ['ab', 'a', 'bb', 'cb', 'c', 'db', 'd', 'eb', 'fb', 'f', 'gb', 'g', 'ab']
    },

    midiToMajorKey: {
        21: 'A',
        22: 'Bb',
        23: 'B',
        24: 'C',
        25: 'C#',
        26: 'D',
        27: 'Eb',
        28: 'E',
        29: 'F',
        30: 'F#',
        31: 'G',
        32: 'Ab',
        33: 'A',
        34: 'Bb',
        35: 'B',
        36: 'C',
        37: 'C#',
        38: 'D',
        39: 'Eb',
        40: 'E',
        41: 'F',
        42: 'F#',
        43: 'G',
        44: 'Ab',
        45: 'A',
        46: 'Bb',
        47: 'B',
        48: 'C',
        49: 'C#',
        50: 'D',
        51: 'Eb',
        52: 'E',
        53: 'F',
        54: 'F#',
        55: 'G',
        56: 'Ab',
        57: 'A',
        58: 'Bb',
        59: 'B',
        60: 'C',
        61: 'C#',
        62: 'D',
        63: 'Eb',
        64: 'E',
        65: 'F',
        66: 'F#',
        67: 'G',
        68: 'Ab',
        69: 'A',
        70: 'Bb',
        71: 'B',
        72: 'C',
        73: 'C#',
        74: 'D',
        75: 'Eb',
        76: 'E',
        77: 'F',
        78: 'F#',
        79: 'G',
        80: 'Ab',
        81: 'A',
        82: 'Bb',
        83: 'B',
        84: 'C',
        85: 'C#',
        86: 'D',
        87: 'Eb',
        88: 'E',
        89: 'F',
        90: 'F#',
        91: 'G',
        92: 'Ab',
        93: 'A',
        94: 'Bb',
        95: 'B',
        96: 'C',
        97: 'C#',
        98: 'D',
        99: 'Eb',
        100: 'E',
        101: 'F',
        102: 'F#',
        103: 'G',
        104: 'Ab',
        105: 'A',
        106: 'Bb',
        107: 'B',
        108: 'C'
    },
};

function clearExceriseButtonColor() {
    $('#tranposeRepitions li').removeClass('activeBtn');
    $('.fa-play').parent().removeClass('activeBtn');
    $('.fa-step-backward').parent().removeClass('activeBtn');
    $('.fa-step-forward').parent().removeClass('activeBtn');
    $('.fa-pause').parent().removeClass('activeBtn');
    $('.fa-stop').parent().removeClass('activeBtn');
}

function ExceriseButtonColor(action) {
    clearExceriseButtonColor();
    switch (action) {
        case "play":
            $('.fa-play').parent().addClass('activeBtn');
            $('#tranposeRepitions li').first().addClass('activeBtn');
            break;
        case "backward":
            $('.fa-play').parent().addClass('activeBtn');
            $('.fa-step-backward').parent().addClass('activeBtn');
            break;
        case "forward":
            $('.fa-play').parent().addClass('activeBtn');
            $('.fa-step-forward').parent().addClass('activeBtn');
            break;
        case "pause":
            $('.fa-pause').parent().addClass('activeBtn');
            break;
        case "stop":
            $('.fa-stop').parent().addClass('activeBtn');
            break;
        default:
            break;
    }
}