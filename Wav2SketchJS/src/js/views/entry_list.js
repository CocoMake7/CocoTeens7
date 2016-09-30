var base64 = require('base64-js');

var Base = require('./base');
var Entry = require('../models/entry');

var ProjectSingleView = require('./entry_single');
var Base64Binary = require('../helpers/base64binary.js');

module.exports = Base.ListView.extend({

    template: require('../templates/entry_list.dust'),

    initialize: function() {
        Base.ListView.prototype.initialize.apply(this, arguments);
    },

    addOne: function (model) {
        // console.debug('add', model.id);
        var view = new ProjectSingleView({model: model});
        this.$el.find(".entries").prepend(view.render().el);
        view.onShow(); // TODO call onShow automatically
    },

    removeOne: function() {
        $(window).trigger('resize.app');
    },

    onSync: function () {
        //console.debug('############################################onSync list');
    },

    events: {
        "dragover #drop_zone": "handleDragOver",
        "drop #drop_zone": "handleFileSelect",
        "dragleave #drop_zone": "handleDragLeave",
    },

    handleDragLeave: function (evt) {
        $('#drop_zone').removeClass('hover');
    },

    handleDragOver: function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $('#drop_zone').addClass('hover');
        evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    },

    handleFileSelect: function (evt) {

        $('#drop_zone').removeClass('hover');

        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.originalEvent.dataTransfer.files; // FileList object.

        // files is a FileList of File objects.
        for (var i = 0, f; f = files[i]; i++) {

            var entry = this.collection.create({
                filename: f.name,
                size: f.size,
                modified: f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                type: f.type || 'n/a'
            });

            entry.set("samplename", entry.getSampleName(f.name));
            //entry.save();

            var reader = new FileReader();
            reader.onload = function () {
                entry.set("file", Base64Binary.encode(reader.result));
                //entry.set("file", btoa(reader.result));
                entry.save();
                entry.trigger('ready');
            };
            reader.readAsArrayBuffer(f);
        }
    },

    onShow: function () {
        console.debug("############################################onShow list");

        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }

    },

});