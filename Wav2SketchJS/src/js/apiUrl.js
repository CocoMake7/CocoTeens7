var api_url = '/api/v1/';

var URLs = {

    // entries
    entries: function() {
        return api_url + 'entry/';
    },

    // entry
    entry: function(uuid) {
        return api_url + 'entry/'+ uuid;
    },

    // example left for documentation
    /*
    subscriptions: function(userId, id) {
        return "/api/users/"+ userId +"/subscriptions/" + id;
    }
    */
}


// Helper for accessing the URL list.
module.exports = function(type) {
    var r = URLs[type] ? URLs[type].apply(this, [].slice.call(arguments, 1)) : undefined;
    return r;
}
