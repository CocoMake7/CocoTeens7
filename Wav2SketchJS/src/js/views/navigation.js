var Base = require('./base.js');

// navigation template
module.exports = Base.TemplateView.extend({
    template: require('../templates/navigation.dust'),
    onShow: function() {
    }
});