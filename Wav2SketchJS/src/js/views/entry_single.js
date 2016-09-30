var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');

Backbone.$ = $;
require('../dust-filters.js');

var Base = require('./base');
var Base64Binary = require('../helpers/base64binary.js');

global.WaveSurfer = require('wavesurfer.js');
require('wavesurfer.js/plugin/wavesurfer.regions.js');

module.exports = Base.SingleView.extend({

    template: require('../templates/entry_single.dust'),

    options: {
        zoomLevel: 1,
    },

    initialize: function (options) {
        this.options = _.defaults(options || {}, this.options);
        _.bindAll(this, 'render', 'onShow', 'waveform');

        // add model cid for template
        _.extend( this.options, { data: {"cid": this.model.cid } } );

        //this.listenTo(this.model, 'change', this.render);   // model data changed
        this.listenTo(this.model, 'ready', this.waveform);   // model data changed
        this.listenTo(this.model, 'destroy', this.remove);  // model was deleted from server
        this.listenTo(this.model, 'remove', this.remove);   // model was removed from collection
        this.listenTo(this.model, 'sync', this.onSync);
    },

    /*
    convert: function () {
        if (this.model.hasChanged("file")) {
            // convert automatically
            console.info("converting " + this.model.get('filename') + " ...");
            this.model.convert();
        }
    },
    */

    waveform: function() {

        console.log("############################### ready for waveform");

        //if (this.wavesurfer)
        //    this.wavesurfer.destroy();

        this.wavesurfer = WaveSurfer.create({
            audioContext: App.Audio.context,
            container: '.waveform-'+this.model.cid,
            waveColor: 'yellow',
            progressColor: 'yellow',
            cursorColor: 'yellow',
        });

        var array = Base64Binary.decodeArrayBuffer(this.model.get('file'));
        var blob = new Blob([array], {type: 'application/octet-binary'});
        //var blob = new Blob([array], { type : 'audio/wav'});
        this.wavesurfer.loadBlob(blob);

        //var array = Base64Binary.decodeArrayBuffer(this.get('file'));
        //var blob = new Blob([array], {type: 'application/octet-binary'});
        //reader.readAsArrayBuffer(blob);



        this.wavesurfer.on('ready', function () {

            this.wavesurfer.zoom(this.options.zoomLevel);

            this.wavesurfer.addRegion({
                loop: true,
                start: 0.0, // time in seconds
                end: this.wavesurfer.getDuration(), // time in seconds
                color: 'hsla(100, 100%, 70%, 0.4)'
            });

        }.bind(this));


        this.wavesurfer.on('zoom', function(z) {
            this.options.zoomLevel = z;
        }.bind(this));

    },

    onSync: function() {

    },

    onShow: function() {

        //setTimeout( this.waveform, 4000); // TODO
        //this.waveform();

        this.$el.on({
            mouseenter: function () {
                $(this).addClass("active");
            },
            mouseleave: function () {
                $(this).removeClass("active");
            }
        });

        // testing
        //this.model.convert();
    },

    events: {
        "wheel": function(e) {
            e.stopPropagation();
            e.preventDefault();
            var oEvent = e.originalEvent, delta  = oEvent.deltaY || oEvent.wheelDelta;
            var d = delta > 0 ? -1 : 1;
            var z = Math.max(1, Math.min(5000, this.options.zoomLevel + d*100) );
            //console.info(z);
            this.wavesurfer.zoom(z);
        },

        "click .play": function(e) {
            this.wavesurfer.playPause();
        },

        "click .delete": function() {
            this.model.destroy();
        },

        "click .convert": function() {
            this.model.convert();

            /*
            function downloadURI(uri, name) {
                var link = document.createElement("a");
                link.download = name;
                link.href = uri;
                link.click();
            }
            downloadURI("data:application/octet-stream;charset=utf-8;base64," + this.model.get('cppfile_base64'), this.model.get('samplename')+'.cpp');
            */
        }
    },
});
