function addItemLessonQueue(value) {    
    window.angularComponentReference.zone.run(() => { window.lessonQueueReference.lessonQueueCallback(value); });
}


function mobileTermService(androidCalled = false, isAcceptedTermService = false) {
    try { //android start lesson               
        CSharp.mobileTermService(isAcceptedTermService);
        androidCalled = true;
    } catch (ex) { }
    if (!androidCalled) {
        try { // IOS 
            var result = prompt(isAcceptedTermService);
            if (result != null) {
                document.getElementById("app").innerHTML = "entered in app: " + isAcceptedTermService;
            }
        } catch (ex) { }
    }
}

function mobileStartLesson(androidCalled = false, social = null, userId = null, password = null, role = null, firstName = null) {
    try { //android start lesson
        CSharp.StartLiveLesson(social, userId, password, role, firstName);
        androidCalled = true;
    } catch (ex) { }
    if (!androidCalled) {
        try { // iOS Start lesson
            promptAlert(social, userId, password, role, firstName);
        } catch (ex) { }
    }
}

function promptAlert(social = null, userId = null, password = null, role = null, firstName = null) {
    var result = prompt(social, userId + '_' + password + '_' + role + '_' + firstName);
    if (result != null) {
        document.getElementById("app").innerHTML = "entered in app: " + result;
    }
}

function enableFroalaEditor() {
    $("#divFroalaEditor").froalaEditor("edit.on");
}

function disableFroalaEditor() {
    $("#divFroalaEditor").froalaEditor("edit.off");
}