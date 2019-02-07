var VoicelessonsGuidedVideoPlayer = VoicelessonsGuidedVideoPlayer || {};
VoicelessonsGuidedVideoPlayer = {
    http: null,
    element: null,
    sanitizer: null,
    validYouTubeOptions: [
        'default',
        'mqdefault',
        'hqdefault',
        'sddefault',
        'maxresdefault'
    ],
    validVimeoOptions: [
        'thumbnail_small',
        'thumbnail_medium',
        'thumbnail_large'
    ],
    validDailyMotionOptions: [
        'thumbnail_60_url',
        'thumbnail_120_url',
        'thumbnail_180_url',
        'thumbnail_240_url',
        'thumbnail_360_url',
        'thumbnail_480_url',
        'thumbnail_720_url',
        'thumbnail_1080_url'
    ],
    init: function (element, url, tittle, options, guidedVideo = false) {        
        this.element = element;
        let strHtml = ''; //this.drawPlayerTool(element,guidedVideo);        
        if (url.includes('.mp4') && !(!!window.chrome && !!window.chrome.webstore)) {
            // strHtml += '<div id="divJwPlayer" style="width: 620px !important; height: 270px !important; margin-left: -50px;"></div>';
            strHtml += '<div id="divJwPlayer"></div>';
            $(element).html(strHtml);
            this.playMP4(url);
        }
        else {
            this.embed(url, options, element);

            //let embedUrl = this.embed(url, options);
            //strHtml += embedUrl
            //$(element).html(strHtml);
        }
        $('#lblVideoItemId').html(tittle); $('#txtVideoItemId').val(tittle);
    },

    playMP4: function (url) {
        let playList = [];
        playList.push({
            "file": url,
            "image": "../../../../assets/images/caro-video-img.jpg",
        });

        jwplayer('divJwPlayer').setup({
            title: 'Player Test',
            playlist: playList,
            aspectratio: '16:9',
            mute: false,
            autostart: false,
            primary: 'html5',
            nextUpDisplay: true,
            displaytitle: true,
            displaydescription: true,
            visualplaylist: false,
        });
    },
    embed: function (url, options, element) {        
        var isVideoAvailable = false;
        var id;
        url = new URL(url);
        id = this.detectYoutube(url);
        if (id) {
            isVideoAvailable = true;
            $(element).html(this.embed_youtube(id, options));
        }
        id = this.detectVimeo(url);
        if (id) {
            isVideoAvailable = true;
            $(element).html(this.embed_vimeo(id, options));
        }
        id = this.detectDailymotion(url);
        if (id) {
            isVideoAvailable = true;
            $(element).html(this.embed_dailymotion(id, options));
        }

        id = this.detectWistia(url);
        if (id) {
            isVideoAvailable = true;
            $(element).html(this.embed_Wistia(id, options));
        }
        else if (!isVideoAvailable) {
            if (window.location.href.includes('teacher/video-library') || window.location.href.includes('student/guidedvideofeedback')
                    || window.location.href.includes('/student/videofeedback')) {
                if (window.location.href.includes('student/guidedvideofeedback')) {                                        
                    $('#videoPlayer').removeAttr('src');                    
                    $('#videoPlayer').hide();
                    $('#divVideoPlayer').show();                    
                    $('#divVideoPlayer').html("<video width='100%' controls> <source src='" + url.href + "' type='video/mp4'></video>");
                }
                else{
                    $(element).show();
                    $(element).html("<video width='100%' controls> <source src='" + url.href + "' type='video/mp4'></video>");
                }
            }
            else {
                $(element).removeAttr('src');
                $(element).html("<video width='30%' controls> <source src='" + url.href + "' type='video/mp4'></video>");
            }
        }
    },
    drawPlayerTool: function (element, guidedVideo = false) {
        if (guidedVideo) {
            return "<div id='playerContainer'></div>";
        }
        else {
            var strHtml = '<div id="playerContainer"><div class="playerTrack"><ul><li><span class="prev"><a href="javascript:void(0);" onclick="playNextVideo();"><i class="fa fa-angle-left"></i></a></span><div class="trackDetail">';
            strHtml += '<label id="lblVideoItemId" onclick="videoItemClick();" style="width: calc(100% - 80px); text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"> </label>';
            strHtml += '<input maxlength="50" id="txtVideoItemId" class="editLibLabel" onblur="videoItemNameBlur();" onchange="videoItemNameChanged();" type="text" value=""/> ';
            strHtml += '</div><span class="next"><a href="javascript:void(0);" onclick="playNextVideo();"><i class="fa fa-angle-right"></i></a></span></li></ul></div>'
            return strHtml;
        }
    },
    embed_youtube: function (id, options) {
        options = this.parseOptions(options);
        var queryString;
        if (options && options.hasOwnProperty('query')) {
            queryString = '?' + this.serializeQuery(options.query);
        }
        $(this.element).attr('src', "https://www.youtube.com/embed/" + id + options.query + options.attr);
        $(this.element).find('iframe').attr('src', "https://www.youtube.com/embed/" + id + options.query + options.attr);
        return;

        return this.sanitize_iframe('<iframe src="https://www.youtube.com/embed/'
            + id + options.query + '"' + options.attr
            + ' frameborder="0" allowfullscreen></iframe>');
    },
    embed_vimeo: function (id, options) {
        options = this.parseOptions(options);
        var queryString;
        if (options && options.hasOwnProperty('query')) {
            queryString = '?' + this.serializeQuery(options.query);
        }
        $(this.element).attr('src', "https://player.vimeo.com/video/" + id + options.query + options.attr);
        return;
        return this.sanitize_iframe('<iframe width="480px" height="270px" src="https://player.vimeo.com/video/'
            + id + options.query + '"' + options.attr
            + ' frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
    },
    embed_dailymotion: function (id, options) {
        options = this.parseOptions(options);
        var queryString;
        if (options && options.hasOwnProperty('query')) {
            queryString = '?' + this.serializeQuery(options.query);
        }
        $(this.element).attr('src', "https://www.dailymotion.com/embed/video/" + id + options.query + options.attr);
        return;
        return this.sanitize_iframe('<iframe width="620px" height="270px" style="margin:0px 0px 0px -50px;" src="https://www.dailymotion.com/embed/video/'
            + id + options.query + '"' + options.attr
            + ' frameborder="0" allowfullscreen></iframe>');
    },

    embed_Wistia: function (id, options) {
        options = this.parseOptions(options);
        var queryString;
        if (options && options.hasOwnProperty('query')) {
            queryString = '?' + this.serializeQuery(options.query);
        }
        $(this.element).attr('src', "http://fast.wistia.net/embed/iframe/" + id + options.query + options.attr);
        return;
        return this.sanitize_iframe('<iframe width="620px" height="270px" style="margin:0px 0px 0px -50px;" src="http://fast.wistia.net/embed/iframe/'
            + id + options.query + '"' + options.attr
            + ' frameborder="0" allowfullscreen></iframe>');
    },

    embed_image: function (url, options) {
        var id;
        url = new URL(url);
        id = this.detectYoutube(url);
        if (id) {
            return this.embed_youtube_image(id, options);
        }
        id = this.detectVimeo(url);
        if (id) {
            return this.embed_vimeo_image(id, options);
        }
        id = this.detectDailymotion(url);
        if (id) {
            return this.embed_dailymotion_image(id, options);
        }
    },
    embed_youtube_image: function (id, options) {
        if (typeof options === 'function') {
            options = {};
        }
        options = options || {};
        options.image = VoicelessonsGuidedVideoPlayer.validYouTubeOptions.indexOf(options.image) > 0 ? options.image : 'default';
        var src = 'https://img.youtube.com/vi/' + id + '/' + options.image + '.jpg';
        var result = {
            link: src,
            html: '<img src="' + src + '"/>'
        };
        return new Promise(function (resolve, reject) {
            resolve(result);
        });
    },
    embed_vimeo_image: function (id, options) {
        if (typeof options === 'function') {
            options = {};
        }
        options = options || {};
        options.image = VoicelessonsGuidedVideoPlayer.validVimeoOptions.indexOf(options.image) >= 0 ? options.image : 'thumbnail_large';
        return this.http.get('https://vimeo.com/api/v2/video/' + id + '.json')
            .map(function (res) {
                return {
                    'link': res.json()[0][options.image],
                    'html': '<img src="' + res.json()[0][options.image] + '"/>'
                };
            })
            .toPromise()
            .catch(function (error) { return console.log(error); });
    },
    embed_dailymotion_image: function (id, options) {
        if (typeof options === 'function') {
            options = {};
        }
        options = options || {};
        options.image = VoicelessonsGuidedVideoPlayer.validDailyMotionOptions.indexOf(options.image) >= 0 ? options.image : 'thumbnail_480_url';
        return this.http.get('https://api.dailymotion.com/video/' + id + '?fields=' + options.image)
            .map(function (res) {
                return {
                    'link': res.json()[options.image],
                    'html': '<img src="' + res.json()[options.image] + '"/>'
                };
            })
            .toPromise()
            .catch(function (error) { return console.log(error); });
    },
    parseOptions: function (options) {
        var queryString = '', attributes = '';
        if (options && options.hasOwnProperty('query')) {
            queryString = '?' + this.serializeQuery(options.query);
        }
        if (options && options.hasOwnProperty('attr')) {
            var temp_1 = [];
            Object.keys(options.attr).forEach(function (key) {
                temp_1.push(key + '="' + (options.attr[key]) + '"');
            });
            attributes = ' ' + temp_1.join(' ');
        }
        return {
            query: queryString,
            attr: attributes
        };
    },
    serializeQuery: function (query) {
        var queryString = [];
        for (var p in query) {
            if (query.hasOwnProperty(p)) {
                queryString.push(encodeURIComponent(p) + '=' + encodeURIComponent(query[p]));
            }
        }
        return queryString.join('&');
    },
    sanitize_iframe: function (iframe) {
        //return this.sanitizer.bypassSecurityTrustHtml(iframe);        
        return iframe; //this.validateString(iframe);
    },

    validateString: function (string) {

        var validity = true;

        if (string == '') { validity = false; }

        if (string.match(/[ |<|,|>|\.|\?|\/|:|;|"|'|{|\[|}|\]|\||\\|~|`|!|@|#|\$|%|\^|&|\*|\(|\)|_|\-|\+|=]+/) != null) {

            validity = false;
        }

        return validity;
    },

    detectVimeo: function (url) {
        return (url.hostname === 'vimeo.com') ? url.pathname.split('/')[1] : null;
    },
    detectYoutube: function (url) {
        if (url.hostname.indexOf('youtube.com') > -1) {
            return url.search.split('=')[1];
        }
        if (url.hostname.includes('youtu')) {
            return url.pathname.replace('/', '');
        }
        return '';
    },

    detectWistia: function (url) {
        if (url.hostname.includes('wistia')) {
            //return url.pathname.split('/')[1];
            return url.pathname.split('/')[2];
        }
        return '';
    },

    detectDailymotion: function (url) {
        if (url.hostname.indexOf('dailymotion.com') > -1) {
            return url.pathname.split('/')[2].split('_')[0];
        }
        if (url.hostname === 'dai.ly') {
            return url.pathname.split('/')[1];
        }
        return '';
    },
}

function playNextVideo() {
    window.angularComponentReference.zone.run(() => { window.angularComponentReference.playNextItem(); });
}

function videoItemNameChanged() {
    if (localStorage.getItem('userRole') == 'Teacher') {
        var itemName = $('#txtVideoItemId').val();
        window.angularComponentReference.zone.run(() => { window.angularComponentReference.renameItems(itemName); });
    }
}

function videoItemClick() {
    if (localStorage.getItem('userRole') == 'Teacher'){
        $('#lblVideoItemId').hide(); $('#txtVideoItemId').show();
        $('#txtVideoItemId').focus();
    }
}

function videoItemNameBlur() {
    $('#lblExceriseItemId').show(); $('#exceriseItemId').hide();
    $('#lblSongItemId').show(); $('#txtSongItemId').hide();
    $('#lblVideoItemId').show(); $('#txtVideoItemId').hide();
};