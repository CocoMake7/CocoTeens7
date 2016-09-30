/* Base Views */
'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');
Backbone.$ = $;

module.exports.TemplateView = Backbone.View.extend({

    options: {}, // optional params

    initialize: function (options) {
        this.options = _.defaults(options || {}, this.options);
        _.bindAll(this, 'render', 'onShow', 'onRemove');
    },

    render: function () {

        this.template(_.extend({}, this.options.data || {}), function (err, out) {
            if (err) {
                console.error(err);
            }
            else {
                this.$el.html($(out).html());
                this.$el.attr($(out).attr());
            }
        }.bind(this));

        return this;
    },

    onShow: function () {
        // optional override in child view
    },

    onRemove: function() {
        // optional override in child view
    },
});


module.exports.DetailView = Backbone.View.extend({

    template: '',

    options: {}, // optional params

    initialize: function (options) {
        this.options = _.defaults(options || {}, this.options);
        _.bindAll(this, 'onRequest', 'onSync', 'render', 'onShow');

        this.listenTo(this.model, 'change', function () {
            //console.log('change....');
            this.render();
            this.onShow();
        });
        this.listenTo(this.model, 'request', this.onRequest);
        this.listenTo(this.model, 'sync', this.onSync);
        this.listenTo(this.model, 'destroy', this.remove);
        this.listenTo(this.model, 'remove', this.remove);
    },

    onRequest: function () {
        //console.debug('request...', this.template); // TODO show loading indicator
    },

    onSync: function () {
        //console.debug('sync', this.template);
    },

    render: function () {
        this.template(_.extend(this.model.toJSON(), this.options.data || {}), function (err, out) {
            if (err) {
                console.error(err);
            }
            else {
                this.$el.html($(out).html());
                this.$el.attr($(out).attr());
            }
        }.bind(this));
    },

    onShow: function () {
        // optional override in view
    }
});


module.exports.SingleView = Backbone.View.extend({

    template: '',   // template name

    options: {}, // optional params

    initialize: function (options) {
        this.options = _.defaults(options || {}, this.options);
        _.bindAll(this, 'render', 'onShow');

        this.listenTo(this.model, 'change', this.render);   // model data changed
        this.listenTo(this.model, 'destroy', this.remove);  // model was deleted from server
        this.listenTo(this.model, 'remove', this.remove);   // model was removed from collection
        this.listenTo(this.model, 'sync', this.onSync);
    },

    onSync: function () {
        //console.debug('############################################ single->onSync');
    },

    render: function () {
        //console.debug("render single view", this.model.id);

        this.template(_.extend(this.model.toJSON(), this.options.data || {}), function (err, out) {
            if (err) {
                console.error(err);
            }
            else {
                this.$el.html($(out).html());
                this.$el.attr($(out).attr());
            }
        }.bind(this));

        return this;
    },

    onShow: function () {
        // optional override in view
    }
});


module.exports.ListView = Backbone.View.extend({

    template: '',   // template name

    options: {}, // optional params

    initialize: function (options) {
        this.options = _.extend({}, options);
        _.bindAll(this, 'onRequest', 'onSync', 'render', 'addOne', 'removeOne', 'onShow', 'onRemove');

        this.listenTo(this.collection, 'request', this.onRequest);
        this.listenTo(this.collection, 'sync', this.onSync);
        this.listenTo(this.collection, 'reset', this.render); // TODO addAll function instead of render?

        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'remove', this.removeOne);
        //this.listenTo(this.collection, 'update', this.render);
    },

    onRequest: function () {
        //console.debug('request...', this.template); // TODO show loading indicator
    },

    onSync: function () {
        //console.debug('sync', this.template);
    },

    addOne: function (model) {
        // needs override in view
        //console.warn('ListView.addOne: possible missing function override in child view.');
    },

    removeOne: function (model, collection, options) {
        //console.debug('removed', model.id);
    },

    render: function () {

        this.template(_.extend( this.options.data || {}, { meta: this.collection.meta }), function (err, out) {
            if (err) {
                console.error(err);
            }
            else {
                this.$el.html($(out).html());
                this.$el.attr($(out).attr());
            }
        }.bind(this));

        this.collection.each(this.addOne, this);

        return this;
    },

    onShow: function () {
        // optional override in view
    },

    onRemove: function () {
        // optional override in view
    },
});
