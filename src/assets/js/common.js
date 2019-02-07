$(document).ready(function() {
});

    function openKeysApp() {
    window.resizeTo(screen.width+15, parseInt(screen.height * 0.739));
    var executablePath = "";
    var mac = false;
    if (navigator.platform.indexOf('Mac') >= 0)
    { mac = true; }
    console.log("check platform type and truth value " + navigator.platform + " " + mac);
    if (mac) {
    var child = require('child_process').exec('open /Applications/VoiceLessons/Keys.app/', function (err, data) {
    if (err)
    { alert("Unable to launch Keys on MAC."); return; }
    });
    }
    else {
    executablePath = "C:Program Files (x86)\\VoiceLessons Keys.exe";
    var child = require('child_process').execFile;
    child(executablePath,
    { cwd: 'C:\\Program Files (x86)\\VoiceLessons\\' }
    , function (err, data) {
    if (err)
    { alert("Unable to launch Keys."); return; }
    });
    }
    }