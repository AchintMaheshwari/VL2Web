(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.lunar = factory();
    }
})(this, function () {

    'use strict';

    var lunar = {};

    lunar.hasClass = function (elem, name) {
        return new RegExp('(\\s|^)' + name + '(\\s|$)').test(elem.attr('class'));
    };

    lunar.addClass = function (elem, name) {
        !lunar.hasClass(elem, name) && elem.attr('class', (!!elem.getAttribute('class') ? elem.getAttribute('class') + ' ' : '') + name);
    };

    lunar.removeClass = function (elem, name) {
        var remove = elem.attr('class').replace(new RegExp('(\\s|^)' + name + '(\\s|$)', 'g'), '$2');
        lunar.hasClass(elem, name) && elem.attr('class', remove);
    };

    lunar.toggleClass = function (elem, name) {
        lunar[lunar.hasClass(elem, name) ? 'removeClass' : 'addClass'](elem, name);
    };

    lunar.className = function (elem, name) {
        elem.attr('class', name);
        console.log('className', elem);
    };

    return lunar;

});

(function ($) {
    var songNo = 0;
    var selectedMidiNo = 0;
    var _ = {

        cursorPoint: function (evt, el) {
            debugger;
            _.settings.pt.x = evt.clientX;
            _.settings.pt.y = evt.clientY;
            var playObject = el.find('svg').attr('id');
            playObject = document.getElementById(playObject);
            return _.settings.pt.matrixTransform(playObject.getScreenCTM().inverse());
        },

        angle: function (ex, ey) {
            debugger;
            var dy = ey - 50; // 100;
            var dx = ex - 50; // 100;
            var theta = Math.atan2(dy, dx); // range (-PI, PI]
            theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
            theta = theta + 90; // in our case we are animating from the top, so we offset by the rotation value;
            if (theta < 0) theta = 360 + theta; // range [0, 360)
            return theta;
        },

        playLibraryMidiFile: function () {
            debugger;
            if (_.settings.currentTime != undefined)
                MIDI.Player.currentTime = _.settings.currentTime;
            MIDI.Player.setAnimation(_.libraryMidiPlayerProgess);
            MIDI.Player.start();
        },

        libraryMidiPlayerProgess: function (event) {
            if (event.progress > 0) {
                var progress = event.progress;
                var currentTime = event.now >> 0;
                var duration = event.end >> 0;

                var el = $(_.settings.thisSelector);
                var obj = el.find(_.settings.progress);

                pc = _.settings.pc,
                    dash = pc - parseFloat(((currentTime / duration) * pc), 10);

                $(obj).css('strokeDashoffset', dash);

                if (currentTime === 0) {
                    $(obj).addClass(obj, 'done');
                    if (obj === $(_.settings.progress)) $(obj).attr('class', 'ended');
                }
            }
        },

        setGraphValue: function (obj, val, el) {
            var audioObj = el.find(_.settings.audioObj),
                pc = _.settings.pc,
                dash = pc - parseFloat(((val / audioObj[0].duration) * pc), 10);
            $(obj).css('strokeDashoffset', dash);
            if (val === 0) {
                $(obj).addClass(obj, 'done');
                if (obj === $(_.settings.progress)) $(obj).attr('class', 'ended');
            }
        },

        reportPosition: function (el, audioId) {
            var progress = el.find(_.settings.progress),
                audio = el.find(_.settings.audioObj);
            _.setGraphValue(progress, audioId.currentTime, el);
        },

        stopAllSounds: function () {
            _.songListsettings[selectedMidiNo].currentTime = MIDI.Player.currentTime;
            MIDI.Player.pause();
            _.songListsettings.forEach(element => {
                var el = $(element.thisSelector);
                if (el.find('[data-play]').attr('class') != undefined) {
                    if (el.find('[data-play]').attr('class').includes('playing')) {
                        el.find('[data-play]').attr('class', 'playable paused');
                    }
                }
            });
            //document.addEventListener('play', function (e) {
            var audios = document.getElementsByTagName('audio');
            for (var i = 0, len = audios.length; i < len; i++) {
                //if (audios[i] != e.target) {
                audios[i].pause();
                $(audios[i]).parent('div').find('.playing').attr('class', 'paused');
                //}
                //if (audios[i] != e.target) $(audios[i]).parent('div').find('.playing').attr('class', 'paused');
            }
            //}, true);
        },

        settings: {},
        songListsettings: [],
        /**
         * Main Function for plugin
         * @param options
         */
        init: function (options) {
            var songId = $(this).attr('class').split('_')[1];

            var template = ['<svg viewBox="0 0 100 100" id="playable' + songId + '" version="1.1" xmlns="http://www.w3.org/2000/svg" width="34" height="34" data-play="playable" class="not-started playable">',
                '<g class="shape">',
                '<circle class="progress-track" cx="50" cy="50" r="45" stroke="#fff" stroke-opacity="1" stroke-linecap="round" fill="none" stroke-width="12"/>',
                //'<circle class="precache-bar" cx="50" cy="50" r="45" stroke="#6f8ebd" stroke-opacity="0.5" stroke-linecap="round" fill="none" stroke-width="12" transform="rotate(-90 50 50)"/>',
                '<circle class="progress-bar" cx="50" cy="50" r="45" stroke="#009EF8" stroke-opacity="1" stroke-linecap="round" fill="none" stroke-width="12" transform="rotate(-90 50 50)"/>',
                '</g>',
            '<circle class="controls' + songId + '" id="' + songNo + '"  cx="50" cy="50" r="45" stroke="none" fill="#000000" opacity="0.0" pointer-events="all"/>',
                '<g class="control pause">',
                '<line x1="40" y1="35" x2="40" y2="65" stroke="#fff" fill="none" stroke-width="8" stroke-linecap="round"/>',
                '<line x1="60" y1="35" x2="60" y2="65" stroke="#fff" fill="none" stroke-width="8" stroke-linecap="round"/>',
                '</g>',
                '<g class="control play">',
                '<polygon style="margin:25px" points="40,30 70,50 40,75" fill="#ffff" stroke-width="0"></polygon>',
                '</g>',
                '<g class="control stop">',
                '<rect x="35" y="35" width="30" height="30" stroke="#009EF8" fill="none" stroke-width="1"/>',
                '</g>',
                '</svg>'];

            template = template.join(' ');

            $.each(this, function (a, b) {
                var audio = $(this).find('audio');
                audio.attr('id', 'audio' + songId);
                template = template.replace('width="34"', 'width="' + audio.data('size') + '"');
                template = template.replace('height="34"', 'height="' + audio.data('size') + '"');
                template = template.replace('id="playable"', 'id="playable' + songId + '"');
                $(this).append(template);

            });

            var svgId = $(this).find('svg').attr('id');
            svgId = document.getElementById(svgId);

            _.defaults = {
                this: this,
                thisSelector: '.' + $(this).attr('class').split(' ')[1], //this.selector.toString(),
                playObj: 'playable' + songId,
                progress: '.progress-bar',
                precache: '.precache-bar',
                audioObj: '.audio' + songId,
                controlsObj: '.controls' + songId,
                pt: svgId.createSVGPoint(),
                pc: 298.1371428256714, // 2 pi r                   
                midiPlayer: {},// MIDI.Player,
                midiData: null,
                src: null,
            };

            lunar = {};

            _.settings = $.extend({}, _.defaults, options);
            _.songListsettings.push(_.settings);
            $('.controls' + songId).on('click', function (e) {
                _.settings = _.songListsettings[e.currentTarget.id];
                var el = $(_.settings.thisSelector);

                var obj = {
                    el: el,
                    activeAudio: el.find(_.settings.audioObj),
                    playObj: el.find('[data-play]'),
                    precache: el.find(_.settings.precache)
                };

                obj.class = obj.playObj.attr('class');
                _.stopAllSounds();
                switch (obj.class.replace('playable', '').trim()) {
                    case 'not-started':
                        //_.stopAllSounds();
                        _.settings.src = obj.activeAudio[0].currentSrc;
                        if (_.settings.src != '') {
                            if (_.settings.src.toString().includes(".mid") != true) {
                                obj.activeAudio[0].play();
                                var audioId = document.getElementById(obj.activeAudio.attr('id'));
                                audioId.addEventListener('timeupdate', function (e) {
                                    _.reportPosition(el, audioId)
                                });
                            }
                            else {
                                console.log(e.currentTarget.id);
                                MIDI.Player.loadFile(_.settings.src, _.playLibraryMidiFile, null, null);
                            }
                            obj.playObj.attr('class', 'playing');
                        }
                        break;
                    case 'playing':
                        if (_.settings.src.toString().includes(".mid") != true) {
                            obj.activeAudio[0].pause();
                            $(audioId).off('timeupdate');
                        }
                        else {
                            _.settings.currentTime = MIDI.Player.currentTime;
                            MIDI.Player.pause();
                        }
                        obj.playObj.attr('class', 'playable paused');
                        break;
                    case 'paused':
                        if (_.settings.src.toString().includes(".mid") != true)
                            obj.activeAudio[0].play();
                        else {
                            _.stopAllSounds();
                            MIDI.Player.loadFile(_.settings.src, _.playLibraryMidiFile, null, null);
                            //_.settings.midiPlayer.data = _.settings.midiData;                                 
                            //_.settings.midiPlayer.start();
                            //MIDI.Player = _.settings.midiPlayer;
                            //MIDI.Player.start();
                        }
                        obj.playObj.attr('class', 'playable playing');
                        break;
                    case 'ended':
                        obj.playObj.attr('class', 'not-started playable');
                        obj.activeAudio.off('timeupdate', _.reportPosition);
                        break;
                }
                selectedMidiNo = parseInt(e.currentTarget.id);
            });
            songNo = songNo + 1;
            $(_.defaults.audioObj).on('progress', function (e) {
                if (this.buffered.length > 0) {
                    var end = this.buffered.end(this.buffered.length - 1);
                    var cache = $(e.currentTarget).parent().find(_.settings.precache),
                        el = $(this).closest($(_.settings.thisSelector));
                    _.setGraphValue(cache, end, el);
                }
            });

        }

    };

    // Add Plugin to Jquery
    $.fn.mediaPlayer = function (methodOrOptions) {
        if (_[methodOrOptions]) {
            return _[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return _.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.mediaPlayer');
        }
    };

    $.fn.clearSongList = function () {
        var audios = document.getElementsByTagName('audio');
        for (var i = 0, len = audios.length; i < len; i++) {
            audios[i].pause();
            $(audios[i]).parent('div').find('.playing').attr('class', 'paused');
        }
        songNo = 0;
        selectedMidiNo = 0;
        _.songListsettings = [];
        MIDI.Player.stop();
    };

})(jQuery);