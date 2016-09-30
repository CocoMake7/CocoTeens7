module.exports = function(region, newView) {

    // if there's an old View in the region, grab a reference to it
    var oldView = region.view;
    App.View.oldView = oldView;

    if (oldView) {
        // unbind the event listeners
        oldView.off();
        if (oldView.model) {
            oldView.model.off('change', oldView.render, oldView);
        }

        // remove the old View HTML from the page
        if (oldView.onRemove){
            oldView.onRemove();
        }
        oldView.remove();

        // remove references to the el DOM nodes
        delete oldView.$el;
        delete oldView.el;
    }

    // save a reference to the new View on the Region itself
    region.view = newView;
    App.View.view = region.view;

    // put the HTML output from the new View into the Region (and therefore the page)
    region.html(newView.render().el);

    if (newView.onShow){
        newView.onShow();
    }

};
