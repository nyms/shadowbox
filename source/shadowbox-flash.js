(function (shadowbox, undefined) {

    var utils = shadowbox.utils,
        supportsFlash = false;

    // Detect Flash support.
    if (navigator.plugins && navigator.plugins.length) {
        utils.each(navigator.plugins, function(i, plugin) {
            if (plugin.name === "Shockwave Flash") {
                supportsFlash = true;
                return false; // Exit the loop.
            }
        });
    } else {
        try {
            var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            supportsFlash = true;
        } catch(e) {}
    }

    function Flash(obj, id) {
        this.url = obj.url;
        this.width = parseInt(obj.width, 10) || 300;
        this.height = parseInt(obj.height, 10) || 300;
        this.params = obj.flashParams || {};
        this.vars = obj.flashVars || {};
        this.id = id;
    }

    utils.apply(Flash.prototype, {

        /**
         * Returns true if this player is supported on this browser.
         */
        isSupported: function () {
            return supportsFlash;
        },

        /**
         * Inserts this object as the only child of the given DOM element.
         * Returns the newly created element, false if none was created.
         */
        insert: function (element) {
            if (!supportsFlash) {
                return false;
            }

            var vars = [];
            for (var varName in this.vars) {
                vars.push(varName + "=" + this.vars[varName]);
            }

            this._el = createSwf(this.url, {
                id: this.id,
                width: this.width,
                height: this.height
            }, utils.apply({}, this.params, {flashvars: vars.join("&")}));

            utils.empty(element);
            element.appendChild(this._el);

            return this._el;
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

    shadowbox.register(Flash, "swf");

    var isIE = /*@cc_on!@*/false;

    function createSwf(url, attributes, params) {
        attributes = attributes || {};
        params = params || {};

        var obj;
        if (isIE) {
            // Need to use innerHTML here for IE.
            var div = utils.create("div");
            div.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="movie" value="' + url + '"></object>';
            obj = div.firstChild;
        } else {
            obj = utils.create("object");
            obj.setAttribute("type", "application/x-shockwave-flash");
            obj.setAttribute("data", url);
        }

        // Set <object> attributes.
        for (var attrName in attributes) {
            obj.setAttribute(attrName, attributes[attrName]);
        }

        // Append <param> elements.
        var param;
        for (var paramName in params) {
            param = utils.create("param");
            param.setAttribute("name", paramName);
            param.setAttribute("value", params[paramName]);
            obj.appendChild(param);
        }

        return obj;
    }

    // Expose.
    shadowbox.Flash = Flash;
    utils.supportsFlash = supportsFlash;
    utils.createSwf = createSwf;

})(shadowbox);
