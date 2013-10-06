/*
 * Serve JSON to our AngularJS client
 */
var fs = require('fs');
var filename = __dirname + '/../data/messages.json';
var yammer = require('./yammer');
var request = require('superagent');


exports.name = function (req, res) {
  res.json({
  	name: 'Bob'
  });
};

function loadFromStaticFile(res) {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            res.send(500);
        }

        var feed = yammer.interpret(JSON.parse(data));

        res.json(feed);
    });
}
exports.feed = function(req, res) {

    var token = req.query['token'];

    console.log('Have Yammer access token',token);

    if (token) {
        console.log('Fetching from Yammer..');
        request.get('https://www.yammer.com/api/v1/messages.json')
            .set('Authentication','Bearer ' + token)
            .end(function(yammerFeed) {
                console.log('Got data from yammer',yammerFeed.status,yammerFeed.body);
                var feed = yammer.interpret(yammerFeed.body);
                res.json(feed);
            });
    } else {
        loadFromStaticFile(res);
    }
}