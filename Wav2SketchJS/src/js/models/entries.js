'use strict';
var Backbone = require('backbone');
var apiUrl = require('../apiUrl');
var Entry = require('./entry');

Backbone.LocalStorage = require("backbone.localstorage");

module.exports = Backbone.Collection.extend({

    model: Entry,

    localStorage: new Backbone.LocalStorage("Entries"),

});
