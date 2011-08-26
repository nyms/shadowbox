(function (shadowbox, undefined) {

    var options = shadowbox.options,
        utils = shadowbox.utils,
        supportsFlash = utils.supportsFlash,
        supportsH264 = false,
        supportsOgg = false,
        supportsWebm = false;

    // The URL of the Flowplayer SWF.
    shadowbox.flowplayer = "http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf";

    // Detect video support, adapted from Modernizr.
    var video = utils.create("video"),
        canPlay = video.canPlayType && function (type) {
            var able = video.canPlayType(type);
            return able != "" && able != "no";
        }

    if (canPlay) {
        var mp4 = 'video/mp4; codecs="avc1.42E01E';
        supportsH264 = canPlay(mp4 + '"') || canPlay(mp4 + ', mp4a.40.2"');
        supportsOgg = canPlay('video/ogg; codecs="theora"');
        supportsWebm = canPlay('video/webm; codecs="vp8, vorbis"');
    }

    var reFormat = /\.(mp4|ogg|webm|flv)/i;

    function detectFormat(url) {
        var match = url.match(reFormat);
        return match ? match[1].toLowerCase() : null;
    }

    function Video(obj, id) {
        this.url = obj.url;
        this.width = parseInt(obj.width, 10) || 640;
        this.height = parseInt(obj.height, 10) || 480;
        this.posterUrl = obj.posterUrl;

        if (obj.formats) {
            this.formats = obj.formats;
        } else {
            this.formats = {};
        }

        // Try to automatically detect the video format.
        var format = detectFormat(obj.url);
        if (format) {
            this.formats[format] = obj.url;
        } else {
            throw new Error("Cannot detect video format from URL: " + obj.url);
        }

        this.id = id;
    }

    utils.apply(Video.prototype, {

        _createVideo: function (url) {
            this._el = utils.create("video");

            var attrs = {
                id: this.id,
                src: url,
                preload: "auto",
                // controls: "controls",
                width: this.width,
                height: this.height
            };

            if (options.autoPlay) {
                attrs.autoplay = "autoplay";
            }

            if (this.posterUrl) {
                attrs.poster = this.posterUrl;
            }

            for (var attrName in attrs) {
                this._el.setAttribute(attrName, attrs[attrName]);
            }

            // Working with an HTML5 <video> element.
            utils.apply(this, html5Methods);
        },

        _createSwf: function (url) {
            var clipProps = [];

            clipProps.push('"url":"' + url + '"');
            clipProps.push('"scaling":"fit"');
            if (options.autoPlay) {
                clipProps.push('"autoPlay":true');
            }

            var clip = "{" + clipProps.join(",") + "}";

            var playlistItems = [];

            if (this.posterUrl) {
                playlistItems.push('"' + this.posterUrl + '"');
            }
            playlistItems.push(clip);

            var playlist = "[" + playlistItems.join(",") + "]";

            var configProps = [];

            configProps.push('"playerId":"' + this.id + '"');
            configProps.push('"clip":{}');
            configProps.push('"playlist":' + playlist);
            configProps.push('"plugins":{"controls":null}');
            // configProps.push('"debug":true');

            var config = "{" + configProps.join(",") + "}";
            var apiId = this.id + "_api";

            this._el = utils.createSwf(shadowbox.flowplayer, {
                id: apiId,
                name: apiId,
                width: this.width,
                height: this.height
            }, {
                allowfullscreen: "true",
                allowscriptaccess: "always",
                quality: "high",
                bgcolor: "#ffffff",
                flashvars: "config=" + config
            });

            // Working with a Flowplayer <object> element.
            utils.apply(this, flashMethods);
        },

        /**
         * Returns true if this player is supported on this browser.
         */
        isSupported: function () {
            if (supportsH264 && this.formats["mp4"]) {
                return true;
            } else if (supportsOgg && this.formats["ogg"]) {
                return true;
            } else if (supportsWebm && this.formats["webm"]) {
                return true;
            } else if (supportsFlash && (this.formats["flv"] || this.formats["mp4"])) {
                return true;
            }

            return false;
        },

        /**
         * Inserts this object as the only child of the given DOM element.
         * Returns the newly created element, false if none was created.
         */
        insert: function (element) {
            if (supportsH264 && this.formats["mp4"]) {
                this._createVideo(this.formats["mp4"]);
            } else if (supportsOgg && this.formats["ogg"]) {
                this._createVideo(this.formats["ogg"]);
            } else if (supportsWebm && this.formats["webm"]) {
                this._createVideo(this.formats["webm"]);
            } else if (supportsFlash && (this.formats["flv"] || this.formats["mp4"])) {
                this._createSwf(this.formats["flv"] || this.formats["mp4"]);
            }

            if (this._el) {
                utils.empty(element);
                element.appendChild(this._el);
                return this._el;
            }

            return false;
        },

        /**
         * Removes this object from the DOM.
         */
        remove: function () {
            if (this._el) {
                utils.remove(this._el);
                this._el = null;
            }
        }

    });

    shadowbox.register(Video, ["mp4", "ogg", "webm", "flv"]);

    // Methods for controlling an HTML5 <video> element.
    var html5Methods = {

        play: function () {
            return this._el.play();
        },

        pause: function () {
            return this._el.pause();
        }

    };

    // Methods for controlling a Flowplayer <object> element.
    var flashMethods = {

        play: function () {
            return this._el.fp_play();
        },

        pause: function () {
            return this._el.fp_pause();
        }

    };

    // Expose.
    shadowbox.Video = Video;
    utils.supportsH264 = supportsH264;
    utils.supportsOgg = supportsOgg;
    utils.supportsWebm = supportsWebm;

})(shadowbox);
