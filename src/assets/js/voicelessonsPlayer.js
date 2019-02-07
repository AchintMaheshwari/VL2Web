var VoiceLessons = VoiceLessons || {};
VoiceLessons = {
    const: initDrawPlayerTool = 0,
    options: null,
    audio: null,
    currentSongNo: 0,
    callback: null,
    fileType: null,
    playerMidi: null,
    AudioPlayer: function(element, option, callback, playSongNo = 0, type = 'song') {
        this.playerMidi = MIDI.Player;
        currentSongNo = playSongNo;
        this.fileType = type;
        //====== check dependecy ==============
        this.options = option;
        initDrawPlayerTool = 0;
        this.callback = callback;
        checkDependency(element);
    },
    destoryPlayer: function() {
        if (VoiceLessons.audio != null) {
            VoiceLessons.audio.currentTime = 0;
            VoiceLessons.audio.pause();
        }
        if (VoiceLessons.playerMidi != null) {
            VoiceLessons.playerMidi.stop();
        }
    }
}

function playMidiFile() {
    VoiceLessons.playerMidi.setAnimation(midiPlayerProgess);
    VoiceLessons.playerMidi.start();
}

function checkDependency(element) {

    if (!window.jQuery) {
        var jqueryScript = document.createElement("script");
        jqueryScript.type = "text/javascript";
        jqueryScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js";
        document.head.appendChild(jqueryScript);

        initDrawPlayerTool = setInterval(() => {
            try {
                debugger
                if (initDrawPlayerTool == 0) {
                    clearInterval(initDrawPlayerTool);
                    drawPlayerTool(element);
                    initEvents();
                    init();
                    showDuration();
                    if (VoiceLessons.fileType == 'song') {
                        audioPlay();
                        playerButtonColor('play');
                    }
                    clearInterval(initDrawPlayerTool);
                }
            } catch (e) {}
        }, 2000);
    } else {
        if (VoiceLessons.fileType == 'song') {
            if (VoiceLessons.audio != null) {
                VoiceLessons.audio.pause();
                VoiceLessons.audio.currentTime = 0;
            }
        }
        drawPlayerTool(element);
        init();
        initEvents();
        if (VoiceLessons.fileType == 'song') {
            audioPlay();
        }
        playerButtonColor('play');
        showDuration();
    }

    if (!findCss("font-awesome") && !findCss("font-awesome.min")) {
        var fontAwesome = document.createElement("link");
        fontAwesome.type = "text/css";
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css";
        fontAwesome.media = 'all';
        document.head.appendChild(fontAwesome);
        //$('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" type="text/css" />');
    }
}

function init(song) {
    var audioSong = null;

    if (song == undefined && currentSongNo > -1)
        audioSong = VoiceLessons.options[currentSongNo];
    else
        audioSong = song;
    console.log(audioSong);
    $('#lblSongItemId').html(audioSong.tittle);
    $('#txtSongItemId').val(audioSong.tittle);
    VoiceLessons.fileType = audioSong.src.substring(audioSong.src.length - 4) == '.mid' ? 'mid' : 'song';
    if (audioSong.src.indexOf('midi;base64') > -1) VoiceLessons.fileType = 'mid';
    if (VoiceLessons.fileType == 'song') {
        if (VoiceLessons.audio == null)
            VoiceLessons.audio = new Audio(audioSong.src);
        else
            VoiceLessons.audio.src = audioSong.src;
        VoiceLessons.audio.preload = 'auto'
    } else {
        VoiceLessons.playerMidi.transpose = 0;
        VoiceLessons.playerMidi.loadFile(audioSong.src, playMidiFile, null, null);
    }

    $('.jumpto').html('');
    if (audioSong.jumpPoints != '' && audioSong.jumpPoints != null)
        if (audioSong.jumpPoints.length > 0 && audioSong.jumpPoints[0].point != "" && audioSong.jumpPoints[0].point != undefined)
            bindJumpPoints(audioSong.jumpPoints);
}

function bindJumpPoints(jumpPoints) {
    var strHtml = '<ul><li><label>Jump to</label></li>';
    jumpPoints.forEach(element => {
        if (element.point != null && element.point != undefined)
            strHtml += '<li><label><a href="javascript:void(0);">' + element.point + ' - ' + element.name + '</a></label></li>';
    });
    strHtml += "</ul>";
    $('.jumpto').html(strHtml);
    pointClickEvent();
}

function initEvents() {

    $('.progress').click(function(e) {
        var totalWidth = parseFloat($('.progress').css('width').replace('px', ''));
        var inputDurationPercentage = ((e.offsetX / totalWidth) * 100)
        playerButtonColor('play');
        if (VoiceLessons.fileType == 'song') {
            //VoiceLessons.audio.load();
            //VoiceLessons.audio.currentTime = 0;
            //VoiceLessons.audio.load;
            //VoiceLessons.audio.pause();            
            VoiceLessons.audio.currentTime = parseInt((VoiceLessons.audio.duration * inputDurationPercentage) / 100);
            //audioPlay();
            showDuration();
        } else {
            VoiceLessons.playerMidi.pause();
            VoiceLessons.playerMidi.currentTime = parseInt((VoiceLessons.playerMidi.endTime * inputDurationPercentage) / 100);
            VoiceLessons.playerMidi.start();
        }
    });

    $('.fa-step-backward').parent().click(function() {
        if (VoiceLessons.fileType == 'song') {
            VoiceLessons.audio.currentTime -= 30;
            showDuration();
            VoiceLessons.audio.play();
        } else {
            VoiceLessons.playerMidi.pause();
            VoiceLessons.playerMidi.currentTime -= 10000;
            VoiceLessons.playerMidi.start();
        }
        playerButtonColor('backward');
    });

    $('.fa-step-forward').parent().click(function() {
        if (VoiceLessons.fileType == 'song') {
            VoiceLessons.audio.currentTime += 30;
            showDuration();
            if (VoiceLessons.fileType == 'song') {
                VoiceLessons.audio.play();
            }
        } else {
            VoiceLessons.playerMidi.pause();
            VoiceLessons.playerMidi.currentTime += 10000;
            VoiceLessons.playerMidi.start();
        }
        playerButtonColor('forward');
    });

    //Next button
    $('.fa-angle-right').parent().click(function() {
        window.angularComponentReference.zone.run(() => { window.angularComponentReference.playNextItem(); });
        return;
        playSongsAuto();
    });

    //Prev button
    $('.fa-angle-left').parent().click(function() {

        window.angularComponentReference.zone.run(() => { window.angularComponentReference.playPreviousItem(); });
        return;

        VoiceLessons.audio.pause();
        if (VoiceLessons.currentSongNo > 0)
            VoiceLessons.currentSongNo = VoiceLessons.currentSongNo - 1;
        else if (VoiceLessons.currentSongNo == 0)
            VoiceLessons.currentSongNo = Object.keys(VoiceLessons.options).length - 1;
        init(VoiceLessons.options[VoiceLessons.currentSongNo])
            //init(settings[0])
        if (VoiceLessons.fileType == 'song')
            audioPlay();

        playerButtonColor('play');
        showDuration();
        //('.jumpto li')
    });

    //Volume control
    $('#volume').change(function() {
        VoiceLessons.audio.volume = parseFloat(this.value / 10);
    });

    $('.fa-play').click(function() {
        if (VoiceLessons.fileType == 'song') {
            if (VoiceLessons.fileType == 'song') {
                VoiceLessons.audio.play();
            }
            showDuration();
        } else {
            VoiceLessons.playerMidi.start();
        }
        playerButtonColor('play');
    })

    $('.fa-pause').click(function() {
        if (VoiceLessons.fileType == 'song') {
            VoiceLessons.audio.pause();
        } else
            VoiceLessons.playerMidi.pause();
        playerButtonColor('pause');
    });

    $('.fa-stop').click(function() {
        if (VoiceLessons.fileType == 'song') {
            VoiceLessons.audio.pause();
            VoiceLessons.audio.currentTime = 0;
        } else {
            $('.progress-bar-striped').css('width', 0 + '%');
            VoiceLessons.playerMidi.stop();
        }
        playerButtonColor('stop');
    });
}

function pointClickEvent() {
    $('.jumpto li').click(function() {
        VoiceLessons.audio.pause();
        var point = $(this)[0].innerText;
        VoiceLessons.audio.currentTime = parseFloat(point.split(' - ')[0]);
        showDuration();
        playerButtonColor('play');
        audioPlay();
    });
}

function audioPlay() {
    VoiceLessons.audio.load();
    var playPromise = VoiceLessons.audio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
                //VoiceLessons.audio.play();
            })
            .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
            });
    }
}

function midiPlayerProgess(event) {
    if (event.progress > 0) {
        var progress = event.progress;
        var currentTime = event.now >> 0;
        var duration = event.end >> 0;
        $('.traceDuration').html(getMinutes(currentTime) + '/' + getMinutes(duration + 1));

        $('.progress-bar-striped').css('width', (event.progress * 100) + '%');
        if (VoiceLessons.playerMidi.currentTime == VoiceLessons.playerMidi.endTime) {
            window.angularComponentReference.zone.run(() => { window.angularComponentReference.voiceLessonsMusicCallback(VoiceLessons.options[currentSongNo]); });
        }
    }
}

function showDuration() {
    $(VoiceLessons.audio).bind('timeupdate', function() {
        //Get hours and minutes
        var s = parseInt(VoiceLessons.audio.currentTime % 60);
        var m = parseInt(VoiceLessons.audio.currentTime / 60) % 60;
        if (s < 10) {
            s = '0' + s;
        }
        if (VoiceLessons.audio.duration > 0)
            $('.traceDuration').html(m + ':' + s + '/' + (VoiceLessons.audio.duration / 60).toFixed(2).replace('.', ':'));
        var value = 0;
        if (VoiceLessons.audio.currentTime > 0) {
            value = ((100 / VoiceLessons.audio.duration) * VoiceLessons.audio.currentTime);
        }
        $('.progress-bar-striped').css('width', value + '%');
        if (VoiceLessons.audio.currentTime == VoiceLessons.audio.duration) {
            // play next song Auto
            playSongsAuto();
            //VoiceLessons.callback(VoiceLessons.options[currentSongNo])
            window.angularComponentReference.zone.run(() => { window.angularComponentReference.voiceLessonsMusicCallback(VoiceLessons.options[currentSongNo]); });
        }
    });
}

function playSongsAuto() {
    try {
        VoiceLessons.audio.pause();
        VoiceLessons.audio.currentTime = 0;
        if (VoiceLessons.currentSongNo < Object.keys(VoiceLessons.options).length - 1)
            VoiceLessons.currentSongNo = VoiceLessons.currentSongNo + 1;
        else if (VoiceLessons.currentSongNo == Object.keys(VoiceLessons.options).length - 1)
            VoiceLessons.currentSongNo = 0;
        init(VoiceLessons.options[VoiceLessons.currentSongNo])
        audioPlay();
        showDuration();
        playerButtonColor('play');
    } catch (err) {}
}

function drawPlayerTool(element) {
    var strHtml = '<div id="playerContainer"><div class="playerTrack"><ul><li><span class="prev"><a href="javascript:void(0);"><i class="fa fa-angle-left"></i></a></span><div class="trackDetail">';
    //strHtml += '<label id="lblSongItemId" onclick="songItemClick();"> </label>';
    //strHtml += '<input id="txtSongItemId" onchange="songItemNameChanged();" type="text" value="" style="width:200px; display:none;"/> ';

    strHtml += '<label id="lblSongItemId" onclick="songItemClick();" style="width: calc(100% - 80px); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"> </label>';
    strHtml += '<input maxlength="50" id="txtSongItemId" class="editLibLabel" onblur="songItemNameBlur();" onchange="songItemNameChanged();" type="text" value=""/> ';

    strHtml += '</div><span class="next"><a href="javascript:void(0);"><i class="fa fa-angle-right"></i></a></span></li></ul></div>'
        //strHtml += '<div onclick="downloadFile('+VoiceLessons.options[currentSongNo].src+')">download-MP3</div>';
    strHtml += '<div class="jumpto"><ul><li><label>Jump to</label></li><li><a href="javascript:void(0);">0:43 - Verse 2</a></li><li>'
    strHtml += '<a href="javascript:void(0);">1:52 - Chorus</a></li><li><a href="javascript:void(0);">2:15 - Bridge</a></li><li><a href="javascript:void(0);">3:37 - Rehearsal B</a></li></ul></div><div class="progress">'
    strHtml += '<div id="progress-bar" class="progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 0%"><span class="sr-only">40% Complete (success)</span></div></div>'
    strHtml += '<div class="playerControls"><ul class="buttons"><li><i class="fa fa-step-backward"></i></li><li id="playMusicPlayer"><i class="fa fa-play"></i></li><li><i class="fa fa-step-forward"></i></li><li><i class="fa fa-pause"></i></li><li><i class="fa fa-stop"></i></li></ul>'
        // strHtml += '<ul class="traceStatus"><li><label class="traceDuration">0:00 / 0:00</label></li><li><img src="https://vlapp2.azurewebsites.net/assets/images/music-icon.png" alt=""></li><li><img src="https://vlapp2.azurewebsites.net/assets/images/file-icon.png" alt=""></li></ul><div style="clear: both;"></div></div></div>'
    strHtml += '<ul class="traceStatus"><li><label class="traceDuration">0:00 / 0:00</label></li></ul><div style="clear: both;"></div></div></div>'

    // strHtml += '<link href="https://vlapp2.azurewebsites.net/assets/css/player.css" type="text/css" rel="stylesheet">'

    $(element).html(strHtml);
}

function songItemNameBlur() {
    $('#lblExceriseItemId').show();
    $('#exceriseItemId').hide();
    $('#lblSongItemId').show();
    $('#txtSongItemId').hide();
    $('#lblVideoItemId').show();
    $('#txtVideoItemId').hide();
};

function songItemNameChanged() {
    if (window.location.hash.includes('student/videoConnected') || window.location.hash.includes('teacher/videoConnected') || window.location.hash.includes('lesson-planner/library')) {
        var itemName = $('#txtSongItemId').val();
        window.angularComponentReference.zone.run(() => { window.angularComponentReference.renameItems(itemName); });
    }
}

function songItemClick() {
    if (window.location.hash.includes('student/videoConnected') || window.location.hash.includes('teacher/videoConnected') || window.location.hash.includes('lesson-planner/library')) {
        $('#lblSongItemId').hide();
        $('#txtSongItemId').show();
        $('#txtSongItemId').focus();
    }
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

function clearButtonColor() {
    $('.fa-play').parent().removeClass('activeBtn');
    $('.fa-step-backward').parent().removeClass('activeBtn');
    $('.fa-step-forward').parent().removeClass('activeBtn');
    $('.fa-pause').parent().removeClass('activeBtn');
    $('.fa-stop').parent().removeClass('activeBtn');
}

function playerButtonColor(action) {
    clearButtonColor();
    switch (action) {
        case "play":
            $('.fa-play').parent().addClass('activeBtn');
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
//convert Second to Minite
function getMinutes(s) {
    return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
}