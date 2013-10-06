_ = require('underscore');

var onlyParents = function(m) {
    return m.replied_to_id === null;
};

var onlyReplies = function(m) {
    return m.replied_to_id != null;
};


exports.interpret = function(data) {

    var swatch = process.hrtime();

    var roots = _.filter(data.messages, onlyParents);
    var replies = _.filter(data.messages, onlyReplies);

    var refs = data.references;

    function findRef(refId) {
        return _.find(refs, function(i) {
            return i.id === refId;
        });
    }

    var convertYammerToOur = function (m) {
        var sender = findRef(m.sender_id);
        var translated = {
            id: m.id,
            text: m.body.plain,
            created_at: m.created_at,
            replies: [],
            sender_id: m.sender_id,
            sender_name: sender.full_name,
            mugshot_url: sender.mugshot_url
        };

        var repliesToThis = _.filter(replies, function (r) {
            return r.replied_to_id === m.id;
        });

        translated.replies = _.sortBy( _.map(repliesToThis, convertYammerToOur), "created_at" );

        if (translated.replies.length > 0) {
            translated.last_update = _.last(translated.replies).created_at;
        } else {
            translated.last_update = translated.created_at;
        }

        return  translated;
    };


    var updates =   _.map(roots, convertYammerToOur);

    var sortedUpdates = updates.sort(function(a,b) {
        if (a.last_update > b.last_update) {
            return -1;
        } else if (a.last_update < b.last_update) {
            return 1;
        } else {
            return 0;
        }
    });

    var elapsed = process.hrtime(swatch);
    console.log("Processing took %d", elapsed[0] + elapsed[1]/1e9);

    return { updates : sortedUpdates };
};
