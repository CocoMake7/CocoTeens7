window.App = {
    Audio: {},
    Helper: {},
    Router: {},
    Model: {},
    Collection: {},
    View: {},
    Form: {}
};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
App.Audio.context = new AudioContext();

global.$       = global.jQuery = require('jquery');
//var $ = require('jquery');

// TODO
//var foundation = require('../../node_modules/foundation-sites/dist/foundation.js');

var Backbone = require('backbone');

Backbone.$ = $;

require('dustjs-helpers');
require('./dust-filters.js');

var Router = require('./router.js');

// jquery attr() functionality
// usage:
// var $div = $("<div data-a='1' id='b'>");
// $div.attr();  // returning { "data-a": "1", "id": "b" }
(function(old) {
    $.fn.attr = function() {
        if(arguments.length === 0) {
            if(this.length === 0) {
                return null;
            }

            var obj = {};
            $.each(this[0].attributes, function() {
                if(this.specified) {
                    obj[this.name] = this.value;
                }
            });
            return obj;
        }
        return old.apply(this, arguments);
    };
})($.fn.attr);


$(function () {
    var router = new Router();
    Backbone.history.start({pushState: true});
    //$(document).foundation();

});




