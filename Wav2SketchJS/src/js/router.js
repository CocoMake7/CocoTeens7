// Application router
// ==================
'use strict';
var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

// models
var Entries = require('./models/entries.js');

// views
var swap = require('./views/swap.js');
var Regions = require('./views/regions.js');

var LayoutView = require('./views/layout.js');
var NavigationView = require('./views/navigation.js');
var EntryListView = require('./views/entry_list.js');

App.Collection.entries = new Entries();

var defaultRoute = function (actions) {
    console.debug("defaultRoute:", actions);
};

var list = function (actions) {
    //console.debug("list:", actions);
    swap(Regions.content, new EntryListView({collection: App.Collection.entries}));
    App.Collection.entries.fetch({success: function() {
        App.Collection.entries.each(function(entry) {
            entry.trigger('ready');
            setTimeout(function(){}, 500); // TODO hack to load files..
        });
    }});
};

module.exports = Backbone.Router.extend({

    initialize: function () {
        console.debug("##################################initialize router");
        // render the base layout
        this.renderBase();
        // define regions RIGHT HERE after base layout has been rendered
        Regions.navigation = $('[data-js-region="navigation"]');
        Regions.content = $('[data-js-region="content"]');
        // render navigation
        this.renderNavigation();
    },

    routes: {
        '(/)': list,
        '*action(/)': defaultRoute
    },

    renderBase: function () {
        App.View.layout = new LayoutView();
        // render the view and attach it to the body
        $(App.View.layout.render().el).prependTo('body');
        App.View.layout.onShow();
    },

    renderNavigation: function () {
        swap(Regions.navigation, new NavigationView({}));
    }
});

