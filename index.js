var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var User = require('./models/user');

app.use(bodyParser.json());

// Add your API endpoints here
app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            res.sendStatus(500);
        }
        res.status(200).json(users);
    })
})

app.post('/users', function(req, res) {
    User.create({username: req.body.username}, function(err, user) {
        if (err) {
            res.sendStatus(500);
        }
        console.log(user);
        res.status(201).json(user);
    })
})

var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
    mongoose.connect(databaseUri).then(function() {
        var port = process.env.PORT || 8080;
        var server = app.listen(port, function() {
            console.log('Listening on port ' + port);
            if (callback) {
                callback(server);
            }
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;

