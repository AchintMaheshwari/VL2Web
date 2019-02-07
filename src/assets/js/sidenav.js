$(document).ready(function() {
    function t() {
        $(".photo--lightbox a").colorbox({
            photo: !0,
            scalePhotos: !0,
            maxHeight: "90%",
            maxWidth: "90%",
            transition: "none",
            fadeOut: 0
        });
        var t = $(".photoset-grid, this").attr("data-gutter");
        $(".photoset-grid, this").photosetGrid({
            highresLinks: !0,
            rel: "",
            gutter: t + "px",
            onComplete: function() {
                $(".photoset-grid.lightbox").attr("style", ""), $(".photoset-grid.lightbox a").colorbox({
                    photo: !0,
                    scalePhotos: !0,
                    maxHeight: "90%",
                    maxWidth: "90%",
                    transition: "none",
                    fadeOut: 0,
                    title: function() {
                        return $("img", this).attr("alt")
                    }
                }), $(".photoset-grid.lightbox").each(function() {
                    var t = $(this).attr("data-id");
                    $(this).find(".photoset-cell").attr("rel", t)
                }), $(".photoset-grid.post").each(function() {
                    var t = $(this).attr("data-post");
                    $(this).find(".photoset-cell").attr("href", t)
                }), $(".photoset-grid.none").each(function() {
                    $(this).find(".photoset-cell").attr("href", "")
                })
            }
        })
    }

    function e() {
        $(".type_photo.double_size img:not(.photoset-grid img)").each(function() {
            var t = $(this).data("highres");
            $(this).attr("src", t)
        })
    }

    function s() {
        $(".video-container, this").each(function() {
            var t = $(this),
                e = t.children("iframe");
            if (e.length > 0) {
                var s = e.attr("width"),
                    i = e.attr("height"),
                    o = i / s * 100;
                t.css({
                    "padding-bottom": o + "%"
                });
                var a = e.attr("src").split("/"),
                    n = a[2];
                "instagram.com" === n && (t.css({
                    "padding-top": 60
                }), t.parent().css({
                    "max-width": 620
                })), t.addClass("ready")
            } else {
                var r = t.children("a"),
                    d = r.width(),
                    c = r.height(),
                    l = c / d * 100;
                t.css({
                    "padding-bottom": l + "%"
                }), r.css({
                    position: "absolute",
                    width: "100%",
                    height: "100%"
                }), r.children("div").css({
                    "background-size": 50
                }), t.addClass("ready")
            }
        })
    }

    function i() {
        $(".the-posts article").each(function() {
            t(), s(), e()
        })
    }

    function o() {
        var t = $(".instagram-token").text(),
            e = parseInt(t.split(".")[0], 10),
            s = new Instafeed({
                get: "user",
                userId: e,
                accessToken: t,
                clientId: "11d9b23c34d547feb08648dce2ba0eb6",
                resolution: "standard_resolution",
                limit: 9,
                target: "instagram-feed",
                template: '<a class="instagram-image" href="{{link}}" target="_blank"><img src="{{image}}" /><span class="overlay"><i class="social-instagram"></i></span></a>',
                after: function() {
                    $(".instagram-feed").addClass("on"), a()
                }
            });
        if ($(".instagram-feed").length && $("body.index:not(.tagged,.search)").length) {
            var i = $(".instagram-order").text();
            i < $("article:visible").length ? $(".the-posts .posts-grid article:nth-of-type(" + i + ")").after($(".instagram-feed")) : $(".the-posts .posts-grid article.type_description").after($(".instagram-feed")), s.run()
        } else a()
    }

    function a() {
        "none" === $(".grid-sizer").css("clear") && $(".the-posts .posts-grid article").length > 0 ? $(".the-posts .posts-grid").imagesLoaded(function() {
            $(".the-posts article").length > 0 && ($(".the-posts .posts-grid").masonry({
                itemSelector: "article",
                columnWidth: ".the-posts .grid-sizer",
                hiddenStyle: {
                    transform: "translateY(50%)"
                },
                visibleStyle: {
                    opacity: 1,
                    transform: "translateY(0)"
                }
            }), $(".description-wrap.typist").length || $(".the-posts .posts-grid").addClass("on"), $(".description-wrap.typist").length && $("body.index.tagged,body.index.search").length && $(".the-posts .posts-grid").addClass("on"))
        }) : ($(".description-wrap.typist").length || $(".the-posts .posts-grid").addClass("on"), $(".description-wrap.typist").length && $("body.index.tagged,body.index.search").length && $(".the-posts .posts-grid").addClass("on"))
    }

    function n() {
        if (!$(".type_pagination").hasClass("pagination_standard")) {
            var i = $(".load-more-loading").text(),
                o = $(".load-more-end").text();
            $(".the-posts .posts-grid").infinitescroll({
                navSelector: ".pagination",
                nextSelector: ".pagination a.next",
                itemSelector: ".the-posts .posts-grid article",
                bufferPx: 10,
                loading: {
                    selector: ".type_pagination .load-more",
                    speed: 0,
                    msgText: i,
                    finishedMsg: o,
                    finished: function() {
                        $("#infscr-loading").hide(), $(".pagination_load-more").removeClass("loading")
                    }
                },
                errorCallback: function() {
                    $(".type_pagination").addClass("off"), $(".type_pagination").removeClass("current"), $(".type_pagination").prev(".scrollable").addClass("current"), $("#infscr-loading").show(), setTimeout(function() {
                        $(".type_pagination").addClass("hidden")
                    }, 2640)
                }
            }, function(i, o) {
                var a = $(i).css({
                    opacity: 0
                });
                $("body.sticky-posts:not(.tagged, .search)").length > 0 && $("article." + m + ":not(.sticky-show)").remove(), t(), s(), e(), window.twttr.widgets.load(), a.imagesLoaded(function() {
                    $(".the-posts .posts-grid").masonry("appended", a, !0)
                });
                var n = o.state.currPage;
                Tumblr.LikeButton.get_status_by_page(n), $(".dsq-comment-count").length > 0 && ! function() {
                    var t = document.createElement("script");
                    t.async = !0, t.type = "text/javascript", t.src = "//" + disqus_shortname + ".disqus.com/count.js", (document.getElementsByTagName("HEAD")[0] || document.getElementsByTagName("BODY")[0]).appendChild(t)
                }()
            })
        }
        $(".type_pagination").hasClass("pagination_load-more") && ($(window).unbind(".infscr"), $(".pagination_load-more").click(function() {
            $(".pagination_load-more").addClass("loading"), $(".the-posts .posts-grid").infinitescroll("retrieve")
        }))
    }
    if ($(document).on("click ", ".menu-open", function() {
            $(".menu-wrap").addClass("on")
        }), $(document).on("click ", ".menu-close", function() {
             $(".menu-wrap").removeClass("on")
        }),
        $(document).on("click ", ".mainSidenav", function() {
            // $(".menu-wrap").removeClass("on")
        }), $(".menu-tags").length) {
        var r = $(".menu-tags").text().split(","),
            d = 0;
        for (d = 0; d < r.length; d++) {
            var c = r[d],
                l = c.replace(/\s+/g, "-").toLowerCase(),
                p = encodeURIComponent(l);
            $(".tag-menu").append('<li><a href="/tagged/' + p + '" title="' + c + '">' + c + "</a></li>")
        }
    }
    if ($(".scroll-top").click(function() {
            return $("body, html").animate({
                scrollTop: 0
            }, 800, "easeInOutQuint"), !1
        }), $(".description-wrap.typist").length && $("body.index:not(.tagged,.search)").length)
        if ("typed" === $.cookie("typist-intro")) $(".description-wrap").removeClass("typist");
        else {
            var g = $(".description-typist").data("content");
            $(".description-typist").on("end_type.typist", function() {
                $(".posts-grid").addClass("on")
            }).typist({
                speed: 30,
                text: g
            }).typistPause(2e3).typistStop();
            var h = new Date;
            h.setTime(h.getTime() + 6e5), $.cookie("typist-intro", "typed", {
                expires: h
            })
        }
    if (window.twttr = function(t, e, s) {
            var i, o, a = t.getElementsByTagName(e)[0];
            if (!t.getElementById(s)) return o = t.createElement(e), o.id = s, o.src = "https://platform.twitter.com/widgets.js", a.parentNode.insertBefore(o, a), window.twttr || (i = {
                _e: [],
                ready: function(t) {
                    i._e.push(t)
                }
            })
        }(document, "script", "twitter-wjs"), window.twttr.ready(function(t) {
            t.events.bind("rendered", function() {
                setTimeout(function() {
                    $(".the-posts .posts-grid").masonry()
                }, 200)
            })
        }), $("body.sticky-posts:not(.tagged, .search)").length > 0) {
        var m = $(".posts-holder").data("sticky");
        $(".sticky-loader").load("/tagged/" + m + " .posts-holder article", function() {
            $(".sticky-loader article").addClass("sticky-show"), $(".sticky-loader article").prependTo(".posts-holder"), $(".sticky-loader").remove(), $("article." + m + ":not(.sticky-show)").remove(), i(), o(), n()
        })
    } else $(".sticky-loader").remove(), i(), o(), n()
});