var _ = require('underscore');
var Base = require('./base.js');

var res = 24,
refreshRate = 50,
rad = Math.PI / 180,
aa = ab = ac = ad = 0,
cr = cg = cb  = 128,
a = 0,
SCREEN_WIDTH,
SCREEN_HEIGHT,
HALF_WIDTH,
HALF_HEIGHT;

// layout template
module.exports = Base.TemplateView.extend({

    el: $('body'),

    template: require('../templates/layout.dust'),

    initialize: function(options) {
        Base.TemplateView.prototype.initialize.apply(this, arguments);
        _.bindAll(this, 'onResize');
        $(window).on("resize.app", this.onResize);
    },

    onRemove: function() {
        console.log("removed layout view.");
        $(window).off("resize.app");
    },

    onResize: function() {
        console.info("let's resize");

        var w = $(document).width();
        var h = $(document).height();

        $('#drop_zone').css({'height': h + 'px'});

        context = this.$("#canvas")[0].getContext('2d');
        a = this.seed(6);

        h -= 10;
        context.canvas.width  = w;
        context.canvas.height = h;

        HALF_WIDTH    = Math.ceil(w / res);
        HALF_HEIGHT   = Math.ceil(h / res);
    },

    onShow: function() {
        SCREEN_WIDTH  = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight-10;
        context = this.$("#canvas")[0].getContext('2d');
        a = this.seed(6);
        context.canvas.width  = SCREEN_WIDTH;
        context.canvas.height = SCREEN_HEIGHT;
        HALF_WIDTH    = Math.ceil(SCREEN_WIDTH / res);
        HALF_HEIGHT   = Math.ceil(SCREEN_HEIGHT / res);

        this.plasma();

        //setTimeout(_.bind(this.plasma, this), refreshRate);
        var interval = setInterval(this.plasma, refreshRate);

    },

    plasma: function() {

        for(var x = 0; x < res; x++) {

            aa += 0.0005 * Math.cos(rad * x * a[0]);
            ac += 0.0010 * Math.sin(rad * (res - x) * a[2]);

            for(var y = 0; y < res; y++) {

                ab += 0.001 * Math.cos(rad * y * a[1]);
                ad += 0.001 * Math.sin(rad * (res - y) * a[3]);

                var h = x * 8 * Math.sin(rad * (aa + ab) * a[4]),
                j = y * 8 * Math.cos(rad * (ac + ad) * a[5]),
                k = (x * a[0] + y * a[1]) * 32 * Math.sin(rad * ((res - x) * h + (y - res) * h) * a[2] / 720),
                l = (res * a[3] - x  * a[3] + (res * a[4] - y * a[4])) * 32 * Math.sin(rad * (x * h + y * j) * a[5] / 720);

                h = 48 * Math.cos(rad * h) + 42 * Math.cos(rad * j);

                cr = 128 + Math.ceil(42 * Math.cos(rad * k) + h);
                cg = 128 + Math.ceil(42 * Math.cos(rad * l) + h);
                cb = Math.ceil((cr + cg) / 2 - h * 2);

                context.fillStyle = 'rgb(' + cr + ',' + cg + ',' + cb + ')';
                context.fillRect(y * HALF_WIDTH, x * HALF_HEIGHT, HALF_WIDTH, HALF_HEIGHT);
            }
        }
    },

    seed: function(count) {
        var res = [];
        for(var i = 0; i < count; i++) {
            res[i] = Math.ceil(Math.random(0, 1) * 3 + 1);
        }
        return res;
    },
});