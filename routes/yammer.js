_ = require('underscore');

var postsOnly = function(m) {
    return m.replied_to_id === null;
};

var repliesOnly = function(m) {
    return m.replied_to_id != null;
};

var not = function(f) {
    return function() {
        return !(f.apply(null, arguments));
    }
};


exports.interpret = function(data) {

    var swatch = process.hrtime();

    var posts = _.filter(data.messages, postsOnly);
    var replies = _.filter(data.messages, not(postsOnly));

    var refs = data.references;

    function findRef(refId) {
        return _.find(refs, function(i) {
            return i.id === refId;
        });
    }

    var convertYammerFeedItem = function (m) {
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

        translated.replies = _.sortBy( _.map(repliesToThis, convertYammerFeedItem), "created_at" );

        if (translated.replies.length > 0) {
            translated.last_update = _.last(translated.replies).created_at;
        } else {
            translated.last_update = translated.created_at;
        }

        return  translated;
    };


    var updates = _.map(posts, convertYammerFeedItem);

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
    console.log("Processing took %d s", elapsed[0] + elapsed[1]/1e9);

    return { updates : sortedUpdates };
};
